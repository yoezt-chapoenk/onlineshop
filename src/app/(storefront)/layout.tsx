import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhatsAppFloat from "@/components/layout/WhatsAppFloat";
import { CartProvider } from "@/components/cart/CartProvider";

// Storefront-only chrome: the public Header, Footer, and floating
// WhatsApp button, plus the cart context provider used by all
// shopper-facing pages. Because this layout lives in a route group
// and not at the app root, /admin routes do not inherit it.
export default function StorefrontLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <CartProvider>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsAppFloat />
    </CartProvider>
  );
}
