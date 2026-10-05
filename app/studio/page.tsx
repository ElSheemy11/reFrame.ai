import StudioWorkbench from "@/components/studio/workbench";
import { getQuotaSnapshot } from "@/lib/generation-quota";
import { listGenerations } from "@/lib/generations-repo";
import { STUDIO_HISTORY_LIMIT } from "@/lib/studio";
import type { GenerationHistorySummaryItem } from "@/lib/types";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";

const HISTORY_LIMIT = STUDIO_HISTORY_LIMIT;

/**
 * Page container for /studio. The fixed pill header sits above the content, so
 * the top padding keeps the first section clear of it at every breakpoint.
 */
const SHELL_PADDING = "px-4 pt-20 pb-6 sm:px-6 sm:pt-24 sm:pb-8 lg:px-8";
const SHELL_CLASS = `mx-auto w-full max-w-7xl ${SHELL_PADDING}`;

/** Maps a stored `done` row to the history shape the workbench renders. */
function toHistoryItem(row: Awaited<ReturnType<typeof listGenerations>>[number]): GenerationHistorySummaryItem {
  return {
    id: row.id,
    clerkUserId: row.userId,
    originalFileName: null,
    sourceImageUrl: "",
    resultImageUrl: row.imageUrl ?? "",
    styleSlug: row.presetId,
    styleLabel: row.presetLabel,
    model: row.model,
    promptUsed: "",
    createdAt: row.createdAt,
  };
}

function SignInPrompt() {
  return (
    <main className="studio-shell min-h-dvh">
      <div
        className={
          `mx-auto flex w-full max-w-xl flex-col items-center justify-center gap-4 text-center ${SHELL_PADDING}`
        }
      >
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Sign in to open the studio
        </h1>
        <p className="max-w-md text-sm text-muted-foreground sm:text-base">
          The studio keeps your renders private to your account, so we need you signed in first.
        </p>

        <div className="mt-1 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/sign-in"
            className="studio-primary-action flex h-11 items-center rounded-full px-6 text-sm font-semibold"
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="studio-pill flex h-11 items-center rounded-full border px-6 text-sm font-medium"
          >
            Create an account
          </Link>
        </div>
      </div>
    </main>
  );
}

async function StudioPage() {
  const { userId } = await auth();
  if (!userId) return <SignInPrompt />;

  const [rows, initialQuota] = await Promise.all([
    listGenerations(userId, HISTORY_LIMIT),
    getQuotaSnapshot(userId),
  ]);

  const initialHistory = rows.filter((row) => row.status === "done" && row.imageUrl).map(toHistoryItem);

  return (
    <main className="studio-shell min-h-dvh">
      <div className={SHELL_CLASS}>
        <StudioWorkbench
          clerkUserId={userId}
          initialHistory={initialHistory}
          initialQuota={initialQuota}
        />
      </div>
    </main>
  );
}

export default StudioPage;
