import type { Metadata } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";
import { SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/lib/constants";

// next/font self-hosts these via the build pipeline and emits `font-display:
// swap` preload links, so the browser doesn't block first paint on a
// fonts.googleapis.com round-trip and there's no CLS when fonts arrive.
// Restricting weight ranges keeps the bundled font files small — we don't
// need 100-1000 of either family on the site.
const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-dm-sans",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    template: `%s — ${SITE_NAME}`,
  },
  description:
    "Juragan Grosir adalah toko kacamata premium dan grosir di Indonesia. Belanja kacamata fashion, kacamata hitam, dan blue-light dengan harga retail dan reseller.",
  openGraph: {
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description:
      "Kacamata premium dan grosir di Indonesia. Harga retail dan reseller, pengiriman cepat, layanan pelanggan responsif.",
    type: "website",
    siteName: SITE_NAME,
    locale: "id_ID",
  },
  icons: {
    icon: "/favicon.svg",
  },
  verification: {
    google: "Y7Kj3dGN2txF6pU7GKWHGoAYBHEPjMamXjaYdcFkMOg",
  },
};

// Root layout intentionally only owns the html/body shell and global
// styles. The storefront chrome (Header/Footer/WhatsApp + CartProvider)
// lives in the (storefront) route group so /admin pages don't inherit
// the public navbar, footer, and chat widget.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`h-full antialiased font-sans ${dmSans.variable} ${playfair.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Apply saved theme synchronously before React hydrates so there's
            no flash-of-wrong-theme. This MUST run inline; an effect would
            paint the default theme for one frame first. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem('theme')==='light'){document.documentElement.classList.add('light-mode')}}catch(e){}`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
      </body>
      {/* Analytics pixels (GA / Meta / TikTok) are injected only on the
          storefront via <StorefrontPixels />, driven by the admin settings
          row. /admin pages intentionally don't load marketing scripts. */}
    </html>
  );
}
