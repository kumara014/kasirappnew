<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
include_once 'config.php';

echo "<h2>🔧 Diagnostik Database & File</h2>";

// 1. Check Database Connection
try {
    $conn->query("SELECT 1");
    echo "<p style='color:green'>[✓] Koneksi Database OK</p>";
} catch (Exception $e) {
    echo "<p style='color:red'>[X] Koneksi Database Gagal: " . $e->getMessage() . "</p>";
    exit;
}

// 2. Check Table and Columns
try {
    $res = $conn->query("DESCRIBE products");
    $columns = $res->fetchAll(PDO::FETCH_COLUMN);
    echo "<p><b>Kolom di tabel 'products':</b> " . implode(", ", $columns) . "</p>";

    if (in_array('stock', $columns)) {
        echo "<p style='color:green'>[✓] Kolom 'stock' ditemukan.</p>";
    } else {
        echo "<p style='color:red'>[X] Kolom 'stock' TIDAK ADA! Silahkan jalankan fix_laragon.php</p>";
    }
} catch (Exception $e) {
    echo "<p style='color:red'>[X] Gagal membaca tabel products: " . $e->getMessage() . "</p>";
}

// 3. Check if this is the correct file (Symbolic Link test)
echo "<p><b>Path file ini:</b> " . __FILE__ . "</p>";
if (strpos(__FILE__, 'antigravity') !== false) {
    echo "<p style='color:green'>[✓] Symbolic Link AKTIF! Laragon membaca file dari folder project.</p>";
} else {
    echo "<p style='color:orange'>[!] Symbolic Link TIDAK AKTIF. Laragon membaca file dari folder www manual.</p>";
}

echo "<hr><p><a href='fix_laragon.php'>Klik di sini untuk menjalankan Perbaikan Database (Fix Laragon)</a></p>";
?>