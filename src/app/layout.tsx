import type { Metadata } from "next";
import { Inter } from "next/font/google";
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
    "Juragan Grosir is Indonesia's home for premium and wholesale eyewear. Shop fashion glasses, sunglasses, and blue-light frames with retail and reseller pricing.",
  openGraph: {
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description:
      "Premium and wholesale eyewear in Indonesia. Retail and reseller pricing, fast shipping, dedicated support.",
    type: "website",
    siteName: SITE_NAME,
  },
  icons: {
    icon: "/favicon.svg",
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
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white text-[color:var(--color-ink)]">
        {children}
      </body>
    </html>
  );
}
