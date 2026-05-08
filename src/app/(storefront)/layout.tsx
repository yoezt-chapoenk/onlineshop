import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhatsAppFloat from "@/components/layout/WhatsAppFloat";
import { CartProvider } from "@/components/cart/CartProvider";
import { SessionProvider, type SessionUser } from "@/components/auth/SessionProvider";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { getCurrentUser } from "@/lib/supabase/server";

// Storefront-only chrome: the public Header, Footer, and floating
// WhatsApp button, plus the cart context provider used by all
// shopper-facing pages. Because this layout lives in a route group
// and not at the app root, /admin routes do not inherit it.
export default async function StorefrontLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { authUser, profile } = await getCurrentUser();

  const initialUser: SessionUser | null = authUser
    ? {
        id: authUser.id,
        email: authUser.email,
        fullName: profile?.full_name ?? null,
        phone: profile?.phone ?? null,
        role: profile?.role ?? "customer",
        resellerStatus: profile?.reseller_status ?? "none",
      }
    : null;

  const auth = {
    isAuthenticated: Boolean(authUser),
    displayName: profile?.full_name ?? authUser?.email ?? null,
  };

  return (
    <ThemeProvider>
      <SessionProvider initialUser={initialUser}>
        <CartProvider>
          <Header auth={auth} />
          <main className="flex-1">{children}</main>
          <Footer />
          <WhatsAppFloat />
        </CartProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}
