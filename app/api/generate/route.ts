import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { ACCEPTED_SOURCE_IMAGE_MIME_TYPES } from "@/lib/constants";
import {
  MAX_SOURCE_IMAGE_LABEL,
  findStudioPreset,
  rejectSourceImage,
  type StudioGenerateError,
  type StudioGenerateErrorCode,
  type StudioGeneration,
} from "@/lib/studio";
import { getRenderEngineConfig, requestStyledImage } from "@/lib/studio-engine";

// Multipart uploads and the upstream `fetch` rely on Node's FormData/File, so
// this route is pinned to the Node.js runtime.
export const runtime = "nodejs";

/** "JPEG, PNG, WEBP" — for error copy that mirrors the accepted MIME types. */
const ACCEPTED_SOURCE_IMAGE_LABEL = Array.from(ACCEPTED_SOURCE_IMAGE_MIME_TYPES)
  .map((mimeType) => mimeType.slice("image/".length).toUpperCase())
  .join(", ");

function failure(code: StudioGenerateErrorCode, status: number, message: string) {
  return NextResponse.json<StudioGenerateError>({ error: { code, message } }, { status });
}

/**
 * Renders a restyle for `image` using `preset`.
 *
 * Status codes:
 * - `401` no Clerk session
 * - `400` malformed multipart body, unusable source image or unknown preset
 * - `501` no engine configured (`RENDER_ENGINE_URL` / `RENDER_ENGINE_API_KEY`)
 * - `502` the engine was reached but failed or answered something unusable
 * - `200` a `StudioGeneration`
 */
export async function POST(request: Request) {
  // `proxy.ts` keeps signed-out browsers out of /studio, but an API route can be
  // called directly, so it enforces its own session check.
  const { userId } = await auth();
  if (!userId) {
    return failure("unauthenticated", 401, "Sign in to render a restyle.");
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return failure(
      "invalid_request",
      400,
      "Expected a multipart form body with an `image` file and a `preset` id.",
    );
  }

  const image = form.get("image");
  const rawPresetId = form.get("preset");

  if (!(image instanceof File) || image.size === 0) {
    return failure("invalid_request", 400, "Attach the source image as `image`.");
  }

  const rejection = rejectSourceImage(image);
  if (rejection === "type") {
    return failure("invalid_request", 400, `Source images must be ${ACCEPTED_SOURCE_IMAGE_LABEL}.`);
  }
  if (rejection === "size") {
    return failure("invalid_request", 400, `Source images must be ${MAX_SOURCE_IMAGE_LABEL} or smaller.`);
  }

  const preset = findStudioPreset(typeof rawPresetId === "string" ? rawPresetId : "");
  if (!preset) {
    return failure("invalid_request", 400, "Choose one of the curated styles.");
  }

  const engine = getRenderEngineConfig();
  if (!engine) {
    return failure(
      "engine_not_connected",
      501,
      "No style engine is connected yet. Set RENDER_ENGINE_URL and RENDER_ENGINE_API_KEY to enable renders.",
    );
  }

  const outcome = await requestStyledImage({ engine, image, presetId: preset.id });
  if (!outcome.ok) {
    return failure("engine_failed", 502, outcome.reason);
  }

  return NextResponse.json<StudioGeneration>(
    {
      id: crypto.randomUUID(),
      presetId: preset.id,
      presetLabel: preset.label,
      imageUrl: outcome.imageUrl,
      createdAt: new Date().toISOString(),
    },
    { status: 200 },
  );
}
