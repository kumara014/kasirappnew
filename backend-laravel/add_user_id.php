<?php
// Bootstrap Laravel
define('LARAVEL_START', microtime(true));
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

$pdo = DB::getPdo();

$tables = [
    'kategoris' => 'id_kategori',
    'transaksi' => 'id_transaksi',
    'stok_mutasi' => 'id_mutasi',
];

foreach ($tables as $table => $afterCol) {
    $check = $pdo->query("SHOW COLUMNS FROM `$table` LIKE 'user_id'")->fetchAll();
    if (empty($check)) {
        echo "Adding user_id to $table...\n";
        $pdo->exec("ALTER TABLE `$table` ADD COLUMN `user_id` BIGINT UNSIGNED NULL AFTER `$afterCol`");
        try {
            $pdo->exec("ALTER TABLE `$table` ADD CONSTRAINT `fk_{$table}_user_id` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE");
        } catch (Exception $e) {
            echo "  FK warning (may already exist): " . $e->getMessage() . "\n";
        }
        echo "  Done.\n";
    } else {
        echo "user_id already exists on $table, skipping schema.\n";
    }
}

// Backfill: assign all null user_ids to first user
$firstUser = $pdo->query("SELECT id FROM users ORDER BY id ASC LIMIT 1")->fetch(PDO::FETCH_ASSOC);
if ($firstUser) {
    $uid = (int) $firstUser['id'];
    echo "\nBackfilling all NULL user_ids => user_id=$uid...\n";
    foreach (array_keys($tables) as $table) {
        $count = $pdo->exec("UPDATE `$table` SET user_id=$uid WHERE user_id IS NULL");
        echo "  $table: $count rows updated\n";
    }
    $count = $pdo->exec("UPDATE barang SET user_id=$uid WHERE user_id IS NULL");
    echo "  barang: $count rows updated\n";
} else {
    echo "No users found — skipping backfill.\n";
}

echo "\nAll done!\n";
