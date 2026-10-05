import Image from "next/image";
import { CircleDotIcon, DownloadIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { downloadImageFromUrl } from "@/lib/utils";

import { useStudioWorkbench } from "@/context/StudioWorkbenchContext";
import { HistoryCard, PreviewFrame, ResultPreviewFrame } from "./workbench-ui";

export function StudioPreviewPanel() {
  const {
    history,
    isLoading,
    openHistoryPreview,
    removeHistoryItem,
    resultPreview,
    selectedPreset,
    sourcePreview,
  } = useStudioWorkbench();

  return (
    <section className="studio-panel min-w-0 rounded-[2rem] border p-4 sm:p-5">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-foreground">Preview</h2>
        <p className="mt-1.5 text-sm text-muted-foreground sm:text-base">
          See the original and the generated result side by side.
        </p>
      </div>

      <div className="studio-panel-inset mt-4 rounded-[1.9rem] border p-4 sm:p-5">
        <div className="grid gap-4 sm:grid-cols-2 sm:gap-0">
          <div className="min-w-0 sm:border-r sm:border-border/30 sm:pr-6">
            <PreviewFrame label="Original">
              {sourcePreview ? (
                <Image
                  src={sourcePreview}
                  alt="Uploaded source preview"
                  fill
                  unoptimized
                  className="object-contain"
                />
              ) : (
                <Image
                  src="/original.png"
                  alt="Original example preview"
                  fill
                  className="object-contain"
                />
              )}
            </PreviewFrame>
          </div>

          <div className="min-w-0 sm:pl-6">
            <PreviewFrame label="Result">
              <ResultPreviewFrame
                fallbackAlt={`${selectedPreset.label} example`}
                fallbackSrc={selectedPreset.thumbnail}
                isLoading={isLoading}
                resultPreview={resultPreview}
              />
            </PreviewFrame>

            {resultPreview && !isLoading ? (
              <Button
                type="button"
                variant="outline"
                className="studio-pill mt-3 h-10 w-full gap-2 rounded-full px-4 text-sm"
                onClick={() => {
                  void downloadImageFromUrl(resultPreview, `${selectedPreset.id}-result.png`);
                }}
              >
                <DownloadIcon className="size-4" />
                Download result
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-start gap-2.5 text-sm text-muted-foreground">
        <CircleDotIcon className="mt-0.5 size-4 shrink-0 text-primary" />
        <p>The result is generated with Cloudflare Workers AI style transfer.</p>
      </div>

      <div className="studio-panel-inset mt-5 rounded-[1.9rem] border p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-foreground">History</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Your saved generations are private to your account.
            </p>
          </div>
          <Button
            variant="outline"
            type="button"
            tabIndex={-1}
            className="studio-pill pointer-events-none shrink-0 rounded-full px-4 py-2 text-sm"
          >
            {history.length} saved
          </Button>
        </div>

        {history.length ? (
          <div className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(11rem,1fr))] gap-3 sm:gap-4">
            {history.map((item) => (
              <HistoryCard
                key={item.id}
                item={item}
                onView={() => openHistoryPreview(item)}
                onDelete={() => {
                  void removeHistoryItem(item.id);
                }}
              />
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-[1.4rem] border border-dashed border-border/35 bg-background/15 px-4 py-5 text-sm text-muted-foreground">
            Your generation history will appear here after your first successful result.
          </div>
        )}
      </div>
    </section>
  );
}