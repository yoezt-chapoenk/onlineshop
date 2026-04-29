import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { adminClientOrError } from "@/lib/admin/api";
import { getR2Config } from "@/lib/storage/r2";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
  // Reuse the admin auth gate so only HTTP-Basic-authed admins can
  // hit this route (uploads cost money once R2 is wired up).
  const ctx = adminClientOrError();
  if (!ctx.ok) return ctx.response;

  const r2 = getR2Config();
  if (!r2) {
    return NextResponse.json(
      {
        error:
          "Penyimpanan gambar belum dikonfigurasi (R2_ACCOUNT_ID / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY / R2_BUCKET / R2_PUBLIC_URL).",
      },
      { status: 503 },
    );
  }

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

  // Random object key; keep extension for friendly URL + correct
  // Content-Type when served via the R2 public domain.
  const ext = EXT[file.type];
  const key = `products/${Date.now()}-${crypto.randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    await r2.client.send(
      new PutObjectCommand({
        Bucket: r2.bucket,
        Key: key,
        Body: buffer,
        ContentType: file.type,
        // Aggressive cache header: object keys are random, so a
        // re-upload always gets a new url and the cached copy can
        // safely live forever.
        CacheControl: "public, max-age=31536000, immutable",
      }),
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload gagal";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ url: `${r2.publicUrl}/${key}`, path: key });
}
