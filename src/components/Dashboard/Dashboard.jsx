import React, { useState } from "react";
import { useData } from "../../context/DataContext";
import { haptic } from "../../utils/haptics";
import {
    DollarSign,
    ShoppingBag,
    Grid,
    Menu,
    Clock,
    PieChart,
    Bell,
    Plus,
    ShoppingCart,
    TrendingUp,
    CreditCard,
    Banknote,
    Navigation
} from 'lucide-react';

const TEAL = "#4A9BAD";
const TEAL_LIGHT = "#EAF5F7";
const TEAL_DARK = "#357585";

const formatRp = (n) => "Rp" + new Intl.NumberFormat("id-ID").format(n || 0);

export default function Dashboard({ onNavigate }) {
    const { dashboardData, ordersData, loadingDashboard } = useData();

    const summary = dashboardData || {
        omzet_today: 0,
        total_revenue: 0,
        sell_today: 0,
        items_sold_today: 0,
        trending: [],
        out_of_stock: [],
        chart_data: []
    };

    const totalOmzet = summary?.omzet_today || 0;
    const totalTrx = summary?.sell_today || 0;
    const avgTrx = totalTrx > 0 ? Math.round(totalOmzet / totalTrx) : 0;

    const now = new Date();
    const dateStr = now.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    const hour = now.getHours();
    const greeting = hour < 11 ? "Selamat Pagi" : hour < 15 ? "Selamat Siang" : hour < 18 ? "Selamat Sore" : "Selamat Malam";

    // Chart data from backend
    const weekData = (summary?.chart_data?.length > 0)
        ? summary.chart_data.map((d, i, arr) => ({
            day: new Date(d.date).toLocaleDateString('id-ID', { weekday: 'short' }),
            val: d.total || 0,
            today: i === arr.length - 1
        }))
        : [
            { day: "Sen", val: 0 }, { day: "Sel", val: 0 }, { day: "Rab", val: 0 },
            { day: "Kam", val: 0 }, { day: "Jum", val: 0 }, { day: "Sab", val: 0 },
            { day: "Min", val: 0, today: true },
        ];

    const maxVal = Math.max(...weekData.map((d) => d.val), 100000);

    const recentTransactions = Array.isArray(ordersData)
        ? ordersData.slice(0, 5)
        : [];

    return (
        <div className="dashboard-root" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: "#F5F7F8", minHeight: "100%", position: "relative" }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        
        .dashboard-content { 
            padding-bottom: 100px; 
            max-width: 800px;
            margin: 0 auto;
        }

        /* Header */
        .dash-header {
          background: ${TEAL};
          padding: 40px 20px 80px;
          position: relative; overflow: hidden;
          color: #fff;
        }
        .dash-header-circle1 { position: absolute; top: -40px; right: -40px; width: 160px; height: 160px; border-radius: 50%; background: rgba(255,255,255,0.07); pointer-events: none; }
        .dash-header-circle2 { position: absolute; bottom: 10px; left: -30px; width: 120px; height: 120px; border-radius: 50%; background: rgba(255,255,255,0.05); pointer-events: none; }

        .greeting { font-size: 14px; color: rgba(255,255,255,0.75); margin-bottom: 4px; position: relative; z-index: 2; }
        .username { font-size: 24px; font-weight: 800; color: #fff; letter-spacing: -0.5px; position: relative; z-index: 2; }
        .date-tag { display: inline-flex; align-items: center; gap: 6px; margin-top: 10px; background: rgba(255,255,255,0.15); border-radius: 20px; padding: 6px 14px; font-size: 12px; color: rgba(255,255,255,0.9); font-weight: 500; position: relative; z-index: 2; border: 1px solid rgba(255,255,255,0.1); }

        /* Stats */
        .stats-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin: -50px 16px 0; position: relative; z-index: 5; }
        .stat-card { 
            background: #fff; 
            border-radius: 20px; 
            padding: 16px 12px; 
            box-shadow: 0 10px 25px rgba(74,155,173,0.12), 0 2px 5px rgba(0,0,0,0.04); 
            border: 1px solid #fff;
            transition: transform 0.2s;
        }
        .stat-card:active { transform: scale(0.98); }
        .stat-icon { font-size: 24px; margin-bottom: 10px; display: flex; align-items: center; justify-content: center; width: 44px; height: 44px; border-radius: 12px; background: ${TEAL_LIGHT}; color: ${TEAL}; }
        .stat-val { font-size: 14px; font-weight: 800; color: #111; letter-spacing: -0.3px; line-height: 1.2; word-break: break-all; }
        .stat-label { font-size: 11px; color: #888; font-weight: 600; margin-top: 4px; }
        .stat-badge { display: inline-flex; align-items: center; font-size: 10px; font-weight: 700; margin-top: 8px; padding: 3px 8px; border-radius: 8px; }
        .stat-badge.up { background: #E8F7EF; color: #2ECC71; }
        .stat-badge.down { background: #FFF0F1; color: #FF4757; }

        /* Section */
        .section { padding: 24px 16px 0; }
        .section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
        .section-title { font-size: 16px; font-weight: 800; color: #111; letter-spacing: -0.3px; }
        .see-all { font-size: 13px; font-weight: 600; color: ${TEAL}; cursor: pointer; display: flex; align-items: center; gap: 4px; }

        /* Quick actions */
        .actions-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
        .action-btn { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 16px 10px; background: #fff; border-radius: 18px; border: 1.5px solid #F0F2F4; cursor: pointer; transition: all 0.2s; }
        .action-btn:active { transform: scale(0.92); background: #fdfdfd; }
        .action-icon { width: 48px; height: 48px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 22px; transition: transform 0.2s; }
        .action-btn:hover .action-icon { transform: translateY(-2px); }
        .action-label { font-size: 12px; font-weight: 700; text-align: center; color: #555; }

        /* Chart */
        .chart-card { background: #fff; border-radius: 20px; padding: 20px; border: 1.5px solid #F0F2F4; box-shadow: 0 4px 12px rgba(0,0,0,0.02); }
        .chart-summary { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 20px; }
        .chart-total { font-size: 24px; font-weight: 800; color: #111; letter-spacing: -0.5px; }
        .chart-period { font-size: 12px; color: #aaa; margin-top: 2px; font-weight: 500; }
        .chart-bars { display: flex; align-items: flex-end; gap: 10px; height: 100px; padding-top: 10px; }
        .bar-wrap { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 8px; height: 100%; justify-content: flex-end; }
        .bar { border-radius: 8px 8px 4px 4px; width: 100%; min-height: 6px; transition: height 0.6s cubic-bezier(0.4, 0, 0.2, 1); }
        .bar-label { font-size: 11px; font-weight: 700; color: #bbb; }
        .bar-label.today { color: ${TEAL}; }

        /* Transactions */
        .trx-item { background: #fff; border-radius: 18px; padding: 14px 16px; margin-bottom: 12px; display: flex; align-items: center; gap: 14px; border: 1.5px solid #F0F2F4; transition: transform 0.1s; }
        .trx-item:active { transform: scale(0.98); }
        .trx-icon { width: 46px; height: 46px; border-radius: 14px; background: ${TEAL_LIGHT}; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; color: ${TEAL}; }
        .trx-info { flex: 1; min-width: 0; }
        .trx-invoice { font-size: 14px; font-weight: 700; color: #111; }
        .trx-meta { font-size: 12px; color: #888; margin-top: 3px; font-weight: 500; }
        .method-badge { display: inline-block; font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 8px; background: #F0F2F4; color: #666; text-transform: uppercase; }
        .trx-right { text-align: right; flex-shrink: 0; }
        .trx-total { font-size: 15px; font-weight: 800; color: #111; }
        .trx-time { font-size: 11px; color: #aaa; margin-top: 3px; font-weight: 500; }

        /* FAB */
        .fab { position: fixed; bottom: 24px; right: 24px; width: 60px; height: 60px; border-radius: 20px; background: ${TEAL}; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #fff; box-shadow: 0 8px 25px ${TEAL}55; z-index: 35; transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        .fab:active { transform: scale(0.9); box-shadow: 0 4px 10px ${TEAL}33; }
        
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .dashboard-content > * { animation: fadeIn 0.4s ease-out both; }
        .dashboard-content > *:nth-child(2) { animation-delay: 0.1s; }
        .dashboard-content > *:nth-child(3) { animation-delay: 0.2s; }
        .dashboard-content > *:nth-child(4) { animation-delay: 0.3s; }
      `}</style>

            <div className="dashboard-content">
                {/* Top Header */}
                <div className="dash-header">
                    <div className="dash-header-circle1" />
                    <div className="dash-header-circle2" />
                    <div className="greeting">{greeting} 👋</div>
                    <div className="username">Pointly Store Admin</div>
                    <div className="date-tag">📅 {dateStr}</div>
                </div>

                {/* Stat Cards */}
                <div className="stats-row">
                    <div className="stat-card">
                        <div className="stat-icon"><Banknote size={22} /></div>
                        <div className="stat-val">{formatRp(totalOmzet)}</div>
                        <div className="stat-label">Omzet Hari Ini</div>
                        <div className="stat-badge up">↑ 12%</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon"><ShoppingBag size={22} /></div>
                        <div className="stat-val">{totalTrx}</div>
                        <div className="stat-label">Transaksi</div>
                        <div className="stat-badge up">↑ 3</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon"><TrendingUp size={22} /></div>
                        <div className="stat-val">{formatRp(avgTrx)}</div>
                        <div className="stat-label">Rata-rata</div>
                        <div className="stat-badge down">↓ 5%</div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="section">
                    <div className="section-header">
                        <div className="section-title">Menu Cepat</div>
                    </div>
                    <div className="actions-grid">
                        {[
                            { id: 'order', icon: <ShoppingCart />, label: "Kasir", bg: TEAL_LIGHT, color: TEAL },
                            { id: 'menu', icon: <Grid />, label: "Produk", bg: "#FFF3E8", color: "#F08030" },
                            { id: 'report', icon: <PieChart />, label: "Laporan", bg: "#EEF0FF", color: "#6C63FF" },
                            { id: 'history', icon: <Clock />, label: "Riwayat", bg: "#FFF0F4", color: "#FF4B7B" },
                        ].map((a) => (
                            <div key={a.id} className="action-btn" onClick={() => { haptic.tap(); onNavigate(a.id); }}>
                                <div className="action-icon" style={{ background: a.bg, color: a.color }}>{a.icon}</div>
                                <div className="action-label">{a.label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Weekly Chart */}
                <div className="section">
                    <div className="section-header">
                        <div className="section-title">Penjualan Minggu Ini</div>
                        <div className="see-all" onClick={() => onNavigate('report')}>Detail →</div>
                    </div>
                    <div className="chart-card">
                        <div className="chart-summary">
                            <div>
                                <div className="chart-total">{formatRp(weekData.reduce((s, d) => s + d.val, 0))}</div>
                                <div className="chart-period">Total 7 hari terakhir</div>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
                                <div style={{ width: 10, height: 10, borderRadius: 3, background: TEAL }} />
                                <span style={{ color: "#aaa", fontWeight: 600 }}>Hari ini</span>
                            </div>
                        </div>
                        <div className="chart-bars">
                            {weekData.map((d, i) => (
                                <div key={i} className="bar-wrap">
                                    <div className="bar" style={{ height: `${(d.val / maxVal) * 100}%`, background: d.today ? TEAL : "#E8F4F6" }} />
                                    <div className={`bar-label${d.today ? " today" : ""}`}>{d.day}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Transactions */}
                <div className="section">
                    <div className="section-header">
                        <div className="section-title">Transaksi Terakhir</div>
                        <div className="see-all" onClick={() => onNavigate('history')}>Riwayat →</div>
                    </div>
                    {recentTransactions?.length > 0 ? recentTransactions.map((t, idx) => {
                        const methodIcons = { cash: <Banknote size={18} />, qris: <CreditCard size={18} />, transfer: <Navigation size={18} /> };
                        return (
                            <div key={idx} className="trx-item" onClick={() => onNavigate('history')}>
                                <div className="trx-icon">{methodIcons[t.metode_pembayaran?.toLowerCase()] || <Banknote size={18} />}</div>
                                <div className="trx-info">
                                    <div className="trx-invoice">{t.id_transaksi}</div>
                                    <div className="trx-meta">{t.total_item} item • <span className="method-badge">{t.metode_pembayaran}</span></div>
                                </div>
                                <div className="trx-right">
                                    <div className="trx-total">{formatRp(t.total_harga)}</div>
                                    <div className="trx-time">{t.created_at ? new Date(t.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : ''}</div>
                                </div>
                            </div>
                        );
                    }) : (
                        <div style={{ textAlign: 'center', padding: '40px 0', color: '#aaa', fontSize: '14px' }}>
                            Belum ada transaksi hari ini
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
}
