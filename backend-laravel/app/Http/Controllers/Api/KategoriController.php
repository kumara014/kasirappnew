<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Kategori;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class KategoriController extends Controller
{
    public function index()
    {
        return response()->json(Kategori::all());
    }

    public function store(Request $request)
    {
        $request->validate([
            'nama_kategori' => [
                'required',
                'string',
                Rule::unique('kategoris')->where(fn($query) => $query->where('user_id', Auth::id()))
            ]
        ]);

        $kategori = Kategori::create([
            'nama_kategori' => $request->nama_kategori
        ]);

        return response()->json($kategori, 201);
    }

    public function destroy($id)
    {
        $kategori = Kategori::findOrFail($id);
        $kategori->delete();

        return response()->json(['message' => 'Kategori berhasil dihapus']);
    }
}
