export const SITE_NAME = "Juragan Grosir";
export const SITE_TAGLINE = "Kacamata Premium dan Grosir";
// Read from NEXT_PUBLIC_SITE_URL so production sitemap, robots.txt,
// metadataBase OG-image URLs, and WhatsApp product share links all
// point to the real domain. Falls back to the example placeholder
// only for local dev when the env var is unset. Trailing slash is
// stripped to keep `${SITE_URL}/path` joins clean.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://juragangrosir.example.com"
).replace(/\/$/, "");

// Customer support — used by the floating WhatsApp button and contact CTAs.
// In production this should come from admin site_settings.
export const WHATSAPP_NUMBER = "6282251220020";
export const SUPPORT_EMAIL = "support@juragangrosir.id";
export const STORE_PHONE = "+62 822 5122 0020";
export const STORE_ADDRESS = "Dusun Krajan 1, RT 002/008 Jombang, Kec. Jombang, Kab. Jember, Jawa Timur 68168";
export const STORE_ORIGIN_POSTAL_CODE = "68168";

export const NAV_LINKS = [
  { label: "Beranda", href: "/" },
  { label: "Belanja", href: "/shop" },
  { label: "Koleksi", href: "/collections" },
] as const;

export function whatsappLink(message: string) {
  const text = encodeURIComponent(message);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
}
