import "server-only";
import { and, count, desc, eq, gte, inArray } from "drizzle-orm";

import { db } from "@/db/index";
import { generations } from "@/db/schema";
import type { StudioPresetId } from "@/lib/studio";

/** A row as read back from the `generations` table. */
export type GenerationRecord = typeof generations.$inferSelect;

/** Input for a freshly queued render. */
export type CreatePendingGenerationInput = {
  userId: string;
  presetId: StudioPresetId;
  presetLabel: string;
  model: string;
};

/** Fields written once a render succeeds. */
export type MarkGenerationDoneInput = {
  /** ImageKit URL, or `null` when only the session copy survives. */
  imageUrl: string | null;
  /** ImageKit file id, or `null` when the upload was skipped. */
  imageKitFileId: string | null;
  /** How long the engine took, in milliseconds. */
  durationMs: number | null;
};

/**
 * Inserts a `pending` row before the engine runs. Status `pending` lets the
 * quota count in-flight requests so concurrent calls cannot exceed the limit.
 */
export async function createPendingGeneration(
  input: CreatePendingGenerationInput,
): Promise<GenerationRecord> {
  const [row] = await db
    .insert(generations)
    .values({
      userId: input.userId,
      presetId: input.presetId,
      presetLabel: input.presetLabel,
      status: "pending",
      model: input.model,
    })
    .returning();

  return row;
}

/** Marks a queued render as finished and stores where the image lives. */
export async function markGenerationDone(
  userId: string,
  id: string,
  result: MarkGenerationDoneInput,
): Promise<GenerationRecord | undefined> {
  const [row] = await db
    .update(generations)
    .set({
      status: "done",
      imageUrl: result.imageUrl,
      imageKitFileId: result.imageKitFileId,
      durationMs: result.durationMs,
    })
    .where(and(eq(generations.id, id), eq(generations.userId, userId)))
    .returning();

  return row;
}

/**
 * Marks a queued render as failed so it stops counting against the quota.
 * Failures do not consume a render, hence the explicit status flip.
 */
export async function markGenerationFailed(
  userId: string,
  id: string,
  durationMs: number | null = null,
): Promise<GenerationRecord | undefined> {
  const [row] = await db
    .update(generations)
    .set({ status: "failed", durationMs })
    .where(and(eq(generations.id, id), eq(generations.userId, userId)))
    .returning();

  return row;
}

/** Most recent rows for one user, newest first. */
export async function listGenerations(userId: string, limit: number): Promise<GenerationRecord[]> {
  return db
    .select()
    .from(generations)
    .where(eq(generations.userId, userId))
    .orderBy(desc(generations.createdAt))
    .limit(limit);
}

/** A single row, scoped to its owner. Returns `undefined` for other users' ids. */
export async function getGeneration(
  userId: string,
  id: string,
): Promise<GenerationRecord | undefined> {
  const [row] = await db
    .select()
    .from(generations)
    .where(and(eq(generations.id, id), eq(generations.userId, userId)))
    .limit(1);

  return row;
}

/** Deletes a row, scoped to its owner, and returns the removed row if any. */
export async function deleteGeneration(
  userId: string,
  id: string,
): Promise<GenerationRecord | undefined> {
  const [row] = await db
    .delete(generations)
    .where(and(eq(generations.id, id), eq(generations.userId, userId)))
    .returning();

  return row;
}

/**
 * Renders counted against the monthly quota for one user, from `monthStartUtc`.
 * Counts `pending` and `done` rows only: in-flight requests hold a slot, while
 * `failed` attempts give the slot back.
 */
export async function countMonthlyGenerations(
  userId: string,
  monthStartUtc: Date,
): Promise<number> {
  const [row] = await db
    .select({ count: count() })
    .from(generations)
    .where(
      and(
        eq(generations.userId, userId),
        gte(generations.createdAt, monthStartUtc),
        inArray(generations.status, ["pending", "done"]),
      ),
    );

  return Number(row?.count ?? 0);
}
