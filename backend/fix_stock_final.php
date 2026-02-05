<?php
include_once 'config.php';

try {
    // 1. Add stock column if missing
    try {
        $conn->exec("ALTER TABLE products ADD COLUMN stock INT DEFAULT 0");
        echo "<div style='color:green'>[✓] Kolom 'stock' berhasil ditambahkan.</div><br>";
    } catch (Exception $e) {
        echo "<div style='color:blue'>[!] Kolom 'stock' sudah ada.</div><br>";
    }

    // 2. Initialize stock to 999 for all products so it's ready to sell
    $conn->exec("UPDATE products SET stock = 999 WHERE stock = 0 OR stock IS NULL");
    echo "<div style='color:green'>[✓] Stok semua produk berhasil di-reset ke 999.</div><br>";

    echo "<h2>Perbaikan Database Selesai!</h2>";
    echo "<p>Silakan kembali ke aplikasi dan coba transaksi lagi. Stok sekarang pasti berkurang!</p>";

} catch (PDOException $e) {
    echo "<div style='color:red'>Gagal: " . $e->getMessage() . "</div>";
}
?>