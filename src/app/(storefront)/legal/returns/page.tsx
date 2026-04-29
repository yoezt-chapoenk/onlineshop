import type { Metadata } from "next";
import LegalPage from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Kebijakan Pengembalian",
};

export default function ReturnsPage() {
  return (
    <LegalPage
      title="Kebijakan Pengembalian"
      description="Cara mengembalikan atau menukar produk Juragan Grosir jika tidak sesuai harapan Anda."
      breadcrumbLabel="Kebijakan Pengembalian"
      sections={[
        {
          heading: "Periode pengembalian",
          body: [
            "Kami menerima pengembalian dalam 7 hari setelah barang diterima untuk produk yang belum digunakan dan masih dalam kemasan asli. Untuk pesanan grosir dan reseller, silakan hubungi account manager Anda.",
          ],
        },
        {
          heading: "Cara memulai pengembalian",
          body: [
            "Hubungi kami via WhatsApp atau email dengan menyertakan nomor pesanan dan foto produk. Tim kami akan menerbitkan otorisasi pengembalian dalam 1 hari kerja.",
            "Pelanggan menanggung ongkos kirim pengembalian, kecuali produk tiba dalam kondisi rusak atau salah kirim.",
          ],
        },
        {
          heading: "Produk cacat",
          body: [
            "Jika kacamata Anda tiba dengan cacat produksi, kami akan menanggung ongkos kirim pengembalian dan memberikan penggantian gratis. Mohon laporkan cacat dalam 7 hari setelah diterima.",
          ],
        },
        {
          heading: "Pengembalian dana",
          body: [
            "Pengembalian dana diproses dalam 7–14 hari kerja setelah barang retur kami terima. Dana dikembalikan ke metode pembayaran semula.",
          ],
        },
      ]}
    />
  );
}
