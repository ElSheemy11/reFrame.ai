import { Footer } from "@/components/Footer";
import { GalleryShowcase } from "@/components/GalleryShowcase";
import { HomeHero } from "@/components/HomeHero";
import { HowItWorksSection } from "@/components/HowItWorks";
import { Testimonials } from "@/components/Testimonials";

export default function Home() {
  return (
    <>
      <main className="min-h-screen bg-background sm:px-10  lg:px-15">
        <HomeHero />
        <GalleryShowcase />
        <HowItWorksSection />
        <Testimonials />
      </main>

      {/* Full-bleed curtain-reveal footer. Kept outside <main> so the page
          padding never clips the fixed footer. */}
      <Footer />
    </>
  );
}
