<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function summary()
    {
        $response = \Cache::remember('dashboard_summary', 300, function () {
            // Get Total Omzet Today
            $omzet_today = DB::table('transaksi')
                ->whereDate('tanggal_transaksi', today())
                ->sum('total_harga') ?? 0;

            // Get Total Revenue (All Time)
            $total_revenue = DB::table('transaksi')
                ->sum('total_harga') ?? 0;

            // Get Total Sell (Transactions) Today
            $sell_today = DB::table('transaksi')
                ->whereDate('tanggal_transaksi', today())
                ->count() ?? 0;

            // Get Total Products Count
            $total_products = DB::table('barang')->count() ?? 0;

            // Get Trending Dishes (Top 5 based on qty)
            $trending_dishes = DB::table('transaksi_detail')
                ->join('barang', 'transaksi_detail.id_barang', '=', 'barang.id_barang')
                ->select('barang.nama_barang as name', DB::raw('SUM(transaksi_detail.qty) as total_sold'))
                ->groupBy('barang.nama_barang')
                ->orderByDesc('total_sold')
                ->limit(5)
                ->get();

            // Get Out of Stock / Low Stock Items
            $out_of_stock = DB::table('barang')
                ->select('nama_barang as name', 'stok as stock')
                ->where('stok', '<', 5)
                ->limit(5)
                ->get();

            // Get Weekly Sales for Chart
            $chart_data = DB::table('transaksi')
                ->select(DB::raw('DATE(tanggal_transaksi) as date'), DB::raw('SUM(total_harga) as total'))
                ->where('tanggal_transaksi', '>=', now()->subDays(7))
                ->groupBy(DB::raw('DATE(tanggal_transaksi)'))
                ->orderBy('date', 'asc')
                ->get();

            // Get Total Items Sold Today
            $items_sold_today = DB::table('transaksi_detail')
                ->join('transaksi', 'transaksi_detail.id_transaksi', '=', 'transaksi.id_transaksi')
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
