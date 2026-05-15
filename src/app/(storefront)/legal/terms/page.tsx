import type { Metadata } from "next";
import LegalPage from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Syarat & Ketentuan",
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Syarat & Ketentuan"
      description="Syarat dan ketentuan yang mengatur penggunaan situs dan layanan Juragan Grosir."
      breadcrumbLabel="Syarat & Ketentuan"
      sections={[
        {
          heading: "1. Penerimaan ketentuan",
          body: [
            "Dengan mengakses atau menggunakan situs Juragan Grosir, Anda setuju untuk terikat pada Syarat & Ketentuan ini. Jika tidak setuju, mohon tidak menggunakan situs ini.",
          ],
        },
        {
          heading: "2. Pendaftaran akun",
          body: [
            "Anda bertanggung jawab menjaga kerahasiaan kredensial akun Anda. Kami berhak menangguhkan akun yang melanggar ketentuan ini atau melakukan aktivitas penipuan.",
          ],
        },
        {
          heading: "3. Harga & pesanan",
          body: [
            "Harga retail berlaku secara default. Harga grosir bertingkat berlaku otomatis saat jumlah minimum tercapai. Harga reseller hanya untuk akun reseller yang sudah disetujui.",
            "Total pesanan dihitung ulang di sisi server sebelum pembayaran dibuat. Kami berhak membatalkan pesanan dengan kesalahan harga sebelum konfirmasi pembayaran.",
          ],
        },
        {
          heading: "4. Hak kekayaan intelektual",
          body: [
            "Seluruh konten di situs ini — termasuk fotografi produk, ilustrasi, dan aset merek — adalah milik Juragan Grosir atau pemberi lisensinya.",
          ],
        },
        {
          heading: "5. Batasan tanggung jawab",
          body: [
            "Juragan Grosir tidak bertanggung jawab atas kerugian tidak langsung, insidental, atau konsekuensial yang timbul dari penggunaan produk atau layanan kami.",
          ],
        },
      ]}
    />
  );
}
