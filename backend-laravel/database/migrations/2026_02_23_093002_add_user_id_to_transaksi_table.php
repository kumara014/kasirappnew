<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (!Schema::hasColumn('transaksi', 'user_id')) {
            Schema::table('transaksi', function (Blueprint $table) {
                $table->unsignedBigInteger('user_id')->nullable()->after('id_transaksi');
                $table->foreign('user_id')->references('id_user')->on('users')->onDelete('cascade');
            });
        }
    }

    public function down(): void
    {
        Schema::table('transaksi', function (Blueprint $table) {
            if (Schema::hasColumn('transaksi', 'user_id')) {
                $table->dropForeign(['user_id']);
                $table->dropColumn('user_id');
            }
        });
    }
};
