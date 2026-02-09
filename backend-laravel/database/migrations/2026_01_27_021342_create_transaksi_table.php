<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTransaksiTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('transaksi', function (Blueprint $table) {
            $table->id('id_transaksi');
            $table->unsignedBigInteger('id_user')->nullable(); // FK to Users
            // Skipping id_barang as it belongs in detail
            $table->integer('total_item');
            $table->decimal('total_harga', 15, 2);
            $table->decimal('uang_bayar', 15, 2);
            $table->decimal('kembalian', 15, 2);
            $table->timestamp('tanggal_transaksi')->useCurrent();
            $table->timestamps();

            // Foreign keys
            $table->foreign('id_user')->references('id_user')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('transaksi');
    }
}
