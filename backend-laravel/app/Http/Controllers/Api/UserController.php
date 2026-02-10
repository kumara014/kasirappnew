<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $nama_usaha = $request->query('nama_usaha');
        
        if (!$nama_usaha) {
            return response()->json(['status' => 'error', 'message' => 'Nama usaha required'], 400);
        }

        $users = User::where('nama_usaha', $nama_usaha)->get();
        return response()->json(['status' => 'success', 'data' => $users]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required',
            'username' => 'required|unique:users,username',
            'password' => 'required|min:6',
            'role' => 'required',
            'nama_usaha' => 'required',
            'permissions' => 'nullable|array'
        ]);

        $user = User::create([
            'name' => $request->name,
            'username' => $request->username,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'nama_usaha' => $request->nama_usaha,
            'permissions' => $request->permissions,
            'tipe_bisnis' => $request->tipe_bisnis ?? 'Other',
        ]);

        return response()->json(['status' => 'success', 'message' => 'User created', 'data' => $user]);
    }

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);
        
        $request->validate([
            'name' => 'sometimes|required',
            'role' => 'sometimes|required',
            'permissions' => 'nullable|array'
        ]);

        if ($request->has('name')) $user->name = $request->name;
        if ($request->has('role')) $user->role = $request->role;
        if ($request->has('permissions')) $user->permissions = $request->permissions;
        
        if ($request->has('password') && !empty($request->password)) {
            $user->password = Hash::make($request->password);
        }

        $user->save();

        return response()->json(['status' => 'success', 'message' => 'User updated', 'data' => $user]);
    }

    public function destroy($id)
    {
        $user = User::findOrFail($id);
        $user->delete();
        return response()->json(['status' => 'success', 'message' => 'User deleted']);
    }
}
