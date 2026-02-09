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
        'total_item',
        'total_harga',
        'diskon',
        'uang_bayar',
        'kembalian',
        'metode_pembayaran',
        'tanggal_transaksi'
    ];

    public function details()
    {
        return $this->hasMany(TransaksiDetail::class, 'id_transaksi');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'id_user');
    }
}
