import Link from "next/link";
import { ArrowRight, Wallet, Share2, Users, Banknote } from "lucide-react";

export const metadata = {
  title: "Program Affiliate",
  description: "Dapatkan penghasilan tambahan dengan menjadi agen promotor (Affiliate) Juragan Grosir.",
};

export default function AffiliateLandingPage() {
  return (
    <div className="pb-24">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[color:var(--color-navy-900)] to-blue-900 text-white py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="mx-auto max-w-4xl text-center relative z-10">
          <span className="text-sm font-semibold uppercase tracking-[0.15em] text-white/70 mb-4 block">
            Program Kemitraan
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6">
            Rekomendasikan Produk, <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-white">
              Dapatkan Komisi Tunai
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto mb-10 leading-relaxed">
            Bergabunglah dengan Program Affiliate Juragan Grosir. Sebarkan link Anda, dan raih komisi dari setiap pembeli yang berbelanja melalui link Anda.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/account/affiliate" className="btn !bg-white !text-[color:var(--color-navy-900)] !px-8 !py-4 !text-base font-bold shadow-lg hover:-translate-y-0.5 transition-transform">
              Daftar Sekarang <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-white/5 blur-3xl" />
          <div className="absolute top-[60%] -right-[10%] w-[40%] h-[60%] rounded-full bg-blue-500/10 blur-3xl" />
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight mb-4">Bagaimana Cara Kerjanya?</h2>
          <p className="text-[color:var(--color-muted)] max-w-2xl mx-auto">
            Hanya butuh 3 langkah mudah untuk mulai menghasilkan uang bersama kami.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-16">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto bg-[color:var(--color-blue-50)] text-[color:var(--color-navy-700)] rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-[color:var(--color-blue-100)]">
              <Users className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-3">1. Mendaftar & Buat Link</h3>
            <p className="text-[color:var(--color-muted)]">
              Masuk ke akun Anda dan buat Kode Affiliate unik Anda. Sistem kami akan secara otomatis menghasilkan Link Referral khusus untuk Anda.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 mx-auto bg-[color:var(--color-blue-50)] text-[color:var(--color-navy-700)] rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-[color:var(--color-blue-100)]">
              <Share2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-3">2. Promosikan Link</h3>
            <p className="text-[color:var(--color-muted)]">
              Sebarkan link tersebut ke WhatsApp, Instagram, TikTok, atau blog Anda. Rekomendasikan kacamata berkualitas kami ke jaringan Anda.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 mx-auto bg-[color:var(--color-blue-50)] text-[color:var(--color-navy-700)] rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-[color:var(--color-blue-100)]">
              <Wallet className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-3">3. Dapatkan Komisi</h3>
            <p className="text-[color:var(--color-muted)]">
              Ketika ada yang mengeklik link Anda dan melakukan pembelian dalam 30 hari, komisi akan otomatis masuk ke saldo Anda.
            </p>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-[color:var(--color-cloud-100)] py-20 px-4 sm:px-6 lg:px-8 border-y border-[color:var(--color-line)]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tight mb-10 text-center">Keuntungan Menjadi Affiliate</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-[color:var(--color-cloud-200)] shadow-sm flex gap-4">
              <div className="shrink-0 mt-1 text-green-600">
                <Banknote className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-lg mb-1">Pencairan Dana Fleksibel</h4>
                <p className="text-sm text-[color:var(--color-muted)]">Tarik saldo Anda kapan saja ke rekening bank lokal pilihan Anda dengan minimal penarikan Rp 50.000.</p>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-2xl border border-[color:var(--color-cloud-200)] shadow-sm flex gap-4">
              <div className="shrink-0 mt-1 text-blue-600">
                <Share2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-lg mb-1">Cookies Tahan 30 Hari</h4>
                <p className="text-sm text-[color:var(--color-muted)]">Pembeli tidak harus langsung belanja hari itu. Selama mereka belanja dalam 30 hari sejak klik, komisi tetap milik Anda.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 text-center max-w-3xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-6">Siap untuk mulai menghasilkan?</h2>
        <p className="text-[color:var(--color-muted)] mb-10">
          Gabung sekarang, tanpa biaya pendaftaran (100% Gratis). Mulai promosikan produk terlaris kami dan nikmati keuntungannya.
        </p>
        <Link href="/account/affiliate" className="btn btn-primary !px-8 !py-4 !text-base shadow-lg">
          Mulai Jadi Affiliate
        </Link>
      </section>
    </div>
  );
}
