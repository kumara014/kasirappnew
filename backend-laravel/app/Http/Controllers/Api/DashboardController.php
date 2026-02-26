<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Transaksi;
use App\Models\Barang;
use App\Models\TransaksiDetail;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    public function summary()
    {
        // Use user-specific cache key
        $cacheKey = 'dashboard_summary_' . Auth::id();

        $response = \Cache::remember($cacheKey, 300, function () {
            $ownerId = Auth::user()->getOwnerId();

            // Get Total Omzet Today
            $omzet_today = Transaksi::where('user_id', $ownerId)
                ->whereDate('tanggal_transaksi', today())
                ->sum('total_harga') ?? 0;

            // Get Total Revenue (All Time)
            $total_revenue = Transaksi::where('user_id', $ownerId)
                ->sum('total_harga') ?? 0;

            // Get Total Sell (Transactions) Today
            $sell_today = Transaksi::where('user_id', $ownerId)
                ->whereDate('tanggal_transaksi', today())
                ->count() ?? 0;

            // Get Total Products Count
            $total_products = Barang::where('user_id', $ownerId)->count() ?? 0;

            // Get Trending Dishes (Top 5 based on qty)
            $trending_dishes = TransaksiDetail::join('barang', 'transaksi_detail.id_barang', '=', 'barang.id_barang')
                ->where('barang.user_id', $ownerId)
                ->select('barang.nama_barang as name', DB::raw('SUM(transaksi_detail.qty) as total_sold'))
                ->groupBy('barang.nama_barang')
                ->orderByDesc('total_sold')
                ->limit(5)
                ->get();

            // Get Out of Stock / Low Stock Items
            $out_of_stock = Barang::select('nama_barang as name', 'stok as stock')
                ->where('user_id', $ownerId)
                ->where('stok', '<', 5)
                ->limit(5)
                ->get();

            // Get Weekly Sales for Chart
            $chart_data = Transaksi::select(DB::raw('DATE(tanggal_transaksi) as date'), DB::raw('SUM(total_harga) as total'))
                ->where('user_id', $ownerId)
                ->where('tanggal_transaksi', '>=', now()->subDays(7))
                ->groupBy(DB::raw('DATE(tanggal_transaksi)'))
                ->orderBy('date', 'asc')
                ->get();

            // Get Total Items Sold Today
            $items_sold_today = TransaksiDetail::join('transaksi', 'transaksi_detail.id_transaksi', '=', 'transaksi.id_transaksi')
                ->where('transaksi.user_id', $ownerId)
                ->whereDate('transaksi.tanggal_transaksi', today())
                ->sum('transaksi_detail.qty') ?? 0;

            return [
                "omzet_today" => (float) $omzet_today,
                "total_revenue" => (float) $total_revenue,
                "sell_today" => (int) $sell_today,
                "total_products" => (int) $total_products,
                "items_sold_today" => (int) $items_sold_today,
                "trending" => $trending_dishes,
                "out_of_stock" => $out_of_stock,
                "chart_data" => $chart_data
            ];
        });

        return response()->json($response);
    }
}
