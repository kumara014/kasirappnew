<?php
include_once 'config.php';

try {
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // 1. Create Order Items Table (The missing piece)
    $sql = "CREATE TABLE IF NOT EXISTS order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        product_id INT NOT NULL,
        product_name VARCHAR(255) NOT NULL,
        quantity INT NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        subtotal DECIMAL(10, 2) NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    )";
    $conn->exec($sql);
    echo "<div style='color:green'>Success: table 'order_items' created/checked.</div><br>";

    // 2. Add 'status' column to orders if missing
    // Simple check by trying to select it, or just use Exception handling
    try {
        $conn->query("SELECT status FROM orders LIMIT 1");
    } catch (Exception $e) {
        $conn->exec("ALTER TABLE orders ADD COLUMN status VARCHAR(20) DEFAULT 'Completed'");
        echo "<div style='color:green'>Success: column 'status' added to 'orders'.</div><br>";
    }

    // 3. Add 'payment_method' column to orders if missing
    try {
        $conn->query("SELECT payment_method FROM orders LIMIT 1");
    } catch (Exception $e) {
        $conn->exec("ALTER TABLE orders ADD COLUMN payment_method VARCHAR(50) DEFAULT 'Cash'");
        echo "<div style='color:green'>Success: column 'payment_method' added to 'orders'.</div><br>";
    }

    echo "<h1>Database Updated Successfully!</h1>";
    echo "<p>You can now go back to the app and try paying again.</p>";

} catch (PDOException $e) {
    echo "<div style='color:red'>Error: " . $e->getMessage() . "</div>";
}
?>