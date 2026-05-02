"use server";

import { getServerSupabase } from "@/lib/supabase/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { getR2Config } from "@/lib/storage/r2";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { revalidatePath } from "next/cache";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export async function submitPaymentConfirmation(formData: FormData) {
  const supabase = await getServerSupabase();
  if (!supabase) return { error: "Database not configured" };

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { error: "Not logged in" };

  const orderNumber = formData.get("order_number") as string;
  const accountName = formData.get("account_name") as string;
  const bankName = formData.get("bank_name") as string;
  const amountStr = formData.get("amount") as string;
  const file = formData.get("receipt_image") as File | null;

  if (!orderNumber || !accountName || !bankName || !amountStr || !file) {
    return { error: "Semua field harus diisi" };
  }

  const amount = parseInt(amountStr.replace(/\\D/g, ""));
  if (isNaN(amount) || amount <= 0) {
    return { error: "Nominal tidak valid" };
  }

  // 1. Verify that the order belongs to this customer
  const { data: order } = await supabase
    .from("orders")
    .select("id, status")
    .eq("order_number", orderNumber)
    .single();

  if (!order) {
    return { error: "Pesanan tidak ditemukan atau bukan milik Anda" };
  }

  if (order.status !== "pending") {
    return { error: "Pesanan ini tidak membutuhkan konfirmasi pembayaran saat ini" };
  }

  // 2. Upload file to R2
  const r2 = getR2Config();
  if (!r2) {
    return { error: "Sistem penyimpanan belum dikonfigurasi" };
  }

  if (file.size > MAX_BYTES) {
    return { error: `File terlalu besar (maksimal 5MB)` };
  }
  if (!ALLOWED.has(file.type)) {
    return { error: `Tipe file tidak didukung` };
  }

  const ext = EXT[file.type];
  const key = `receipts/${Date.now()}-${crypto.randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    await r2.client.send(
      new PutObjectCommand({
        Bucket: r2.bucket,
        Key: key,
        Body: buffer,
        ContentType: file.type,
        CacheControl: "public, max-age=31536000, immutable",
      }),
    );
  } catch (err) {
    return { error: "Gagal mengunggah gambar bukti transfer" };
  }

  const receiptUrl = `${r2.publicUrl}/${key}`;

  // 3. Save to database using Admin Client (bypassing RLS because we don't have an insert policy)
  const adminClient = getAdminClient();
  if (!adminClient) return { error: "Database admin not configured" };

  const { error: insertError } = await adminClient
    .from("payment_confirmations")
    .insert({
      order_number: orderNumber,
      account_name: accountName,
      bank_name: bankName,
      amount,
      receipt_url: receiptUrl,
    });

  if (insertError) {
    return { error: "Gagal menyimpan data konfirmasi: " + insertError.message };
  }

  revalidatePath("/account/payment-confirmation");
  revalidatePath(`/account/orders/${order.id}`);
  
  return { success: true };
}
