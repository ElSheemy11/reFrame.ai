import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { deleteGeneration, getGeneration } from "@/lib/generations-repo";
import { deleteUploadedImage } from "@/lib/imagekit-upload";

export const runtime = "nodejs";

/**
 * Deletes one of the signed-in user's renders: the ImageKit file (best effort)
 * and the database row. Owner-only — every lookup is scoped by Clerk `userId`.
 */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json(
      { error: { code: "unauthenticated", message: "Please sign in to use the studio." } },
      { status: 401 },
    );
  }

  const { id } = await params;

  const existing = await getGeneration(userId, id);
  if (!existing) {
    return NextResponse.json(
      { error: { code: "not_found", message: "That render doesn't exist." } },
      { status: 404 },
    );
  }

  if (existing.imageKitFileId) {
    try {
      await deleteUploadedImage(existing.imageKitFileId);
    } catch (err) {
      // The DB row should still go, even if the CDN delete fails.
      console.error("[api/generations] could not delete ImageKit file", err);
    }
  }

  await deleteGeneration(userId, id);

  return NextResponse.json({ ok: true });
}
