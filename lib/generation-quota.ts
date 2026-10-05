import "server-only";

import { auth } from "@clerk/nextjs/server";

import { countMonthlyGenerations } from "@/lib/generations-repo";

/**
 * Single source of truth for the monthly render allowance of every plan.
 *
 * Keys are the plan slugs configured in Clerk (Billing → Plans), and the values
 * are the allowances advertised on the pricing cards. Both the API route and
 * the studio page resolve the limit from here, so they can never disagree.
 */
export const PLAN_MONTHLY_LIMITS = {
  free_user: 3,
  pro: 75,
  studio: 175,
} as const;

export type PlanKey = keyof typeof PLAN_MONTHLY_LIMITS;

/** Plan granted when a user has no paid subscription, or cannot be resolved. */
export const DEFAULT_PLAN: PlanKey = "free_user";

/**
 * Accepted forms for a plan key in Clerk's billing claims. The format that this
 * app actually receives could not be confirmed against a live subscription, so
 * `resolvePlan` checks both: the bare slug (`pro`) and the payer-namespaced
 * form (`user:pro`) — see `CheckAuthorizationParamsFromSessionClaims` in
 * Clerk's session types.
 */
const CLERK_PLAN_PREFIX = "user:";

/** Which `has({ plan })` form matched, for the temporary debug log. */
type PlanClaimForm = "bare" | "prefixed" | "none";

/**
 * Every plan ordered from the highest allowance down. `resolvePlan` walks this
 * list so a user matching several plans keeps the most generous one, and so
 * newly added plans are ranked automatically instead of by hand.
 */
const PLANS_BY_LIMIT: readonly PlanKey[] = (Object.keys(PLAN_MONTHLY_LIMITS) as PlanKey[]).sort(
  (a, b) => PLAN_MONTHLY_LIMITS[b] - PLAN_MONTHLY_LIMITS[a],
);

/** Renders allowed per month for `plan`. Pure — no auth, no I/O. */
export function limitForPlan(plan: PlanKey): number {
  return PLAN_MONTHLY_LIMITS[plan] ?? PLAN_MONTHLY_LIMITS[DEFAULT_PLAN];
}

/** Renders counted against the studio's monthly quota for one account. */
export type GenerationQuotaSnapshot = {
  /** Renders allowed per UTC calendar month, from `limitForPlan(plan)`. */
  limit: number;
  /** Renders used so far this UTC month (`pending` + `done`). */
  used: number;
  /** `limit - used`, floored at 0. */
  remaining: number;
  /** ISO timestamp when the count resets (start of the next UTC month). */
  resetsAt?: string;
  /** Plan the limit was resolved from, so the client can label the quota. */
  plan?: PlanKey;
};

/**
 * Resolves the signed-in user's plan from Clerk's billing claims.
 *
 * Checks the paid plans first and returns the one with the highest allowance.
 * Never throws: an unknown, missing or failed lookup falls back to the free
 * plan so a billing hiccup can never hand out an unbounded quota.
 */
export async function resolvePlan(): Promise<PlanKey> {
  try {
    const { has } = await auth();
    for (const plan of PLANS_BY_LIMIT) {
      // TODO remove after verifying paid plans
      const matchedForm: PlanClaimForm = has({ plan })
        ? "bare"
        : has({ plan: `${CLERK_PLAN_PREFIX}${plan}` })
          ? "prefixed"
          : "none";
      if (matchedForm !== "none") {
        const planKey: PlanKey = plan;
        // TODO remove after verifying paid plans
        console.log("[quota] resolved plan", planKey, matchedForm);
        return planKey;
      }
    }
    // TODO remove after verifying paid plans
    console.log("[quota] resolved plan", DEFAULT_PLAN, "none");
    return DEFAULT_PLAN;
  } catch (err) {
    console.error("[generation-quota] could not resolve plan, falling back to free", err);
    return DEFAULT_PLAN;
  }
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
export async function getQuotaSnapshot(
  userId: string,
  plan: PlanKey = DEFAULT_PLAN,
): Promise<GenerationQuotaSnapshot> {
  const limit = limitForPlan(plan);
  const used = await countMonthlyGenerations(userId, utcMonthStart());

  return {
    limit,
    used,
    remaining: Math.max(0, limit - used),
    resetsAt: nextUtcMonthStart().toISOString(),
    plan,
  };
}
