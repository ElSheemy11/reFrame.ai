import { ClerkProvider } from "@clerk/nextjs";
import { shadcn } from "@clerk/ui/themes";
import type { Metadata } from "next";
import { Geist, Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { ThemeProvider } from "@/components/ui/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Display font for the cinematic footer. `preload: false` keeps it off the
// critical path on pages that never render the footer.
const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  // `default` is used by pages that don't set their own title; `template` keeps
  // every page branded without repeating the suffix.
  title: {
    default: "reFrame.ai — High-fidelity style transfer",
    template: "%s | reFrame.ai",
  },
  description:
    "Upload a photo, pick a curated style, and get a gallery-ready restyle. Identity-preserving style transfer with no prompts and no guesswork.",
  applicationName: "reFrame.ai",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${plusJakarta.variable} antialiased`}
      >
        <ClerkProvider appearance={{ theme: shadcn }}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
          >
            <SiteHeader />
            {children}
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}