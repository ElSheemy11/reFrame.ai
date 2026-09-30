"use client";

import Image from "next/image";
import { CheckIcon } from "lucide-react";

import { STUDIO_PRESETS, type StudioPresetId } from "@/lib/studio";
import { cn } from "@/lib/utils";

/**
 * Grid of curated looks. Rendered as a radio group so keyboard and screen
 * reader users get "one of these is selected" semantics rather than a set of
 * unrelated toggle buttons.
 */
export function StudioPresetPicker({
  value,
  disabled,
  onChange,
}: {
  value: StudioPresetId;
  disabled: boolean;
  onChange: (presetId: StudioPresetId) => void;
}) {
  return (
    <section className="studio-panel rounded-[1.5rem] border p-4 sm:p-5">
      <div className="min-w-0">
        <h2 className="text-sm font-semibold tracking-tight text-foreground">Style</h2>
        <p className="mt-1 text-xs text-muted-foreground">Curated looks. No prompts, no sliders.</p>
      </div>

      <div
        role="radiogroup"
        aria-label="Style preset"
        className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3"
      >
        {STUDIO_PRESETS.map((preset) => {
          const selected = preset.id === value;

          return (
            <button
              key={preset.id}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={disabled}
              onClick={() => onChange(preset.id)}
              className={cn(
                "studio-preset-card group relative rounded-[1.25rem] border p-2 text-left",
                "transition-[border-color,box-shadow,translate] duration-300 hover:-translate-y-0.5",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                "disabled:pointer-events-none disabled:opacity-60",
                "motion-reduce:transition-none motion-reduce:hover:translate-y-0",
                selected && "studio-preset-card-selected",
              )}
            >
              <span className="relative block aspect-[4/3] w-full overflow-hidden rounded-[0.9rem] bg-secondary/40">
                <Image
                  src={preset.thumbnail}
                  alt={`${preset.label} example`}
                  fill
                  sizes="(max-width: 640px) 40vw, (max-width: 1024px) 26vw, 180px"
                  className="object-cover"
                />
              </span>

              <span className="mt-2 flex items-center justify-between gap-2 px-1">
                <span className="truncate text-xs font-medium text-foreground sm:text-sm">
                  {preset.label}
                </span>
                {selected ? <CheckIcon className="size-3.5 shrink-0 text-primary" /> : null}
              </span>

              <span className="mt-1 block px-1 pb-1 text-[0.68rem] leading-snug text-muted-foreground">
                {preset.blurb}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
