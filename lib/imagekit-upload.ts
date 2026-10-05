import "server-only";

import ImageKit, { toFile } from "@imagekit/nodejs";

/** Thrown when the ImageKit private key is missing. */
export class ImageKitNotConfiguredError extends Error {
  constructor() {
    super("IMAGEKIT_PRIVATEKEY_VALUE is not set");
    this.name = "ImageKitNotConfiguredError";
  }
}

let client: ImageKit | null = null;

function getClient(): ImageKit {
  const privateKey = process.env.IMAGEKIT_PRIVATEKEY_VALUE?.trim();
  if (!privateKey) throw new ImageKitNotConfiguredError();
  if (!client) client = new ImageKit({ privateKey });
  return client;
}

/** Splits a `data:<mime>;base64,<payload>` URL into its MIME type and bytes. */
function parseDataUrl(dataUrl: string): { mimeType: string; buffer: Buffer } {
  const comma = dataUrl.indexOf(",");
  if (!dataUrl.startsWith("data:") || comma === -1) {
    throw new Error("Unsupported image source: expected a data URL");
  }

  const header = dataUrl.slice("data:".length, comma);
  const payload = dataUrl.slice(comma + 1);
  const mimeType = header.split(";")[0] || "image/png";

  return { mimeType, buffer: Buffer.from(payload, "base64") };
}

/** A stored ImageKit file: its public URL and the id needed to delete it. */
export type UploadedGeneratedImage = {
  url: string;
  fileId: string;
};

/**
 * Uploads a rendered image (a data URL) to ImageKit under `/reframe/<userId>`.
 * Server-only, so the private key never reaches the client.
 */
export async function uploadGeneratedImage(params: {
  userId: string;
  generationId: string;
  dataUrl: string;
}): Promise<UploadedGeneratedImage> {
  const { mimeType, buffer } = parseDataUrl(params.dataUrl);
  const extension = mimeType === "image/jpeg" ? "jpg" : "png";
  const fileName = `${params.generationId}-${Date.now()}.${extension}`;
  const file = await toFile(buffer, fileName, { type: mimeType });

  const result = await getClient().files.upload({
    file,
    fileName,
    folder: `/reframe/${params.userId}`,
    useUniqueFileName: true,
  });

  if (!result.url || !result.fileId) {
    throw new Error("ImageKit upload did not return a url and fileId");
  }

  return { url: result.url, fileId: result.fileId };
}

/** Deletes a previously uploaded file by its ImageKit file id. */
export async function deleteUploadedImage(fileId: string): Promise<void> {
  await getClient().files.delete(fileId);
}
