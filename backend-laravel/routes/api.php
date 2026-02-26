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

Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:5,1');
Route::post('/register', [AuthController::class, 'register']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    // Barang Routes
    Route::get('/barang', [BarangController::class, 'index']);
    Route::post('/barang', [BarangController::class, 'store']);
    Route::put('/barang/{id}', [BarangController::class, 'update']);
    Route::delete('/barang/{id}', [BarangController::class, 'destroy']);
    Route::get('/storage/{path}', [BarangController::class, 'showImage'])->where('path', '.*');

    // Kategori Routes
    Route::get('/categories', [App\Http\Controllers\Api\KategoriController::class, 'index']);
    Route::post('/categories', [App\Http\Controllers\Api\KategoriController::class, 'store']);
    Route::delete('/categories/{id}', [App\Http\Controllers\Api\KategoriController::class, 'destroy']);

    // Transaksi Routes
    Route::post('/transaksi', [TransaksiController::class, 'store']);
    Route::get('/transaksi', [TransaksiController::class, 'index']);
    Route::get('/transaksi/{id}', [TransaksiController::class, 'show']);

    // Dashboard & Reports
    Route::get('/dashboard', [DashboardController::class, 'summary']);
    Route::get('/reports/sales', [ReportController::class, 'sales']);
    Route::get('/reports/items', [ReportController::class, 'items']);
    Route::get('/stok-mutasi', [BarangController::class, 'mutations']);
    Route::post('/stok-mutasi', [BarangController::class, 'storeMutation']);

    // Employee management
    Route::get('/employees', [App\Http\Controllers\Api\EmployeeController::class, 'index']);
    Route::post('/employees', [App\Http\Controllers\Api\EmployeeController::class, 'store']);
    Route::put('/employees/{id}', [App\Http\Controllers\Api\EmployeeController::class, 'update']);
    Route::delete('/employees/{id}', [App\Http\Controllers\Api\EmployeeController::class, 'destroy']);

    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::post('/user/profile', [AuthController::class, 'updateProfile']);
    Route::post('/user/password', [AuthController::class, 'updatePassword']);
});
