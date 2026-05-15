/**
 * Bahasa Indonesia copy used across the storefront. Centralized here
 * so the entire site has a single source of truth and a future English
 * locale can be added by mirroring this file.
 */
export const t = {
  // Brand / general
  brand: "Juragan Grosir",
  tagline: "Kacamata Premium dan Grosir",

  // Header
  nav: {
    shop: "Belanja",
    collections: "Koleksi",
    wholesale: "Grosir",
    about: "Tentang Kami",
    contact: "Kontak",
    cart: "Keranjang",
    account: "Akun",
    login: "Masuk",
    register: "Daftar",
    logout: "Keluar",
    becomeReseller: "Jadi Reseller",
  },

  // Footer
  footer: {
    quickLinks: "Tautan Cepat",
    customerService: "Layanan Pelanggan",
    contactUs: "Hubungi Kami",
    legal: "Legal",
    privacy: "Kebijakan Privasi",
    terms: "Syarat & Ketentuan",
    shipping: "Pengiriman",
    returns: "Pengembalian",
    about: "Tentang Kami",
    rights: "Seluruh hak dilindungi.",
  },

  // Buttons / common
  common: {
    addToCart: "Tambah ke Keranjang",
    buyNow: "Beli Sekarang",
    continueShopping: "Lanjut Belanja",
    checkout: "Checkout",
    proceedToCheckout: "Lanjut ke Checkout",
    save: "Simpan",
    cancel: "Batal",
    edit: "Ubah",
    delete: "Hapus",
    submit: "Kirim",
    loading: "Memuat…",
    search: "Cari",
    filter: "Filter",
    showMore: "Tampilkan lebih banyak",
    showLess: "Tampilkan lebih sedikit",
    yes: "Ya",
    no: "Tidak",
    back: "Kembali",
    next: "Berikutnya",
    previous: "Sebelumnya",
    apply: "Terapkan",
    clear: "Hapus",
    clearAll: "Hapus semua",
    quantity: "Jumlah",
    total: "Total",
    subtotal: "Subtotal",
    shipping: "Pengiriman",
    free: "Gratis",
    sale: "DISKON",
    new: "BARU",
    soldOut: "Habis",
    inStock: "Tersedia",
  },

  // Pricing
  pricing: {
    retailPrice: "Harga retail",
    wholesalePrice: "Harga grosir",
    resellerPrice: "Harga reseller",
    promotionalPrice: "Harga promo",
    pricePerUnit: "Harga per pcs",
    minOrder: "Minimum order",
    pcs: "pcs",
  },

  // Auth
  auth: {
    loginTitle: "Masuk ke Akun",
    loginSubtitle: "Masuk untuk melihat pesanan dan harga reseller Anda.",
    registerTitle: "Daftar Akun Baru",
    registerSubtitle: "Buat akun untuk mulai belanja dan melacak pesanan.",
    forgotPasswordTitle: "Lupa Password",
    forgotPasswordSubtitle:
      "Masukkan email Anda dan kami akan kirim tautan untuk reset password.",
    email: "Alamat email",
    password: "Password",
    confirmPassword: "Konfirmasi password",
    fullName: "Nama lengkap",
    phone: "Nomor HP / WhatsApp",
    rememberMe: "Ingat saya",
    forgotPassword: "Lupa password?",
    resetPassword: "Reset password",
    sendResetLink: "Kirim tautan reset",
    loginCta: "Masuk",
    registerCta: "Daftar",
    haveAccount: "Sudah punya akun?",
    noAccount: "Belum punya akun?",
    loginHere: "Masuk di sini",
    registerHere: "Daftar di sini",
    confirmEmailNote:
      "Kami sudah mengirim email konfirmasi. Klik tautan di email untuk mengaktifkan akun Anda.",
    invalidCredentials: "Email atau password salah.",
    weakPassword: "Password minimal 8 karakter.",
    passwordsDontMatch: "Konfirmasi password tidak cocok.",
    accountCreated: "Akun berhasil dibuat. Silakan cek email Anda.",
    resetEmailSent: "Tautan reset password sudah dikirim ke email Anda.",
    loggedOut: "Anda sudah keluar.",
  },

  // Account dashboard
  account: {
    overview: "Beranda Akun",
    welcome: (name: string) => `Selamat datang, ${name}`,
    profile: "Profil",
    orders: "Pesanan Saya",
    addresses: "Alamat",
    becomeReseller: "Jadi Reseller",
    role: "Peran",
    resellerStatus: "Status Reseller",
    customer: "Pelanggan",
    reseller: "Reseller",
    wholesale: "Grosir",
    admin: "Admin",
    statusNone: "Belum mendaftar",
    statusPending: "Menunggu persetujuan",
    statusApproved: "Disetujui",
    statusRejected: "Ditolak",
    noOrdersYet: "Belum ada pesanan.",
    startShopping: "Mulai belanja",
    orderNumber: "Nomor pesanan",
    orderDate: "Tanggal pesan",
    orderStatus: "Status",
    orderTotal: "Total",
    viewOrder: "Lihat detail",
    repeatOrder: "Beli lagi",
    repeatOrderAdded: "Item dari pesanan ini sudah ditambahkan ke keranjang.",
    trackingNumber: "Nomor resi",
    courier: "Kurir",
    paymentStatus: "Status pembayaran",
    fulfillmentStatus: "Status pengiriman",
    saveProfile: "Simpan profil",
    profileSaved: "Profil berhasil disimpan.",
    submitResellerApplication: "Ajukan jadi reseller",
    resellerExplain:
      "Resellers mendapatkan harga khusus untuk setiap pembelian. Lengkapi aplikasi di bawah ini, dan tim kami akan meninjau dalam 1–2 hari kerja.",
    pendingResellerNote:
      "Aplikasi reseller Anda sedang ditinjau. Anda akan menerima email setelah disetujui.",
    approvedResellerNote:
      "Akun reseller Anda sudah aktif. Harga reseller berlaku otomatis di setiap pembelian.",
    rejectedResellerNote:
      "Aplikasi reseller Anda tidak disetujui. Hubungi tim kami untuk informasi lebih lanjut.",
  },

  // Order statuses
  orderStatus: {
    pending: "Menunggu",
    paid: "Dibayar",
    processing: "Diproses",
    packed: "Dikemas",
    shipped: "Dikirim",
    delivered: "Diterima",
    cancelled: "Dibatalkan",
    refunded: "Dikembalikan",
  },

  // Forms / validation
  validation: {
    required: "Wajib diisi",
    invalidEmail: "Format email tidak valid",
    invalidPhone: "Nomor HP tidak valid",
    minLength: (n: number) => `Minimal ${n} karakter`,
    maxLength: (n: number) => `Maksimal ${n} karakter`,
  },
};

export type Messages = typeof t;
