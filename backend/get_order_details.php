<?php
include_once 'config.php';

$id_param = isset($_GET['id']) ? $_GET['id'] : '';
$clean_id = str_replace('#', '', $id_param);
$order_id = intval($clean_id);

if ($order_id > 0) {
    // 1. Get transaction info
    $queryOrder = "SELECT * FROM orders WHERE id = :id";
    $stmtOrder = $conn->prepare($queryOrder);
    $stmtOrder->bindParam(':id', $order_id);
    $stmtOrder->execute();
    $order = $stmtOrder->fetch(PDO::FETCH_ASSOC);

    // 2. Get items
    $queryItems = "SELECT * FROM order_items WHERE order_id = :order_id";
    $stmtItems = $conn->prepare($queryItems);
    $stmtItems->bindParam(':order_id', $order_id);
    $stmtItems->execute();
    $items = $stmtItems->fetchAll(PDO::FETCH_ASSOC);

    if ($order) {
        $response = array(
            'id' => '#' . str_pad($order['id'], 6, '0', STR_PAD_LEFT),
            'date' => $order['created_at'],
            'total' => $order['total'],
            'payment_method' => $order['payment_method'],
            'items' => $items
        );
        echo json_encode($response);
    } else {
        echo json_encode(array("message" => "Order not found."));
    }
} else {
    echo json_encode(array("message" => "Invalid ID."));
}
?>