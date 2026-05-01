import Link from "next/link";
import {
  SITE_NAME,
  STORE_ADDRESS,
  STORE_PHONE,
  SUPPORT_EMAIL,
} from "@/lib/constants";

const SHOP_LINKS = [
  { label: "Kacamata Optik", href: "/collections/eyeglasses" },
  { label: "Kacamata Hitam", href: "/collections/sunglasses" },
  { label: "Kacamata Blue Light", href: "/collections/blue-light" },
  { label: "Aksesoris", href: "/collections/accessories" },
  { label: "Semua Produk", href: "/shop" },
];

const COMPANY_LINKS = [
  { label: "Tentang Kami", href: "/about" },
  { label: "Blog", href: "/blog" },
  { label: "Jadi Reseller", href: "/wholesale" },
  { label: "Kontak", href: "/contact" },
];

const POLICY_LINKS = [
  { label: "Kebijakan Privasi", href: "/legal/privacy" },
  { label: "Syarat & Ketentuan", href: "/legal/terms" },
  { label: "Kebijakan Pengembalian", href: "/legal/returns" },
  { label: "Kebijakan Pengiriman", href: "/legal/shipping" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[color:var(--color-navy-900)] text-white mt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          <div className="col-span-2 md:col-span-1">
            <div className="text-xl font-bold tracking-tight">{SITE_NAME}</div>
            <p className="mt-3 text-sm text-white/70 leading-relaxed">
              Kacamata premium dan grosir di Indonesia. Harga retail dan reseller,
              pengiriman cepat, layanan pelanggan responsif.
            </p>
            <div className="mt-5 space-y-1.5 text-sm text-white/80">
              <div>{STORE_ADDRESS}</div>
              <div>
                <a href={`tel:${STORE_PHONE.replace(/\s+/g, "")}`} className="hover:underline">
                  {STORE_PHONE}
                </a>
              </div>
              <div>
                <a href={`mailto:${SUPPORT_EMAIL}`} className="hover:underline">
                  {SUPPORT_EMAIL}
                </a>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white/90">
              Belanja
            </h4>
            <ul className="mt-4 space-y-2 text-sm text-white/75">
              {SHOP_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white/90">
              Perusahaan
            </h4>
            <ul className="mt-4 space-y-2 text-sm text-white/75">
              {COMPANY_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white/90">
              Pelanggan
            </h4>
            <ul className="mt-4 space-y-2 text-sm text-white/75">
              {POLICY_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row gap-3 sm:gap-6 sm:items-center justify-between text-xs text-white/60">
          <div>© {year} {SITE_NAME}. Hak cipta dilindungi.</div>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <span>Pembayaran aman via Bank Transfer, VA, QRIS</span>
            <span aria-hidden>·</span>
            <span>Dikirim dengan kurir terpercaya seluruh Indonesia</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
