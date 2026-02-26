# Arus Kerja Aplikasi (Flowchart)

Berikut adalah diagram alir (*flowchart*) yang menjelaskan logika utama dan navigasi dalam aplikasi Pointly POS ini.

```mermaid
flowchart TD
    %% Start
    Start([Buka Aplikasi]) --> IsLoggedIn{Sudah Login?}

    %% Auth Flow
    IsLoggedIn -- Tidak --> LoginScreen[Halaman Login]
    LoginScreen --> Register{Belum punya akun?}
    Register -- Ya --> RegScreen[Halaman Registrasi]
    RegScreen -- Sukses --> LoginScreen
    LoginScreen -- Input Valid --> Dashboard

    %% Main Dashboard
    IsLoggedIn -- Ya --> Dashboard[Dashboard Overview]
    
    %% Main Navigation Nodes
    Dashboard --> Nav{Navigasi Sidebar}

    %% POS / Kasir Flow
    Nav --> POS[Menu Utama / POS]
    POS --> SelectItem[Pilih Produk / Scan]
    SelectItem --> Cart[Keranjang Belanja]
    Cart --> Checkout[Proses Pembayaran]
    Checkout --> PrintReceipt[Cetak Struk & Update Stok]
    PrintReceipt --> POS

    %% Management Flow (Produk & Kategori)
    Nav --> ManageStore[Kelola Toko]
    ManageStore --> KelolaProduk[Kelola Produk / Kategori]
    KelolaProduk --> CRUD_Produk[Tambah/Edit/Hapus Data]
    CRUD_Produk --> UpdateDB[(Database)]

    %% Stock Flow
    Nav --> StockFlow[Mutasi Stok]
    Dashboard -- Notifikasi Stok Rendah --> StockFlow
    StockFlow --> InputMutasi[Input Stok Masuk/Keluar]
    InputMutasi --> UpdateStok[Update Jumlah Stok]
    UpdateStok --> UpdateDB

    %% Human Resources
    Nav --> Karyawan[Manajemen Karyawan]
    Karyawan --> CRUD_Karyawan[Atur Akun & Hak Akses]
    CRUD_Karyawan --> UpdateDB

    %% Reports & History
    Nav --> History[Riwayat Transaksi]
    Nav --> Reports[Laporan Penjualan]
    Reports --> FilterDate[Filter Periode]
    FilterDate --> ViewChart[Lihat Tren & Grafik]

    %% Settings
    Nav --> Settings[Pengaturan]
    Settings --> Profile[Profil Usaha]
    Settings --> Security[Ubah Password]
    Settings --> Logout([Logout])
    Logout --> LoginScreen

    %% Stylings
    classDef primary fill:#4A9BAD,stroke:#333,stroke-width:2px,color:#fff
    classDef secondary fill:#EAF5F7,stroke:#4A9BAD,stroke-width:1px,color:#333
    classDef danger fill:#FF4757,stroke:#333,stroke-width:1px,color:#fff

    class Start,Dashboard,POS,ManageStore,StockFlow,Karyawan,History,Reports,Settings primary
    class LoginScreen,RegScreen,SelectItem,Cart,Checkout,FilterDate secondary
    class Logout danger
```

### Penjelasan Singkat:

1.  **Halaman Utama (Dashboard)**: Memberikan ringkasan penjualan dan notifikasi stok yang menipis.
2.  **Transaksi (POS)**: Alur kasir di mana produk dipilih, dimasukkan ke keranjang, dan diselesaikan melalui pembayaran yang otomatis memotong stok.
3.  **Manajemen Data**: Tempat Owner mengatur katalog produk, kategori, dan mendaftarkan karyawan (Kasir/Admin) beserta hak aksesnya.
4.  **Logika Stok**: Setiap barang masuk atau keluar dicatat di Mutasi Stok untuk transparansi data.
5.  **Laporan**: Data transaksi diolah menjadi grafik tren penjualan untuk membantu pengambilan keputusan bisnis.
6.  **Keamanan**: Menggunakan sistem *multi-tenancy*, memastikan data antar toko tidak saling bercampur.
