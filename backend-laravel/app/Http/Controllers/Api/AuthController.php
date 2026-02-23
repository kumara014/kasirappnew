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
            ->orWhere('no_hp', $request->username)
            ->orWhere('nama_usaha', $request->username)
            ->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Username atau password salah',
            ], 401);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Login Berhasil',
            'user' => [
                'id' => $user->id_user,
                'username' => $user->username,
                'name' => $user->name,
                'role' => $user->role,
                'nama_usaha' => $user->nama_usaha,
                'tipe_bisnis' => $user->tipe_bisnis,
                'email' => $user->email,
                'no_hp' => $user->no_hp,
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
            'no_hp' => 'nullable|string',
            'password' => 'required|string|min:6',
        ]);

        $user = User::create([
            'name' => $request->name,
            'nama_usaha' => $request->nama_usaha,
            'tipe_bisnis' => $request->tipe_bisnis,
            'email' => $request->email,
            'no_hp' => $request->no_hp,
            'username' => $request->email, // Use email as username
            'password' => Hash::make($request->password),
            'role' => 'admin', // Registered users are admins of their own shop
            'permissions' => ['dashboard', 'menu', 'order', 'history', 'report', 'stok-mutasi', 'settings'], // Default admin permissions
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Registrasi Berhasil',
            'user' => $user
        ]);
    }
}
