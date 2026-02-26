<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TransaksiDetail extends Model
{
    use HasFactory, \App\Traits\Multitenantable;

    protected $table = 'transaksi_detail';
    protected $primaryKey = 'id_detail';

    protected $fillable = [
        'id_transaksi',
        'id_barang',
        'harga',
        'qty',
        'subtotal',
        'user_id',
        'metode_pembayaran',
        'uang_bayar',
        'kembalian'
    ];

    public function transaksi()
    {
        return $this->belongsTo(Transaksi::class, 'id_transaksi');
    }

    public function barang()
    {
        return $this->belongsTo(Barang::class, 'id_barang');
    }
}
