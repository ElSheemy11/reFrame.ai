import "server-only";

/**
 * Server-only bridge to the style engine that turns a source image plus a
 * studio preset into a restyled image.
 *
 * The studio ships **without** a connected engine: `RENDER_ENGINE_URL` and
 * `RENDER_ENGINE_API_KEY` are unset, so `getRenderEngineConfig()` returns
 * `null`, `/studio` shows the "engine not connected" notice and
 * `POST /api/generate` answers `501`. Point the two variables at an endpoint
 * that speaks the contract documented on `requestStyledImage` and rendering
 * turns on with no code change.
 *
 * Keeping this in its own module means the credentials are only ever read on
 * the server: nothing here can be imported into the "use client" workspace.
 */

export type RenderEngineConfig = {
  /** Absolute URL of the engine endpoint that accepts render jobs. */
  url: string;
  /** Bearer token sent with each render request. */
  apiKey: string;
};

/**
 * Reads the engine credentials. Returns `null` while either variable is
 * missing, which is the signal the whole feature uses to stay switched off.
 */
export function getRenderEngineConfig(): RenderEngineConfig | null {
  const url = process.env.RENDER_ENGINE_URL?.trim();
  const apiKey = process.env.RENDER_ENGINE_API_KEY?.trim();

  if (!url || !apiKey) return null;

  return { url, apiKey };
}

/** `true` once both engine variables are set, so the studio can enable Render. */
export function isRenderEngineConnected(): boolean {
  return getRenderEngineConfig() !== null;
}

export type RenderRequest = {
  engine: RenderEngineConfig;
  /** Source image exactly as the visitor uploaded it. */
  image: File;
  /** Preset id from `STUDIO_PRESETS`. */
  presetId: string;
};

export type RenderOutcome =
  | { ok: true; imageUrl: string }
  /** `reason` is safe to show to the visitor. */
  | { ok: false; reason: string };

/**
 * Expected engine contract — implement it with a small adapter service, or
 * point `RENDER_ENGINE_URL` straight at a provider that already matches:
 *
 *   POST <RENDER_ENGINE_URL>
 *   Authorization: Bearer <RENDER_ENGINE_API_KEY>
 *   Content-Type: multipart/form-data
 *     image  — the source image, unmodified
 *     preset — one of `STUDIO_PRESETS[].id`
 *
 *   200 → { "imageUrl": "https://…" }
 */
export async function requestStyledImage({ engine, image, presetId }: RenderRequest): Promise<RenderOutcome> {
  const body = new FormData();
  body.append("image", image, image.name);
  body.append("preset", presetId);

  let response: Response;

  try {
    response = await fetch(engine.url, {
      method: "POST",
      headers: { Authorization: `Bearer ${engine.apiKey}` },
      body,
      // Renders are long-running, but a hung engine must not hold the request
      // open forever.
      signal: AbortSignal.timeout(120_000),
    });
  } catch (error) {
    return {
      ok: false,
      reason: error instanceof Error && error.name === "TimeoutError"
        ? "The style engine took too long to respond."
        : "The style engine could not be reached.",
    };
  }

  if (!response.ok) {
    return { ok: false, reason: `The style engine rejected the render (HTTP ${response.status}).` };
  }

  const payload: unknown = await response.json().catch(() => null);
  const imageUrl = typeof payload === "object" && payload !== null
    ? (payload as { imageUrl?: unknown }).imageUrl
    : undefined;

  if (typeof imageUrl !== "string" || imageUrl.length === 0) {
    return { ok: false, reason: "The style engine returned a response without an image URL." };
  }

  return { ok: true, imageUrl };
}
