import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import {
  findStudioPreset,
  rejectSourceImage,
  MAX_SOURCE_IMAGE_LABEL,
  type StudioGeneration,
  type StudioGenerateError,
  type StudioGenerateErrorCode,
} from "@/lib/studio";
import { EngineFailedError, EngineNotConnectedError, renderPreset } from "@/lib/gemini";

export const runtime = "nodejs";
export const maxDuration = 60;

function fail(code: StudioGenerateErrorCode, message: string, status: number) {
  const body: StudioGenerateError = { error: { code, message } };
  return NextResponse.json(body, { status });
}

// Auth: the project's real auth is Clerk. `proxy.ts` keeps signed-out browsers
// out of /studio, but an API route can be called directly, so this enforces its
// own session check and fails closed when there is no user.
async function getUserId(): Promise<string | null> {
  const { userId } = await auth();
  return userId ?? null;
}

// In-memory limiter: per server instance only.
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function isRateLimited(userId: string): boolean {
  const now = Date.now();
  const recent = (hits.get(userId) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(userId, recent);
    return true;
  }
  recent.push(now);
  hits.set(userId, recent);
  return false;
}

export async function POST(req: Request) {
  const userId = await getUserId();
  if (!userId) return fail("unauthenticated", "Please sign in to use the studio.", 401);

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return fail("invalid_request", "Send the photo and style as multipart form data.", 400);
  }

  const photo = form.get("photo");
  const presetId = form.get("presetId");

  if (typeof presetId !== "string") return fail("invalid_request", "Choose a style.", 400);
  const preset = findStudioPreset(presetId);
  if (!preset) return fail("invalid_request", "That style isn't available.", 400);

  if (!(photo instanceof File)) return fail("invalid_request", "Upload a photo.", 400);

  const rejection = rejectSourceImage(photo);
  if (rejection === "type") return fail("invalid_request", "Use a JPG, PNG or WebP image.", 400);
  if (rejection === "size") {
    return fail("invalid_request", `Image must be under ${MAX_SOURCE_IMAGE_LABEL}.`, 400);
  }

  if (isRateLimited(userId)) {
    return fail("engine_failed", "You're going a bit fast. Try again in a minute.", 429);
  }

  try {
    const bytes = new Uint8Array(await photo.arrayBuffer());
    const { imageUrl } = await renderPreset(preset.id, bytes, photo.type);

    const generation: StudioGeneration = {
      id: crypto.randomUUID(),
      presetId: preset.id,
      presetLabel: preset.label,
      imageUrl,
      createdAt: new Date().toISOString(),
    };
    return NextResponse.json(generation);
  } catch (err) {
    if (err instanceof EngineNotConnectedError) {
      return fail("engine_not_connected", "The studio engine isn't connected yet.", 503);
    }
    if (err instanceof EngineFailedError && err.message === "no_image") {
      return fail(
        "engine_failed",
        "The engine couldn't restyle this photo. Try a different image or style.",
        422,
      );
    }
    console.error("[api/generate]", err);
    return fail("engine_failed", "Something went wrong while rendering. Please try again.", 502);
  }
}
