<?php

use Illuminate\Support\Facades\DB;

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    DB::statement("ALTER TABLE stok_mutasi MODIFY COLUMN jenis ENUM('masuk', 'keluar', 'rusak', 'koreksi', 'penjualan') NOT NULL");
    echo "Success!";
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage();
}
