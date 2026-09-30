"use client";

import { Show, SignUpButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { MotionConfig, motion } from "motion/react";
import { Button, buttonVariants } from "@/components/ui/button";
import { GALLERY_IMAGES, GALLERY_STATS, HIGHLIGHTS, SHOWCASE_BG_VIDEO_SRC } from "@/lib/constants";

// Orange sits around 30deg on the hue wheel and purple around 270deg,
// so a +240deg rotation moves the video from orange to purple.
// Lower it (e.g. 225) for a bluer violet, raise it (e.g. 255) for magenta.
const VIDEO_PURPLE_FILTER = "hue-rotate(240deg) saturate(1.1)";

const CARD_SPRING = { type: "spring", stiffness: 320, damping: 22 } as const;

const CTA_CLASSES =
  "w-full rounded-2xl px-7 text-base shadow-lg shadow-primary/20 transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/40 motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:w-auto";

export function GalleryShowcase() {
  return (
    // reducedMotion="user" disables transform animations (hover lifts, floating frame)
    // for people who have "reduce motion" turned on in their OS.
    <MotionConfig reducedMotion="user">
      <section
        id="styles"
        className="section-shell relative mt-6 overflow-hidden px-4 py-10 sm:px-8 sm:py-18 lg:px-12 lg:py-20"
      >
        {/* Autoplaying background video is skipped for people who prefer reduced motion */}
        <video
          className="hero-video pointer-events-none absolute inset-0 z-0 h-full w-full object-cover object-center motion-reduce:hidden"
          style={{ filter: VIDEO_PURPLE_FILTER }}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          aria-hidden
        >
          <source src={SHOWCASE_BG_VIDEO_SRC} type="video/mp4" />
        </video>
        <div
          className="showcase-surface pointer-events-none absolute inset-0 z-1"
          aria-hidden="true"
        />
        <div
          className="showcase-pattern pointer-events-none absolute inset-0 z-2 opacity-70"
          aria-hidden="true"
        />

        <div className="relative z-10 mx-auto grid max-w-7xl gap-6 sm:gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          {/* Left: copy panel */}
          <div className="showcase-panel relative min-w-0 overflow-hidden rounded-[1.5rem] border border-border/70 p-5 sm:rounded-[2rem] sm:p-8 lg:p-10">
            <div className="showcase-glow absolute -left-14 top-8 size-36 rounded-full blur-3xl" />

            <div className="relative z-10">
              {/* 2 columns on phones, 4 from sm up */}
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
                {HIGHLIGHTS.map((item) => {
                  const Icon = item.icon;

                  return (
                    <motion.div
                      key={item.label}
                      whileHover={{ y: -6 }}
                      whileTap={{ scale: 0.97 }}
                      transition={CARD_SPRING}
                      className="group cursor-default rounded-[1.1rem] border border-border/60 bg-card px-3 py-4 text-center transition-[border-color,box-shadow] duration-300 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/20 sm:rounded-[1.4rem] sm:px-4 sm:py-5"
                    >
                      <div className="mx-auto flex size-11 items-center justify-center rounded-2xl bg-primary/14 text-primary transition-all duration-300 group-hover:-rotate-6 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground sm:size-12">
                        <Icon className="size-5" />
                      </div>
                      <p className="mt-3 text-xs tracking-wide text-muted-foreground transition-colors duration-300 group-hover:text-foreground sm:mt-4 sm:text-sm">
                        {item.label}
                      </p>
                    </motion.div>
                  );
                })}
              </div>

              <div className="mt-8 sm:mt-10">
                <p className="caps-lg font-mono text-xs font-medium uppercase tracking-[0.18em] text-primary sm:text-sm sm:tracking-[0.24em]">
                  Style showcase
                </p>
                {/* Smaller mono type on phones and natural wrapping, so it can't overflow narrow screens */}
                <h2 className="mt-4 text-balance break-words font-mono text-4xl font-normal leading-[1.05] tracking-[-0.03em] text-foreground sm:mt-5 sm:text-5xl lg:text-5xl xl:text-6xl">
                  Transform <span className="font-medium text-primary">photos</span>
                  <br className="hidden sm:block" /> into art.
                </h2>
                <p className="mt-5 max-w-xl font-mono text-sm leading-relaxed text-muted-foreground sm:mt-6 sm:text-base">
                  Turn everyday portraits and moments into richly styled scenes with cinematic depth,
                  warm character, and a premium editorial finish.
                </p>
              </div>

              {/* Stats stay in 3 columns on phones instead of stacking into a tall list */}
              <div className="mt-8 grid grid-cols-3 gap-3 border-y border-border/60 py-5 sm:mt-10 sm:gap-4 sm:py-6">
                {GALLERY_STATS.map((stat) => (
                  <div key={stat.label} className="min-w-0 space-y-1.5 sm:space-y-2">
                    <p className="text-2xl font-semibold tracking-tight text-primary sm:text-4xl">
                      {stat.value}
                    </p>
                    <p className="caps-xs text-[0.65rem] uppercase leading-snug text-muted-foreground sm:text-sm">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-7 sm:mt-8">
                <Show when="signed-out">
                  <SignUpButton mode="modal" fallbackRedirectUrl="/studio">
                    <Button size="lg" className={CTA_CLASSES}>
                      Transform Photos
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
                    Transform Photos
                  </Link>
                </Show>
              </div>
            </div>
          </div>

          {/* Right: image frame. Capped width on tablets so the images don't become huge. */}
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 7.5, repeat: Infinity, ease: "easeInOut" }}
            className="showcase-frame relative mx-auto w-full min-w-0 max-w-xl rounded-[1.75rem] border border-border/60 p-3 sm:rounded-[2.25rem] sm:p-5 lg:max-w-none"
          >
            {/* Always 2 columns. The bottom padding leaves room for the staggered offset. */}
            <div className="grid grid-cols-2 gap-3 pb-4 sm:gap-4 sm:pb-6">
              {GALLERY_IMAGES.map((image, index) => (
                // Outer div keeps the staggered offset; the inner motion.div handles the hover lift,
                // so the two transforms never fight each other.
                <div
                  key={image.src}
                  className={index % 2 === 0 ? "translate-y-4 sm:translate-y-6" : ""}
                >
                  <motion.div
                    whileHover={{ y: -8 }}
                    whileTap={{ scale: 0.97 }}
                    transition={CARD_SPRING}
                    className="showcase-image-card group relative aspect-[3/4] w-full overflow-hidden rounded-[1.25rem] border border-border/60 transition-[border-color,box-shadow] duration-300 hover:border-primary/60 hover:shadow-2xl hover:shadow-primary/30 sm:rounded-[1.8rem]"
                  >
                    <Image
                      src={image.src}
                      alt={image.alt}
                      width={900}
                      height={1200}
                      sizes="(max-width: 1024px) 45vw, 22vw"
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                      priority={index < 2}
                    />
                    <div
                      className="pointer-events-none absolute inset-0 bg-linear-to-t from-primary/30 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      aria-hidden="true"
                    />
                  </motion.div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </MotionConfig>
  );
}
