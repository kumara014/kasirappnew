<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class RemoveUserAndDiscountFromTransaksi extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('transaksi', function (Blueprint $table) {
            if (Schema::hasColumn('transaksi', 'id_user')) {
                try {
                    $table->dropForeign(['id_user']);
                } catch (\Exception $e) {
                    // Foreign key might not exist or have a different name
                }
                $table->dropColumn('id_user');
            }
            if (Schema::hasColumn('transaksi', 'diskon')) {
                $table->dropColumn('diskon');
            }
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('transaksi', function (Blueprint $table) {
            $table->unsignedBigInteger('id_user')->nullable()->after('id_transaksi');
            $table->decimal('diskon', 15, 2)->default(0)->after('total_harga');

            $table->foreign('id_user')->references('id_user')->on('users')->onDelete('cascade');
        });
    }
}
