<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('transaksi_detail', function (Blueprint $table) {
            $table->string('metode_pembayaran')->nullable()->after('subtotal');
            $table->decimal('uang_bayar', 15, 2)->nullable()->after('metode_pembayaran');
            $table->decimal('kembalian', 15, 2)->nullable()->after('uang_bayar');
        });
    }

    public function down(): void
    {
        Schema::table('transaksi_detail', function (Blueprint $table) {
            $table->dropColumn(['metode_pembayaran', 'uang_bayar', 'kembalian']);
        });
    }
};
