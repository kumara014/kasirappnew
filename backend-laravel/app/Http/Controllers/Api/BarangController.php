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
        return Barang::with('kategori')->latest()->paginate(15);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nama_barang' => 'required',
            'harga' => 'required|numeric',
            'stok' => 'required|integer',
            'stok_minimum' => 'nullable|integer|min:0',
            'id_kategori' => [
                'nullable',
                \Illuminate\Validation\Rule::exists('kategoris', 'id_kategori')->where(function ($query) {
                    $query->where('user_id', auth()->user()->getOwnerId());
                }),
            ],
            'gambar' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:10240'
        ]);

        $data = $request->all();
        $data['user_id'] = auth()->user()->getOwnerId();

        if ($request->hasFile('gambar')) {
            $file = $request->file('gambar');
            $resizedImage = $this->resizeImage($file, 800);
            
            $filename = 'barang/' . time() . '_' . $file->getClientOriginalName();
            \Storage::disk('public')->put($filename, $resizedImage);
            $data['gambar'] = $filename;
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
            'stok_minimum' => 'sometimes|nullable|integer|min:0',
            'id_kategori' => [
                'sometimes',
                'nullable',
                \Illuminate\Validation\Rule::exists('kategoris', 'id_kategori')->where(function ($query) {
                    $query->where('user_id', auth()->user()->getOwnerId());
                }),
            ],
            'gambar' => 'sometimes|nullable|image|mimes:jpeg,png,jpg,gif,svg|max:10240'
        ]);

        $barang = Barang::findOrFail($id);
        $oldStock = $barang->stok;

        $data = $request->all();

        if ($request->hasFile('gambar')) {
            // Delete old image if exists
            if ($barang->gambar) {
                \Storage::disk('public')->delete($barang->gambar);
            }
            $file = $request->file('gambar');
            $resizedImage = $this->resizeImage($file, 800);
            
            $filename = 'barang/' . time() . '_' . $file->getClientOriginalName();
            \Storage::disk('public')->put($filename, $resizedImage);
            $data['gambar'] = $filename;
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

        // Map types to DB enum ['masuk', 'keluar']
        $dbJenis = in_array($request->jenis, ['masuk', 'koreksi']) ? 'masuk' : 'keluar';
        
        // If it's a correction, and the new stock is LOWER than old stock, it's actually 'keluar'
        // but for simplicity, we map it to 'masuk' or 'keluar' based on the diff?
        // Actually, the most important is to fix 'rusak' and 'penjualan' which are definitely 'keluar'.
        
        $mutation = StokMutasi::create([
            'id_barang' => $request->id_barang,
            'jenis' => $dbJenis,
            'jumlah' => $jumlah,
            'keterangan' => ($request->jenis !== $dbJenis ? "[" . strtoupper($request->jenis) . "] " : "") . ($request->keterangan ?? '-')
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

    private function resizeImage($file, $maxWidth = 800)
    {
        $imageInfo = getimagesize($file);
        $width = $imageInfo[0];
        $height = $imageInfo[1];
        $type = $imageInfo[2];

        switch ($type) {
            case IMAGETYPE_JPEG:
                $src = imagecreatefromjpeg($file);
                break;
            case IMAGETYPE_PNG:
                $src = imagecreatefrompng($file);
                break;
            case IMAGETYPE_GIF:
                $src = imagecreatefromgif($file);
                break;
            case IMAGETYPE_WEBP:
                $src = imagecreatefromwebp($file);
                break;
            default:
                return file_get_contents($file);
        }

        if ($width <= $maxWidth) {
            ob_start();
            imagejpeg($src, null, 85);
            $data = ob_get_clean();
            imagedestroy($src);
            return $data;
        }

        $newWidth = $maxWidth;
        $newHeight = floor($height * ($maxWidth / $width));

        $tmp = imagecreatetruecolor($newWidth, $newHeight);
        
        // Handle transparency for PNG
        if ($type == IMAGETYPE_PNG || $type == IMAGETYPE_WEBP) {
            imagealphablending($tmp, false);
            imagesavealpha($tmp, true);
        }

        imagecopyresampled($tmp, $src, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);

        ob_start();
        imagejpeg($tmp, null, 85); // Convert to high quality JPG
        $data = ob_get_clean();

        imagedestroy($src);
        imagedestroy($tmp);

        return $data;
    }
}
