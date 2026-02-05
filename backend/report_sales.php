<?php
include_once 'config.php';

// Get Total Revenue
$queryRev = "SELECT SUM(total) as revenue FROM orders";
$stmtRev = $conn->prepare($queryRev);
$stmtRev->execute();
$rowRev = $stmtRev->fetch(PDO::FETCH_ASSOC);
$revenue = $rowRev['revenue'] ?? 0;

// Get Total Orders
$queryOrd = "SELECT COUNT(*) as total_orders FROM orders";
$stmtOrd = $conn->prepare($queryOrd);
$stmtOrd->execute();
$rowOrd = $stmtOrd->fetch(PDO::FETCH_ASSOC);
$total_orders = $rowOrd['total_orders'] ?? 0;

echo json_encode(array(
    "revenue" => $revenue,
    "orders" => $total_orders
));
?>