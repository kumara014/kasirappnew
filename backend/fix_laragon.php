<?php
include_once 'config.php';

try {
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $conn->exec("SET NAMES 'utf8mb4'"); // Fix for emojis

    // 1. Create Users Table
    $sql_users = "CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(100) NOT NULL,
        role VARCHAR(20) DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";
    $conn->exec($sql_users);
    echo "<div style='color:green'>[✓] Tabel 'users' siap.</div><br>";

    // 1b. Create Orders Table
    $sql_orders = "CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        table_no VARCHAR(10) NOT NULL,
        total DECIMAL(10, 2) NOT NULL,
        payment_method VARCHAR(50) DEFAULT 'Cash',
        status VARCHAR(20) DEFAULT 'Completed',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";
    $conn->exec($sql_orders);
    echo "<div style='color:green'>[✓] Tabel 'orders' siap.</div><br>";

    // 1c. Create Order Items Table
    $sql_items = "CREATE TABLE IF NOT EXISTS order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        product_id INT NOT NULL,
        product_name VARCHAR(255) NOT NULL,
        quantity INT NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        subtotal DECIMAL(10, 2) NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    )";
    $conn->exec($sql_items);
    echo "<div style='color:green'>[✓] Tabel 'order_items' siap.</div><br>";

    // 2. Add Default Users if not exist
    // Admin
    $check_admin = $conn->query("SELECT id FROM users WHERE username = 'admin'")->fetch();
    if (!$check_admin) {
        $conn->exec("INSERT INTO users (username, password, name, role) VALUES ('admin', 'admin123', 'Administrator', 'admin')");
        echo "<div style='color:green'>[✓] User 'admin' siap (pass: admin123).</div><br>";
    }

    // Kasir
    $check_kasir = $conn->query("SELECT id FROM users WHERE username = 'kasir'")->fetch();
    if (!$check_kasir) {
        $conn->exec("INSERT INTO users (username, password, name, role) VALUES ('kasir', 'kasir123', 'Kasir Toko', 'kasir')");
        echo "<div style='color:green'>[✓] User 'kasir' siap (pass: kasir123).</div><br>";
    }

    // 3. Add stock column to products
    // 4. Add color column if missing
    try {
        $conn->exec("ALTER TABLE products ADD COLUMN color VARCHAR(20) DEFAULT '#f5f5f5'");
    } catch (Exception $e) {
    }

    // 4. Update products with some stock
    $conn->exec("UPDATE products SET stock = 99 WHERE stock = 0 OR stock IS NULL");
    echo "<div style='color:green'>[✓] Stok & Database berhasil diperbaiki (Tanpa Image).</div><br>";

    echo "<h1>Database Laragon Berhasil Diperbaiki!</h1>";
    echo "<p>Sekarang login dengan username: <b>admin</b> dan password: <b>admin123</b></p>";

} catch (PDOException $e) {
    echo "<div style='color:red'>Gagal: " . $e->getMessage() . "</div>";
}
?>