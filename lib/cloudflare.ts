import "server-only";
import { Jimp } from "jimp";
import type { StudioPresetId } from "@/lib/studio";
import { DEFAULT_WORKERS_AI_IMAGE_MODEL } from "@/lib/workers-ai-models";

/** Thrown when Cloudflare credentials are missing. */
export class EngineNotConnectedError extends Error {
  constructor() {
    super("CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_API_TOKEN is not set");
    this.name = "EngineNotConnectedError";
  }
}

/** Thrown when the engine ran but did not return a usable image. */
export class EngineFailedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EngineFailedError";
  }
}

const KEEP_SUBJECT =
  "Keep the subject, pose, facial features and composition exactly the same. Change only the visual style.";

const PROMPTS: Record<StudioPresetId, string> = {
  "storybook-3d": `Restyle this photo as a painted 3D storybook illustration with soft light and rounded forms. ${KEEP_SUBJECT}`,
  "anime-cel": `Restyle this photo as anime with flat cel shading, crisp ink lines and saturated colour. ${KEEP_SUBJECT}`,
  "clay-render": `Restyle this photo as a matte clay sculpt with soft studio shadows. ${KEEP_SUBJECT}`,
  pixart: `Restyle this photo as chunky pixel art on a tight retro palette. ${KEEP_SUBJECT}`,
  "voxel-block": `Restyle this photo as a blocky voxel build with toy-like depth. ${KEEP_SUBJECT}`,
  "marble-sculpture": `Restyle this photo as a polished marble carving under cool studio light. ${KEEP_SUBJECT}`,
};

export function buildPrompt(presetId: StudioPresetId, guardrails: readonly string[] = []): string {
  return [PROMPTS[presetId], ...guardrails].map((s) => s.trim()).filter(Boolean).join(" ");
}

const MODEL = DEFAULT_WORKERS_AI_IMAGE_MODEL;

// FLUX.2 klein requires input images no larger than 512x512.
const MAX_SIDE = 512;

export type RenderResult = { imageUrl: string };

export async function renderPreset(
  presetId: StudioPresetId,
  bytes: Uint8Array,
  mediaType: string,
  guardrails: readonly string[] = [],
): Promise<RenderResult> {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID?.trim();
  const apiToken = process.env.CLOUDFLARE_API_TOKEN?.trim();
  if (!accountId || !apiToken) throw new EngineNotConnectedError();

  let resized: Buffer;
  try {
    // Jimp reads the bytes and applies the camera's EXIF orientation on read.
    const image = await Jimp.read(Buffer.from(bytes));
    // Uniformly scale to fit inside MAX_SIDE x MAX_SIDE; cap at 1 so we never enlarge.
    const scale = Math.min(1, MAX_SIDE / image.bitmap.width, MAX_SIDE / image.bitmap.height);
    if (scale < 1) image.scale(scale);
    resized = await image.getBuffer("image/png");
  } catch (err) {
    if (mediaType === "image/jpeg" || mediaType === "image/png") {
      console.error("[cloudflare] jimp could not process image, sending the original", err);
      resized = Buffer.from(bytes);
    } else {
      console.error("[cloudflare] could not read image", err);
      throw new EngineFailedError("bad_image");
    }
  }

  const form = new FormData();
  form.append("prompt", buildPrompt(presetId, guardrails));
  form.append(
    "input_image_0",
    new Blob([new Uint8Array(resized)], { type: "image/png" }),
    "input.png",
  );

  let res: Response;
  try {
    // Do not set Content-Type manually: fetch adds the multipart boundary itself.
    res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${MODEL}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiToken}` },
      body: form,
    });
  } catch (err) {
    console.error("[cloudflare] network error", err);
    throw new EngineFailedError("network_error");
  }

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error("[cloudflare] upstream error", res.status, detail.slice(0, 500));
    throw new EngineFailedError(res.status === 429 ? "rate_limited" : "upstream_error");
  }

  const contentType = res.headers.get("content-type") ?? "";

  // Some models return raw image bytes.
  if (contentType.startsWith("image/")) {
    const out = Buffer.from(await res.arrayBuffer());
    if (out.length === 0) throw new EngineFailedError("no_image");
    return { imageUrl: `data:${contentType};base64,${out.toString("base64")}` };
  }

  // FLUX.2 returns JSON with a base64 image (wrapped in `result` on the REST API).
  let json: { result?: { image?: unknown }; image?: unknown } | null = null;
  try {
    json = await res.json();
  } catch {
    json = null;
  }
  const b64 = json?.result?.image ?? json?.image;
  if (typeof b64 !== "string" || b64.length === 0) {
    console.error("[cloudflare] unexpected response shape", json ? Object.keys(json) : "not json");
    throw new EngineFailedError("no_image");
  }
  const mime = b64.startsWith("/9j/") ? "image/jpeg" : "image/png";
  return { imageUrl: `data:${mime};base64,${b64}` };
}
