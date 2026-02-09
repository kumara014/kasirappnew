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
            'harga' => 'required|numeric',
            'stok' => 'required|integer',
            'kode_barang' => 'nullable|string|unique:barang,kode_barang',
            'gambar' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048'
        ]);

        $data = $request->all();

        if ($request->hasFile('gambar')) {
            $path = $request->file('gambar')->store('barang', 'public');
            $data['gambar'] = $path;
        }

        $barang = Barang::create($data);

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
            'kode_barang' => 'sometimes|nullable|string|unique:barang,kode_barang,' . $id . ',id_barang',
            'category' => 'sometimes|nullable|string',
            'gambar' => 'sometimes|nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048'
        ]);

        $barang = Barang::findOrFail($id);
        $oldStock = $barang->stok;

        $data = $request->all();

        if ($request->hasFile('gambar')) {
            // Delete old image if exists
            if ($barang->gambar) {
                \Storage::disk('public')->delete($barang->gambar);
            }
            $path = $request->file('gambar')->store('barang', 'public');
            $data['gambar'] = $path;
        }

        $barang->update($data);

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

        return response()->json($barang);
    }

    public function destroy($id)
    {
        Barang::findOrFail($id)->delete();
        return response()->json(['message' => 'Barang deleted']);
    }

    public function showImage($path)
    {
        $fullPath = storage_path('app/public/' . $path);

        if (!file_exists($fullPath)) {
            return response()->json(['message' => 'Image not found'], 404);
        }

        return response()->file($fullPath);
    }
}
