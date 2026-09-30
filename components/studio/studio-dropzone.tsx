"use client";

import * as React from "react";
import { ImagePlusIcon, Trash2Icon, UploadIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { MAX_SOURCE_IMAGE_LABEL, SOURCE_IMAGE_ACCEPT_ATTRIBUTE } from "@/lib/studio";
import { cn } from "@/lib/utils";

/** A source image that passed validation and is ready to render. */
export type StudioSource = {
  /** The original file, posted to `/api/generate` untouched. */
  file: File;
  /** Data URL used only for the on-screen preview. */
  previewUrl: string;
  name: string;
  sizeLabel: string;
};

export function StudioDropzone({
  source,
  error,
  disabled,
  onSelect,
  onClear,
}: {
  source: StudioSource | null;
  /** Validation message for the last picked file, if it was rejected. */
  error: string | null;
  disabled: boolean;
  onSelect: (file: File) => void;
  onClear: () => void;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = React.useState(false);

  function pickFile(files: FileList | null) {
    const [file] = Array.from(files ?? []);
    if (file) onSelect(file);
  }

  function openFileDialog() {
    inputRef.current?.click();
  }

  function handleDragOver(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    if (!disabled) setDragging(true);
  }

  function handleDragLeave(event: React.DragEvent<HTMLDivElement>) {
    // `dragleave` also fires when the pointer crosses into a child element, so
    // only clear the state once it has actually left the panel.
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
    setDragging(false);
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    if (disabled) return;
    pickFile(event.dataTransfer.files);
  }

  const dropTargetLabel = dragging ? "Drop to use this photo" : "Drop a photo here";

  return (
    <section
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "studio-panel rounded-[1.5rem] border p-4 transition-colors duration-300 sm:p-5",
        dragging && "border-primary/60",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold tracking-tight text-foreground">Source image</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            JPEG, PNG or WebP, up to {MAX_SOURCE_IMAGE_LABEL}.
          </p>
        </div>

        {source ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="shrink-0 rounded-full text-xs text-muted-foreground hover:text-foreground"
          >
            <Trash2Icon className="size-3.5" />
            Remove
          </Button>
        ) : null}
      </div>

      {/* One hidden input drives both the click-to-browse button and Replace */}
      <input
        ref={inputRef}
        type="file"
        accept={SOURCE_IMAGE_ACCEPT_ATTRIBUTE}
        className="sr-only"
        onChange={(event) => {
          pickFile(event.target.files);
          // Reset so picking the same file twice still fires `change`.
          event.target.value = "";
        }}
      />

      {source ? (
        <div className="studio-panel-inset mt-4 overflow-hidden rounded-[1.25rem] border">
          <div className="relative aspect-[4/3] w-full bg-secondary/40">
            {/* Data URLs cannot go through next/image's optimizer. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={source.previewUrl}
              alt={`Preview of ${source.name}`}
              className="h-full w-full object-contain"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/50 px-4 py-3">
            <p className="min-w-0 flex-1 truncate text-xs text-muted-foreground" title={source.name}>
              {source.name} · {source.sizeLabel}
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={openFileDialog}
              disabled={disabled}
              className="shrink-0 rounded-full text-xs"
            >
              <UploadIcon className="size-3.5" />
              Replace
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={openFileDialog}
          disabled={disabled}
          className={cn(
            "studio-panel-inset mt-4 flex w-full flex-col items-center justify-center gap-2 rounded-[1.25rem] border border-dashed px-5 py-9 text-center",
            "transition-colors duration-300 hover:border-primary/50 focus-visible:border-primary/60 focus-visible:outline-none",
            "disabled:pointer-events-none disabled:opacity-60",
            dragging && "border-primary/60",
          )}
        >
          <span className="flex size-11 items-center justify-center rounded-2xl bg-primary/14 text-primary">
            <ImagePlusIcon className="size-5" />
          </span>
          <span className="text-sm font-medium text-foreground">{dropTargetLabel}</span>
          <span className="text-xs text-muted-foreground">or click to browse your files</span>
        </button>
      )}

      {error ? (
        <p role="alert" className="mt-3 text-xs leading-relaxed text-destructive">
          {error}
        </p>
      ) : null}
    </section>
  );
}
