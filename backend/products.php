<?php
include_once 'config.php';

$query = "SELECT * FROM products ORDER BY category";
$stmt = $conn->prepare($query);
$stmt->execute();

$num = $stmt->rowCount();

if ($num > 0) {
    $products_arr = array();

    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        extract($row);
        $product_item = array(
            "id" => $id,
            "name" => $name,
            "category" => $category,
            "price" => $price,
            "stock" => isset($stock) ? $stock : 0,
            "color" => $color
        );
        array_push($products_arr, $product_item);
    }
    echo json_encode($products_arr);
} else {
    echo json_encode(array());
}
?>