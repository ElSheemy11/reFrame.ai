import { cn } from "@/lib/utils";

/** Loading placeholder used while a render is in flight. */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-muted", className)} />;
}
