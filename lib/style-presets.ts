import type { StudioPreset } from "@/lib/studio";

/**
 * The curated looks offered in the studio — the single source of truth.
 *
 * `lib/studio` re-exports this list as `STUDIO_PRESETS`, so the studio UI and
 * the `POST /api/generate` route can never disagree about what is selectable.
 * Every id has a matching prompt in `lib/cloudflare.ts` (a
 * `Record<StudioPresetId, string>`), which the compiler enforces.
 */
export type StylePreset = StudioPreset;

export const stylePresets: StudioPreset[] = [
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

/** Look up a preset by its id. Returns `undefined` for unknown ids. */
export function getStylePreset(id: string): StudioPreset | undefined {
  return stylePresets.find((preset) => preset.id === id);
}