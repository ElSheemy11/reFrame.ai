import { PricingTable } from "@clerk/nextjs";

import { GridBackground } from "@/components/GridBackground";

/**
 * Pricing section for the landing page.
 *
 * The plans themselves are configured in the Clerk dashboard (Billing → Plans);
 * this component only frames them and re-themes Clerk's table with the site
 * tokens so it reads like the rest of the page.
 *
 * `#pricing` is the target of the header and footer "Pricing" links, and
 * `scroll-mt-28` keeps the fixed site header from covering the heading when
 * that anchor is followed.
 */
const PRICING_APPEARANCE = {
  variables: {
    colorPrimary: "var(--primary)",
    colorText: "var(--foreground)",
    colorTextSecondary: "var(--muted-foreground)",
    fontFamily: "var(--font-geist-sans)",
    borderRadius: "1rem",
  },
  elements: {
    pricingTableCard: "rounded-3xl border border-border/60 shadow-xl shadow-black/5",
    pricingTableCardTitle: "font-sans tracking-tight",
    pricingTableCardFee: "font-sans tracking-tight",
    pricingTableCardFeePeriod: "text-muted-foreground",
    pricingTableCardFeatures: "text-muted-foreground",
    pricingTableCardBadge: "rounded-full",
    pricingTableCardFooterButton: "rounded-full shadow-lg shadow-primary/20",
  },
};

export function Pricing() {
  return (
    <GridBackground className="section-shell mt-6 scroll-mt-28 px-4 py-12 sm:px-8 sm:py-20 lg:px-12">
      <section id="pricing" className="relative z-10 mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <div className="hero-pill caps-md inline-flex items-center rounded-full px-3.5 py-1.5 text-xs font-medium uppercase text-primary sm:px-4 sm:py-2">
            Pricing
          </div>

          <h2 className="mt-5 text-balance wrap-break-word font-sans text-3xl font-medium tracking-tight text-foreground min-[400px]:text-4xl sm:mt-6 sm:text-5xl lg:text-6xl">
            Pricing that grows with your work.
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-balance text-base leading-relaxed text-muted-foreground sm:mt-5 sm:text-lg sm:leading-7">
            Start free and upgrade when your renders outgrow it. Every plan runs the same
            identity-preserving engine and the full library of curated styles, so quality never
            changes as you scale.
          </p>
        </div>

        <div className="mt-10 sm:mt-14">
          {/* `highlightedPlan` can badge a single plan as popular once its slug is
              known; `newSubscriptionRedirectUrl` drops new subscribers straight
              into the studio. */}
          <PricingTable
            appearance={PRICING_APPEARANCE}
            newSubscriptionRedirectUrl="/studio"
          />
        </div>

        <p className="mx-auto mt-6 max-w-2xl text-center text-xs leading-relaxed text-muted-foreground sm:mt-8">
          Billing is handled securely in-app — change or cancel a plan at any time.
        </p>
      </section>
    </GridBackground>
  );
}

export default Pricing;

