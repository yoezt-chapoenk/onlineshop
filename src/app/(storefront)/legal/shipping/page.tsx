import type { Metadata } from "next";
import LegalPage from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Kebijakan Pengiriman",
};

export default function ShippingPolicyPage() {
  return (
    <LegalPage
      title="Kebijakan Pengiriman"
      description="Cara kami mengirim pesanan Juragan Grosir ke seluruh Indonesia, termasuk waktu pemrosesan dan pilihan kurir."
      breadcrumbLabel="Kebijakan Pengiriman"
      sections={[
        {
          heading: "Waktu pemrosesan",
          body: [
            "Pesanan yang masuk sebelum pukul 14.00 WIB pada hari kerja akan diproses dan dikirim pada hari yang sama. Pesanan setelah pukul 14.00 WIB akan dikirim pada hari kerja berikutnya.",
          ],
        },
        {
          heading: "Kurir & tarif",
          body: [
            "Tarif pengiriman dihitung secara realtime saat checkout via Biteship, berdasarkan tujuan dan total berat pesanan. Kurir yang tersedia: JNE, J&T, dan Central Cargo.",
            "Pelanggan dapat memilih kurir dan layanan favorit pada saat checkout.",
          ],
        },
        {
          heading: "Pelacakan",
          body: [
            "Nomor resi otomatis dikirim ke email dan WhatsApp Anda saat pesanan dikirim. Anda juga bisa melacak pesanan dari halaman akun Anda.",
          ],
        },
        {
          heading: "Pengiriman hilang atau rusak",
          body: [
            "Jika paket hilang dalam perjalanan atau tiba dalam keadaan rusak, mohon hubungi kami dalam 7 hari sejak perkiraan tanggal pengiriman. Kami akan berkoordinasi dengan kurir untuk menyelesaikan masalah dan mengirim pengganti jika diperlukan.",
          ],
        },
      ]}
    />
  );
}
