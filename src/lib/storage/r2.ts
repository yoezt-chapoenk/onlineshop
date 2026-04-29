import "server-only";
import { S3Client } from "@aws-sdk/client-s3";

let cached: S3Client | null = null;

export interface R2Config {
  client: S3Client;
  bucket: string;
  publicUrl: string; // no trailing slash
}

/**
 * Cloudflare R2 is S3-compatible, so we use the AWS SDK pointed at the
 * R2 endpoint. Five env vars are required (all server-only):
 *
 *   R2_ACCOUNT_ID         — Cloudflare account id (R2 dashboard top-right)
 *   R2_ACCESS_KEY_ID      — R2 API token Access Key ID
 *   R2_SECRET_ACCESS_KEY  — R2 API token Secret
 *   R2_BUCKET             — bucket name (e.g. juragan-grosir-products)
 *   R2_PUBLIC_URL         — public url prefix (custom domain or pub-*.r2.dev),
 *                           no trailing slash
 *
 * Returns null when any of these are missing so route handlers can
 * surface a clean 503 instead of crashing.
 */
export function getR2Config(): R2Config | null {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET;
  const publicUrlRaw = process.env.R2_PUBLIC_URL;
  if (!accountId || !accessKeyId || !secretAccessKey || !bucket || !publicUrlRaw) {
    return null;
  }
  const publicUrl = publicUrlRaw.replace(/\/$/, "");
  if (!cached) {
    cached = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId, secretAccessKey },
    });
  }
  return { client: cached, bucket, publicUrl };
}
