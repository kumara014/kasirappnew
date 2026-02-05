<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Keranjang extends Model
{
    use HasFactory;

    protected $table = 'keranjang';
    protected $primaryKey = 'id_keranjang';

    protected $fillable = [
        'id_user',
        'id_barang',
        'qty',
        'subtotal'
    ];

    public function barang() {
        return $this->belongsTo(Barang::class, 'id_barang');
    }

    public function user() {
        return $this->belongsTo(User::class, 'id_user');
    }
}
