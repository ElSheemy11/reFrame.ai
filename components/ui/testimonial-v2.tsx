"use client";

import * as React from "react";
import Image from "next/image";
import { MotionConfig, motion } from "motion/react";

import { cn } from "@/lib/utils";

/**
 * A single testimonial card's data. Declared locally (instead of importing the
 * app's `MarketingTestimonial`) so this primitive stays portable — any object
 * with these four string fields is assignable to it.
 */
export type Testimonial = {
  text: string;
  image: string;
  name: string;
  role: string;
};

export type TestimonialColumnData = {
  /** Cards rendered in this column, top to bottom. */
  testimonials: readonly Testimonial[];
  /** Seconds for one full loop. Higher = slower, calmer scroll. */
  duration?: number;
  /** Extra classes, usually responsive visibility (e.g. `hidden lg:block`). */
  className?: string;
};

// Lift + shadow applied on hover/focus. Declared once so `whileHover` and
// `whileFocus` can never drift apart.
const CARD_SPRING = { type: "spring", stiffness: 400, damping: 17 } as const;

const CARD_HOVER_SHADOW =
  "0 25px 50px -12px rgba(0, 0, 0, 0.12), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.05)";

const CARD_HOVER = {
  scale: 1.03,
  y: -8,
  boxShadow: CARD_HOVER_SHADOW,
  transition: CARD_SPRING,
} as const;

/**
 * One vertically looping column of testimonial cards.
 *
 * The list is rendered twice so the `translateY(-50%)` loop is seamless. The
 * second copy is a pure visual duplicate, so it is removed from the tab order
 * and hidden from assistive tech.
 */
export const TestimonialsColumn = React.memo(function TestimonialsColumn({
  testimonials,
  duration = 10,
  className,
}: {
  testimonials: readonly Testimonial[];
  duration?: number;
  className?: string;
}) {
  return (
    <div className={className}>
      <motion.ul
        animate={{ translateY: "-50%" }}
        transition={{
          duration,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop",
        }}
        className="m-0 flex list-none flex-col gap-6 bg-transparent p-0 pb-6"
      >
        {Array.from({ length: 2 }, (_, copyIndex) => {
          const isDuplicate = copyIndex === 1;

          return (
            <React.Fragment key={copyIndex}>
              {testimonials.map(({ text, image, name, role }, index) => (
                <motion.li
                  key={`${copyIndex}-${index}`}
                  aria-hidden={isDuplicate}
                  tabIndex={isDuplicate ? -1 : 0}
                  whileHover={CARD_HOVER}
                  whileFocus={CARD_HOVER}
                  className="group w-full max-w-xs cursor-default select-none rounded-3xl border border-border/70 bg-card p-6 shadow-lg shadow-black/5 outline-none transition-[border-color,box-shadow] duration-300 focus-visible:ring-2 focus-visible:ring-primary/40 sm:p-8"
                >
                  <blockquote className="m-0 p-0">
                    <p className="m-0 font-normal leading-relaxed text-muted-foreground transition-colors duration-300">
                      {text}
                    </p>
                    <footer className="mt-6 flex items-center gap-3">
                      <Image
                        src={image}
                        alt={`Avatar of ${name}`}
                        width={40}
                        height={40}
                        sizes="40px"
                        className="h-10 w-10 rounded-full object-cover ring-2 ring-border/60 transition-all duration-300 ease-in-out group-hover:ring-primary/40"
                      />
                      <div className="flex min-w-0 flex-col">
                        <cite className="text-sm font-semibold not-italic leading-5 tracking-tight text-foreground transition-colors duration-300">
                          {name}
                        </cite>
                        <span className="mt-0.5 text-sm leading-5 tracking-tight text-muted-foreground transition-colors duration-300">
                          {role}
                        </span>
                      </div>
                    </footer>
                  </blockquote>
                </motion.li>
              ))}
            </React.Fragment>
          );
        })}
      </motion.ul>
    </div>
  );
});

/**
 * Marketing testimonial marquee: a centered heading block above continuously
 * scrolling columns. The columns are supplied by the caller so copy and data
 * stay in one place (see `components/Testimonials.tsx`).
 */
export function TestimonialV2({
  columns,
  id = "testimonials",
  badge = "Testimonials",
  title = "What our users say",
  description = "Discover how thousands of teams streamline their operations with our platform.",
  className,
}: {
  columns: readonly TestimonialColumnData[];
  id?: string;
  badge?: string;
  title?: string;
  description?: string;
  className?: string;
}) {
  const headingId = `${id}-heading`;

  return (
    // reducedMotion="user" turns off the transform-based motion (hover lifts and
    // the marquee loop) for people who asked for reduced motion in their OS.
    <MotionConfig reducedMotion="user">
      <section
        id={id}
        aria-labelledby={headingId}
        className={cn(
          "section-shell relative mt-6 overflow-hidden px-4 py-12 sm:px-8 sm:py-20 lg:px-12",
          className,
        )}
      >
        <motion.div
          initial={{ opacity: 0, y: 50, rotate: -2 }}
          whileInView={{ opacity: 1, y: 0, rotate: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{
            duration: 1.2,
            ease: [0.16, 1, 0.3, 1],
            opacity: { duration: 0.8 },
          }}
          className="relative z-10 mx-auto w-full max-w-7xl"
        >
          <div className="mx-auto flex w-full max-w-[640px] flex-col items-center text-center">
            <div className="hero-pill caps-md inline-flex items-center rounded-full px-3.5 py-1.5 text-xs font-medium uppercase text-primary sm:px-4 sm:py-2">
              {badge}
            </div>

            <h2
              id={headingId}
              className="mt-5 text-balance wrap-break-word font-sans text-3xl font-medium tracking-tight text-foreground min-[400px]:text-4xl sm:mt-6 sm:text-5xl lg:text-6xl"
            >
              {title}
            </h2>

            <p className="mx-auto mt-4 max-w-xl text-balance text-base leading-relaxed text-muted-foreground sm:mt-5 sm:text-lg sm:leading-7">
              {description}
            </p>
          </div>

          <div
            role="region"
            aria-label="Scrolling testimonials"
            className="mt-10 flex max-h-[740px] justify-center gap-6 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)] [-webkit-mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)]"
          >
            {columns.map((column, index) => (
              <TestimonialsColumn
                key={`column-${index}`}
                testimonials={column.testimonials}
                duration={column.duration}
                className={column.className}
              />
            ))}
          </div>
        </motion.div>
      </section>
    </MotionConfig>
  );
}

export default TestimonialV2;
