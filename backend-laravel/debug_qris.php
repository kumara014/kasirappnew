<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;

$user = User::first();
if ($user) {
    echo "USER ID: " . $user->id_user . "\n";
    echo "QRIS_IMAGE: '" . $user->qris_image . "'\n";
    echo "BANK_INFO: " . json_encode($user->bank_info) . "\n";
} else {
    echo "NO USER FOUND\n";
}
