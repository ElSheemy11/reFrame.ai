import { FaqSection } from "@/components/FaqSection";
import { Footer } from "@/components/Footer";
import { GalleryShowcase } from "@/components/GalleryShowcase";
import { HomeHero } from "@/components/HomeHero";
import { HowItWorksSection } from "@/components/HowItWorks";
import Pricing from "@/components/Pricing";
import { PrivacyTrustStrip } from "@/components/PrivacyTrustStrip";
import { Testimonials } from "@/components/Testimonials";

export default function Home() {
  return (
    <>
      <main className="min-h-screen bg-background sm:px-10  lg:px-15">
        <HomeHero />
        <GalleryShowcase />
        <HowItWorksSection />
        <Pricing />
        <PrivacyTrustStrip />
        <FaqSection />
        <Testimonials />
      </main>

      {/* Full-bleed curtain-reveal footer. Kept outside <main> so the page
          padding never clips the fixed footer. */}
      <Footer />
    </>
  );
}
