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
        'total_item',
        'total_harga',
        'uang_bayar',
        'kembalian',
        'metode_pembayaran',
        'tanggal_transaksi'
    ];

    public function details()
    {
        return $this->hasMany(TransaksiDetail::class, 'id_transaksi');
    }
}
