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
import { EngineFailedError, EngineNotConnectedError, renderPreset } from "@/lib/cloudflare";
import { getQuotaSnapshot, type GenerationQuotaSnapshot } from "@/lib/generation-quota";
import {
  createPendingGeneration,
  markGenerationDone,
  markGenerationFailed,
  type GenerationRecord,
} from "@/lib/generations-repo";
import { DEFAULT_WORKERS_AI_IMAGE_MODEL } from "@/lib/workers-ai-models";
import { uploadGeneratedImage } from "@/lib/imagekit-upload";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Extra sentences appended to every preset prompt so the engine keeps the source
 * photo's subject and framing instead of inventing new content.
 */
const PROMPT_GUARDRAILS = [
  "Do not add extra people.",
  "Do not add extra limbs.",
  "Do not add extra subjects or objects.",
  "Do not change the overall camera angle, framing or perspective.",
] as const;

function fail(code: StudioGenerateErrorCode, message: string, status: number) {
  const body: StudioGenerateError = { error: { code, message } };
  return NextResponse.json(body, { status });
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
  // Clerk session check, enforced here because the API can be called directly.
  // Signed-out requests get a JSON 401 (never a redirect); `proxy.ts` does not
  // protect `/api/*`, so this is the only gate.
  const { userId } = await auth();
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

  const quota = await getQuotaSnapshot(userId);
  if (quota.remaining <= 0) {
    const body: StudioGenerateError & { quota: GenerationQuotaSnapshot } = {
      error: {
        code: "quota_exceeded",
        message: "You've used all your renders this month. Try again after your quota resets.",
      },
      quota,
    };
    return NextResponse.json(body, { status: 429 });
  }

  let pending: GenerationRecord;
  try {
    pending = await createPendingGeneration({
      userId,
      presetId: preset.id,
      presetLabel: preset.label,
      model: DEFAULT_WORKERS_AI_IMAGE_MODEL,
    });
  } catch (err) {
    console.error("[api/generate] could not queue generation", err);
    return fail("engine_failed", "Something went wrong while rendering. Please try again.", 502);
  }

  const startedAt = Date.now();
  try {
    const bytes = new Uint8Array(await photo.arrayBuffer());
    const { imageUrl: renderedDataUrl } = await renderPreset(
      preset.id,
      bytes,
      photo.type,
      PROMPT_GUARDRAILS,
    );

    // Upload to ImageKit so the render joins the user's saved history. If the
    // upload fails we keep the session-only data URL and store no file id, so
    // the result is never lost.
    let storedImageUrl: string | null = null;
    let imageKitFileId: string | null = null;
    let responseImageUrl = renderedDataUrl;
    try {
      const uploaded = await uploadGeneratedImage({
        userId,
        generationId: pending.id,
        dataUrl: renderedDataUrl,
      });
      storedImageUrl = uploaded.url;
      imageKitFileId = uploaded.fileId;
      responseImageUrl = uploaded.url;
    } catch (uploadErr) {
      console.error("[api/generate] imagekit upload failed", uploadErr);
    }

    const done = await markGenerationDone(userId, pending.id, {
      imageUrl: storedImageUrl,
      imageKitFileId,
      durationMs: Date.now() - startedAt,
    });

    const generation: StudioGeneration = {
      id: pending.id,
      presetId: preset.id,
      presetLabel: preset.label,
      imageUrl: responseImageUrl,
      createdAt: (done?.createdAt ?? pending.createdAt).toISOString(),
      quota: await getQuotaSnapshot(userId),
    };
    return NextResponse.json(generation);
  } catch (err) {
    try {
      await markGenerationFailed(userId, pending.id, Date.now() - startedAt);
    } catch (markErr) {
      console.error("[api/generate] could not mark generation failed", markErr);
    }

    if (err instanceof EngineNotConnectedError) {
      return fail("engine_not_connected", "The studio engine isn't connected yet.", 503);
    }
    if (err instanceof EngineFailedError) {
      switch (err.message) {
        case "rate_limited":
          return fail(
            "engine_failed",
            "The studio has reached its daily limit. Please try again tomorrow.",
            429,
          );
        case "bad_image":
          return fail(
            "invalid_request",
            "We couldn't read that image. Try a different JPG or PNG.",
            400,
          );
        case "no_model_access":
          return fail(
            "engine_not_connected",
            "The studio engine isn't available right now.",
            503,
          );
        case "no_image":
          return fail(
            "engine_failed",
            "The engine couldn't restyle this photo. Try a different image or style.",
            422,
          );
      }
    }

    console.error("[api/generate]", err);
    return fail("engine_failed", "Something went wrong while rendering. Please try again.", 502);
  }
}
