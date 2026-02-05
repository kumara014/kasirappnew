<?php
error_reporting(0);
include_once 'config.php';

// Get Total Omzet Today
$query_omzet = "SELECT SUM(total) as omzet FROM orders WHERE DATE(created_at) = CURDATE()";
$stmt_omzet = $conn->prepare($query_omzet);
$stmt_omzet->execute();
$omzet_today = $stmt_omzet->fetch(PDO::FETCH_ASSOC)['omzet'] ?? 0;

// Get Total Sell (Transactions) Today
$query_sell = "SELECT COUNT(*) as sell FROM orders WHERE DATE(created_at) = CURDATE()";
$stmt_sell = $conn->prepare($query_sell);
$stmt_sell->execute();
$sell_today = $stmt_sell->fetch(PDO::FETCH_ASSOC)['sell'] ?? 0;

// Get Total Products Count
$query_total_prod = "SELECT COUNT(*) as total FROM products";
$stmt_total_prod = $conn->prepare($query_total_prod);
$stmt_total_prod->execute();
$total_products = $stmt_total_prod->fetch(PDO::FETCH_ASSOC)['total'] ?? 0;

// Get Trending Dishes (Top 5 based on order_items)
$query_trending = "SELECT product_name as name, SUM(quantity) as total_sold FROM order_items GROUP BY product_name ORDER BY total_sold DESC LIMIT 5";
$stmt_trending = $conn->prepare($query_trending);
$stmt_trending->execute();
$trending_dishes = $stmt_trending->fetchAll(PDO::FETCH_ASSOC);

// Get Out of Stock Items
$query_stock = "SELECT name, stock FROM products WHERE stock <= 0 LIMIT 5";
$stmt_stock = $conn->prepare($query_stock);
$stmt_stock->execute();
$out_of_stock = $stmt_stock->fetchAll(PDO::FETCH_ASSOC);

// Get Weekly Sales for Chart
$query_chart = "SELECT DATE(created_at) as date, SUM(total) as total FROM orders WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) GROUP BY DATE(created_at) ORDER BY date ASC";
$stmt_chart = $conn->prepare($query_chart);
$stmt_chart->execute();
$chart_data = $stmt_chart->fetchAll(PDO::FETCH_ASSOC);

$response = [
    "omzet_today" => (float) $omzet_today,
    "sell_today" => (int) $sell_today,
    "total_products" => (int) $total_products,
    "trending" => $trending_dishes,
    "out_of_stock" => $out_of_stock,
    "chart_data" => $chart_data
];

echo json_encode($response);
?>