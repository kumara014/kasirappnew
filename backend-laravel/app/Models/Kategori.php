<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Kategori extends Model
{
    use HasFactory, \App\Traits\Multitenantable;

    protected $table = 'kategoris';
    protected $primaryKey = 'id_kategori';

    protected $fillable = [
        'nama_kategori',
        'user_id'
    ];
}
