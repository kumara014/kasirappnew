<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$request = Illuminate\Http\Request::create('/api/transaksi?month=2026-02', 'GET');
$kernel->handle($request);
// Get query output
$res = \App\Models\Transaksi::latest()->take(5)->get(['id_transaksi', 'tanggal_transaksi']);
echo json_encode($res->toArray());
