<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

$tables = ['users', 'barang', 'transaksi'];

foreach ($tables as $table) {
    if (Schema::hasTable($table)) {
        echo "Table: $table\n";
        $columns = Schema::getColumnListing($table);
        print_r($columns);
    } else {
        echo "Table: $table does not exist.\n";
    }
}
