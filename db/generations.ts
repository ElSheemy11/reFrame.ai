import { and, eq, gte, desc, count, type InferInsertModel } from "drizzle-orm";

import { generations } from "@/db/schema";
import { db } from "@/db/index";

export function utcMonthStart(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1, 0, 0, 0, 0));
}

export async function countGenerationsSince(clerkUserId: string, since: Date) {
  const [row] = await db
    .select({ count: count() })
    .from(generations)
    .where(
      and(
        eq(generations.clerkUserId, clerkUserId),
        gte(generations.createdAt, since)
      )
    );

  return Number(row?.count ?? 0);
}


export async function listUserGenerations(clerkUserId: string, limit: number, offset: number) {
    const rows = await db
        .select()
        .from(generations)
        .where(eq(generations.clerkUserId, clerkUserId))
        .orderBy(desc(generations.createdAt))
        .limit(limit)
        .offset(offset)
    return rows;
};


export async function createGeneration(generation: InferInsertModel<typeof generations>) {
    const [row] = await db.insert(generations).values(generation).returning();
    return row;
}