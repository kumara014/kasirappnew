<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (!Schema::hasColumn('stok_mutasi', 'user_id')) {
            Schema::table('stok_mutasi', function (Blueprint $table) {
                $table->unsignedBigInteger('user_id')->nullable()->after('id_mutasi');
                $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            });
        }
    }

    public function down(): void
    {
        Schema::table('stok_mutasi', function (Blueprint $table) {
            if (Schema::hasColumn('stok_mutasi', 'user_id')) {
                $table->dropForeign(['user_id']);
                $table->dropColumn('user_id');
            }
        });
    }
};
