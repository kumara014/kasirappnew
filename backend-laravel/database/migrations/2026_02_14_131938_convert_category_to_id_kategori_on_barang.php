<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

class ConvertCategoryToIdKategoriOnBarang extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // 1. Add id_kategori column
        Schema::table('barang', function (Blueprint $table) {
            $table->unsignedBigInteger('id_kategori')->nullable()->after('stok');
            $table->foreign('id_kategori')->references('id_kategori')->on('kategoris')->onDelete('set null');
        });

        // 2. Map existing 'category' names to 'id_kategori'
        $items = DB::table('barang')->get();
        foreach ($items as $item) {
            if ($item->category) {
                $category = DB::table('kategoris')
                    ->where('nama_kategori', $item->category)
                    ->first();

                if ($category) {
                    DB::table('barang')
                        ->where('id_barang', $item->id_barang)
                        ->update(['id_kategori' => $category->id_kategori]);
                }
            }
        }

        // 3. Drop old 'category' column
        Schema::table('barang', function (Blueprint $table) {
            $table->dropColumn('category');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('barang', function (Blueprint $table) {
            $table->string('category')->nullable()->after('stok');
        });

        // Map back IDs to names
        $items = DB::table('barang')->get();
        foreach ($items as $item) {
            if ($item->id_kategori) {
                $category = DB::table('kategoris')
                    ->where('id_kategori', $item->id_kategori)
                    ->first();

                if ($category) {
                    DB::table('barang')
                        ->where('id_barang', $item->id_barang)
                        ->update(['category' => $category->nama_kategori]);
                }
            }
        }

        Schema::table('barang', function (Blueprint $table) {
            $table->dropForeign(['id_kategori']);
            $table->dropColumn('id_kategori');
        });
    }
}
