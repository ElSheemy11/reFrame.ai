/**
 * Shrinks a picked photo before it is uploaded to the studio.
 *
 * Longest side is capped at 1280px and the result is JPEG quality 0.9 — but only
 * when the file is large enough to be worth re-encoding. Camera EXIF orientation
 * is honoured via `imageOrientation: "from-image"`.
 *
 * Never throws: on any failure (unsupported browser, unreadable file, canvas
 * unavailable) the original `File` is returned untouched, so the upload still
 * works. The on-screen preview keeps using the original file.
 */
const MAX_UPLOAD_SIDE = 1280;
const JPEG_QUALITY = 0.9;
/** Files at or below this size are sent as-is. */
const SHRINK_THRESHOLD_BYTES = 512 * 1024;

export async function shrinkImageForUpload(file: File): Promise<File> {
  try {
    if (file.size <= SHRINK_THRESHOLD_BYTES) return file;

    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    try {
      const scale = Math.min(1, MAX_UPLOAD_SIDE / Math.max(bitmap.width, bitmap.height));
      const targetWidth = Math.max(1, Math.round(bitmap.width * scale));
      const targetHeight = Math.max(1, Math.round(bitmap.height * scale));

      const canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const context = canvas.getContext("2d");
      if (!context) return file;
      context.drawImage(bitmap, 0, 0, targetWidth, targetHeight);

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY),
      );
      if (!blob) return file;

      const baseName = file.name.replace(/\.[^.]+$/, "") || "photo";
      return new File([blob], `${baseName}.jpg`, {
        type: "image/jpeg",
        lastModified: file.lastModified,
      });
    } finally {
      bitmap.close();
    }
  } catch {
    return file;
  }
}
