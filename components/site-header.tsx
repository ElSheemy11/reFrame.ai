"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { Menu, X } from "lucide-react";

import { ModeToggle } from "@/components/ui/toggle-mode";
import { CENTER_NAV_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

const EASE = "ease-[cubic-bezier(0.32,0.72,0,1)]";

// Reusable glass surface for buttons
const glass =
  "border border-background/30 bg-background/50 backdrop-blur-md " +
  "shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_2px_8px_rgba(0,0,0,0.08)] " +
  "dark:border-background/20 dark:bg-background/50 " +
  "dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_2px_8px_rgba(0,0,0,0.3)]";

// Shared glass surface for the header bar and the mobile panel
const glassSurface =
  "border border-white/30 bg-white/40 backdrop-blur-2xl backdrop-saturate-[1.8] " +
  "shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_8px_32px_rgba(0,0,0,0.12)] " +
  "dark:border-white/10 dark:bg-white/[0.06] " +
  "dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_8px_32px_rgba(0,0,0,0.5)]";

// Accent-tinted liquid glass for the active/hover bubble
const glassAccent = "border border-primary/40 bg-primary/25";

// Split every nav href into its path and hash, e.g. "/#pricing" -> { path: "/", hash: "pricing" }
const NAV_LINKS = [
  ...CENTER_NAV_LINKS.map((link) => {
    const [rawPath, hash = ""] = link.href.split("#");
    return { ...link, path: rawPath || "/", hash };
  }),
  // Studio is a route link, not a home-page section: highlighted by pathname.
  { label: "Studio", href: "/studio", path: "/studio", hash: "" },
];

// Ids of the on-page sections that the nav links point to
const SECTION_IDS = NAV_LINKS.filter((l) => l.hash).map((l) => l.hash);

// A section counts as "current" once its top passes this fraction of the viewport height
const SPY_LINE = 0.35;

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [pill, setPill] = useState<{ left: number; width: number } | null>(
    null,
  );

  const navRef = useRef<HTMLElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  // After a nav click, pause the scroll spy so the pill doesn't flicker through
  // every section the smooth scroll passes on the way. Resumed by a timer so no
  // impure clock call is needed inside render-scoped code.
  const spyPaused = useRef(false);
  const spyResumeTimer = useRef<number | null>(null);

  // Which nav item is "current":
  // - on the home page: the section in view, or the Home link when above all sections
  // - on any other page: the link whose path matches the route
  let activeIndex = -1;
  if (pathname === "/") {
    activeIndex = activeSection
      ? NAV_LINKS.findIndex((l) => l.hash === activeSection)
      : NAV_LINKS.findIndex((l) => l.path === "/" && !l.hash);
  } else {
    activeIndex = NAV_LINKS.findIndex(
      (l) => !l.hash && l.path !== "/" && pathname.startsWith(l.path),
    );
  }
  const targetIndex = hovered ?? activeIndex;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Scroll spy: track which section is currently in view (home page only).
  // On other routes it never runs, and `activeSection` is ignored there
  // (only `activeIndex` is read), so no state reset happens in this effect.
  useEffect(() => {
    if (pathname !== "/") return;

    let frame = 0;

    const update = () => {
      frame = 0;
      if (spyPaused.current) return;

      const line = window.innerHeight * SPY_LINE;
      const atBottom =
        window.scrollY > 0 &&
        window.innerHeight + window.scrollY >=
          document.documentElement.scrollHeight - 4;

      // Pick the section that has most recently crossed the line. At the very bottom of
      // the page, short last sections (like FAQ) may never reach the line, so take the last one.
      let best: { id: string; top: number } | null = null;
      for (const id of SECTION_IDS) {
        const el = document.getElementById(id);
        if (!el) continue;
        const top = el.getBoundingClientRect().top;
        if (!atBottom && top > line) continue;
        if (!best || top > best.top) best = { id, top };
      }
      setActiveSection(best ? best.id : null);
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [pathname]);

  // Close the mobile menu when the route changes via browser back/forward.
  // Header links close it themselves on click; this covers history navigation.
  useEffect(() => {
    const close = () => setMobileOpen(false);
    window.addEventListener("popstate", close);
    return () => window.removeEventListener("popstate", close);
  }, []);

  // Close on Escape
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  // Position the sliding glass indicator (desktop only)
  useLayoutEffect(() => {
    const el = itemRefs.current[targetIndex];
    if (!el) return setPill(null);
    setPill({ left: el.offsetLeft, width: el.offsetWidth });
  }, [targetIndex, pathname]);

  // Mark a link as current right away on click, instead of waiting for the scroll to arrive
  const handleNavClick = (index: number) => {
    setMobileOpen(false);
    if (pathname !== "/") return;
    const link = NAV_LINKS[index];
    if (link.path !== "/") return;
    spyPaused.current = true;
    if (spyResumeTimer.current !== null) {
      window.clearTimeout(spyResumeTimer.current);
    }
    spyResumeTimer.current = window.setTimeout(() => {
      spyPaused.current = false;
      spyResumeTimer.current = null;
    }, 800);
    setActiveSection(link.hash || null);
  };

  const widthClass = scrolled ? "max-w-4xl" : "max-w-6xl";

  return (
    <header className="pointer-events-none fixed inset-x-0 top-5 z-50 flex flex-col items-center gap-2 px-3 sm:top-4 sm:px-4">
      {/* Main bar */}
      <div
        className={cn(
          "pointer-events-auto flex w-full items-center justify-between gap-2 rounded-xl px-3 sm:gap-4 sm:px-4",
          glassSurface,
          "transition-[max-width,height,background-color,box-shadow] duration-500",
          EASE,
          scrolled
            ? "h-12 max-w-4xl bg-white/55 dark:bg-white/9"
            : "h-14 max-w-6xl",
        )}
      >
        <Link
          href="/"
          onClick={() => setMobileOpen(false)}
          className="text-foreground pl-1 text-base font-semibold tracking-tight transition-opacity duration-300 hover:opacity-70 sm:pl-2"
        >
          reFrame.ai
        </Link>

        {/* Desktop nav */}
        <nav
          ref={navRef}
          onMouseLeave={() => setHovered(null)}
          className="relative hidden items-center md:flex"
        >
          <span
            aria-hidden
            className={cn(
              "absolute inset-y-0 rounded-xl",
              glassAccent,
              "transition-[left,width,opacity] duration-500 ease-[cubic-bezier(0.34,1.4,0.64,1)]",
              pill ? "opacity-100" : "opacity-0",
            )}
            style={{ left: pill?.left ?? 0, width: pill?.width ?? 0 }}
          />

          {NAV_LINKS.map((link, i) => (
            <Link
              key={link.label}
              href={link.href}
              ref={(el) => {
                itemRefs.current[i] = el;
              }}
              onMouseEnter={() => setHovered(i)}
              onClick={() => handleNavClick(i)}
              aria-current={i === activeIndex ? "page" : undefined}
              className={cn(
                "relative z-10 rounded-xl px-4 py-1.5 text-sm transition-colors duration-300",
                i === targetIndex
                  ? "text-foreground"
                  : "text-muted-foreground",
                i === activeIndex && "font-medium",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ModeToggle />

          {/* Auth: one user control in the bar at every size — the "Sign in"
              button shows when signed out (the account menu when signed in);
              "Sign up" stays desktop-only and lives in the mobile menu too. */}
          <Show when="signed-out">
            <SignInButton mode="modal" fallbackRedirectUrl={"/studio"}>
              <Button
                className={cn(
                  "text-foreground h-10 rounded-xl px-3 text-sm font-medium md:h-9 md:px-4",
                  "transition-all duration-300 hover:bg-white/60 active:scale-95 dark:hover:bg-white/20",
                  glass,
                )}
              >
                Sign in
              </Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button
                className={cn(
                  "bg-foreground text-background hidden rounded-xl px-4 py-1.5 text-sm font-medium md:inline-flex",
                  "shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_2px_8px_rgba(0,0,0,0.2)]",
                  "transition-all duration-300 hover:opacity-90 active:scale-95",
                )}
              >
                Sign up
              </Button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <UserButton />
          </Show>

          {/* Hamburger: mobile only */}
          <button
            type="button"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            onClick={() => setMobileOpen((o) => !o)}
            className={cn(
              "text-foreground inline-flex size-9 items-center justify-center rounded-xl md:hidden",
              "transition-all duration-300 active:scale-95",
              glass,
            )}
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown panel */}
      <div
        id="mobile-nav"
        aria-hidden={!mobileOpen}
        className={cn(
          "w-full rounded-xl p-2 md:hidden",
          widthClass,
          glassSurface,
          "transition-[opacity,transform] duration-300",
          EASE,
          mobileOpen
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-2 opacity-0",
        )}
      >
        <nav className="flex flex-col">
          {NAV_LINKS.map((link, i) => (
            <Link
              key={link.label}
              href={link.href}
              tabIndex={mobileOpen ? 0 : -1}
              onClick={() => handleNavClick(i)}
              aria-current={i === activeIndex ? "page" : undefined}
              className={cn(
                "rounded-lg px-4 py-3 text-base transition-colors duration-200",
                i === activeIndex
                  ? cn(glassAccent, "text-foreground font-medium")
                  : "text-muted-foreground hover:bg-white/30 dark:hover:bg-white/10",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <Show when="signed-out">
          <div className="mt-2 grid grid-cols-2 gap-2 border-t border-white/20 pt-3 dark:border-white/10">
            <SignInButton mode="modal">
              <Button
                tabIndex={mobileOpen ? 0 : -1}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "text-foreground h-10 rounded-xl text-sm font-medium",
                  "transition-all duration-300 hover:bg-white/60 active:scale-95 dark:hover:bg-white/20",
                  glass,
                )}
              >
                Sign in
              </Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button
                tabIndex={mobileOpen ? 0 : -1}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "bg-foreground text-background h-10 rounded-xl text-sm font-medium",
                  "shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_2px_8px_rgba(0,0,0,0.2)]",
                  "transition-all duration-300 hover:opacity-90 active:scale-95",
                )}
              >
                Sign up
              </Button>
            </SignUpButton>
          </div>
        </Show>
      </div>
    </header>
  );
}
