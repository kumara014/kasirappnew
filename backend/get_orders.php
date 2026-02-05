<?php
include_once 'config.php';

$query = "SELECT id, created_at as date, total, status FROM orders ORDER BY created_at DESC";
$stmt = $conn->prepare($query);
$stmt->execute();

$orders = array();
while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    $row['id'] = '#' . str_pad($row['id'], 6, '0', STR_PAD_LEFT);
    $orders[] = $row;
}

echo json_encode($orders);
?>