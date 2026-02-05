<?php
include_once 'config.php';

try {
    // Add stock column to products table if it doesn't exist
    $conn->exec("ALTER TABLE products ADD COLUMN stock INT DEFAULT 0");
    echo "Stack column added successfully";
} catch (PDOException $e) {
    if (strpos($e->getMessage(), "Duplicate column name") !== false) {
        echo "Stock column already exists.";
    } else {
        echo "Error: " . $e->getMessage();
    }
}
?>