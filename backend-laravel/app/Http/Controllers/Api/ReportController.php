<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    public function sales()
    {
        // Get Total Revenue
        $revenue = DB::table('transaksi')->sum('total_harga') ?? 0;

        // Get Total Orders
        $total_orders = DB::table('transaksi')->count() ?? 0;

        // Get Last 30 Days Trend (Ensuring 30 data points)
        $trend = [];
        for ($i = 29; $i >= 0; $i--) {
            $date = now()->subDays($i)->format('Y-m-d');
            $trend[$date] = [
                'date' => $date,
                'total' => 0
            ];
        }

        $actualTrend = DB::table('transaksi')
            ->select(DB::raw('DATE(tanggal_transaksi) as date'), DB::raw('SUM(total_harga) as total'))
            ->where('tanggal_transaksi', '>=', now()->subDays(29))
            ->groupBy(DB::raw('DATE(tanggal_transaksi)'))
            ->get();

        foreach ($actualTrend as $row) {
            if (isset($trend[$row->date])) {
                $trend[$row->date]['total'] = $row->total;
            }
        }

        return response()->json([
            "revenue" => $revenue,
            "orders" => $total_orders,
            "trend" => array_values($trend)
        ]);
    }

    public function items()
    {
        // Group by Product Name (Joined)
        $items = DB::table('transaksi_detail')
            ->join('barang', 'transaksi_detail.id_barang', '=', 'barang.id_barang')
            ->select(
                'barang.nama_barang as product_name',
                DB::raw('SUM(transaksi_detail.qty) as total_qty'),
                DB::raw('SUM(transaksi_detail.subtotal) as total_sales')
            )
            ->groupBy('barang.nama_barang')
            ->orderByDesc('total_sales')
            ->get();

        return response()->json($items);
    }
}
