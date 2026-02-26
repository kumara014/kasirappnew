<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Barang extends Model
{
    use HasFactory, \App\Traits\Multitenantable;

    protected $table = 'barang';
    protected $primaryKey = 'id_barang';

    protected $fillable = [
        'nama_barang',
        'harga',
        'stok',
        'stok_minimum',
        'gambar',
        'id_kategori',
        'user_id',
    ];

    public function kategori()
    {
        return $this->belongsTo(Kategori::class, 'id_kategori');
    }
}
