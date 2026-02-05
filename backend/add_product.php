<?php
include_once 'config.php';

$data = json_decode(file_get_contents("php://input"));

if (
    !empty($data->name) &&
    !empty($data->price) &&
    !empty($data->category)
) {
    try {
        $query = "INSERT INTO products (name, price, category, stock, color) VALUES (:name, :price, :category, :stock, :color)";
        $stmt = $conn->prepare($query);

        $name = htmlspecialchars(strip_tags($data->name));
        $price = htmlspecialchars(strip_tags($data->price));
        $category = htmlspecialchars(strip_tags($data->category));
        $stock = isset($data->stock) ? (int) $data->stock : 0;
        $color = !empty($data->color) ? htmlspecialchars(strip_tags($data->color)) : '#f5f5f5';

        $stmt->bindParam(":name", $name);
        $stmt->bindParam(":price", $price);
        $stmt->bindParam(":category", $category);
        $stmt->bindParam(":stock", $stock);
        $stmt->bindParam(":color", $color);

        if ($stmt->execute()) {
            echo json_encode(array("status" => "success", "message" => "Product created."));
        } else {
            echo json_encode(array("status" => "error", "message" => "Unable to create product."));
        }
    } catch (PDOException $e) {
        echo json_encode(array("status" => "error", "message" => "Database error: " . $e->getMessage()));
    }
} else {
    echo json_encode(array("status" => "error", "message" => "Incomplete data."));
}
?>