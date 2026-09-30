"use client";

import { MailIcon, Wand2Icon } from "lucide-react";

import {
  CinematicFooter,
  type FooterAction,
  type FooterLink,
} from "@/components/ui/motion-footer";
import { FOOTER_QUICK_LINKS } from "@/lib/constants";

/**
 * Primary footer CTAs. "Contact me for creative work" opens the visitor's mail
 * client — swap the address for the inbox that should receive briefs.
 *
 * This module stays a Client Component because `icon` holds actual Lucide
 * components (forwardRef objects). `CinematicFooter` is a Client Component, so
 * handing it a component reference from a Server Component would throw
 * "Functions cannot be passed directly to Client Components" while prerendering.
 */
const FOOTER_ACTIONS: FooterAction[] = [
  {
    label: "Contact me for creative work",
    href: "mailto:hello@reframe.ai",
    icon: MailIcon,
  },
  {
    label: "Open the studio",
    href: "/studio",
    icon: Wand2Icon,
  },
];

/** Endless strip of value props at the top of the footer. */
const FOOTER_MARQUEE_ITEMS: string[] = [
  "High-fidelity style transfer",
  "Identity-preserving renders",
  "Curated art directions",
  "Gallery-ready exports",
  "One upload, zero prompts",
];

/** Secondary pills, reusing the quick links already defined for the footer. */
const FOOTER_LINKS: readonly FooterLink[] = FOOTER_QUICK_LINKS;

export function Footer() {
  return (
    <CinematicFooter
      brand="reFrame.ai"
      giantText="REFRAME"
      heading="Ready to begin?"
      marqueeItems={FOOTER_MARQUEE_ITEMS}
      actions={FOOTER_ACTIONS}
      links={FOOTER_LINKS}
      copyright="© 2026 reFrame.ai. All rights reserved."
    />
  );
}

export default Footer;

