<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transaksi extends Model
{
    use HasFactory;

    protected $table = 'transaksi';
    protected $primaryKey = 'id_transaksi';

    protected $fillable = [
        'id_user',
        'table_no', // Keeping for legacy support if needed, but ERD doesn't show it. Migration has it removed? Check migration.
        // Migration Transaksi: id_user, total_item, total_harga, uang_bayar, kembalian, tanggal_transaksi.
        // I removed table_no from migration.
        'total_item',
        'total_harga',
        'uang_bayar',
        'kembalian',
        'tanggal_transaksi'
    ];

    public function details() {
        return $this->hasMany(TransaksiDetail::class, 'id_transaksi');
    }

    public function user() {
        return $this->belongsTo(User::class, 'id_user');
    }
}
