export const SITE_NAME = "Juragan Grosir";
export const SITE_TAGLINE = "Kacamata Premium dan Grosir";
export const SITE_URL = "https://juragangrosir.example.com";

// Customer support — used by the floating WhatsApp button and contact CTAs.
// In production this should come from admin site_settings.
export const WHATSAPP_NUMBER = "6281234567890";
export const SUPPORT_EMAIL = "support@juragangrosir.id";
export const STORE_PHONE = "+62 812 3456 7890";
export const STORE_ADDRESS = "Jl. Gatot Subroto No. 123, Jakarta Selatan, DKI Jakarta 12930";

export const NAV_LINKS = [
  { label: "Beranda", href: "/" },
  { label: "Belanja", href: "/shop" },
  { label: "Koleksi", href: "/collections" },
  { label: "Tentang Kami", href: "/about" },
  { label: "Grosir", href: "/wholesale" },
  { label: "Kontak", href: "/contact" },
] as const;

export function whatsappLink(message: string) {
  const text = encodeURIComponent(message);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
}
