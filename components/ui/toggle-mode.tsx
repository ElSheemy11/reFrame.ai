"use client"

import * as React from "react"
import { flushSync } from "react-dom"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { cn } from "@/lib/utils"

/** Never subscribes: `useSyncExternalStore` is only used for the SSR-safe mounted check. */
const emptySubscribe = () => () => {}

export function ModeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  // `true` on the client, `false` during SSR — avoids a setState-in-effect to
  // guard against hydration mismatches.
  const mounted = React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  )

  const isDark = mounted && resolvedTheme === "dark"

  function toggle(e: React.MouseEvent<HTMLButtonElement>) {
    const next = isDark ? "light" : "dark"

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (!document.startViewTransition || reduceMotion) {
      setTheme(next)
      return
    }

    const rect = e.currentTarget.getBoundingClientRect()
    const x = rect.left + rect.width / 2
    const y = rect.top + rect.height / 2
    const radius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    )

    const transition = document.startViewTransition(() => {
      flushSync(() => setTheme(next))
    })

    transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`],
        },
        {
          duration: 400,
          easing: "ease-in-out",
          pseudoElement: "::view-transition-new(root)",
        }
      )
    })
  }
const [pressed, setPressed] = React.useState(false)

return (
  <button
    type="button"
    role="switch"
    aria-checked={isDark}
    aria-label="Toggle dark mode"
    onClick={toggle}
    onPointerDown={() => setPressed(true)}
    onPointerUp={() => setPressed(false)}
    onPointerLeave={() => setPressed(false)}
    onPointerCancel={() => setPressed(false)}
    style={{ viewTransitionName: "theme-toggle" }}
    className={cn(
      "relative inline-flex h-8 w-14 shrink-0 cursor-pointer items-center rounded-xl p-1",
      "transition-colors duration-500 ease-in-out motion-reduce:transition-none",
      "focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:outline-none",
      isDark ? "bg-primary" : "bg-input"
    )}
  >
    <span
      className="bg-background text-foreground pointer-events-none relative flex h-6 items-center justify-center rounded-lg shadow-md transition-[transform,width] duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] motion-reduce:transition-none"
      style={{
        width: pressed ? 30 : 24,
        // dark: 24px travel, minus the extra 6px of width so it stays inside the track
        transform: `translateX(${isDark ? (pressed ? 18 : 24) : 0}px)`,
      }}
    >
      <Sun
        className={cn(
          "absolute size-3.5 transition-all duration-500 ease-in-out motion-reduce:transition-none",
          isDark ? "scale-0 rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100"
        )}
      />
      <Moon
        className={cn(
          "absolute size-3.5 transition-all duration-500 ease-in-out motion-reduce:transition-none",
          isDark ? "scale-100 rotate-0 opacity-100" : "scale-0 -rotate-90 opacity-0"
        )}
      />
    </span>
  </button>
)
}