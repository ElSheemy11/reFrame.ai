export { cn } from "cn";

/**
 * Downloads an image (remote URL or data URL) under a chosen file name.
 * Browser-only: used from click handlers, never during render.
 */
export async function downloadImageFromUrl(url: string, fileName: string): Promise<void> {
  const response = await fetch(url);
  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);

  try {
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

/** Localised date and time for a history item, e.g. "Oct 3, 2026, 2:03 PM". */
export function formatHistoryDate(value: Date | string): string {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

