<?php

namespace Database\Seeders;

use Illuminate\Support\Facades\Hash;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        // Seed User
        \App\Models\User::create([
            'name' => 'Admin User',
            'username' => 'admin',
            'password' => Hash::make('admin123'),
            'role' => 'admin',
        ]);

        // Seed Barang
        $items = [
            ['nama_barang' => 'Nasi Goreng', 'harga' => 15000, 'stok' => 100],
            ['nama_barang' => 'Ayam Penyet', 'harga' => 18000, 'stok' => 50],
            ['nama_barang' => 'Es Teh Manis', 'harga' => 5000, 'stok' => 200],
            ['nama_barang' => 'Kopi Hitam', 'harga' => 8000, 'stok' => 150],
            ['nama_barang' => 'Kentang Goreng', 'harga' => 12000, 'stok' => 80],
        ];

        foreach ($items as $item) {
            \App\Models\Barang::create($item);
            // Also seed initial stock mutation
            // We need id_barang but create returns it.
            /* 
               Actually doing this cleanly requires fetching the object. 
               Using create returns the model instance.
            */
        }
    }
}
