"use client";

import * as React from "react";
import {
  CircleCheckIcon,
  HistoryIcon,
  ImageOffIcon,
  Loader2Icon,
  PlugZapIcon,
  SparklesIcon,
  TriangleAlertIcon,
} from "lucide-react";

import { StudioDropzone, type StudioSource } from "@/components/studio/studio-dropzone";
import { StudioPresetPicker } from "@/components/studio/studio-preset-picker";
import { Button } from "@/components/ui/button";
import {
  DEFAULT_STUDIO_PRESET_ID,
  GENERATE_ENDPOINT,
  MAX_SOURCE_IMAGE_LABEL,
  STUDIO_HISTORY_LIMIT,
  STUDIO_PRESETS,
  findStudioPreset,
  formatBytes,
  isStudioGenerateError,
  rejectSourceImage,
  type StudioGeneration,
  type StudioPresetId,
} from "@/lib/studio";
import { cn } from "@/lib/utils";

/** Reads a picked file as a data URL, so previews need no object-URL cleanup. */
function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/** Local time for a finished render, e.g. "2:03 PM". */
function formatTime(isoTimestamp: string): string {
  return new Date(isoTimestamp).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

/**
 * The studio workspace: pick a source image, pick a curated style, then render
 * and compare. Everything except the render step works today — rendering needs
 * an engine behind `/api/generate`, and while none is configured the notice
 * below explains what to set and Render stays disabled.
 */
export function StudioWorkspace({ engineConnected }: { engineConnected: boolean }) {
  const [source, setSource] = React.useState<StudioSource | null>(null);
  const [sourceError, setSourceError] = React.useState<string | null>(null);
  const [presetId, setPresetId] = React.useState<StudioPresetId>(DEFAULT_STUDIO_PRESET_ID);
  const [rendering, setRendering] = React.useState(false);
  const [renderError, setRenderError] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<StudioGeneration | null>(null);
  const [history, setHistory] = React.useState<StudioGeneration[]>([]);

  const activePreset = findStudioPreset(presetId) ?? STUDIO_PRESETS[0];
  const canRender = engineConnected && source !== null && !rendering;

  async function selectSource(file: File) {
    const rejection = rejectSourceImage(file);

    if (rejection === "type") {
      setSourceError("That file type is not supported. Use a JPEG, PNG or WebP image.");
      return;
    }
    if (rejection === "size") {
      setSourceError(`That image is larger than ${MAX_SOURCE_IMAGE_LABEL}.`);
      return;
    }

    try {
      const previewUrl = await readAsDataUrl(file);
      setSourceError(null);
      setRenderError(null);
      setResult(null);
      setSource({ file, previewUrl, name: file.name, sizeLabel: formatBytes(file.size) });
    } catch {
      setSourceError("That file could not be read. Try another image.");
    }
  }

  function clearSource() {
    setSource(null);
    setSourceError(null);
    setRenderError(null);
    setResult(null);
  }

  function resetWorkspace() {
    clearSource();
    setPresetId(DEFAULT_STUDIO_PRESET_ID);
    setHistory([]);
  }

  async function renderRestyle() {
    if (!source || !canRender) return;

    setRendering(true);
    setRenderError(null);

    const body = new FormData();
    body.append("photo", source.file);
    body.append("presetId", presetId);

    try {
      const response = await fetch(GENERATE_ENDPOINT, { method: "POST", body });
      const payload: unknown = await response.json().catch(() => null);

      if (!response.ok || isStudioGenerateError(payload)) {
        setRenderError(
          isStudioGenerateError(payload)
            ? payload.error.message
            : "The render could not be completed. Please try again.",
        );
        return;
      }

      const generation = payload as StudioGeneration;
      setResult(generation);
      setHistory((previous) => [generation, ...previous].slice(0, STUDIO_HISTORY_LIMIT));
    } catch {
      setRenderError("The render request could not be sent. Check your connection and try again.");
    } finally {
      setRendering(false);
    }
  }

  return (
    <section className="relative z-10 mx-auto w-full max-w-6xl">
      <header className="mx-auto flex w-full max-w-2xl flex-col items-center text-center">
        <div className="hero-pill caps-md inline-flex items-center rounded-full px-3.5 py-1.5 text-xs font-medium uppercase text-primary sm:px-4 sm:py-2">
          Studio
        </div>

        <h1 className="mt-5 text-balance font-sans text-3xl font-medium tracking-tight text-foreground min-[400px]:text-4xl sm:mt-6 sm:text-5xl">
          Restyle a photo, compare it side by side
        </h1>

        <p className="mt-4 max-w-xl text-balance text-base leading-relaxed text-muted-foreground sm:text-lg">
          Upload one image and pick a curated style. Your file stays in the browser until you
          render.
        </p>
      </header>

      {engineConnected ? null : (
        <div
          role="status"
          className="studio-pill mx-auto mt-8 flex max-w-3xl items-start gap-3 rounded-2xl border p-4 sm:p-5"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/14 text-primary">
            <PlugZapIcon className="size-4" />
          </span>

          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">No style engine connected yet</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              The workspace is wired end to end, but nothing is rendering images yet, so{" "}
              <span className="font-medium text-foreground">Render restyle</span> stays disabled.
              Set{" "}
              <code className="rounded bg-secondary/60 px-1 py-0.5 text-foreground">
                GOOGLE_GENERATIVE_AI_API_KEY
              </code>{" "}
              to switch rendering on.
            </p>
          </div>
        </div>
      )}

      <div className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <div className="flex min-w-0 flex-col gap-5">
          <StudioDropzone
            source={source}
            error={sourceError}
            disabled={rendering}
            onSelect={selectSource}
            onClear={clearSource}
          />

          <StudioPresetPicker value={presetId} disabled={rendering} onChange={setPresetId} />
        </div>

        <section className="studio-panel flex min-w-0 flex-col rounded-[1.5rem] border p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-sm font-semibold tracking-tight text-foreground">Result</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Compare the original against the {activePreset.label} render.
              </p>
            </div>

            <span className="studio-pill-strong inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-[0.68rem] font-medium text-muted-foreground">
              {engineConnected ? (
                <CircleCheckIcon className="size-3.5 text-primary" />
              ) : (
                <TriangleAlertIcon className="size-3.5" />
              )}
              {engineConnected ? "Engine connected" : "Engine offline"}
            </span>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <figure className="studio-panel-inset m-0 flex flex-col overflow-hidden rounded-[1.25rem] border">
              <div className="relative aspect-[4/3] w-full bg-secondary/40">
                {source ? (
                  // Data URLs bypass next/image's optimizer.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={source.previewUrl}
                    alt={`Original ${source.name}`}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center">
                    <ImageOffIcon className="size-5 text-muted-foreground/70" />
                    <p className="text-xs text-muted-foreground">No source image yet.</p>
                  </div>
                )}
              </div>

              <figcaption className="caps-xs border-t border-border/50 px-3.5 py-2 text-[0.65rem] font-medium uppercase text-muted-foreground">
                Original
              </figcaption>
            </figure>

            <figure className="studio-panel-inset m-0 flex flex-col overflow-hidden rounded-[1.25rem] border">
              <div className="relative aspect-[4/3] w-full bg-secondary/40">
                {rendering ? (
                  <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center">
                    <Loader2Icon className="size-5 animate-spin text-primary" />
                    <p className="text-xs text-muted-foreground">Rendering restyle…</p>
                  </div>
                ) : result ? (
                  // Engine hosts are unknown at build time, so this stays a plain <img>.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={result.imageUrl}
                    alt={`${result.presetLabel} restyle`}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center">
                    <SparklesIcon className="size-5 text-muted-foreground/70" />
                    <p className="text-xs text-muted-foreground">
                      {engineConnected
                        ? "Render to see the styled result."
                        : "The styled result will appear here."}
                    </p>
                  </div>
                )}
              </div>

              <figcaption className="caps-xs border-t border-border/50 px-3.5 py-2 text-[0.65rem] font-medium uppercase text-muted-foreground">
                {activePreset.label}
              </figcaption>
            </figure>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            {/* Styled straight from the studio layer classes: the Button
                primitive's variant background would override the gradient. */}
            <button
              type="button"
              onClick={renderRestyle}
              disabled={!canRender}
              title={engineConnected ? undefined : "Connect a style engine to enable rendering"}
              className={cn(
                "studio-primary-action inline-flex items-center gap-2 rounded-full px-6 py-3",
                "text-sm font-medium text-primary-foreground transition-[filter,translate] duration-300",
                "hover:brightness-110 active:translate-y-px",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                "disabled:pointer-events-none disabled:opacity-55 motion-reduce:transition-none",
              )}
            >
              {rendering ? (
                <Loader2Icon className="size-4 animate-spin" />
              ) : (
                <SparklesIcon className="size-4" />
              )}
              {rendering ? "Rendering" : "Render restyle"}
            </button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={resetWorkspace}
              disabled={rendering || (!source && history.length === 0)}
              className="rounded-full text-xs text-muted-foreground hover:text-foreground"
            >
              Reset workspace
            </Button>
          </div>

          {renderError ? (
            <p
              role="alert"
              className="studio-pill mt-4 flex items-start gap-2 rounded-2xl border px-3 py-2.5 text-xs leading-relaxed text-destructive"
            >
              <TriangleAlertIcon className="mt-0.5 size-3.5 shrink-0" />
              <span>{renderError}</span>
            </p>
          ) : null}

          <p role="status" aria-live="polite" className="mt-4 text-xs text-muted-foreground">
            {rendering
              ? `Rendering with ${activePreset.label}…`
              : result
                ? `Rendered with ${result.presetLabel} at ${formatTime(result.createdAt)}.`
                : "Nothing rendered in this session yet."}
          </p>
        </section>
      </div>

      <section aria-labelledby="studio-history-heading" className="mt-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2
            id="studio-history-heading"
            className="flex items-center gap-2 text-sm font-semibold tracking-tight text-foreground"
          >
            <HistoryIcon className="size-4 text-muted-foreground" />
            Session history
          </h2>

          {history.length > 0 ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setHistory([])}
              className="rounded-full text-xs text-muted-foreground hover:text-foreground"
            >
              Clear history
            </Button>
          ) : null}
        </div>

        {history.length === 0 ? (
          <p className="studio-pill mt-3 rounded-2xl border px-4 py-6 text-center text-xs text-muted-foreground">
            Renders from this session will collect here.
          </p>
        ) : (
          <ul className="m-0 grid list-none grid-cols-2 gap-3 p-0 sm:grid-cols-3 lg:grid-cols-4">
            {history.map((generation) => (
              <li
                key={generation.id}
                className="studio-history-card overflow-hidden rounded-2xl border border-border/60"
              >
                <div className="relative aspect-[4/3] w-full bg-secondary/40">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={generation.imageUrl}
                    alt={`${generation.presetLabel} restyle`}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="flex items-center justify-between gap-2 px-3 py-2">
                  <span className="truncate text-xs font-medium text-foreground">
                    {generation.presetLabel}
                  </span>
                  <span className="shrink-0 text-[0.65rem] text-muted-foreground">
                    {formatTime(generation.createdAt)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </section>
  );
}
