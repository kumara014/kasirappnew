<?php
include_once 'config.php';

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->ids) && is_array($data->ids)) {
    // Create placeholders for prepared statement based on array length
    $ids = $data->ids;
    $placeholders = implode(',', array_fill(0, count($ids), '?'));

    $query = "DELETE FROM products WHERE id IN ($placeholders)";
    $stmt = $conn->prepare($query);

    if ($stmt->execute($ids)) {
        echo json_encode(array("message" => "Products deleted."));
    } else {
        echo json_encode(array("message" => "Unable to delete products."));
    }
} else {
    echo json_encode(array("message" => "No IDs provided."));
}
?>