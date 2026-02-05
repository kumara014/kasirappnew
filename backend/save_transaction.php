<?php
include_once 'config.php';

$data = json_decode(file_get_contents("php://input"));

if (
    !empty($data->total) &&
    !empty($data->items) &&
    is_array($data->items)
) {
    try {
        $conn->beginTransaction();

        // 1. Insert Order
        $query = "INSERT INTO orders (table_no, total, payment_method, status) VALUES (:table_no, :total, :payment_method, 'Completed')";
        $stmt = $conn->prepare($query);

        $table_no = $data->table_no ?? 'T1';
        $total = $data->total;
        $payment_method = $data->payment_method ?? 'Cash';

        $stmt->bindParam(":table_no", $table_no);
        $stmt->bindParam(":total", $total);
        $stmt->bindParam(":payment_method", $payment_method);

        if (!$stmt->execute()) {
            throw new Exception("Failed to insert order");
        }

        $order_id = $conn->lastInsertId();

        // 2. Insert Order Items
        $queryItem = "INSERT INTO order_items (order_id, product_id, product_name, quantity, price, subtotal) VALUES (:order_id, :product_id, :product_name, :quantity, :price, :subtotal)";
        $stmtItem = $conn->prepare($queryItem);

        foreach ($data->items as $item) {
            $subtotal = $item->price * $item->qty;

            $stmtItem->bindParam(":order_id", $order_id);
            $stmtItem->bindParam(":product_id", $item->id);
            $stmtItem->bindParam(":product_name", $item->name);
            $stmtItem->bindParam(":quantity", $item->qty);
            $stmtItem->bindParam(":price", $item->price);
            $stmtItem->bindParam(":subtotal", $subtotal);

            if (!$stmtItem->execute()) {
                throw new Exception("Failed to insert order item: " . $item->name);
            }

            // 3. Subtract Stock (Inventory Automation)
            // We use a query that only updates if stock exists and is sufficient
            $queryStock = "UPDATE products SET stock = stock - :qty WHERE id = :pid AND stock >= :qty";
            $stmtStock = $conn->prepare($queryStock);

            $sold_qty = (int) $item->qty;
            $product_id = (int) $item->id;

            $stmtStock->bindParam(":qty", $sold_qty);
            $stmtStock->bindParam(":pid", $product_id);

            $stmtStock->execute();

            if ($stmtStock->rowCount() == 0) {
                // If 0 rows affected, check if it's because column doesn't exist or stock is low
                throw new Exception("Gagal potong stok untuk '{$item->name}'. Kemungkinan: Stok 0 / Habis, atau kolom 'stock' belum ada di database.");
            }
        }

        $conn->commit();
        echo json_encode(array("message" => "Transaction saved.", "order_id" => $order_id));

    } catch (Exception $e) {
        $conn->rollBack();
        echo json_encode(array("message" => "Transaction failed.", "error" => $e->getMessage()));
    }
} else {
    echo json_encode(array("message" => "Incomplete data."));
}
?>