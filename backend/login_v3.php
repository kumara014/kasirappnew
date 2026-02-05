<?php
include_once 'config.php';

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->username) && !empty($data->password)) {
    $username = $data->username;
    $password = $data->password;

    $query = "SELECT id, username, password, name, role FROM users WHERE username = :username LIMIT 0,1";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':username', $username);
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        // Simple comparison for now (user might not have hashed passwords yet)
        if ($password == $row['password'] || password_verify($password, $row['password'])) {
            echo json_encode([
                "status" => "success",
                "message" => "Login Berhasil",
                "user" => [
                    "id" => $row['id'],
                    "username" => $row['username'],
                    "name" => $row['name'],
                    "role" => $row['role']
                ]
            ]);
        } else {
            echo json_encode(["status" => "error", "message" => "Password salah"]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "Username tidak ditemukan"]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Data tidak lengkap"]);
}
?>