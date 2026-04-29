import type { Metadata } from "next";
import LegalPage from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Kebijakan Privasi",
  description:
    "Bagaimana Juragan Grosir mengumpulkan, menggunakan, dan melindungi informasi pribadi Anda.",
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Kebijakan Privasi"
      description="Kami menghormati privasi Anda dan berkomitmen melindungi informasi pribadi yang Anda bagikan kepada kami."
      breadcrumbLabel="Kebijakan Privasi"
      sections={[
        {
          heading: "1. Informasi yang kami kumpulkan",
          body: [
            "Saat Anda memesan atau membuat akun, kami mengumpulkan informasi seperti nama, nomor telepon, email, dan alamat pengiriman.",
            "Kami juga mengumpulkan informasi teknis seperti alamat IP, jenis perangkat, dan perilaku penjelajahan untuk analitik dan pencegahan penipuan.",
          ],
        },
        {
          heading: "2. Bagaimana kami menggunakan informasi Anda",
          body: [
            "Informasi Anda digunakan untuk memproses pesanan, menghitung ongkos kirim, memproses pembayaran, mengirim pembaruan pesanan, serta meningkatkan produk dan layanan kami.",
            "Kami tidak pernah menjual informasi pribadi Anda kepada pihak ketiga. Data hanya kami bagikan ke penyedia layanan (pembayaran, pengiriman, analitik) sebatas yang diperlukan untuk operasional bisnis.",
          ],
        },
        {
          heading: "3. Komunikasi pemasaran",
          body: [
            "Kami dapat mengirim email dan pesan WhatsApp pemasaran tentang koleksi baru, promo, dan informasi reseller. Anda dapat berhenti berlangganan kapan saja melalui tautan unsubscribe atau menghubungi tim dukungan.",
          ],
        },
        {
          heading: "4. Cookie & pelacakan",
          body: [
            "Kami menggunakan cookie dan pixel (Google Analytics, Meta Pixel, TikTok Pixel) untuk memahami cara pelanggan menggunakan situs serta mengukur efektivitas iklan.",
          ],
        },
        {
          heading: "5. Hak Anda",
          body: [
            "Anda dapat meminta akses, pembaruan, atau penghapusan informasi pribadi Anda kapan saja dengan menghubungi kami di support@juragangrosir.id.",
          ],
        },
      ]}
    />
  );
}
