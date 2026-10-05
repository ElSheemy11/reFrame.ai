import Image from "next/image";
import { CheckIcon, DownloadIcon, Loader2Icon, Trash2Icon, WandSparklesIcon } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, downloadImageFromUrl } from "@/lib/utils";
import { GenerationHistorySummaryItem } from "@/lib/types";

const previewFrameClassName =
  "relative mt-3 aspect-[4/5] max-h-[60dvh] w-full overflow-hidden rounded-[1.45rem] bg-background/28";

/** Copy shown under the result while a render is in flight, cycled every 2.5s. */
const WAITING_MESSAGES = [
  "Gathering info…",
  "Detecting faces…",
  "Studying the lighting…",
  "Mapping the composition…",
  "Sketching the style…",
  "Mixing the colours…",
  "Adding finishing touches…",
  "Almost there…",
] as const;

/**
 * Cycles `WAITING_MESSAGES` every 2.5 seconds while visible. It only exists
 * during a render, so each run restarts at the first message, and it clears its
 * own timer when it unmounts.
 */
function WaitingMessage() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % WAITING_MESSAGES.length);
    }, 2500);

    return () => clearInterval(timer);
  }, []);

  return (
    <p
      role="status"
      aria-live="polite"
      className="mt-3 pb-2 text-center text-sm text-muted-foreground"
    >
      {WAITING_MESSAGES[index]}
    </p>
  );
}

export function GenerateButton({ disabled, isLoading }: { disabled: boolean; isLoading: boolean }) {
  return (
    <Button
      type="submit"
      disabled={disabled}
      className={cn(
        "studio-primary-action mt-3 h-11 w-full rounded-full text-sm font-semibold sm:w-auto sm:px-8",
      )}
    >
      {isLoading ? (
        <>
          <Loader2Icon className="animate-spin size-4" /> Generating
        </>
      ) : (
        <>
          <WandSparklesIcon className="size-4" /> Generate
        </>
      )}
    </Button>
  );
}

export function StylePresetCard({
  isSelected,
  label,
  onSelect,
  thumbnailAlt,
  thumbnailPath,
}: {
  isSelected: boolean;
  label: string;
  onSelect: () => void;
  thumbnailAlt: string;
  thumbnailPath: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "studio-panel-inset group relative overflow-hidden rounded-[1.85rem] border text-left",
        isSelected ? "studio-preset-card-selected" : "studio-preset-card",
      )}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-background/25">
        <Image
          src={thumbnailPath}
          alt={thumbnailAlt}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />

        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background via-background/50 to-transparent" />

        {isSelected ? (
          <div className="studio-primary-action absolute right-2.5 top-2.5 flex size-8 items-center justify-center rounded-full text-primary-foreground">
            <CheckIcon className="size-4" />
          </div>
        ) : null}

        <div className="absolute inset-x-0 bottom-0 px-3.5 pb-3.5 pt-6">
          <p className="text-sm font-semibold text-primary-foreground drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)]">
            {label}
          </p>
        </div>
      </div>
    </button>
  );
}

export function PreviewFrame({ children, label }: { children: ReactNode; label: string }) {
  return (
    <>
      <p className="caps-xl text-xs font-semibold uppercase text-muted-foreground">{label}</p>
      <div className={previewFrameClassName}>{children}</div>
    </>
  );
}

export function ResultPreviewFrame({
  fallbackAlt,
  fallbackSrc,
  isLoading,
  resultPreview,
}: {
  fallbackAlt: string;
  fallbackSrc: string;
  isLoading: boolean;
  resultPreview: string | null;
}) {
  if (isLoading) {
    return (
      <div className="flex h-full flex-col justify-between p-4">
        <Skeleton className="h-full w-full rounded-[1rem]" />
        <WaitingMessage />
      </div>
    );
  }

  if (resultPreview) {
    return (
      <Image
        src={resultPreview}
        alt="Generated styled result"
        fill
        unoptimized
        className="object-cover"
      />
    );
  }

  return <Image src={fallbackSrc} alt={fallbackAlt} fill className="object-cover" />;
}

export function HistoryCard({
  item,
  onDelete,
  onView,
}: {
  item: GenerationHistorySummaryItem;
  /** Optional: removes this render from history after confirmation. */
  onDelete?: () => void;
  onView: () => void;
}) {
  return (
    <div className="studio-panel-inset studio-history-card min-w-0 rounded-[1.45rem] border">
      <div className="relative aspect-[1.1] w-full overflow-hidden rounded-t-[1.45rem] bg-background/20">
        <Image
          src={item.resultImageUrl}
          alt={`${item.styleLabel} history preview`}
          fill
          unoptimized
          className="object-cover"
        />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-background via-background/55 to-transparent" />
      </div>

      <div className="flex flex-wrap items-center gap-2 p-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="studio-pill h-10 min-w-0 flex-1 shrink rounded-full px-3 text-xs"
          onClick={onView}
        >
          <span className="truncate">View</span>
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="studio-pill size-10 shrink-0 rounded-full p-0"
          aria-label="Download result"
          onClick={() => {
            void downloadImageFromUrl(item.resultImageUrl, `${item.styleSlug}-result.png`);
          }}
        >
          <DownloadIcon className="size-3.5" />
        </Button>

        {onDelete ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="studio-pill size-10 shrink-0 rounded-full p-0"
            aria-label="Delete result"
            onClick={() => {
              if (window.confirm("Delete this render? This can't be undone.")) {
                onDelete();
              }
            }}
          >
            <Trash2Icon className="size-3.5" />
          </Button>
        ) : null}
      </div>
    </div>
  );
}