import { getAdminClient } from "@/lib/supabase/admin";
import CouponsClient, { type CouponRow } from "./CouponsClient";

export const dynamic = "force-dynamic";

export default async function AdminCouponsPage() {
  const supabase = getAdminClient();
  let configured = false;
  let coupons: CouponRow[] = [];
  if (supabase) {
    configured = true;
    const { data } = await supabase
      .from("coupons")
      .select("*")
      .order("created_at", { ascending: false });
    coupons = (data ?? []) as CouponRow[];
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <header>
        <h1 style={{ fontSize: 24, fontWeight: 700, fontFamily: "var(--font-display)", color: "var(--text)" }}>
          Coupons
        </h1>
        <p style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 4 }}>
          Promo codes redeemable at checkout. Percentage or fixed-IDR discount, optional minimum subtotal, expiry, and overall use cap.
        </p>
      </header>

      {!configured && (
        <div style={{ borderRadius: 16, border: "1px solid var(--gold)", background: "rgba(201,169,110,0.1)", padding: 16, fontSize: 14, color: "var(--text)" }}>
          Supabase isn&apos;t configured.
        </div>
      )}

      <CouponsClient initial={coupons} />
    </div>
  );
}
