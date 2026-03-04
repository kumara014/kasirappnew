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
                'id_user' => $user->id_user,
                'username' => $user->username,
                'name' => $user->name,
                'role' => $user->role,
                'nama_usaha' => $user->nama_usaha,
                'tipe_bisnis' => $user->tipe_bisnis,
                'email' => $user->email,
                'permissions' => $user->permissions ?? ['dashboard', 'menu', 'order', 'history', 'report', 'stok-mutasi', 'settings'],
                'qris_image' => $user->qris_image,
                'bank_info' => $user->bank_info,
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
            'name' => 'nullable|string|max:255',
            'email' => 'nullable|email|unique:users,email,' . $user->id_user . ',id_user',
            'nama_usaha' => 'nullable|string|max:255',
            'tipe_bisnis' => 'nullable|string|max:255',
            'bank_info' => 'nullable', // Expected to be array or JSON
            'qris_image' => 'nullable' // Could be file or base64
        ]);

        $updateData = [];
        if ($request->has('name')) $updateData['name'] = $request->name;
        if ($request->has('email')) $updateData['email'] = $request->email;
        if ($request->has('nama_usaha')) $updateData['nama_usaha'] = $request->nama_usaha;
        if ($request->has('tipe_bisnis')) $updateData['tipe_bisnis'] = $request->tipe_bisnis;
        
        if ($request->has('bank_info')) {
            $bankData = $request->bank_info;
            if (is_string($bankData)) {
                $decoded = json_decode($bankData, true);
                $updateData['bank_info'] = is_array($decoded) ? $decoded : [];
            } else {
                $updateData['bank_info'] = is_array($bankData) ? $bankData : [];
            }
        }

        \Log::info('Update Profile Request:', $request->all());

        if ($request->has('qris_image') && !empty($request->qris_image)) {
            // Handle image upload if it's a file or base64
            if ($request->hasFile('qris_image')) {
                $path = $request->file('qris_image')->store('qris', 'public');
                $updateData['qris_image'] = $path;
            } else if (preg_match('/^data:image\/(\w+);base64,/', $request->qris_image, $type)) {
                // Base64 logic
                $image_data = substr($request->qris_image, strpos($request->qris_image, ',') + 1);
                $type = strtolower($type[1]); // jpg, png, gif

                if (!in_array($type, ['jpg', 'jpeg', 'gif', 'png'])) {
                    return response()->json(['status' => 'error', 'message' => 'Invalid image type'], 422);
                }

                $image_data = base64_decode($image_data);
                if ($image_data === false) {
                    return response()->json(['status' => 'error', 'message' => 'Base64 decode failed'], 422);
                }

                $fileName = 'qris_' . time() . '.' . $type;
                $path = 'qris/' . $fileName;
                
                // Ensure directory exists
                if (!\Illuminate\Support\Facades\Storage::disk('public')->exists('qris')) {
                    \Illuminate\Support\Facades\Storage::disk('public')->makeDirectory('qris');
                }

                \Illuminate\Support\Facades\Storage::disk('public')->put($path, $image_data);
                $updateData['qris_image'] = $path;
            } else {
                // If it's just a string path (not a new upload), keep it as is
                $updateData['qris_image'] = $request->qris_image;
            }
        }

        \Log::info('Final Update Data:', $updateData);

        if (!empty($updateData)) {
            $user->update($updateData);
            $user->refresh();
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Profil berhasil diperbarui',
            'user' => [
                'id' => $user->id_user,
                'id_user' => $user->id_user,
                'username' => $user->username,
                'name' => $user->name,
                'role' => $user->role,
                'nama_usaha' => $user->nama_usaha,
                'tipe_bisnis' => $user->tipe_bisnis,
                'email' => $user->email,
                'permissions' => $user->permissions,
                'qris_image' => $user->qris_image,
                'bank_info' => $user->bank_info,
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
