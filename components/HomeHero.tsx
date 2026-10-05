import { Show, SignUpButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";

import { Button, buttonVariants } from "@/components/ui/button";
import { HERO_VIDEO_SRC_MP, HERO_VIDEO_SRC_PC } from "@/lib/constants";

export function HomeHero() {
  return (
    <section id="Home" className="home-hero my-10">
      <div className="hero-surface absolute inset-0 z-10" />
            {/* Phone background (< 768px) */}
      <video
        className="hero-video absolute inset-0 h-full w-full object-cover object-center md:hidden dark:filter-none invert hue-rotate-180 saturate-75"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
      >
        <source src={HERO_VIDEO_SRC_MP} type="video/mp4" />
      </video>

      {/* Desktop / tablet background (>= 768px) */}
      <video
        className="hero-video absolute inset-0 hidden h-full w-full object-cover object-center md:block dark:filter-none invert hue-rotate-180 saturate-75"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
      >
        <source src={HERO_VIDEO_SRC_PC} type="video/mp4" />
      </video>
      <div className="hero-fade pointer-events-none absolute inset-0 z-20" />

      <div className="home-hero-stack">

        <div className="home-hero-copy mt-30">
          <h1 className="hero-title home-hero-title">
            <span className="block">High-fidelity style transfer.</span>
            <span className="home-hero-tagline">One upload, a gallery-ready image.</span>
          </h1>

          <p className="home-hero-lede">
            Upload once, pick a curated style, get a polished restyle.
          </p>

          <div className="home-hero-ctas">
            <Show when="signed-out">
              <SignUpButton mode="modal" fallbackRedirectUrl="/studio">
                <Button type="button" className="home-btn-hero-primary">
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
                className={buttonVariants({ className: "home-btn-hero-primary" })}
              >
                Open Studio
              </Link>
            </Show>

            <Link
              href="/#how-it-works"
              className={buttonVariants({ variant: "ghost", className: "hero-pill home-btn-hero-ghost" })}
            >
              Watch 2min demo
            </Link>
          </div>
        </div>

        <div className="home-demo-wrap">
          <div className="home-demo-shift">
            <div className="hero-demo-glass home-demo-glass-shell">
              <div className="hero-demo-glass-inner home-demo-inner">
                <Image
                  src="/Hero-Section.png"
                  alt="reFrame.ai workspace showing upload, curated styles, and a before-and-after preview"
                  width={3290}
                  height={1872}
                  className="h-auto w-full"
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1100px"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}