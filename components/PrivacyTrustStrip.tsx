import Link from "next/link";
import { ArrowRightIcon, FileTextIcon, ShieldCheckIcon, Trash2Icon } from "lucide-react";

// Each point is a promise to your users, so only keep the ones that are true for reFrame.ai
// and match what your /privacy page says.
const POINTS = [
  {
    icon: ShieldCheckIcon,
    title: "Your photos stay yours",
    body: "You keep ownership of everything you upload and create.",
  },
  {
    icon: Trash2Icon,
    title: "Delete anytime",
    body: "Remove your uploads and results whenever you like.",
  },
  {
    icon: FileTextIcon,
    title: "Plain-language policy",
    body: "Clear answers on what we collect and why, without the legal maze.",
  },
];

export function PrivacyTrustStrip() {
  return (
    <section aria-label="Privacy" className="px-4 sm:px-8 lg:px-12">
      <div className="mx-auto mt-6 max-w-7xl rounded-[1.5rem] border border-border/70 bg-card/80 p-5 backdrop-blur-sm sm:rounded-[2rem] sm:p-8">
        <div className="grid gap-5 sm:grid-cols-3 sm:gap-6">
          {POINTS.map(({ icon: Icon, title, body }) => (
            <div key={title} className="group flex items-start gap-4">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/14 text-primary transition-all duration-300 group-hover:-rotate-6 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground motion-reduce:transition-none motion-reduce:group-hover:rotate-0 motion-reduce:group-hover:scale-100 sm:size-12">
                <Icon className="size-5" />
              </div>
              <div className="min-w-0">
                <p className="text-base font-semibold tracking-tight text-foreground">{title}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 border-t border-border/60 pt-4 sm:mt-6 sm:pt-5">
          <Link
            href="/privacy"
            className="group/link inline-flex items-center gap-2 text-sm font-medium text-primary transition-opacity duration-200 hover:opacity-80"
          >
            Read our privacy policy
            <ArrowRightIcon className="size-4 transition-transform duration-200 group-hover/link:translate-x-0.5 motion-reduce:transition-none" />
          </Link>
        </div>
      </div>
    </section>
  );
}
