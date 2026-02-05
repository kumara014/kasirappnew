<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Barang;
use App\Models\StokMutasi;

class BarangController extends Controller
{
    public function index()
    {
        return response()->json(Barang::all());
    }

    public function store(Request $request)
    {
        $request->validate([
            'nama_barang' => 'required',
            'harga'       => 'required|numeric',
            'stok'        => 'required|integer',
            'kode_barang' => 'nullable|string|unique:barang,kode_barang'
            // Category ignored as it's not in ERD
        ]);

        $barang = Barang::create($request->all());

        // Log mutation
        if ($barang->stok > 0) {
            StokMutasi::create([
                'id_barang' => $barang->id_barang,
                'jenis' => 'masuk',
                'jumlah' => $barang->stok,
                'keterangan' => 'Stok awal barang baru'
            ]);
        }

        return response()->json($barang);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'nama_barang' => 'sometimes|required|string|max:255',
            'harga' => 'sometimes|required|numeric|min:0',
            'stok' => 'sometimes|required|integer|min:0',
            'kode_barang' => 'sometimes|nullable|string|unique:barang,kode_barang,'.$id.',id_barang',
            'category' => 'sometimes|nullable|string'
        ]);

        $barang = Barang::findOrFail($id);
        $oldStock = $barang->stok;
        $barang->update($request->all());

        // Mutation log logic (simplified)
        if ($request->has('stok')) {
             $diff = $request->stok - $oldStock;
             if ($diff != 0) {
                 StokMutasi::create([
                     'id_barang' => $barang->id_barang,
                     'jenis' => $diff > 0 ? 'masuk' : 'keluar',
                     'jumlah' => abs($diff),
                     'keterangan' => 'Update stok manual'
                 ]);
             }
        }

        // Return the updated object
        return response()->json($barang);
    }

    public function destroy($id)
    {
        Barang::findOrFail($id)->delete();
        return response()->json(['message' => 'Barang deleted']);
    }
}
