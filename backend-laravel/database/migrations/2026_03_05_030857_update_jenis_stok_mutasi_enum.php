<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

class UpdateJenisStokMutasiEnum extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        DB::statement("ALTER TABLE stok_mutasi MODIFY COLUMN jenis ENUM('masuk', 'keluar', 'rusak', 'koreksi', 'penjualan') NOT NULL");
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        DB::statement("ALTER TABLE stok_mutasi MODIFY COLUMN jenis ENUM('masuk', 'keluar') NOT NULL");
    }
}
