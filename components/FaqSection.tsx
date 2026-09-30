"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { Show, SignUpButton } from "@clerk/nextjs";
import { ArrowRightIcon, PlusIcon } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { GridBackground } from "@/components/GridBackground";
import { cn } from "@/lib/utils";

/**
 * FAQ content.
 *
 * The mechanical answers below are checked against how the app is actually
 * built (upload limits, the render flow, where billing lives). The answers
 * tagged CONFIRM describe what the app does today but still depend on business
 * policy that is not in this repo — replace those sentences with your own
 * wording, and publish the /privacy page the footer already links to — before
 * launch.
 *
 * Once the copy is settled, this array can move to "@/lib/constants" with the
 * rest of the content.
 */
type FaqItem = {
  question: string;
  answer: string;
  /** Optional single next step, rendered under the answer. */
  action?: { label: string; href: string };
};

const FAQ_ITEMS: FaqItem[] = [
  {
    question: "How does the style transfer work?",
    answer:
      "Upload a photo, pick one of the curated styles, and the engine restyles it while keeping the subject and composition of your original. It comes down to that single choice — no prompts to write, no settings to tune — and you can review the result next to your original in the studio.",
  },
  {
    question: "Will it keep my face and the composition intact?",
    answer:
      "That is what every style is built around. The engine works from your image instead of starting over, so identity cues, framing and the small details that make the photo yours carry through.",
    action: { label: "See the curated styles", href: "#styles" },
  },
  {
    question: "Are my photos stored or used to train models?",
    // CONFIRM: the render engine's own retention terms, then point this at /privacy.
    answer:
      "Your photo stays in your browser while you set up a render. It is only sent to the rendering engine when you press Render, where it is used to produce that result. We do not keep your uploads as a browsable library, and we do not train our own models on them.",
    action: { label: "Ask us about your data", href: "mailto:hello@reframe.ai" },
  },
  {
    question: "Is the free plan really free?",
    // CONFIRM: the real free-plan limits, from the plans configured in Clerk.
    answer:
      "Yes. You can create an account and render your own photo without entering a card. The pricing section lists exactly what each plan includes, including how many renders the free plan covers.",
    action: { label: "See what is included", href: "#pricing" },
  },
  {
    question: "Which file types can I upload, and what do I get back?",
    // Formats and the 10 MB ceiling mirror ACCEPTED_SOURCE_IMAGE_MIME_TYPES and
    // MAX_SOURCE_IMAGE_BYTES in lib/studio.ts, so this answer cannot drift.
    // CONFIRM: the output resolution your engine returns.
    answer:
      "JPEG, PNG and WebP up to 10 MB. Anything else is turned away in the browser before it uploads, so a wrong file never costs you a wait. Renders come back as a standard image file, shown next to your original.",
  },
  {
    question: "Can I use the results commercially?",
    // CONFIRM: insert your licence terms — this answer deliberately grants nothing.
    answer:
      "You keep the rights to the original photo you upload, and every render is generated from it. If you need written terms before using results in client work, prints or campaigns, ask us and we will send them over.",
    action: { label: "Ask about licensing", href: "mailto:hello@reframe.ai" },
  },
  {
    question: "Can I cancel or change my plan at any time?",
    // CONFIRM: check the avatar menu really shows subscriptions for your Clerk
    // Billing setup, plus your refund policy and what happens to a period
    // already paid for.
    answer:
      "Yes. Plans are billed and cancelled through your account menu, the avatar in the header, so you can change or cancel yourself without emailing us. Cancelling stops future billing.",
  },
];

const CTA_CLASSES =
  "w-full rounded-2xl px-7 text-base shadow-lg shadow-primary/20 transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/40 motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:w-auto";

export function FaqSection() {
  // One item open at a time. The first is open by default; clicking an open item closes it.
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const baseId = useId();

  // Shared styling for the answer actions: an outline pill with an arrow, so they
  // read as a next step rather than body text. Merged through cn so the outline
  // variant's base padding/size can be overridden by the pill overrides below.
  const actionClasses = cn(
    buttonVariants({ variant: "outline", size: "sm" }),
    "group/action mt-4 h-auto rounded-full px-4 py-2 text-xs sm:text-sm",
  );

  return (
    <GridBackground className="section-shell mt-6 px-4 py-12 sm:px-8 sm:py-20 lg:px-12">
      {/* scroll-mt keeps the heading clear of the fixed header when the nav link jumps here */}
      <section id="faq" className="relative z-10 mx-auto max-w-7xl scroll-mt-24">
        <div className="mx-auto max-w-3xl text-center">
          <div className="hero-pill caps-md inline-flex items-center rounded-full px-3.5 py-1.5 text-xs font-medium uppercase text-primary sm:px-4 sm:py-2">
            FAQ
          </div>

          <h2 className="mt-5 text-balance wrap-break-word font-sans text-3xl font-medium tracking-tight text-foreground min-[400px]:text-4xl sm:mt-6 sm:text-5xl lg:text-6xl">
            Questions, answered.
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-balance text-base leading-relaxed text-muted-foreground sm:mt-5 sm:text-lg sm:leading-7">
            Everything people usually ask before uploading their first photo.
          </p>
        </div>

        <div className="mx-auto mt-10 flex max-w-3xl flex-col gap-3 sm:mt-14 sm:gap-4">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openIndex === index;
            const buttonId = `${baseId}-button-${index}`;
            const panelId = `${baseId}-panel-${index}`;

            return (
              <div
                key={item.question}
                className={cn(
                  "group/item rounded-[1.25rem] border backdrop-blur-sm sm:rounded-[1.5rem]",
                  "transition-[translate,transform,border-color,box-shadow,background-color] duration-300 ease-out",
                  "motion-reduce:transition-none",
                  isOpen
                    ? "border-primary/50 bg-card shadow-lg shadow-primary/10"
                    : "border-border/60 bg-card/80 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md hover:shadow-primary/10 motion-reduce:hover:translate-y-0",
                )}
              >
                <h3>
                  <button
                    type="button"
                    id={buttonId}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="flex w-full items-center justify-between gap-4 rounded-[inherit] px-5 py-4 text-left outline-none focus-visible:ring-2 focus-visible:ring-primary/60 sm:px-6 sm:py-5"
                  >
                    <span className="min-w-0 text-base font-semibold tracking-tight text-foreground sm:text-lg">
                      {item.question}
                    </span>
                    <span
                      aria-hidden
                      className={cn(
                        "flex size-8 shrink-0 items-center justify-center rounded-full border transition-all duration-300 motion-reduce:transition-none sm:size-9",
                        isOpen
                          ? "rotate-45 border-primary bg-primary text-primary-foreground"
                          : "border-border/60 text-muted-foreground group-hover/item:border-primary/50 group-hover/item:text-primary",
                      )}
                    >
                      <PlusIcon className="size-4" />
                    </span>
                  </button>
                </h3>

                {/* Animates height with grid rows (0fr to 1fr). "invisible" when closed also
                    removes the hidden answer from the tab order and screen readers. */}
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  className={cn(
                    "grid transition-[grid-template-rows,opacity,visibility] duration-300 ease-out motion-reduce:transition-none",
                    isOpen
                      ? "visible grid-rows-[1fr] opacity-100"
                      : "invisible grid-rows-[0fr] opacity-0",
                  )}
                >
                  <div className="min-h-0 overflow-hidden">
                    <div className="px-5 pb-5 sm:px-6 sm:pb-6">
                      <p className="text-sm leading-relaxed text-muted-foreground sm:text-base sm:leading-7">
                        {item.answer}
                      </p>

                      {item.action ? (
                        // Hash/absolute targets are internal, everything else
                        // (mailto:) stays a plain anchor with no prefetching.
                        item.action.href.startsWith("#") || item.action.href.startsWith("/") ? (
                          <Link
                            href={item.action.href}
                            prefetch={false}
                            className={actionClasses}
                          >
                            {item.action.label}
                            <ArrowRightIcon className="size-3.5 transition-transform duration-300 motion-reduce:transition-none group-hover/action:translate-x-0.5" />
                          </Link>
                        ) : (
                          <a href={item.action.href} className={actionClasses}>
                            {item.action.label}
                            <ArrowRightIcon className="size-3.5 transition-transform duration-300 motion-reduce:transition-none group-hover/action:translate-x-0.5" />
                          </a>
                        )
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Closing call to action */}
        <div className="mx-auto mt-8 max-w-3xl rounded-[1.5rem] border border-border/70 bg-card/80 p-5 text-center backdrop-blur-sm sm:mt-10 sm:rounded-[2rem] sm:p-8">
          <p className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            Ready to see it on your own photo?
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
            Upload once, pick a curated style, and get a polished restyle.
          </p>
          <div className="mt-5 flex justify-center sm:mt-6">
            <Show when="signed-out">
              <SignUpButton mode="modal" fallbackRedirectUrl="/studio">
                <Button size="lg" className={CTA_CLASSES}>
                  Get Started Free
                </Button>
              </SignUpButton>
            </Show>

            <Show when="signed-in">
              {/* Links keep their own semantics, so they are styled with
                  `buttonVariants` instead of wrapping a <Link> in <Button>. */}
              <Link
                href="/studio"
                prefetch={false}
                className={buttonVariants({ size: "lg", className: CTA_CLASSES })}
              >
                Open Studio
              </Link>
            </Show>
          </div>
        </div>
      </section>
    </GridBackground>
  );
}
