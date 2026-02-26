<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'username' => 'required',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->username)
            ->orWhere('username', $request->username)
            ->orWhere('nama_usaha', $request->username)
            ->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Username atau password salah',
            ], 401);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'status' => 'success',
            'message' => 'Login Berhasil',
            'token' => $token,
            'user' => [
                'id' => $user->id_user,
                'username' => $user->username,
                'name' => $user->name,
                'role' => $user->role,
                'nama_usaha' => $user->nama_usaha,
                'tipe_bisnis' => $user->tipe_bisnis,
                'email' => $user->email,
                'permissions' => $user->permissions ?? ['dashboard', 'menu', 'order', 'history', 'report', 'stok-mutasi', 'settings'],
            ]
        ]);
    }

    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'nama_usaha' => 'required|string|max:255',
            'tipe_bisnis' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
        ]);

        $user = User::create([
            'name' => $request->name,
            'nama_usaha' => $request->nama_usaha,
            'tipe_bisnis' => $request->tipe_bisnis,
            'email' => $request->email,
            'username' => $request->email, // Use email as username
            'password' => Hash::make($request->password),
            'role' => 'admin', // Registered users are admins of their own shop
            'permissions' => ['Dashboard', 'Kasir', 'Kelola Produk', 'Laporan', 'Riwayat', 'Mutasi Stok', 'Karyawan'], // Default admin permissions
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'status' => 'success',
            'message' => 'Registrasi Berhasil',
            'token' => $token,
            'user' => $user
        ]);
    }
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id_user . ',id_user',
            'nama_usaha' => 'required|string|max:255',
            'tipe_bisnis' => 'nullable|string|max:255',
        ]);

        $user->update([
            'name' => $request->name,
            'email' => $request->email,
            'nama_usaha' => $request->nama_usaha,
            'tipe_bisnis' => $request->tipe_bisnis,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Profil berhasil diperbarui',
            'user' => [
                'id' => $user->id_user,
                'username' => $user->username,
                'name' => $user->name,
                'role' => $user->role,
                'nama_usaha' => $user->nama_usaha,
                'tipe_bisnis' => $user->tipe_bisnis,
                'email' => $user->email,
                'permissions' => $user->permissions,
            ]
        ]);
    }

    public function updatePassword(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'current_password' => 'required',
            'new_password' => 'required|min:6|confirmed',
        ]);

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Password lama tidak sesuai'
            ], 422);
        }

        $user->update([
            'password' => Hash::make($request->new_password)
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Password berhasil diperbarui'
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Berhasil keluar'
        ]);
    }
}
