import { NextResponse } from "next/server";
import { adminClientOrError } from "@/lib/admin/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BUCKET = "product-images";
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);
const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export async function POST(request: Request) {
  const ctx = adminClientOrError();
  if (!ctx.ok) return ctx.response;

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Missing file field" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: `File terlalu besar (maksimal ${MAX_BYTES / 1024 / 1024}MB)` },
      { status: 400 },
    );
  }
  if (!ALLOWED.has(file.type)) {
    return NextResponse.json(
      { error: `Tipe file tidak didukung: ${file.type || "unknown"}` },
      { status: 400 },
    );
  }

  // Random object name; keep extension for friendly URL + correct
  // Content-Type when served via Supabase Storage public CDN.
  const ext = EXT[file.type];
  const name = `${Date.now()}-${crypto.randomUUID()}.${ext}`;
  const path = `products/${name}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: upErr } = await ctx.supabase.storage
    .from(BUCKET)
    .upload(path, buffer, {
      contentType: file.type,
      cacheControl: "31536000",
      upsert: false,
    });
  if (upErr) {
    return NextResponse.json({ error: upErr.message }, { status: 500 });
  }

  const { data: pub } = ctx.supabase.storage.from(BUCKET).getPublicUrl(path);
  return NextResponse.json({ url: pub.publicUrl, path });
}
