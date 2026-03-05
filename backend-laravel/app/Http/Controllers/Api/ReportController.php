<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

use App\Models\Transaksi;
use App\Models\TransaksiDetail;
use App\Models\Barang;
use Illuminate\Support\Facades\Auth;

class ReportController extends Controller
{
    public function sales(Request $request)
    {
        $now = Carbon::now();
        $monthStr = $request->get('month'); // Expects format YYYY-MM
        
        if ($monthStr) {
            $startDate = Carbon::createFromFormat('Y-m-d', $monthStr . '-01')->startOfMonth();
            $endDate = Carbon::createFromFormat('Y-m-d', $monthStr . '-01')->endOfMonth();
        } else {
            $range = $request->get('range', 30); // Default 30 days
            $startDate = (clone $now)->subDays($range - 1)->startOfDay();
            $endDate = $now;
        }

        $ownerId = Auth::user()->getOwnerId();

        // Stats for Current Period
        $revenue = Transaksi::where('user_id', $ownerId)
            ->whereBetween('tanggal_transaksi', [$startDate, $endDate])
            ->sum('total_harga') ?? 0;

        $total_orders = Transaksi::where('user_id', $ownerId)
            ->whereBetween('tanggal_transaksi', [$startDate, $endDate])
            ->count() ?? 0;

        // Stats for Previous Period (for Growth)
        if ($monthStr) {
            $prevStartDate = (clone $startDate)->subMonth()->startOfMonth();
            $prevEndDate = (clone $startDate)->subMonth()->endOfMonth();
        } else {
            $prevStartDate = (clone $startDate)->subDays($range);
            $prevEndDate = (clone $startDate)->subSecond();
        }

        $prevRevenue = Transaksi::where('user_id', $ownerId)
            ->whereBetween('tanggal_transaksi', [$prevStartDate, $prevEndDate])
            ->sum('total_harga') ?? 0;

        $prevOrders = Transaksi::where('user_id', $ownerId)
            ->whereBetween('tanggal_transaksi', [$prevStartDate, $prevEndDate])
            ->count() ?? 0;

        // Omzet Today
        $omzet_today = Transaksi::where('user_id', $ownerId)
            ->whereDate('tanggal_transaksi', Carbon::today())
            ->sum('total_harga') ?? 0;

        $orders_today = Transaksi::where('user_id', $ownerId)
            ->whereDate('tanggal_transaksi', Carbon::today())
            ->count() ?? 0;

        // Trend Data
        $trend = [];
        
        if ($monthStr) {
            $daysInMonth = $startDate->daysInMonth;
            for ($i = 1; $i <= $daysInMonth; $i++) {
                $dateObj = (clone $startDate)->addDays($i - 1);
                if ($dateObj > $endDate) break; // Don't go past the month
                $date = $dateObj->format('Y-m-d');
                $label = $dateObj->format('d/m');
                $trend[$date] = [
                    'date' => $date,
                    'label' => $label,
                    'total' => 0,
                    'trx' => 0,
                    'today' => $date === $now->format('Y-m-d')
                ];
            }
        } else {
            $format = $range > 7 ? 'd/m' : 'D'; // Fix: 30 & 90 days show daily format "d/m" instead of identical Month names
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
        }

        $actualTrend = Transaksi::select(
            DB::raw('DATE(tanggal_transaksi) as date'),
            DB::raw('SUM(total_harga) as total'),
            DB::raw('COUNT(*) as trx')
        )
            ->where('user_id', $ownerId)
            ->whereBetween('tanggal_transaksi', [$startDate, $endDate])
            ->groupBy(DB::raw('DATE(tanggal_transaksi)'))
            ->get();

        foreach ($actualTrend as $row) {
            if (isset($trend[$row->date])) {
                $trend[$row->date]['total'] = (int) $row->total;
                $trend[$row->date]['trx'] = (int) $row->trx;
            }
        }

        // Payment Methods (Donut Chart)
        $paymentMethods = Transaksi::where('user_id', $ownerId)
            ->whereBetween('tanggal_transaksi', [$startDate, $endDate])
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
        $topProducts = TransaksiDetail::join('transaksi', 'transaksi_detail.id_transaksi', '=', 'transaksi.id_transaksi')
            ->join('barang', 'transaksi_detail.id_barang', '=', 'barang.id_barang')
            ->leftJoin('kategoris', 'barang.id_kategori', '=', 'kategoris.id_kategori')
            ->whereBetween('transaksi.tanggal_transaksi', [$startDate, $endDate])
            // Note: Since Transaksi and Barang have global scopes, it's safer to add explicit filters if join is used
            // but TransaksiDetail::join(...) will use TransaksiDetail's scope (none)
            // So we MUST add the user_id filter manually here because TransaksiDetail doesn't have it.
            ->where('transaksi.user_id', Auth::id())
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
        $monthStr = $request->get('month');
        if ($monthStr) {
            $startDate = Carbon::createFromFormat('Y-m-d', $monthStr . '-01')->startOfMonth();
            $endDate = Carbon::createFromFormat('Y-m-d', $monthStr . '-01')->endOfMonth();
        } else {
            $range = $request->get('range', 30);
            $startDate = Carbon::now()->subDays($range - 1)->startOfDay();
            $endDate = Carbon::now();
        }

        $items = TransaksiDetail::join('transaksi', 'transaksi_detail.id_transaksi', '=', 'transaksi.id_transaksi')
            ->join('barang', 'transaksi_detail.id_barang', '=', 'barang.id_barang')
            ->leftJoin('kategoris', 'barang.id_kategori', '=', 'kategoris.id_kategori')
            ->whereBetween('transaksi.tanggal_transaksi', [$startDate, $endDate])
            ->where('transaksi.user_id', Auth::id())
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
