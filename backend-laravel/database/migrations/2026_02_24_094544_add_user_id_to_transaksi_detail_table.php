<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (!Schema::hasColumn('transaksi_detail', 'user_id')) {
            Schema::table('transaksi_detail', function (Blueprint $table) {
                $table->unsignedBigInteger('user_id')->nullable()->after('id_detail');
                $table->foreign('user_id')->references('id_user')->on('users')->onDelete('cascade');
            });
        }
    }

    public function down(): void
    {
        Schema::table('transaksi_detail', function (Blueprint $table) {
            if (Schema::hasColumn('transaksi_detail', 'user_id')) {
                $table->dropForeign(['user_id']);
                $table->dropColumn('user_id');
            }
        });
    }
};
