<?php
include_once 'config.php';

// Group by Product Name (simple version)
$query = "SELECT product_name, SUM(quantity) as total_qty, SUM(subtotal) as total_sales 
          FROM order_items 
          GROUP BY product_name 
          ORDER BY total_sales DESC";

$stmt = $conn->prepare($query);
$stmt->execute();
$items = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($items);
?>