import { ImagePlusIcon, PaletteIcon, SparklesIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { GridBackground } from "@/components/GridBackground";
import { HOW_IT_WORKS_STEPS, WORKFLOW_STYLE_PREVIEW } from "@/lib/constants";
import { cn } from "@/lib/utils";

// Shared hover treatment for the three big step cards: lift, primary-colored border and glow.
// Named group ("panel") lets children react to the card's hover without clashing with other groups.
// Hover styles only apply on devices that can hover, so touch screens don't get stuck states.
const PANEL_HOVER =
  "group/panel transition-[translate,transform,border-color,box-shadow] duration-300 ease-out " +
  "hover:-translate-y-1.5 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/20 " +
  "motion-reduce:transition-none motion-reduce:hover:translate-y-0";

// Icon tile in each card header: tilts and scales when its card is hovered
const ICON_HOVER =
  "transition-transform duration-300 group-hover/panel:-rotate-6 group-hover/panel:scale-110 " +
  "motion-reduce:transition-none motion-reduce:group-hover/panel:rotate-0 motion-reduce:group-hover/panel:scale-100";

export function HowItWorksSection() {
  return (
    <GridBackground className="section-shell mt-6 px-4 py-12 sm:px-8 sm:py-20 lg:px-12">
      <section id="how-it-works" className="relative z-10 mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <div className="hero-pill caps-md inline-flex items-center rounded-full px-3.5 py-1.5 text-xs font-medium uppercase text-primary sm:px-4 sm:py-2">
            How it works
          </div>

          <h2 className="mt-5 text-balance wrap-break-word font-sans text-3xl font-medium tracking-tight text-foreground min-[400px]:text-4xl sm:mt-6 sm:text-5xl lg:text-6xl">
            From original photo to art-directed result.
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-balance text-base leading-relaxed text-muted-foreground sm:mt-5 sm:text-lg sm:leading-7">
            A clean four-step workflow designed to feel fast, premium, and predictable from the
            first upload to the final export.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:mt-14 sm:gap-6 lg:grid-cols-12 lg:grid-rows-[1.05fr_0.95fr]">
          {/* Step 1 */}
          <article
            className={cn(
              "workflow-panel relative min-w-0 overflow-hidden rounded-[1.5rem] border border-border/70 p-5 sm:rounded-[2rem] sm:p-8 lg:col-span-5 lg:row-span-2",
              PANEL_HOVER,
            )}
          >
            <div className="relative z-10 flex h-full flex-col">
              <div className="mb-6 flex items-start justify-between gap-3 sm:mb-8 sm:gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium tracking-wide text-primary">
                    {HOW_IT_WORKS_STEPS[0].step}
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:mt-3 sm:text-3xl">
                    {HOW_IT_WORKS_STEPS[0].title}
                  </h3>
                </div>
                <div
                  className={cn(
                    "how-icon-ring flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground sm:size-14",
                    ICON_HOVER,
                  )}
                >
                  <ImagePlusIcon className="size-5 sm:size-6" />
                </div>
              </div>

              <div className="relative mb-6 flex min-h-[12rem] flex-1 items-center justify-center overflow-hidden rounded-[1.25rem] border border-border/60 bg-card transition-colors duration-300 group-hover/panel:border-primary/40 sm:mb-8 sm:min-h-[17rem] sm:rounded-[1.75rem]">
                <div className="absolute size-44 rounded-full border border-border/25 transition-[scale,border-color] duration-500 ease-out group-hover/panel:scale-110 group-hover/panel:border-primary/40 motion-reduce:transition-none motion-reduce:group-hover/panel:scale-100 sm:size-56" />
                <div className="absolute inset-5 rounded-[1.25rem] border border-dashed border-border/30 transition-colors duration-300 group-hover/panel:border-primary/50 sm:inset-8 sm:rounded-[1.5rem]" />
                <div className="how-icon-ring relative flex size-20 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform duration-500 ease-out group-hover/panel:scale-110 motion-reduce:transition-none motion-reduce:group-hover/panel:scale-100 sm:size-24">
                  <ImagePlusIcon className="size-8 sm:size-10" />
                </div>
              </div>

              <p className="max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base sm:leading-7">
                {HOW_IT_WORKS_STEPS[0].body}
              </p>
            </div>
          </article>

          {/* Step 2 */}
          <article
            className={cn(
              "workflow-panel relative min-w-0 overflow-hidden rounded-[1.5rem] border border-border/70 p-5 sm:rounded-[2rem] sm:p-8 lg:col-span-7",
              PANEL_HOVER,
            )}
          >
            <div className="relative z-10">
              <div className="mb-6 flex items-start justify-between gap-3 sm:mb-8 sm:gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium tracking-wide text-primary">
                    {HOW_IT_WORKS_STEPS[1].step}
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:mt-3 sm:text-3xl">
                    {HOW_IT_WORKS_STEPS[1].title}
                  </h3>
                </div>
                <div
                  className={cn(
                    "how-icon-ring flex size-12 shrink-0 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground sm:size-14",
                    ICON_HOVER,
                  )}
                >
                  <PaletteIcon className="size-5 sm:size-6" />
                </div>
              </div>

              {/* Stacked rows on phones, 3 columns from sm up. Each row has its own hover. */}
              <div className="grid gap-2.5 sm:grid-cols-3 sm:gap-3">
                {WORKFLOW_STYLE_PREVIEW.map((style, index) => (
                  <div
                    key={style}
                    className={cn(
                      "group/row cursor-default rounded-[1.25rem] border border-border/60 px-4 py-3 sm:rounded-[1.5rem] sm:py-4",
                      "transition-[translate,transform,border-color,box-shadow] duration-300 ease-out",
                      "hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/20",
                      "motion-reduce:transition-none motion-reduce:hover:translate-y-0",
                      index === 0 ? "bg-secondary shadow-lg shadow-primary/10" : "bg-card",
                    )}
                  >
                    {/* flex-wrap lets the badge drop below the name instead of squeezing it */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="min-w-0 text-sm font-semibold text-foreground">{style}</p>
                      {index === 0 ? (
                        <span className="shrink-0 rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground">
                          Selected
                        </span>
                      ) : (
                        <span className="shrink-0 rounded-full border border-border/60 px-2.5 py-1 text-xs text-muted-foreground transition-colors duration-300 group-hover/row:border-primary/50 group-hover/row:text-primary">
                          Preset
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <p className="mt-5 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:mt-6 sm:text-base sm:leading-7">
                {HOW_IT_WORKS_STEPS[1].body}
              </p>
            </div>
          </article>

          {/* Step 3 */}
          <article
            className={cn(
              "workflow-panel workflow-panel-featured relative min-w-0 overflow-hidden rounded-[1.5rem] border border-border/70 p-5 sm:rounded-[2rem] sm:p-8 lg:col-span-7",
              PANEL_HOVER,
            )}
          >
            <div className="relative z-10">
              <div className="mb-6 flex items-start justify-between gap-3 sm:mb-8 sm:gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium tracking-wide text-primary">
                    {HOW_IT_WORKS_STEPS[2].step}
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:mt-3 sm:text-3xl">
                    {HOW_IT_WORKS_STEPS[2].title}
                  </h3>
                </div>
                <div
                  className={cn(
                    "how-icon-ring flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground sm:size-14",
                    ICON_HOVER,
                  )}
                >
                  <SparklesIcon className="size-5 sm:size-6" />
                </div>
              </div>

              <div className="rounded-[1.25rem] border border-border/60 bg-card p-4 transition-colors duration-300 group-hover/panel:border-primary/40 sm:rounded-[1.75rem] sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
                  <div className="min-w-0">
                    <p className="caps-sm text-xs uppercase text-muted-foreground sm:text-sm">
                      Engine status
                    </p>
                    <p className="mt-1.5 text-xl font-semibold tracking-tight text-foreground sm:mt-2 sm:text-2xl">
                      Protecting identity and composition
                    </p>
                  </div>
                  <Button
                    size="sm"
                    className="pointer-events-none shrink-0 rounded-full shadow-lg shadow-primary/20 transition-shadow duration-300 group-hover/panel:shadow-xl group-hover/panel:shadow-primary/50"
                    tabIndex={-1}
                    type="button"
                  >
                    AI Rendering
                  </Button>
                </div>

                {/* Bar and percentage stay on one line, even on phones */}
                <div className="mt-5 grid grid-cols-[1fr_auto] items-center gap-3 sm:mt-6 sm:gap-4">
                  <div className="h-2.5 overflow-hidden rounded-full bg-secondary/70 sm:h-3">
                    <div className="h-full w-[78%] rounded-full bg-primary transition-shadow duration-300 group-hover/panel:shadow-[0_0_14px_var(--color-primary)]" />
                  </div>
                  <div className="whitespace-nowrap text-xs text-muted-foreground transition-colors duration-300 group-hover/panel:text-foreground sm:text-sm">
                    78% complete
                  </div>
                </div>
              </div>

              <p className="mt-5 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:mt-6 sm:text-base sm:leading-7">
                {HOW_IT_WORKS_STEPS[2].body}
              </p>
            </div>
          </article>
        </div>
      </section>
    </GridBackground>
  );
}
