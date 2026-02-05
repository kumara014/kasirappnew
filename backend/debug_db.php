<?php
include_once 'config.php';
$orders = $conn->query("SELECT * FROM orders")->fetchAll(PDO::FETCH_ASSOC);
$items = $conn->query("SELECT * FROM order_items")->fetchAll(PDO::FETCH_ASSOC);
$products = $conn->query("SELECT * FROM products")->fetchAll(PDO::FETCH_ASSOC);
echo json_encode(["orders" => $orders, "items" => $items, "products" => $products, "currdate" => $conn->query("SELECT CURDATE()")->fetchColumn()]);
?>