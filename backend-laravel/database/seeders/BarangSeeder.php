<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class BarangSeeder extends Seeder
{
    /**
     * Seed banyak barang makanan & minuman untuk user ID 1.
     * Jalankan: php artisan db:seed --class=BarangSeeder
     */
    public function run(): void
    {
        $userId = 1;
        $now    = now();

        // ─── 1. Kategori ───────────────────────────────────────────────
        // Hapus data lama agar tidak duplikat jika dijalankan ulang
        DB::table('kategoris')->where('user_id', $userId)->delete();

        $makananId = DB::table('kategoris')->insertGetId([
            'nama_kategori' => 'Makanan',
            'user_id'       => $userId,
            'created_at'    => $now,
            'updated_at'    => $now,
        ]);

        $minumanId = DB::table('kategoris')->insertGetId([
            'nama_kategori' => 'Minuman',
            'user_id'       => $userId,
            'created_at'    => $now,
            'updated_at'    => $now,
        ]);

        // ─── 2. Barang ─────────────────────────────────────────────────
        DB::table('barang')->where('user_id', $userId)->delete();

        $makanan = [
            ['nama_barang' => 'Nasi Goreng Spesial',     'harga' => 18000,  'stok' => 100, 'stok_minimum' => 10],
            ['nama_barang' => 'Nasi Goreng Seafood',      'harga' => 22000,  'stok' => 80,  'stok_minimum' => 10],
            ['nama_barang' => 'Nasi Putih',               'harga' => 5000,   'stok' => 200, 'stok_minimum' => 20],
            ['nama_barang' => 'Ayam Goreng',              'harga' => 15000,  'stok' => 120, 'stok_minimum' => 10],
            ['nama_barang' => 'Ayam Penyet',              'harga' => 18000,  'stok' => 90,  'stok_minimum' => 10],
            ['nama_barang' => 'Ayam Bakar',               'harga' => 20000,  'stok' => 75,  'stok_minimum' => 10],
            ['nama_barang' => 'Ikan Goreng',              'harga' => 20000,  'stok' => 60,  'stok_minimum' => 5],
            ['nama_barang' => 'Ikan Bakar',               'harga' => 25000,  'stok' => 50,  'stok_minimum' => 5],
            ['nama_barang' => 'Mie Goreng',               'harga' => 15000,  'stok' => 100, 'stok_minimum' => 10],
            ['nama_barang' => 'Mie Goreng Seafood',       'harga' => 20000,  'stok' => 70,  'stok_minimum' => 10],
            ['nama_barang' => 'Bakso Kuah',               'harga' => 15000,  'stok' => 100, 'stok_minimum' => 10],
            ['nama_barang' => 'Bakso Goreng',             'harga' => 5000,   'stok' => 150, 'stok_minimum' => 20],
            ['nama_barang' => 'Soto Ayam',                'harga' => 15000,  'stok' => 80,  'stok_minimum' => 10],
            ['nama_barang' => 'Soto Betawi',              'harga' => 18000,  'stok' => 60,  'stok_minimum' => 5],
            ['nama_barang' => 'Gado-Gado',                'harga' => 15000,  'stok' => 50,  'stok_minimum' => 5],
            ['nama_barang' => 'Ketoprak',                 'harga' => 13000,  'stok' => 60,  'stok_minimum' => 5],
            ['nama_barang' => 'Rendang Sapi',             'harga' => 28000,  'stok' => 40,  'stok_minimum' => 5],
            ['nama_barang' => 'Capcay Goreng',            'harga' => 18000,  'stok' => 70,  'stok_minimum' => 5],
            ['nama_barang' => 'Capcay Kuah',              'harga' => 18000,  'stok' => 70,  'stok_minimum' => 5],
            ['nama_barang' => 'Tumis Kangkung',           'harga' => 12000,  'stok' => 80,  'stok_minimum' => 10],
            ['nama_barang' => 'Tempe Goreng',             'harga' => 5000,   'stok' => 200, 'stok_minimum' => 20],
            ['nama_barang' => 'Tahu Goreng',              'harga' => 5000,   'stok' => 200, 'stok_minimum' => 20],
            ['nama_barang' => 'Telur Dadar',              'harga' => 8000,   'stok' => 100, 'stok_minimum' => 10],
            ['nama_barang' => 'Telur Mata Sapi',          'harga' => 8000,   'stok' => 100, 'stok_minimum' => 10],
            ['nama_barang' => 'Kentang Goreng',           'harga' => 13000,  'stok' => 120, 'stok_minimum' => 10],
            ['nama_barang' => 'Pisang Goreng',            'harga' => 10000,  'stok' => 80,  'stok_minimum' => 10],
            ['nama_barang' => 'Martabak Mini',            'harga' => 20000,  'stok' => 40,  'stok_minimum' => 5],
            ['nama_barang' => 'Roti Bakar',               'harga' => 15000,  'stok' => 60,  'stok_minimum' => 5],
            ['nama_barang' => 'Indomie Goreng',           'harga' => 12000,  'stok' => 100, 'stok_minimum' => 10],
            ['nama_barang' => 'Indomie Kuah',             'harga' => 12000,  'stok' => 100, 'stok_minimum' => 10],
        ];

        $minuman = [
            ['nama_barang' => 'Es Teh Manis',             'harga' => 5000,   'stok' => 300, 'stok_minimum' => 30],
            ['nama_barang' => 'Teh Manis Hangat',         'harga' => 5000,   'stok' => 200, 'stok_minimum' => 20],
            ['nama_barang' => 'Es Jeruk',                 'harga' => 7000,   'stok' => 200, 'stok_minimum' => 20],
            ['nama_barang' => 'Jeruk Hangat',             'harga' => 7000,   'stok' => 150, 'stok_minimum' => 10],
            ['nama_barang' => 'Kopi Hitam',               'harga' => 8000,   'stok' => 150, 'stok_minimum' => 15],
            ['nama_barang' => 'Kopi Susu',                'harga' => 12000,  'stok' => 120, 'stok_minimum' => 10],
            ['nama_barang' => 'Kopi Susu Gula Aren',      'harga' => 15000,  'stok' => 100, 'stok_minimum' => 10],
            ['nama_barang' => 'Cappuccino',               'harga' => 18000,  'stok' => 80,  'stok_minimum' => 10],
            ['nama_barang' => 'Americano',                'harga' => 15000,  'stok' => 80,  'stok_minimum' => 10],
            ['nama_barang' => 'Latte',                    'harga' => 20000,  'stok' => 80,  'stok_minimum' => 10],
            ['nama_barang' => 'Matcha Latte',             'harga' => 22000,  'stok' => 60,  'stok_minimum' => 5],
            ['nama_barang' => 'Thai Tea',                 'harga' => 15000,  'stok' => 100, 'stok_minimum' => 10],
            ['nama_barang' => 'Taro Milk Tea',            'harga' => 18000,  'stok' => 80,  'stok_minimum' => 10],
            ['nama_barang' => 'Chocolate Milk',           'harga' => 15000,  'stok' => 100, 'stok_minimum' => 10],
            ['nama_barang' => 'Es Cokelat',               'harga' => 13000,  'stok' => 100, 'stok_minimum' => 10],
            ['nama_barang' => 'Susu Fresh',               'harga' => 10000,  'stok' => 80,  'stok_minimum' => 10],
            ['nama_barang' => 'Jus Alpukat',              'harga' => 18000,  'stok' => 60,  'stok_minimum' => 5],
            ['nama_barang' => 'Jus Mangga',               'harga' => 15000,  'stok' => 60,  'stok_minimum' => 5],
            ['nama_barang' => 'Jus Jambu',                'harga' => 13000,  'stok' => 60,  'stok_minimum' => 5],
            ['nama_barang' => 'Jus Semangka',             'harga' => 13000,  'stok' => 60,  'stok_minimum' => 5],
            ['nama_barang' => 'Jus Tomat',                'harga' => 13000,  'stok' => 50,  'stok_minimum' => 5],
            ['nama_barang' => 'Es Kelapa Muda',           'harga' => 18000,  'stok' => 50,  'stok_minimum' => 5],
            ['nama_barang' => 'Es Campur',                'harga' => 15000,  'stok' => 60,  'stok_minimum' => 5],
            ['nama_barang' => 'Es Doger',                 'harga' => 15000,  'stok' => 50,  'stok_minimum' => 5],
            ['nama_barang' => 'Air Mineral',              'harga' => 5000,   'stok' => 500, 'stok_minimum' => 50],
            ['nama_barang' => 'Soda Gembira',             'harga' => 12000,  'stok' => 80,  'stok_minimum' => 10],
            ['nama_barang' => 'Lemon Tea',                'harga' => 10000,  'stok' => 80,  'stok_minimum' => 10],
            ['nama_barang' => 'Cincau Hitam',             'harga' => 8000,   'stok' => 100, 'stok_minimum' => 10],
            ['nama_barang' => 'Wedang Jahe',              'harga' => 8000,   'stok' => 80,  'stok_minimum' => 10],
            ['nama_barang' => 'Milo Dingin',              'harga' => 12000,  'stok' => 100, 'stok_minimum' => 10],
        ];

        // Insert makanan
        foreach ($makanan as $item) {
            DB::table('barang')->insert([
                'user_id'       => $userId,
                'nama_barang'   => $item['nama_barang'],
                'harga'         => $item['harga'],
                'stok'          => $item['stok'],
                'stok_minimum'  => $item['stok_minimum'],
                'id_kategori'   => $makananId,
                'gambar'        => null,
                'created_at'    => $now,
                'updated_at'    => $now,
            ]);
        }

        // Insert minuman
        foreach ($minuman as $item) {
            DB::table('barang')->insert([
                'user_id'       => $userId,
                'nama_barang'   => $item['nama_barang'],
                'harga'         => $item['harga'],
                'stok'          => $item['stok'],
                'stok_minimum'  => $item['stok_minimum'],
                'id_kategori'   => $minumanId,
                'gambar'        => null,
                'created_at'    => $now,
                'updated_at'    => $now,
            ]);
        }

        $totalMakanan = count($makanan);
        $totalMinuman = count($minuman);
        $this->command->info("✅ Seeder selesai: {$totalMakanan} makanan + {$totalMinuman} minuman untuk user ID {$userId}.");
    }
}
