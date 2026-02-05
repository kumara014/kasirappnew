<?php
include_once 'config.php';

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->id)) {
    try {
        $query = "UPDATE products SET name = :name, price = :price, category = :category, stock = :stock WHERE id = :id";
        $stmt = $conn->prepare($query);

        $name = htmlspecialchars(strip_tags($data->name));
        $price = htmlspecialchars(strip_tags($data->price));
        $category = htmlspecialchars(strip_tags($data->category));
        $stock = isset($data->stock) ? (int) $data->stock : 0;
        $id = htmlspecialchars(strip_tags($data->id));

        $stmt->bindParam(":name", $name);
        $stmt->bindParam(":price", $price);
        $stmt->bindParam(":category", $category);
        $stmt->bindParam(":stock", $stock);
        $stmt->bindParam(":id", $id);

        if ($stmt->execute()) {
            echo json_encode(array("status" => "success", "message" => "Product updated."));
        } else {
            echo json_encode(array("status" => "error", "message" => "Unable to update product."));
        }
    } catch (PDOException $e) {
        echo json_encode(array("status" => "error", "message" => "Database error: " . $e->getMessage()));
    }
} else {
    echo json_encode(array("status" => "error", "message" => "Missing ID."));
}
?>