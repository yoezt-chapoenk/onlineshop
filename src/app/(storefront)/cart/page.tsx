import { redirect } from "next/navigation";

export default function CartPage() {
  // Keranjang utama kini menggunakan CartDrawer yang dapat diakses di seluruh halaman.
  // Jika user tanpa sengaja mengakses URL /cart, arahkan kembali ke toko.
  redirect("/shop");
}
