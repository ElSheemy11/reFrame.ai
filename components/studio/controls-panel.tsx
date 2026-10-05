"use client";

import Link from "next/link";
import { RefreshCcwIcon, UploadIcon } from "lucide-react";

import { stylePresets } from "@/lib/style-presets";
import { MAX_SOURCE_IMAGE_LABEL } from "@/lib/studio";

import { buttonVariants } from "@/components/ui/button";
import { cn, formatHistoryDate } from "@/lib/utils";

import { useStudioWorkbench } from "@/context/StudioWorkbenchContext";
import { GenerateButton, StylePresetCard } from "./workbench-ui";

export function StudioControlsPanel() {
  const {
    error,
    file,
    inputId,
    isGenerateDisabled,
    isLoading,
    quota,
    replaceFile,
    selectedStyle,
    selectStyle,
  } = useStudioWorkbench();

  return (
    <section className="studio-panel min-w-0 rounded-[2rem] border p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <div className="studio-panel-inset flex size-12 shrink-0 items-center justify-center rounded-2xl border text-primary">
          <UploadIcon className="size-6" />
        </div>

        <div className="pt-0.5">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Create a styled result
          </h1>
          <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground sm:text-base">
            Upload an image, choose a style, and generate a new result.
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2 rounded-[1.35rem] border border-border/45 bg-background/25 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">
            <span className="tabular-nums text-base font-semibold text-primary sm:text-lg">{quota.remaining}</span>{" "}
            of <span className="tabular-nums">{quota.limit}</span> renders left this month
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {quota.resetsAt
              ? `Resets ${formatHistoryDate(quota.resetsAt)}.`
              : "Resets at the start of next month."}
          </p>

          {quota.remaining <= 0 ? (
            <p className="mt-2 text-xs font-medium text-destructive">
              You&apos;ve used every render this month. Generating stays off until your quota resets.
            </p>
          ) : null}
        </div>

        {quota.remaining <= 0 ? (
          <Link
            href="/#pricing"
            className={cn(buttonVariants({ variant: "default" }), "shrink-0 text-sm font-medium")}
          >
            View plans
          </Link>
        ) : null}
      </div>

      <div className="studio-panel-inset mt-4 rounded-[1.8rem] border p-4 sm:p-5">
        <div className="flex items-center justify-between gap-4">
          <p className="text-lg font-semibold text-foreground">
            1. Upload image
          </p>

          {file ? (
            <label
              htmlFor={inputId}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "studio-pill cursor-pointer gap-2 rounded-full px-3.5 py-1.5 text-xs",
              )}
            >
              <RefreshCcwIcon className="size-4" />
              Change
            </label>
          ) : null}
        </div>

        <input
          id={inputId}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onClick={(e) => {
            e.currentTarget.value = "";
          }}
          onChange={(e) => replaceFile(e.target.files?.[0] ?? null)}
        />

        <div className="mt-4 flex flex-col gap-3 rounded-[1.45rem] border border-border/35 bg-background/22 p-3.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <label
              htmlFor={inputId}
              className={cn(
                buttonVariants({ variant: "default" }),
                "studio-primary-action h-11 cursor-pointer rounded-full px-5 text-sm font-semibold",
              )}
            >
              {file ? "Replace Image" : "Upload Image"}
            </label>

            <p className="max-w-xl min-w-0 truncate text-sm text-muted-foreground">
              {file ? file.name : "Choose a JPG, PNG, or WEBP file to begin."}
            </p>
          </div>
        </div>

        <p className="mt-4 text-sm text-muted-foreground">
          JPG, PNG or WEBP, up to {MAX_SOURCE_IMAGE_LABEL}.
        </p>
      </div>

      <div className="mt-5">
        <p className="text-lg font-semibold text-foreground">
          2. Choose a style
        </p>

        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
          {stylePresets.map((preset) => (
            <StylePresetCard
              key={preset.id}
              isSelected={preset.id === selectedStyle}
              label={preset.label}
              onSelect={() => selectStyle(preset.id)}
              thumbnailAlt={`${preset.label} example`}
              thumbnailPath={preset.thumbnail}
            />
          ))}
        </div>
      </div>

      <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
        A first version will be generated right away. You can refine it further if needed.
      </p>

      <GenerateButton disabled={isGenerateDisabled} isLoading={isLoading} />

      <p className="mt-4 text-center text-sm text-muted-foreground">
        Styling is powered by Cloudflare Workers AI.
      </p>

      {error ? (
        <div className="mt-4 rounded-[1.3rem] border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}
    </section>
  );
}