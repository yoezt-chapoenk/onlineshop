import type { Metadata } from "next";
import LegalPage from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Return Policy",
};

export default function ReturnsPage() {
  return (
    <LegalPage
      title="Return Policy"
      description="How to return or exchange a Juragan Grosir product if it doesn't meet your expectations."
      breadcrumbLabel="Return Policy"
      sections={[
        {
          heading: "Return window",
          body: [
            "We accept returns within 7 days of delivery for unused, unopened products in original packaging. For wholesale and reseller orders, please contact your account manager.",
          ],
        },
        {
          heading: "How to start a return",
          body: [
            "Contact us via WhatsApp or email with your order number and photos of the product. Our team will issue a return authorization within 1 business day.",
            "Customers are responsible for return shipping unless the product arrived damaged or incorrect.",
          ],
        },
        {
          heading: "Defective items",
          body: [
            "If your eyewear arrives with a manufacturing defect, we will cover return shipping and offer a free replacement. Please report defects within 7 days of delivery.",
          ],
        },
        {
          heading: "Refunds",
          body: [
            "Refunds are processed within 7–14 business days of receiving your returned item. Refunds are returned to the original payment method.",
          ],
        },
      ]}
    />
  );
}
