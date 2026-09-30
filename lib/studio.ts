import { ACCEPTED_SOURCE_IMAGE_MIME_TYPES } from "@/lib/constants";

/**
 * Shared contract for the studio workspace (`/studio`) and the route that will
 * render restyles (`POST /api/generate`).
 *
 * Everything in this module is plain data or a pure helper, so it is safe to
 * import from both the server route and the "use client" workspace. Server-only
 * concerns (engine credentials, the upstream call) live in `lib/studio-engine`.
 */

/** Largest source image the studio accepts, in bytes. */
export const MAX_SOURCE_IMAGE_BYTES = 10 * 1024 * 1024;

/** `MAX_SOURCE_IMAGE_BYTES` in the form shown to people. */
export const MAX_SOURCE_IMAGE_LABEL = formatBytes(MAX_SOURCE_IMAGE_BYTES);

/** `accept` attribute for the source image file input. */
export const SOURCE_IMAGE_ACCEPT_ATTRIBUTE = Array.from(ACCEPTED_SOURCE_IMAGE_MIME_TYPES).join(",");

/** Endpoint that turns a source image plus a preset into a restyled image. */
export const GENERATE_ENDPOINT = "/api/generate";

/** Number of renders kept in the workspace's session history. */
export const STUDIO_HISTORY_LIMIT = 9;

export type StudioPresetId =
  | "storybook-3d"
  | "anime-cel"
  | "clay-render"
  | "pixart"
  | "voxel-block"
  | "marble-sculpture";

export type StudioPreset = {
  id: StudioPresetId;
  /** Shown on the preset card. The first four mirror `FEATURED_STYLES`. */
  label: string;
  /** One-line description of the look, used as the card's sub-line. */
  blurb: string;
  /** Static thumbnail in `public/`, rendered as the card's preview. */
  thumbnail: string;
};

/**
 * The curated looks offered in the studio. Each one has a matching
 * `<id>-example.png` in `public/`, so adding a look is an image plus an entry
 * here — the route validates against this list, so the UI and the API can never
 * disagree about what is selectable.
 */
export const STUDIO_PRESETS: readonly StudioPreset[] = [
  {
    id: "storybook-3d",
    label: "Storybook 3D",
    blurb: "Painted 3D storybook look with soft light and rounded forms.",
    thumbnail: "/storybook-example.png",
  },
  {
    id: "anime-cel",
    label: "Anime Cel",
    blurb: "Flat cel shading with crisp ink lines and saturated colour.",
    thumbnail: "/anime-cel-example.png",
  },
  {
    id: "clay-render",
    label: "Clay Render",
    blurb: "Matte clay sculpt with soft studio shadows.",
    thumbnail: "/clay-render-example.png",
  },
  {
    id: "pixart",
    label: "Pixart",
    blurb: "Chunky pixel art on a tight retro palette.",
    thumbnail: "/pixart-example.png",
  },
  {
    id: "voxel-block",
    label: "Voxel Block",
    blurb: "Blocky voxel build with toy-like depth.",
    thumbnail: "/voxel-block-example.png",
  },
  {
    id: "marble-sculpture",
    label: "Marble Sculpture",
    blurb: "Polished marble carving under cool studio light.",
    thumbnail: "/marble-sculpture-example.png",
  },
];

/** Preset selected when the studio first loads. */
export const DEFAULT_STUDIO_PRESET_ID: StudioPresetId = STUDIO_PRESETS[0].id;

/** Look up a preset by its id. Returns `undefined` for unknown ids. */
export function findStudioPreset(id: string): StudioPreset | undefined {
  return STUDIO_PRESETS.find((preset) => preset.id === id);
}

/** Why a chosen file cannot be used as a source image. */
export type SourceImageRejection = "type" | "size";

/**
 * Checks a candidate source image against the studio's limits. Returns `null`
 * when the file is usable, otherwise the reason it was rejected. Shared by the
 * dropzone (instant feedback) and the route handler (authoritative check).
 */
export function rejectSourceImage(file: { type: string; size: number }): SourceImageRejection | null {
  if (!ACCEPTED_SOURCE_IMAGE_MIME_TYPES.has(file.type)) return "type";
  if (file.size > MAX_SOURCE_IMAGE_BYTES) return "size";
  return null;
}

/** A finished render, as returned by `POST /api/generate`. */
export type StudioGeneration = {
  /** Stable id, used as the React key in the session history. */
  id: string;
  presetId: StudioPresetId;
  /** Denormalised so history can render without re-deriving the preset. */
  presetLabel: string;
  /** URL of the styled image. */
  imageUrl: string;
  /** ISO timestamp of when the engine finished. */
  createdAt: string;
};

/** Machine-readable failure reasons from `POST /api/generate`. */
export type StudioGenerateErrorCode =
  | "unauthenticated"
  | "invalid_request"
  | "engine_not_connected"
  | "engine_failed";

/** Error body returned by `POST /api/generate`. */
export type StudioGenerateError = {
  error: {
    code: StudioGenerateErrorCode;
    /** Safe to show to the person who made the request. */
    message: string;
  };
};

/**
 * Narrows an unknown JSON payload to the error shape. The route always answers
 * with either a `StudioGeneration` or a `StudioGenerateError`, so this is the
 * only branch the client needs.
 */
export function isStudioGenerateError(payload: unknown): payload is StudioGenerateError {
  if (typeof payload !== "object" || payload === null || !("error" in payload)) return false;

  const { error } = payload as { error?: unknown };
  if (typeof error !== "object" || error === null) return false;

  return typeof (error as { message?: unknown }).message === "string";
}

/** Byte counts as short human-readable strings, e.g. `1536` -> `"1.5 KB"`. */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;

  const units = ["KB", "MB", "GB"] as const;
  let value = bytes / 1024;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value >= 10 ? Math.round(value) : Math.round(value * 10) / 10} ${units[unitIndex]}`;
}
