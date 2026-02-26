<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StokMutasi extends Model
{
    use HasFactory, \App\Traits\Multitenantable;

    protected $table = 'stok_mutasi';
    protected $primaryKey = 'id_mutasi';

    protected $fillable = [
        'id_barang',
        'jenis',
        'jumlah',
        'keterangan',
        'user_id'
    ];

    public function barang()
    {
        return $this->belongsTo(Barang::class, 'id_barang');
    }
}
