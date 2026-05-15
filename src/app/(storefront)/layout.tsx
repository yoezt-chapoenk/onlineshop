import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhatsAppFloat from "@/components/layout/WhatsAppFloat";
import { CartProvider } from "@/components/cart/CartProvider";
import { SessionProvider } from "@/components/auth/SessionProvider";
import { ThemeProvider } from "@/components/layout/ThemeProvider";

// Storefront-only chrome: the public Header, Footer, and floating WhatsApp
// button, plus the cart context provider used by all shopper-facing pages.
// Because this layout lives in a route group and not at the app root,
// /admin routes do not inherit it.
//
// Critically: this layout is NOT async and does NOT touch cookies. Touching
// `cookies()` here would opt the entire storefront into dynamic rendering
// and disable `revalidate` on every page. Auth state is fetched client-side
// by SessionProvider via /api/me on hydration, so the static shell can be
// fully cached at the edge.
export default function StorefrontLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ThemeProvider>
      <SessionProvider initialUser={null}>
        <CartProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <WhatsAppFloat />
        </CartProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}
