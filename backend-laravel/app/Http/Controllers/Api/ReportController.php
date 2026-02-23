<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ReportController extends Controller
{
    public function sales(Request $request)
    {
        $range = $request->get('range', 30); // Default 30 days
        $now = Carbon::now();
        $startDate = (clone $now)->subDays($range - 1)->startOfDay();

        // Stats for Current Period
        $revenue = DB::table('transaksi')
            ->where('tanggal_transaksi', '>=', $startDate)
            ->sum('total_harga') ?? 0;

        $total_orders = DB::table('transaksi')
            ->where('tanggal_transaksi', '>=', $startDate)
            ->count() ?? 0;

        // Stats for Previous Period (for Growth)
        $prevStartDate = (clone $startDate)->subDays($range);
        $prevEndDate = (clone $startDate)->subSecond();

        $prevRevenue = DB::table('transaksi')
            ->whereBetween('tanggal_transaksi', [$prevStartDate, $prevEndDate])
            ->sum('total_harga') ?? 0;

        $prevOrders = DB::table('transaksi')
            ->whereBetween('tanggal_transaksi', [$prevStartDate, $prevEndDate])
            ->count() ?? 0;

        // Omzet Today
        $omzet_today = DB::table('transaksi')
            ->whereDate('tanggal_transaksi', Carbon::today())
            ->sum('total_harga') ?? 0;

        $orders_today = DB::table('transaksi')
            ->whereDate('tanggal_transaksi', Carbon::today())
            ->count() ?? 0;

        // Trend Data
        $trend = [];
        $format = $range > 60 ? 'M' : ($range > 7 ? 'd/m' : 'D'); // Month name if > 60 days, else date

        for ($i = $range - 1; $i >= 0; $i--) {
            $date = (clone $now)->subDays($i)->format('Y-m-d');
            $label = (clone $now)->subDays($i)->format($format);
            $trend[$date] = [
                'date' => $date,
                'label' => $label,
                'total' => 0,
                'trx' => 0,
                'today' => $date === $now->format('Y-m-d')
            ];
        }

        $actualTrend = DB::table('transaksi')
            ->select(
                DB::raw('DATE(tanggal_transaksi) as date'),
                DB::raw('SUM(total_harga) as total'),
                DB::raw('COUNT(*) as trx')
            )
            ->where('tanggal_transaksi', '>=', $startDate)
            ->groupBy(DB::raw('DATE(tanggal_transaksi)'))
            ->get();

        foreach ($actualTrend as $row) {
            if (isset($trend[$row->date])) {
                $trend[$row->date]['total'] = (int) $row->total;
                $trend[$row->date]['trx'] = (int) $row->trx;
            }
        }

        // Payment Methods (Donut Chart)
        $paymentMethods = DB::table('transaksi')
            ->where('tanggal_transaksi', '>=', $startDate)
            ->select('metode_pembayaran', DB::raw('COUNT(*) as count'))
            ->groupBy('metode_pembayaran')
            ->get();

        $totalWithMethods = $paymentMethods->sum('count');
        $paymentDistribution = $paymentMethods->map(function ($item) use ($totalWithMethods) {
            $colors = [
                'Tunai' => '#27AE60',
                'QRIS' => '#4A9BAD',
                'Transfer' => '#6C63FF'
            ];
            $icons = [
                'Tunai' => '💵',
                'QRIS' => '📱',
                'Transfer' => '🏦'
            ];
            return [
                'label' => $item->metode_pembayaran,
                'value' => $totalWithMethods > 0 ? round(($item->count / $totalWithMethods) * 100) : 0,
                'color' => $colors[$item->metode_pembayaran] ?? '#aaa',
                'icon' => $icons[$item->metode_pembayaran] ?? '💳'
            ];
        });

        // Top Products
        $topProducts = DB::table('transaksi_detail')
            ->join('transaksi', 'transaksi_detail.id_transaksi', '=', 'transaksi.id_transaksi')
            ->join('barang', 'transaksi_detail.id_barang', '=', 'barang.id_barang')
            ->leftJoin('kategoris', 'barang.id_kategori', '=', 'kategoris.id_kategori')
            ->where('transaksi.tanggal_transaksi', '>=', $startDate)
            ->select(
                'barang.nama_barang as name',
                'kategoris.nama_kategori as category',
                DB::raw('SUM(transaksi_detail.qty) as qty'),
                DB::raw('SUM(transaksi_detail.subtotal) as revenue')
            )
            ->groupBy('barang.id_barang', 'barang.nama_barang', 'kategoris.nama_kategori')
            ->orderByDesc('qty')
            ->limit(5)
            ->get();

        return response()->json([
            "revenue" => (int) $revenue,
            "orders" => (int) $total_orders,
            "prev_revenue" => (int) $prevRevenue,
            "prev_orders" => (int) $prevOrders,
            "omzet_today" => (int) $omzet_today,
            "orders_today" => (int) $orders_today,
            "trend" => array_values($trend),
            "payment_methods" => $paymentDistribution,
            "top_products" => $topProducts
        ]);
    }

    public function items(Request $request)
    {
        $range = $request->get('range', 30);
        $startDate = Carbon::now()->subDays($range - 1)->startOfDay();

        $items = DB::table('transaksi_detail')
            ->join('transaksi', 'transaksi_detail.id_transaksi', '=', 'transaksi.id_transaksi')
            ->join('barang', 'transaksi_detail.id_barang', '=', 'barang.id_barang')
            ->leftJoin('kategoris', 'barang.id_kategori', '=', 'kategoris.id_kategori')
            ->where('transaksi.tanggal_transaksi', '>=', $startDate)
            ->select(
                'barang.nama_barang as product_name',
                'kategoris.nama_kategori as category',
                DB::raw('SUM(transaksi_detail.qty) as total_qty'),
                DB::raw('SUM(transaksi_detail.subtotal) as total_sales')
            )
            ->groupBy('barang.id_barang', 'barang.nama_barang', 'kategoris.nama_kategori')
            ->orderByDesc('total_sales')
            ->get();

        return response()->json($items);
    }
}
