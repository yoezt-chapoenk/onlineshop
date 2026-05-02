import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/lib/constants";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
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
    <html lang="id" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white text-[color:var(--color-ink)]">
        {children}
      </body>
      <Script
        strategy="afterInteractive"
        src="https://www.googletagmanager.com/gtag/js?id=G-VK9XHSB6T6"
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-VK9XHSB6T6');
          `,
        }}
      />
    </html>
  );
}
