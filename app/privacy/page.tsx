import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon } from "lucide-react";

import { GridBackground } from "@/components/GridBackground";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * PRIVACY POLICY — read before publishing.
 *
 * Every statement about the app matches how it is built: there is no database,
 * a photo is forwarded to the render engine and then dropped, results live only
 * in the browser tab, and the only cookies come from Clerk. Four points are
 * policy decisions rather than code facts, so they need a human read:
 *
 *   1. the minimum age under "Children" (13 below);
 *   2. "Photos and AI model training" — confirm the render provider's terms
 *      once one is contracted (RENDER_ENGINE_URL is still unset);
 *   3. name the render and hosting providers in "Who we share data with";
 *   4. the ownership promise under "Your photos and who owns them" — it repeats
 *      the homepage trust strip, so keep the two in sync.
 *
 * Not legal advice. Have a lawyer review the final policy.
 */
export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "What reFrame.ai collects, how your photos are handled, and the choices you have.",
};

/** Bump the date whenever the wording below changes. */
const LAST_UPDATED = "September 30, 2026";

/** One inbox for every privacy request; the same address appears in the footer. */
const CONTACT_EMAIL = "hello@reframe.ai";

type PolicySection = {
  id: string;
  title: string;
  intro?: string;
  bullets?: string[];
  outro?: string;
  /** Optional single next step, rendered as a pill under the section. */
  action?: { label: string; href: string };
};

const SUMMARY = [
  "Your name and email are held by Clerk when you sign in — we don't keep a separate profile for you.",
  "Photos are processed only to make the restyle you ask for. We never store them, so there is nothing for us to delete.",
  "Sentry reports errors, and records a session replay when something breaks.",
  `Ask us anything about your data — including deletion — at ${CONTACT_EMAIL}.`,
];

const SECTIONS: PolicySection[] = [
  {
    id: "collect",
    title: "What we collect",
    intro: "Only what it takes to run reFrame.ai:",
    bullets: [
      "Account details — your name and email address — held by Clerk, our sign-in provider, when you create an account or sign in. We don't keep a separate copy.",
      "The photo you pick, which is sent to the render engine when you press Render so it can produce your restyle.",
      "The images generated for you, shown in your studio and held only for that session.",
      "Session cookies from Clerk, which keep you signed in. There are no advertising or analytics cookies.",
      "Error and performance data from Sentry: device and browser details, the page an error occurred on, and a session replay when something breaks.",
      "Payment details when you subscribe. Checkout runs through Clerk Billing, so we never see your full card number.",
    ],
  },
  {
    id: "use",
    title: "How we use your data",
    bullets: [
      "To create the restyles you ask for and show them to you.",
      "To run, secure and improve reFrame.ai, including diagnosing crashes with Sentry.",
      "To manage your account, your plan and your payments.",
      "To answer support and privacy requests.",
    ],
  },
  {
    id: "training",
    title: "Photos and AI model training",
    // REVIEW: confirm the render provider's terms once one is contracted.
    intro:
      "reFrame.ai does not use your photos to train AI models. Your photo is sent to the render engine for one reason — producing the restyle you asked for — and we don't use your uploads or results to build or improve any model.",
  },
  {
    id: "retention",
    title: "How long we keep your data",
    intro: "There is no database behind reFrame.ai, which keeps this short:",
    bullets: [
      "Your photo lives in your browser until you press Render, is passed to the render engine, and is then dropped — we don't keep a copy.",
      "Results live in your browser tab for that session. Close or refresh the page and the session history is gone.",
      "Account details stay with Clerk while your account is open. Ask us and we'll close the account and delete what we hold.",
      "Error data in Sentry is kept only as long as we need it to investigate a problem.",
    ],
  },
  {
    id: "your-content",
    title: "Your photos and who owns them",
    // REVIEW: matches the homepage trust strip — keep both in sync.
    intro:
      "You keep ownership of the photos you upload and of the images generated for you. We claim no rights to your originals, and we don't use them for anything other than the restyle you requested.",
  },
  {
    id: "sharing",
    title: "Who we share data with",
    intro: "We don't sell your personal data. It only goes to the service providers that run reFrame.ai:",
    // REVIEW: name the render and hosting providers once they are chosen.
    bullets: [
      "Sign-in and accounts: Clerk.",
      "Image rendering: the render engine that turns your photo into a restyle.",
      "Error monitoring and session replay: Sentry.",
      "Payments and billing: Clerk Billing.",
      "Hosting: the provider that serves this site.",
    ],
    outro:
      "We may also share information when the law requires it, or to protect reFrame.ai, our users or the public.",
  },
  {
    id: "rights",
    title: "Your rights and choices",
    intro:
      "Depending on where you live, you can ask to access, correct, export or delete the personal data we hold, and object to certain uses.",
    bullets: [
      "Photos never need deleting — we don't store them in the first place.",
      "Session results clear themselves when you close or refresh the page.",
      "Ask us to close your account and delete what we hold about you, or to send you a copy of it.",
    ],
  },
  {
    id: "security",
    title: "Security",
    intro:
      "We use reasonable technical and organizational measures to protect your data: secrets stay on the server, transport is encrypted, and access is limited to the providers listed above. No online service can guarantee absolute security, so use a strong, unique password for the email address you sign up with.",
  },
  {
    id: "children",
    title: "Children",
    // REVIEW: 13 / 16 / 18 depends on where you operate.
    intro:
      "reFrame.ai is not intended for anyone under 13. If you believe a child has given us personal data, contact us and we'll remove it.",
  },
  {
    id: "changes",
    title: "Changes to this policy",
    intro:
      "We may update this policy from time to time. When we do, we update the date at the top of this page — the version you are reading now is the one that applies.",
  },
  {
    id: "contact",
    title: "Contact us",
    intro: "Questions about this policy or your data? Write to us and a person will reply.",
    action: { label: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}` },
  },
];

/** One next step under a section, styled as an outline pill with a nudge-on-hover arrow. */
function SectionAction({ label, href }: { label: string; href: string }) {
  const className = cn(
    buttonVariants({ variant: "outline", size: "sm" }),
    "group/action mt-4 h-auto rounded-full px-4 py-2 text-xs sm:text-sm",
  );

  // Hash and absolute targets are internal, everything else (mailto:) stays a
  // plain anchor with no prefetching.
  const internal = href.startsWith("#") || href.startsWith("/");
  const content = (
    <>
      {label}
      <ArrowRightIcon className="size-3.5 transition-transform duration-300 motion-reduce:transition-none group-hover/action:translate-x-0.5" />
    </>
  );

  return internal ? (
    <Link href={href} prefetch={false} className={className}>
      {content}
    </Link>
  ) : (
    <a href={href} className={className}>
      {content}
    </a>
  );
}

function TocLinks({ className }: { className?: string }) {
  return (
    <ol className={className}>
      {SECTIONS.map((section, i) => (
        <li key={section.id}>
          <a
            href={`#${section.id}`}
            className="group flex gap-2.5 rounded-lg px-2.5 py-1.5 text-sm text-muted-foreground transition-colors duration-200 hover:bg-primary/10 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          >
            <span className="text-[0.7rem] font-medium tabular-nums text-primary/60 transition-colors duration-200 group-hover:text-primary">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="min-w-0">{section.title}</span>
          </a>
        </li>
      ))}
    </ol>
  );
}

export default function PrivacyPage() {
  return (
    <GridBackground className="section-shell mt-6 px-4 pb-12 pt-28 sm:px-8 sm:pb-20 sm:pt-32 lg:px-12">
      <div className="relative z-10 mx-auto max-w-5xl">
        <Link
          href="/"
          className="group/back inline-flex w-fit items-center gap-2 rounded-full border border-border/60 bg-background/50 px-3.5 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-sm transition-colors duration-200 hover:border-primary/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 sm:text-sm"
        >
          <ArrowLeftIcon className="size-4 transition-transform duration-200 group-hover/back:-translate-x-0.5 motion-reduce:transition-none" />
          Back to home
        </Link>

        <header className="mx-auto mt-8 max-w-3xl text-center sm:mt-10">
          <div className="hero-pill caps-md inline-flex items-center rounded-full px-3.5 py-1.5 text-xs font-medium uppercase text-primary sm:px-4 sm:py-2">
            Legal
          </div>

          <h1 className="mt-5 text-balance font-sans text-3xl font-medium tracking-tight text-foreground min-[400px]:text-4xl sm:mt-6 sm:text-5xl lg:text-6xl">
            Privacy Policy
          </h1>

          <p className="mt-4 text-sm text-muted-foreground">
            Last updated{" "}
            <time dateTime="2026-09-30" className="font-medium text-foreground/80">
              {LAST_UPDATED}
            </time>
          </p>

          <p className="mx-auto mt-3 max-w-2xl text-balance text-base leading-relaxed text-muted-foreground sm:text-lg">
            What we collect, how your photos are handled, and the choices you have — written to be
            read, not skimmed past.
          </p>
        </header>

        {/* The short version, for anyone who only reads the top of the page */}
        <div className="mx-auto mt-8 max-w-3xl rounded-[1.5rem] border border-primary/25 bg-card/80 p-5 shadow-lg shadow-primary/5 backdrop-blur-sm sm:mt-10 sm:rounded-[2rem] sm:p-7">
          <p className="text-xs font-medium uppercase tracking-wider text-primary">
            The short version
          </p>

          <ul className="m-0 mt-4 list-none space-y-3 p-0">
            {SUMMARY.map((line) => (
              <li key={line} className="flex gap-3">
                <span
                  aria-hidden
                  className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary"
                >
                  <CheckIcon className="size-3" />
                </span>
                <span className="min-w-0 text-sm leading-relaxed text-foreground/85 sm:text-base sm:leading-7">
                  {line}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8 gap-10 sm:mt-10 lg:grid lg:grid-cols-[13rem_1fr]">
          {/* Mobile: collapsible contents list */}
          <details className="mb-6 rounded-[1.25rem] border border-border/60 bg-card/80 px-4 py-3 backdrop-blur-sm lg:hidden">
            <summary className="cursor-pointer text-sm font-medium text-foreground">
              On this page
            </summary>
            <TocLinks className="mt-2 space-y-0.5" />
          </details>

          {/* Desktop: sticky contents list */}
          <aside className="hidden lg:block">
            <nav aria-label="Privacy policy sections" className="sticky top-28">
              <p className="mb-2 px-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                On this page
              </p>
              <TocLinks className="space-y-0.5" />
            </nav>
          </aside>

          <article className="min-w-0 rounded-[1.5rem] border border-border/70 bg-card/80 px-5 py-6 backdrop-blur-sm sm:rounded-[2rem] sm:px-8 sm:py-8">
            {SECTIONS.map((section, i) => (
              <section
                key={section.id}
                id={section.id}
                className="scroll-mt-28 border-t border-border/50 py-7 first:border-t-0 first:pt-0 last:pb-0"
              >
                <h2 className="flex items-baseline gap-2.5 text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                  <span className="text-xs font-medium tabular-nums text-primary">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {section.title}
                </h2>

                <div className="mt-3 max-w-[68ch] space-y-3">
                  {section.intro ? (
                    <p className="m-0 text-sm leading-relaxed text-foreground/80 sm:text-[0.975rem] sm:leading-7">
                      {section.intro}
                    </p>
                  ) : null}

                  {section.bullets ? (
                    <ul className="m-0 list-none space-y-2.5 p-0">
                      {section.bullets.map((bullet) => (
                        <li key={bullet} className="flex gap-2.5">
                          <span
                            aria-hidden
                            className="mt-2 size-1.5 shrink-0 rounded-full bg-primary/60"
                          />
                          <span className="min-w-0 text-sm leading-relaxed text-foreground/80 sm:text-[0.975rem] sm:leading-7">
                            {bullet}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  {section.outro ? (
                    <p className="m-0 text-sm leading-relaxed text-foreground/80 sm:text-[0.975rem] sm:leading-7">
                      {section.outro}
                    </p>
                  ) : null}

                  {section.action ? <SectionAction {...section.action} /> : null}
                </div>
              </section>
            ))}
          </article>
        </div>
      </div>
    </GridBackground>
  );
}



