<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BarangController;
use App\Http\Controllers\Api\TransaksiController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\ReportController;

Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

// Barang Routes
Route::get('/barang', [BarangController::class, 'index']);
Route::post('/barang', [BarangController::class, 'store']);
Route::put('/barang/{id}', [BarangController::class, 'update']);
Route::delete('/barang/{id}', [BarangController::class, 'destroy']);
Route::get('/storage/{path}', [BarangController::class, 'showImage'])->where('path', '.*');

// Transaksi Routes
Route::post('/transaksi', [TransaksiController::class, 'store']);
Route::get('/transaksi', [TransaksiController::class, 'index']);
Route::get('/transaksi/{id}', [TransaksiController::class, 'show']);

// Dashboard & Reports
Route::get('/dashboard', [DashboardController::class, 'summary']);
Route::get('/reports/sales', [ReportController::class, 'sales']);
Route::get('/reports/items', [ReportController::class, 'items']);
Route::get('/stok-mutasi', [BarangController::class, 'mutations']);

// User management
Route::get('/users', [App\Http\Controllers\Api\UserController::class, 'index']);
Route::post('/users', [App\Http\Controllers\Api\UserController::class, 'store']);
Route::put('/users/{id}', [App\Http\Controllers\Api\UserController::class, 'update']);
Route::delete('/users/{id}', [App\Http\Controllers\Api\UserController::class, 'destroy']);

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});
