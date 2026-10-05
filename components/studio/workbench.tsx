"use client";

import { StudioWorkbenchProvider, useStudioWorkbench } from "@/context/StudioWorkbenchContext";
import { StudioWorkbenchProps } from "@/lib/types";
import { StudioControlsPanel } from "./controls-panel";
import { StudioPreviewPanel } from "./preview-panel";
import { HistoryPreviewDialog } from "./history-preview-dialog";

function StudioWorkbench({ clerkUserId, initialHistory, initialQuota }: StudioWorkbenchProps) {
  return (
    <StudioWorkbenchProvider
      clerkUserId={clerkUserId}
      initialHistory={initialHistory}
      initialQuota={initialQuota}
    >
      <StudioWorkbenchForm />
    </StudioWorkbenchProvider>
  );
}

function StudioWorkbenchForm() {
  const { handleSubmit, viewedHistoryItem, closeHistoryPreview } = useStudioWorkbench();

  return (
    <form
      onSubmit={handleSubmit}
      className="grid items-start gap-4 sm:gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]"
    >
      <StudioControlsPanel />
      <StudioPreviewPanel />

      {viewedHistoryItem && (
        <HistoryPreviewDialog item={viewedHistoryItem} onClose={closeHistoryPreview} />
      )}
    </form>
  );
}

export default StudioWorkbench;