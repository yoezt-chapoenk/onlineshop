import Link from "next/link";
import { ArrowRight, Wallet, Share2, Users, Banknote } from "lucide-react";

export const metadata = {
  title: "Program Affiliate",
  description: "Dapatkan penghasilan tambahan dengan menjadi agen promotor (Affiliate) Juragan Grosir.",
};

export default function AffiliateLandingPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {/* Hero Section */}
      <section style={{ position: "relative", overflow: "hidden", background: "var(--bg2)", borderBottom: "1px solid var(--border)", padding: "100px 24px", textAlign: "center" }}>
        <div style={{ position: "relative", zIndex: 10, maxWidth: 800, margin: "0 auto" }}>
          <span style={{ display: "block", fontSize: 12, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 16 }}>
            Program Kemitraan
          </span>
          <h1 style={{ fontSize: "clamp(32px, 5vw, 64px)", fontWeight: 400, fontFamily: "var(--font-display)", color: "var(--text)", lineHeight: 1.1, marginBottom: 24 }}>
            Rekomendasikan Produk, <br style={{ display: "none" }} className="sm:block" />
            <span style={{ color: "var(--gold)" }}>
              Dapatkan Komisi Tunai
            </span>
          </h1>
          <p style={{ fontSize: "clamp(16px, 2vw, 20px)", color: "var(--text-muted)", maxWidth: 640, margin: "0 auto 40px auto", lineHeight: 1.6 }}>
            Bergabunglah dengan Program Affiliate Juragan Grosir. Sebarkan link Anda, dan raih komisi dari setiap pembeli yang berbelanja melalui link Anda.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 16 }}>
            <Link href="/account/affiliate" className="btn btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "16px 32px", fontSize: 16 }}>
              Daftar Sekarang <ArrowRight style={{ width: 20, height: 20 }} />
            </Link>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section style={{ padding: "80px 24px", maxWidth: 1200, margin: "0 auto", width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <h2 style={{ fontSize: 32, fontWeight: 400, fontFamily: "var(--font-display)", color: "var(--text)", marginBottom: 16 }}>Bagaimana Cara Kerjanya?</h2>
          <p style={{ fontSize: 16, color: "var(--text-muted)", maxWidth: 600, margin: "0 auto" }}>
            Hanya butuh 3 langkah mudah untuk mulai menghasilkan uang bersama kami.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 40 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ width: 64, height: 64, margin: "0 auto 24px auto", background: "var(--surface)", border: "1px solid var(--gold)", color: "var(--gold)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Users style={{ width: 28, height: 28 }} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 600, color: "var(--text)", marginBottom: 12 }}>1. Mendaftar & Buat Link</h3>
            <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6 }}>
              Masuk ke akun Anda dan buat Kode Affiliate unik Anda. Sistem kami akan secara otomatis menghasilkan Link Referral khusus untuk Anda.
            </p>
          </div>
          
          <div style={{ textAlign: "center" }}>
            <div style={{ width: 64, height: 64, margin: "0 auto 24px auto", background: "var(--surface)", border: "1px solid var(--gold)", color: "var(--gold)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Share2 style={{ width: 28, height: 28 }} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 600, color: "var(--text)", marginBottom: 12 }}>2. Promosikan Link</h3>
            <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6 }}>
              Sebarkan link tersebut ke WhatsApp, Instagram, TikTok, atau blog Anda. Rekomendasikan kacamata berkualitas kami ke jaringan Anda.
            </p>
          </div>

          <div style={{ textAlign: "center" }}>
            <div style={{ width: 64, height: 64, margin: "0 auto 24px auto", background: "var(--surface)", border: "1px solid var(--gold)", color: "var(--gold)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Wallet style={{ width: 28, height: 28 }} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 600, color: "var(--text)", marginBottom: 12 }}>3. Dapatkan Komisi</h3>
            <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6 }}>
              Ketika ada yang mengeklik link Anda dan melakukan pembelian dalam 30 hari, komisi akan otomatis masuk ke saldo Anda.
            </p>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section style={{ background: "var(--bg2)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", padding: "80px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h2 style={{ fontSize: 32, fontWeight: 400, fontFamily: "var(--font-display)", color: "var(--text)", marginBottom: 48, textAlign: "center" }}>Keuntungan Menjadi Affiliate</h2>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: 24, display: "flex", alignItems: "flex-start", gap: 16 }}>
              <div style={{ color: "var(--success)", flexShrink: 0 }}>
                <Banknote style={{ width: 24, height: 24 }} />
              </div>
              <div>
                <h4 style={{ fontSize: 16, fontWeight: 600, color: "var(--text)", marginBottom: 8 }}>Pencairan Dana Fleksibel</h4>
                <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.5 }}>Tarik saldo Anda kapan saja ke rekening bank lokal pilihan Anda dengan minimal penarikan Rp 50.000.</p>
              </div>
            </div>
            
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: 24, display: "flex", alignItems: "flex-start", gap: 16 }}>
              <div style={{ color: "var(--gold)", flexShrink: 0 }}>
                <Share2 style={{ width: 24, height: 24 }} />
              </div>
              <div>
                <h4 style={{ fontSize: 16, fontWeight: 600, color: "var(--text)", marginBottom: 8 }}>Cookies Tahan 30 Hari</h4>
                <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.5 }}>Pembeli tidak harus langsung belanja hari itu. Selama mereka belanja dalam 30 hari sejak klik, komisi tetap milik Anda.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "100px 24px", textAlign: "center", maxWidth: 800, margin: "0 auto" }}>
        <h2 style={{ fontSize: "clamp(28px, 4vw, 36px)", fontWeight: 400, fontFamily: "var(--font-display)", color: "var(--text)", marginBottom: 24 }}>Siap untuk mulai menghasilkan?</h2>
        <p style={{ fontSize: 16, color: "var(--text-muted)", marginBottom: 40, lineHeight: 1.6 }}>
          Gabung sekarang, tanpa biaya pendaftaran (100% Gratis). Mulai promosikan produk terlaris kami dan nikmati keuntungannya.
        </p>
        <Link href="/account/affiliate" className="btn btn-primary" style={{ display: "inline-flex", padding: "16px 32px", fontSize: 16 }}>
          Mulai Jadi Affiliate
        </Link>
      </section>
    </div>
  );
}
