import "server-only";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import type { StudioPresetId } from "@/lib/studio";

/** Thrown when no engine credentials are configured. */
export class EngineNotConnectedError extends Error {
  constructor() {
    super("GOOGLE_GENERATIVE_AI_API_KEY is not set");
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
  "Keep the subject, pose, facial features and composition exactly the same. Change only the visual style. Return one image.";

/**
 * Exhaustive on purpose: adding a preset to STUDIO_PRESETS without a prompt
 * here is a compile error, so the UI and the engine cannot drift apart.
 */
const PRESET_PROMPTS: Record<StudioPresetId, string> = {
  "storybook-3d": `Restyle this photo as a painted 3D storybook illustration with soft light and rounded forms. ${KEEP_SUBJECT}`,
  "anime-cel": `Restyle this photo as anime with flat cel shading, crisp ink lines and saturated colour. ${KEEP_SUBJECT}`,
  "clay-render": `Restyle this photo as a matte clay sculpt with soft studio shadows. ${KEEP_SUBJECT}`,
  pixart: `Restyle this photo as chunky pixel art on a tight retro palette. ${KEEP_SUBJECT}`,
  "voxel-block": `Restyle this photo as a blocky voxel build with toy-like depth. ${KEEP_SUBJECT}`,
  "marble-sculpture": `Restyle this photo as a polished marble carving under cool studio light. ${KEEP_SUBJECT}`,
};

const MODEL_ID = process.env.STUDIO_IMAGE_MODEL ?? "gemini-3.1-flash-image";

export type RenderResult = { imageUrl: string };

export async function renderPreset(
  presetId: StudioPresetId,
  bytes: Uint8Array,
  mediaType: string,
): Promise<RenderResult> {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) throw new EngineNotConnectedError();

  let result;
  try {
    result = await generateText({
      model: google(MODEL_ID),
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: PRESET_PROMPTS[presetId] },
            { type: "image", image: bytes, mediaType },
          ],
        },
      ],
    });
  } catch (err) {
    console.error("[gemini] upstream call failed", err);
    throw new EngineFailedError("upstream_error");
  }

  const image = result.files.find((f) => f.mediaType.startsWith("image/"));
  if (!image) throw new EngineFailedError("no_image");

  return { imageUrl: `data:${image.mediaType};base64,${image.base64}` };
}
