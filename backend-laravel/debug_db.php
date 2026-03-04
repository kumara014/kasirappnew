<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

echo "Columns in users table:\n";
print_r(Schema::getColumnListing('users'));

echo "\nFirst user data:\n";
$user = DB::table('users')->first();
print_r($user);
