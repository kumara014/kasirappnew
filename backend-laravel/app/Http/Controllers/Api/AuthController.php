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

        $user = User::where('username', $request->username)
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
                'no_hp' => $user->no_hp,
            ]
        ]);
    }

    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'nama_usaha' => 'required|string|max:255',
            'tipe_bisnis' => 'required|string|max:255',
            'no_hp' => 'required|string|unique:users,no_hp',
            'password' => 'required|string|min:6',
        ]);

        $user = User::create([
            'name' => $request->name,
            'nama_usaha' => $request->nama_usaha,
            'tipe_bisnis' => $request->tipe_bisnis,
            'no_hp' => $request->no_hp,
            'username' => $request->no_hp, // Use phone as username
            'password' => Hash::make($request->password),
            'role' => 'admin', // Registered users are admins of their own shop
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Registrasi Berhasil',
            'user' => $user
        ]);
    }
}
