import { auth } from "@clerk/nextjs/server";
import type { Metadata } from "next";

import { StudioWorkspace } from "@/components/studio/studio-workspace";
import { isRenderEngineConnected } from "@/lib/studio-engine";

export const metadata: Metadata = {
  title: "Studio",
  description:
    "Upload a photo, pick a curated style and compare the restyle against the original.",
};

async function StudioPage() {
  // Authoritative guard for this resource: middleware only redirects signed-out users,
  // so the server component itself also requires a session.
  await auth.protect();

  // Read on the server so the engine credentials never reach the client bundle:
  // the workspace only learns whether an engine exists, never how to reach it.
  const engineConnected = isRenderEngineConnected();

  return (
    <main className="min-h-screen bg-background p-3 sm:p-4 lg:p-5">
      {/* `.studio-shell` paints the workspace background; the top padding keeps
          the fixed site header clear of the content. */}
      <div className="studio-shell relative overflow-hidden rounded-4xl border border-border/60 px-4 pb-12 pt-24 sm:px-8 sm:pt-28 lg:px-12">
        <StudioWorkspace engineConnected={engineConnected} />
      </div>
    </main>
  );
}

export default StudioPage;
