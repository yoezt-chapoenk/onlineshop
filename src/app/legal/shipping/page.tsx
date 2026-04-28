import type { Metadata } from "next";
import LegalPage from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Shipping Policy",
};

export default function ShippingPolicyPage() {
  return (
    <LegalPage
      title="Shipping Policy"
      description="How we ship Juragan Grosir orders across Indonesia, including processing times and courier options."
      breadcrumbLabel="Shipping Policy"
      sections={[
        {
          heading: "Processing time",
          body: [
            "Orders placed before 2pm WIB on business days are processed and dispatched the same day. Orders placed after 2pm WIB ship the next business day.",
          ],
        },
        {
          heading: "Couriers & rates",
          body: [
            "Live shipping rates are calculated at checkout via RajaOngkir / Komerce, based on your destination and the total order weight. Available couriers include JNE, J&T, SiCepat, and Anteraja.",
            "Customers may select their preferred courier and service tier at checkout.",
          ],
        },
        {
          heading: "Tracking",
          body: [
            "Tracking numbers are sent automatically to your email and WhatsApp once your order is dispatched. You can also track your order from your account page.",
          ],
        },
        {
          heading: "Lost or damaged shipments",
          body: [
            "If your shipment is lost in transit or arrives damaged, please contact us within 7 days of the expected delivery date. We will work with the courier to resolve the issue and ship a replacement when applicable.",
          ],
        },
      ]}
    />
  );
}
