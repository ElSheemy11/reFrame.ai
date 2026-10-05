/**
 * Workers AI image models the studio can render with.
 *
 * The engine call in `lib/cloudflare.ts` uses `DEFAULT_WORKERS_AI_IMAGE_MODEL`;
 * the studio UI shows `WORKERS_AI_IMAGE_MODEL_LABELS`. Add a model here and it
 * becomes the default everywhere the constant is read.
 */
export const WORKERS_AI_IMAGE_MODELS = ["@cf/black-forest-labs/flux-2-klein-4b"] as const;

/** Identifier of a Workers AI image model. */
export type WorkersAiImageModel = (typeof WORKERS_AI_IMAGE_MODELS)[number];

/** Model used when a request does not pick one. */
export const DEFAULT_WORKERS_AI_IMAGE_MODEL: WorkersAiImageModel = WORKERS_AI_IMAGE_MODELS[0];

/** Human-readable names for the model picker and history rows. */
export const WORKERS_AI_IMAGE_MODEL_LABELS: Record<WorkersAiImageModel, string> = {
  "@cf/black-forest-labs/flux-2-klein-4b": "FLUX.2 Klein 4B",
};
