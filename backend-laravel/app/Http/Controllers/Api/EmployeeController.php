<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class EmployeeController extends Controller
{
    public function index()
    {
        $owner_id = Auth::user()->getOwnerId();
        $employees = User::where('owner_id', $owner_id)->get();
        return response()->json($employees);
    }

    public function store(Request $request)
    {
        $owner = Auth::user();
        $owner_id = $owner->getOwnerId();

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'role' => 'required|in:admin,kasir',
            'password' => 'required|string|min:8',
            'permissions' => 'nullable|array',
        ]);

        $defaultPermissions = $request->role === 'admin'
            ? ['Dashboard', 'Kasir', 'Kelola Produk', 'Laporan', 'Riwayat', 'Mutasi Stok', 'Karyawan']
            : ['Dashboard', 'Kasir', 'Riwayat'];

        $permissions = $request->input('permissions', $defaultPermissions);

        $employee = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'username' => $request->email, // Using email as username for consistency
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'permissions' => $permissions,
            'owner_id' => $owner_id,
            'nama_usaha' => $owner->nama_usaha,
            'tipe_bisnis' => $owner->tipe_bisnis,
        ]);

        // Transform slightly for frontend
        $employee->joinDate = $employee->created_at;

        return response()->json([
            'status' => 'success',
            'message' => 'Karyawan berhasil ditambahkan',
            'data' => $employee
        ]);
    }

    public function update(Request $request, $id)
    {
        $owner_id = Auth::user()->getOwnerId();
        $employee = User::where('owner_id', $owner_id)->findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $employee->id_user . ',id_user',
            'role' => 'required|in:admin,kasir',
            'password' => 'nullable|string|min:8',
            'permissions' => 'nullable|array',
        ]);

        $defaultPermissions = $request->role === 'admin'
            ? ['Dashboard', 'Kasir', 'Kelola Produk', 'Laporan', 'Riwayat', 'Mutasi Stok', 'Pengaturan', 'Manajemen Karyawan']
            : ['Dashboard', 'Kasir', 'Riwayat'];

        $permissions = $request->input('permissions', $defaultPermissions);

        $data = [
            'name' => $request->name,
            'email' => $request->email,
            'username' => $request->email,
            'role' => $request->role,
            'permissions' => $permissions,
        ];

        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $employee->update($data);

        $employee->joinDate = $employee->created_at;

        return response()->json([
            'status' => 'success',
            'message' => 'Data karyawan berhasil diperbarui',
            'data' => $employee
        ]);
    }

    public function destroy($id)
    {
        $owner_id = Auth::user()->getOwnerId();
        $employee = User::where('owner_id', $owner_id)->findOrFail($id);

        $employee->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Karyawan berhasil dihapus'
        ]);
    }
}
