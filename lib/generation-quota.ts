import "server-only";

import { countMonthlyGenerations } from "@/lib/generations-repo";

/** Renders counted against the studio's monthly quota for one account. */
export type GenerationQuotaSnapshot = {
  /** Renders allowed per UTC calendar month. */
  limit: number;
  /** Renders used so far this UTC month (`pending` + `done`). */
  used: number;
  /** `limit - used`, floored at 0. */
  remaining: number;
  /** ISO timestamp when the count resets (start of the next UTC month). */
  resetsAt?: string;
};

/** Monthly render allowance used when `STUDIO_MONTHLY_LIMIT` is unset. */
export const DEFAULT_MONTHLY_GENERATION_LIMIT = 3;

/**
 * The active monthly limit. Defaults to `DEFAULT_MONTHLY_GENERATION_LIMIT` and
 * can be overridden with the optional `STUDIO_MONTHLY_LIMIT` env var.
 */
export function monthlyGenerationLimit(): number {
  const raw = process.env.STUDIO_MONTHLY_LIMIT?.trim();
  if (raw) {
    const parsed = Number.parseInt(raw, 10);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }
  return DEFAULT_MONTHLY_GENERATION_LIMIT;
}

/** First instant of the UTC calendar month that contains `date`. */
export function utcMonthStart(date: Date = new Date()): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1, 0, 0, 0, 0));
}

/** First instant of the UTC calendar month after `date` — when quota resets. */
export function nextUtcMonthStart(date: Date = new Date()): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1, 0, 0, 0, 0));
}

/**
 * Reads the current month's usage for a user and returns their quota snapshot.
 * Counts `pending` and `done` rows so concurrent requests cannot slip past the
 * limit, while failed renders give their slot back.
 */
export async function getQuotaSnapshot(userId: string): Promise<GenerationQuotaSnapshot> {
  const limit = monthlyGenerationLimit();
  const used = await countMonthlyGenerations(userId, utcMonthStart());

  return {
    limit,
    used,
    remaining: Math.max(0, limit - used),
    resetsAt: nextUtcMonthStart().toISOString(),
  };
}
