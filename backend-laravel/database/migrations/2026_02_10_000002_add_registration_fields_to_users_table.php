<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddRegistrationFieldsToUsersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('nama_usaha')->nullable()->after('name');
            $table->string('tipe_bisnis')->nullable()->after('nama_usaha');
            $table->string('no_hp')->nullable()->unique()->after('tipe_bisnis');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['nama_usaha', 'tipe_bisnis', 'no_hp']);
        });
    }
}
