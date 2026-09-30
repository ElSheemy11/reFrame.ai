"use client";

import * as React from "react";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { LucideIcon } from "lucide-react";
import { ArrowUpIcon, HeartIcon, SparklesIcon } from "lucide-react";

import { cn } from "@/lib/utils";

// ScrollTrigger reads window/document, so only register it in the browser.
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// -------------------------------------------------------------------------
// 1. THEME-ADAPTIVE INLINE STYLES
// The footer font is loaded once with next/font (see app/layout.tsx) instead
// of an @import here, so it is self-hosted and never render-blocking.
// -------------------------------------------------------------------------
const STYLES = `
.cinematic-footer-wrapper {
  font-family: var(--font-plus-jakarta), var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;

  /* Dynamic variables built from the standard shadcn tokens */
  --pill-bg-1: color-mix(in oklch, var(--foreground) 3%, transparent);
  --pill-bg-2: color-mix(in oklch, var(--foreground) 1%, transparent);
  --pill-shadow: color-mix(in oklch, var(--background) 50%, transparent);
  --pill-highlight: color-mix(in oklch, var(--foreground) 10%, transparent);
  --pill-inset-shadow: color-mix(in oklch, var(--background) 80%, transparent);
  --pill-border: color-mix(in oklch, var(--foreground) 8%, transparent);

  --pill-bg-1-hover: color-mix(in oklch, var(--foreground) 8%, transparent);
  --pill-bg-2-hover: color-mix(in oklch, var(--foreground) 2%, transparent);
  --pill-border-hover: color-mix(in oklch, var(--foreground) 20%, transparent);
  --pill-shadow-hover: color-mix(in oklch, var(--background) 70%, transparent);
  --pill-highlight-hover: color-mix(in oklch, var(--foreground) 20%, transparent);
}

@keyframes footer-breathe {
  0% { transform: translate(-50%, -50%) scale(1); opacity: 0.6; }
  100% { transform: translate(-50%, -50%) scale(1.1); opacity: 1; }
}

@keyframes footer-scroll-marquee {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}

@keyframes footer-heartbeat {
  0%, 100% { transform: scale(1); filter: drop-shadow(0 0 5px color-mix(in oklch, var(--destructive) 50%, transparent)); }
  15%, 45% { transform: scale(1.2); filter: drop-shadow(0 0 10px color-mix(in oklch, var(--destructive) 80%, transparent)); }
  30% { transform: scale(1); }
}

.animate-footer-breathe {
  animation: footer-breathe 8s ease-in-out infinite alternate;
}

.animate-footer-scroll-marquee {
  animation: footer-scroll-marquee 40s linear infinite;
}

.animate-footer-heartbeat {
  animation: footer-heartbeat 2s cubic-bezier(0.25, 1, 0.5, 1) infinite;
}

/* Theme-adaptive grid background */
.footer-bg-grid {
  background-size: 60px 60px;
  background-image:
    linear-gradient(to right, color-mix(in oklch, var(--foreground) 3%, transparent) 1px, transparent 1px),
    linear-gradient(to bottom, color-mix(in oklch, var(--foreground) 3%, transparent) 1px, transparent 1px);
  mask-image: linear-gradient(to bottom, transparent, black 30%, black 70%, transparent);
  -webkit-mask-image: linear-gradient(to bottom, transparent, black 30%, black 70%, transparent);
}

/* Theme-adaptive aurora glow */
.footer-aurora {
  background: radial-gradient(
    circle at 50% 50%,
    color-mix(in oklch, var(--primary) 15%, transparent) 0%,
    color-mix(in oklch, var(--secondary) 15%, transparent) 40%,
    transparent 70%
  );
}

/* Glass pill theming */
.footer-glass-pill {
  background: linear-gradient(145deg, var(--pill-bg-1) 0%, var(--pill-bg-2) 100%);
  box-shadow:
      0 10px 30px -10px var(--pill-shadow),
      inset 0 1px 1px var(--pill-highlight),
      inset 0 -1px 2px var(--pill-inset-shadow);
  border: 1px solid var(--pill-border);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.footer-glass-pill:hover {
  background: linear-gradient(145deg, var(--pill-bg-1-hover) 0%, var(--pill-bg-2-hover) 100%);
  border-color: var(--pill-border-hover);
  box-shadow:
      0 20px 40px -10px var(--pill-shadow-hover),
      inset 0 1px 1px var(--pill-highlight-hover);
  color: var(--foreground);
}

/* Giant background text masking */
.footer-giant-bg-text {
  font-size: 26vw;
  line-height: 0.75;
  font-weight: 900;
  letter-spacing: -0.05em;
  color: transparent;
  -webkit-text-stroke: 1px color-mix(in oklch, var(--foreground) 5%, transparent);
  background: linear-gradient(180deg, color-mix(in oklch, var(--foreground) 10%, transparent) 0%, transparent 60%);
  -webkit-background-clip: text;
  background-clip: text;
}

/* Metallic text glow */
.footer-text-glow {
  background: linear-gradient(180deg, var(--foreground) 0%, color-mix(in oklch, var(--foreground) 40%, transparent) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0px 0px 20px color-mix(in oklch, var(--foreground) 15%, transparent));
}

/* Respect the OS "reduce motion" setting: keep the layout, drop the loops. */
@media (prefers-reduced-motion: reduce) {
  .animate-footer-breathe,
  .animate-footer-scroll-marquee,
  .animate-footer-heartbeat {
    animation: none;
  }
}
`;

// -------------------------------------------------------------------------
// 2. MAGNETIC BUTTON PRIMITIVE (GSAP only, no extra dependencies)
// -------------------------------------------------------------------------
export type MagneticButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    as?: React.ElementType;
  };

const MagneticButton = React.forwardRef<HTMLElement, MagneticButtonProps>(
  ({ className, children, as: Component = "button", ...props }, forwardedRef) => {
    const localRef = useRef<HTMLElement | null>(null);

    // Keep the internal GSAP target and any caller-supplied ref in sync.
    const setRefs = React.useCallback(
      (node: HTMLElement | null) => {
        localRef.current = node;
        if (typeof forwardedRef === "function") forwardedRef(node);
        else if (forwardedRef) forwardedRef.current = node;
      },
      [forwardedRef],
    );

    useEffect(() => {
      const element = localRef.current;
      if (!element) return;
      // People who asked for less motion get a plain, static pill.
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const handleMouseMove = (event: MouseEvent) => {
        const rect = element.getBoundingClientRect();
        const x = event.clientX - rect.left - rect.width / 2;
        const y = event.clientY - rect.top - rect.height / 2;

        gsap.to(element, {
          x: x * 0.4,
          y: y * 0.4,
          rotationX: -y * 0.15,
          rotationY: x * 0.15,
          scale: 1.05,
          ease: "power2.out",
          duration: 0.4,
        });
      };

      const handleMouseLeave = () => {
        gsap.to(element, {
          x: 0,
          y: 0,
          rotationX: 0,
          rotationY: 0,
          scale: 1,
          ease: "elastic.out(1, 0.3)",
          duration: 1.2,
        });
      };

      element.addEventListener("mousemove", handleMouseMove);
      element.addEventListener("mouseleave", handleMouseLeave);

      return () => {
        element.removeEventListener("mousemove", handleMouseMove);
        element.removeEventListener("mouseleave", handleMouseLeave);
        gsap.killTweensOf(element);
      };
    }, []);

    return (
      <Component ref={setRefs} className={cn("cursor-pointer", className)} {...props}>
        {children}
      </Component>
    );
  },
);
MagneticButton.displayName = "MagneticButton";

// -------------------------------------------------------------------------
// 3. MAIN COMPONENT
// -------------------------------------------------------------------------
export type FooterLink = {
  label: string;
  href: string;
};

export type FooterAction = FooterLink & {
  /** Lucide icon rendered before the label. */
  icon: LucideIcon;
};

export type CinematicFooterProps = {
  /** Brand name shown in the "crafted with" badge. */
  brand: string;
  /** Oversized, clipped word behind the content. Defaults to `brand`. */
  giantText?: string;
  /** Headline above the pills. */
  heading: string;
  /** Phrases scrolled endlessly across the top strip. */
  marqueeItems: readonly string[];
  /** Primary glass pills. Hrefs starting with "/" render as next/link. */
  actions: readonly FooterAction[];
  /** Secondary glass pills. The row is hidden when the list is empty. */
  links?: readonly FooterLink[];
  /** Bottom-left legal line. */
  copyright: string;
  /** Extra classes for the footer element. */
  className?: string;
};

/** One half of the seamless marquee; `isDuplicate` marks the aria-hidden copy. */
const MarqueeItem = ({
  items,
  isDuplicate = false,
}: {
  items: readonly string[];
  isDuplicate?: boolean;
}) => (
  <div aria-hidden={isDuplicate || undefined} className="flex items-center gap-12 px-6">
    {items.map((item, index) => (
      <React.Fragment key={item}>
        <span>{item}</span>
        <SparklesIcon
          className={cn(
            "size-3.5 shrink-0",
            index % 2 === 0 ? "text-primary/60" : "text-secondary/60",
          )}
        />
      </React.Fragment>
    ))}
  </div>
);

export function CinematicFooter({
  brand,
  giantText,
  heading,
  marqueeItems,
  actions,
  links = [],
  copyright,
  className,
}: CinematicFooterProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const giantTextRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const giantWord = giantTextRef.current;
    const headingEl = headingRef.current;
    const linksBlock = linksRef.current;

    if (!wrapper || !giantWord || !headingEl || !linksBlock) return;
    // People who asked for less motion keep the natural, fully visible state.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // gsap.context collects the tweens *and* the ScrollTriggers created inside
    // it, so a single revert() on cleanup is strict-mode safe.
    const ctx = gsap.context(() => {
      // Background parallax
      gsap.fromTo(
        giantWord,
        { y: "10vh", scale: 0.8, opacity: 0 },
        {
          y: "0vh",
          scale: 1,
          opacity: 1,
          ease: "power1.out",
          scrollTrigger: {
            trigger: wrapper,
            start: "top 80%",
            end: "bottom bottom",
            scrub: 1,
          },
        },
      );

      // Staggered content reveal
      gsap.fromTo(
        [headingEl, linksBlock],
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: wrapper,
            start: "top 40%",
            end: "bottom bottom",
            scrub: 1,
          },
        },
      );
    }, wrapper);

    return () => ctx.revert();
  }, []);

  const scrollToTop = () => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      {/*
        The "curtain reveal" wrapper stays in normal flow; its clip-path clips
        the fixed footer to its own box, so the footer is only uncovered once
        the page has scrolled this far.
      */}
      <div
        ref={wrapperRef}
        className="relative h-screen w-full"
        style={{ clipPath: "polygon(0% 0, 100% 0%, 100% 100%, 0 100%)" }}
      >
        <footer
          className={cn(
            "cinematic-footer-wrapper fixed bottom-0 left-0 flex h-screen w-full flex-col justify-between overflow-hidden bg-background text-foreground",
            className,
          )}
        >
          {/* Ambient light + grid */}
          <div
            aria-hidden="true"
            className="footer-aurora animate-footer-breathe pointer-events-none absolute left-1/2 top-1/2 z-0 h-[60vh] w-[80vw] -translate-x-1/2 -translate-y-1/2 rounded-[50%] blur-[80px]"
          />
          <div
            aria-hidden="true"
            className="footer-bg-grid pointer-events-none absolute inset-0 z-0"
          />

          {/* Giant background word */}
          <div
            ref={giantTextRef}
            aria-hidden="true"
            className="footer-giant-bg-text pointer-events-none absolute -bottom-[5vh] left-1/2 z-0 -translate-x-1/2 select-none whitespace-nowrap"
          >
            {giantText ?? brand}
          </div>

          {/* 1. Sleek diagonal marquee. `top-24` clears the fixed site header. */}
          <div className="absolute left-0 top-24 z-10 w-full -rotate-2 scale-110 overflow-hidden border-y border-border/50 bg-background/60 py-4 shadow-2xl backdrop-blur-md">
            <div className="animate-footer-scroll-marquee flex w-max text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground md:text-sm">
              <MarqueeItem items={marqueeItems} />
              <MarqueeItem items={marqueeItems} isDuplicate />
            </div>
          </div>

          {/* 2. Main center content */}
          <div className="relative z-10 mx-auto mt-20 flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-6">
            <h2
              ref={headingRef}
              className="footer-text-glow mb-12 text-center text-5xl font-black tracking-tighter md:text-8xl"
            >
              {heading}
            </h2>

            <div ref={linksRef} className="flex w-full flex-col items-center gap-6">
              {/* Primary actions */}
              <div className="flex w-full flex-wrap justify-center gap-4">
                {actions.map((action) => {
                  const Icon = action.icon;
                  const isRoute = action.href.startsWith("/");

                  return (
                    <MagneticButton
                      key={action.label}
                      as={isRoute ? Link : "a"}
                      href={action.href}
                      className="footer-glass-pill group flex items-center gap-3 rounded-full px-10 py-5 text-sm font-bold text-foreground md:text-base"
                    >
                      <Icon className="size-6 text-muted-foreground transition-colors group-hover:text-foreground" />
                      {action.label}
                    </MagneticButton>
                  );
                })}
              </div>

              {/* Secondary links */}
              {links.length > 0 && (
                <div className="mt-2 flex w-full flex-wrap justify-center gap-3 md:gap-6">
                  {links.map((link) => (
                    <MagneticButton
                      key={link.label}
                      as={link.href.startsWith("/") ? Link : "a"}
                      href={link.href}
                      className="footer-glass-pill rounded-full px-6 py-3 text-xs font-medium text-muted-foreground hover:text-foreground md:text-sm"
                    >
                      {link.label}
                    </MagneticButton>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 3. Bottom bar / credits */}
          <div className="relative z-20 flex w-full flex-col items-center justify-between gap-6 px-6 pb-8 md:flex-row md:px-12">
            <div className="order-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground md:order-1 md:text-xs">
              {copyright}
            </div>

            <div className="footer-glass-pill order-1 flex cursor-default items-center gap-2 rounded-full px-6 py-3 md:order-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground md:text-xs">
                Crafted with
              </span>
              <HeartIcon className="animate-footer-heartbeat size-4 fill-destructive text-destructive md:size-5" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground md:text-xs">
                by
              </span>
              <span className="ml-1 text-xs font-black tracking-normal text-foreground md:text-sm">
                ElSheemy
              </span>
            </div>

            <MagneticButton
              as="button"
              type="button"
              onClick={scrollToTop}
              aria-label="Back to top"
              className="footer-glass-pill group order-3 flex size-12 items-center justify-center rounded-full text-muted-foreground hover:text-foreground"
            >
              <ArrowUpIcon className="size-5 transition-transform duration-300 group-hover:-translate-y-1.5" />
            </MagneticButton>
          </div>
        </footer>
      </div>
    </>
  );
}
