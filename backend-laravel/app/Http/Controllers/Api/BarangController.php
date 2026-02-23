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
        $products = \DB::table('barang')
            ->leftJoin('kategoris', 'barang.id_kategori', '=', 'kategoris.id_kategori')
            ->select('barang.*', 'kategoris.nama_kategori')
            ->get();

        return response()->json($products);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nama_barang' => 'required',
            'harga' => 'required|numeric',
            'stok' => 'required|integer',
            'id_kategori' => 'nullable|exists:kategoris,id_kategori',
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
            'id_kategori' => 'sometimes|nullable|exists:kategoris,id_kategori',
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

    public function mutations()
    {
        $mutations = StokMutasi::with('barang')
            ->orderBy('created_at', 'desc')
            ->get();
        return response()->json($mutations);
    }

    public function storeMutation(Request $request)
    {
        $request->validate([
            'id_barang' => 'required|exists:barang,id_barang',
            'jenis' => 'required|in:masuk,keluar,rusak,koreksi,penjualan',
            'jumlah' => 'required|numeric',
            'keterangan' => 'nullable|string'
        ]);

        $barang = Barang::findOrFail($request->id_barang);
        $jumlah = (float) $request->jumlah;

        if ($request->jenis === 'masuk') {
            $barang->stok += $jumlah;
        } elseif (in_array($request->jenis, ['keluar', 'rusak', 'penjualan'])) {
            $barang->stok -= $jumlah;
        } elseif ($request->jenis === 'koreksi') {
            // In koreksi, jumlah usually represents the NEW stock level
            // but we store the difference or just set it
            $barang->stok = $jumlah;
        }

        $barang->save();

        $mutation = StokMutasi::create([
            'id_barang' => $request->id_barang,
            'jenis' => $request->jenis,
            'jumlah' => $jumlah,
            'keterangan' => $request->keterangan ?? '-'
        ]);

        return response()->json([
            'message' => 'Mutasi stok berhasil disimpan',
            'data' => $mutation,
            'new_stock' => $barang->stok
        ]);
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
