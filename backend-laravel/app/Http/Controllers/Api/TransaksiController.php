<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Transaksi;
use App\Models\TransaksiDetail;
use App\Models\Barang;
use App\Models\StokMutasi;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class TransaksiController extends Controller
{
    public function store(Request $request)
    {
        try {
            $request->validate([
                'total_harga' => 'required|numeric',
                'uang_bayar' => 'required|numeric',
                'items' => 'required|array',
            ]);

            return DB::transaction(function () use ($request) {
                // Determine `total_item` from items array
                $totalItem = 0;
                foreach ($request->items as $i) {
                    $totalItem += $i['qty'];
                }

                $kembalian = $request->uang_bayar - $request->total_harga;

                $transaksi = Transaksi::create([
                    'total_item' => $totalItem,
                    'total_harga' => $request->total_harga,
                    'uang_bayar' => $request->uang_bayar,
                    'kembalian' => $kembalian,
                    'metode_pembayaran' => $request->metode_pembayaran ?? 'Cash',
                    'user_id' => Auth::user()->getOwnerId(),
                ]);

                $details = [];
                foreach ($request->items as $item) {
                    $barang = Barang::findOrFail($item['id_barang']);

                    if ($barang->stok < $item['qty']) {
                        throw new \Exception("Stok tidak mencukupi untuk item: " . $barang->nama_barang);
                    }

                    $barang->decrement('stok', $item['qty']);

                    StokMutasi::create([
                        'id_barang' => $barang->id_barang,
                        'jenis' => 'keluar',
                        'jumlah' => $item['qty'],
                        'keterangan' => 'Penjualan Transaksi #' . $transaksi->id_transaksi
                    ]);

                    $details[] = [
                        'id_transaksi' => $transaksi->id_transaksi,
                        'id_barang' => $item['id_barang'],
                        'harga' => $item['harga'],
                        'qty' => $item['qty'],
                        'subtotal' => $item['harga'] * $item['qty'],
                        'user_id' => Auth::id(),
                        'metode_pembayaran' => $request->metode_pembayaran ?? 'Cash',
                        'uang_bayar' => $request->uang_bayar,
                        'kembalian' => $kembalian,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                }

                TransaksiDetail::insert($details);

                // Invalidate user-specific dashboard cache
                \Cache::forget('dashboard_summary_' . Auth::id());

                return response()->json([
                    'message' => 'Transaksi berhasil disimpan.',
                    'id_transaksi' => $transaksi->id_transaksi
                ]);
            });
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validasi gagal.',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Transaksi gagal.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function index()
    {
        return Transaksi::with('details.barang')->latest()->paginate(15);
    }

    public function show($id)
    {
        return response()->json(Transaksi::with('details.barang')->findOrFail($id));
    }
}
