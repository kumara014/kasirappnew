<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     * Adds stok_minimum column to barang table so each product can have
     * its own configurable low-stock threshold instead of a hardcoded value.
     */
    public function up()
    {
        Schema::table('barang', function (Blueprint $table) {
            $table->unsignedInteger('stok_minimum')->default(5)->after('stok');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down()
    {
        Schema::table('barang', function (Blueprint $table) {
            $table->dropColumn('stok_minimum');
        });
    }
};
