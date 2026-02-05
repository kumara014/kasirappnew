<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TransaksiDetail extends Model
{
    use HasFactory;

    protected $table = 'transaksi_detail';
    protected $primaryKey = 'id_detail';

    protected $fillable = [
        'id_transaksi',
        'id_barang',
        'harga',
        'qty',
        'subtotal'
    ];

    public function transaksi() {
        return $this->belongsTo(Transaksi::class, 'id_transaksi');
    }

    public function barang() {
        return $this->belongsTo(Barang::class, 'id_barang');
    }
}
