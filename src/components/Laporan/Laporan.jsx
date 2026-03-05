import React, { useState, useEffect } from "react";
import { apiFetch } from "../../config";
import { useData } from "../../context/DataContext";
import {
    Share2,
    TrendingUp,
    TrendingDown,
    Package,
    Clock,
    Users,
    Gem
} from "lucide-react";
import { haptic } from "../../utils/haptics";
import MonthPicker from "../Common/MonthPicker";

const TEAL = "var(--primary-brand)";
const TEAL_LIGHT = "var(--primary-light)";
const TEAL_DARK = "var(--primary-dark)";

const formatRp = (n) => "Rp" + new Intl.NumberFormat("id-ID").format(n || 0);

// ── MINI BAR CHART ─────────────────────────────────────────────────────────────
function BarChart({ data = [], activeBar, onBarClick }) {
    const maxVal = Math.max(...(data || []).map((d) => d.total || 0), 1);
    const itemWidth = (data || []).length > 15 ? 32 : ((data || []).length > 7 ? 44 : "auto");
    const containerStyle = (data || []).length > 7
        ? { display: "flex", alignItems: "flex-end", gap: 6, height: 110, overflowX: "auto", paddingBottom: 10 }
        : { display: "flex", alignItems: "flex-end", gap: 5, height: 100 };

    return (
        <div className={(data || []).length > 7 ? "chart-scroll" : ""} style={containerStyle}>
            {(data || []).map((d, i) => {
                const pct = (d.total / maxVal) * 100;
                const isActive = activeBar === i;
                return (
                    <div key={i} onClick={() => onBarClick(i)}
                        style={{ flex: data.length > 7 ? `0 0 ${itemWidth}px` : 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5, height: "100%", justifyContent: "flex-end", cursor: "pointer", position: "relative" }}>
                        {isActive && (
                            <div style={{ fontSize: 9, fontWeight: 700, color: TEAL, background: TEAL_LIGHT, padding: "2px 5px", borderRadius: 5, whiteSpace: "nowrap", position: "absolute", bottom: "105%", zIndex: 5 }}>
                                {formatRp(d.total)}
                            </div>
                        )}
                        <div style={{ position: "relative", width: "100%", height: `${Math.max(pct, 4)}%`, borderRadius: "5px 5px 0 0", background: d.today ? "var(--primary-dark)" : isActive ? "var(--primary-brand)" : "var(--primary-light)", transition: "all 0.2s" }} />
                        <div style={{ fontSize: (data?.length || 0) > 15 ? 8 : ((data?.length || 0) > 8 ? 9 : 10), fontWeight: 600, color: d.today ? "var(--primary-brand)" : isActive ? "var(--text-primary)" : "var(--text-tertiary)", whiteSpace: "nowrap" }}>
                            {d.label}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// ── DONUT CHART ────────────────────────────────────────────────────────────────
function DonutChart({ data }) {
    const total = (data || []).reduce((s, d) => s + (d.value || 0), 0);
    if (total === 0) return <div style={{ width: 112, height: 112, borderRadius: "50%", border: "10px solid var(--border-light)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "var(--text-tertiary)" }}>No data</div>;

    let cumulative = 0;
    const r = 42, cx = 56, cy = 56, stroke = 14;
    const circumference = 2 * Math.PI * r;

    return (
        <svg width={112} height={112} viewBox="0 0 112 112">
            {data.map((d, i) => {
                const dashLen = (d.value / total) * circumference;
                const offset = circumference - cumulative * circumference / total;
                cumulative += d.value;
                return (
                    <circle key={i} cx={cx} cy={cy} r={r}
                        fill="none" stroke={d.color} strokeWidth={stroke}
                        strokeDasharray={`${dashLen} ${circumference - dashLen}`}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        style={{ transform: "rotate(-90deg)", transformOrigin: "56px 56px", transition: "all 0.4s" }}
                    />
                );
            })}
            <text x={cx} y={cy - 4} textAnchor="middle" style={{ fontSize: 13, fontWeight: 800, fill: "var(--text-primary)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {total}%
            </text>
            <text x={cx} y={cy + 11} textAnchor="middle" style={{ fontSize: 9, fill: "var(--text-tertiary)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                metode
            </text>
        </svg>
    );
}

// ── MAIN ───────────────────────────────────────────────────────────────────────
export default function Laporan() {
    const [period, setPeriod] = useState("Minggu Ini");
    const [selectedMonth, setSelectedMonth] = useState("");
    const [activeBar, setActiveBar] = useState(null);
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(true);

    const PERIOD_MAP = {
        "Minggu Ini": 7,
        "Bulan Ini": 30
    };

    useEffect(() => {
        if (period === "Pilih Bulan" && !selectedMonth) return; // Don't fetch if specific month is not yet selected
        fetchReport();
    }, [period, selectedMonth]);

    const fetchReport = async () => {
        setLoading(true);
        try {
            let url = `/reports/sales?range=${PERIOD_MAP[period]}`;
            if (period === "Pilih Bulan" && selectedMonth) {
                url = `/reports/sales?month=${selectedMonth}`;
            }
            const response = await apiFetch(url);
            const data = await response.json();
            setReportData(data);
        } catch (error) {
            console.error("Failed to fetch report:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading && !reportData) {
        return (
            <div style={{ ...pageStyle, justifyContent: "center", alignItems: "center" }}>
                <div className="loader"></div>
                <p style={{ marginTop: 16, color: "var(--primary-brand)", fontWeight: 600 }}>Menyiapkan Laporan...</p>
                <style>{`.loader { border: 4px solid var(--border-light); border-top: 4px solid var(--primary-brand); border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; } @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    const {
        revenue = 0,
        orders = 0,
        prev_revenue = 0,
        prev_orders = 0,
        trend = [],
        payment_methods = [],
        top_products = []
    } = reportData || {};
    const avgPerTrx = orders > 0 ? Math.round(revenue / orders) : 0;
    const maxDay = trend && trend.length > 0 ? trend.reduce((a, b) => a.total > b.total ? a : b) : { label: '-', total: 0 };

    const omzetGrowth = prev_revenue > 0 ? Math.round(((revenue - prev_revenue) / prev_revenue) * 100) : (revenue > 0 ? 100 : 0);
    const trxGrowth = prev_orders > 0 ? Math.round(((orders - prev_orders) / prev_orders) * 100) : (orders > 0 ? 100 : 0);

    return (
        <div style={pageStyle}>
            <style>{globalCSS}</style>

            {/* Header */}
            <div className="topbar">
                <div className="topbar-row" style={{ marginBottom: 14 }}>
                    <span className="topbar-title">Laporan <span style={{ color: "var(--primary-brand)" }}>Penjualan</span></span>
                    <button onClick={() => { haptic.tap(); window.print(); }} style={{ marginLeft: "auto", width: 38, height: 38, borderRadius: 12, background: "var(--primary-light)", border: `1px solid var(--primary-brand)22`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Share2 size={18} color="var(--primary-brand)" />
                    </button>
                </div>

                {/* Period tabs */}
                <div style={{ display: "flex", gap: 0, borderBottom: "2px solid #F0F2F4" }}>
                    {["Minggu Ini", "Bulan Ini", "Pilih Bulan"].map((t) => (
                        <button key={t} onClick={() => { haptic.tap(); setPeriod(t); setActiveBar(null); }}
                            style={{ flex: 1, padding: "10px 4px", fontSize: 13, fontWeight: 600, cursor: "pointer", border: "none", background: "none", color: period === t ? "var(--primary-brand)" : "var(--text-tertiary)", borderBottom: `2.5px solid ${period === t ? "var(--primary-brand)" : "transparent"}`, fontFamily: "'Plus Jakarta Sans', sans-serif", marginBottom: -2, transition: "all 0.15s" }}>
                            {t}
                        </button>
                    ))}
                </div>
                {period === "Pilih Bulan" && (
                    <div style={{ padding: "14px 0 0", display: "flex", gap: 10, alignItems: "center", animation: "fadeIn 0.2s ease" }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)" }}>Pilih Bulan:</span>
                        <MonthPicker
                            value={selectedMonth}
                            onChange={(val) => setSelectedMonth(val)}
                        />
                    </div>
                )}
            </div>

            <div className="content">

                {/* KPI Cards */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
                    {/* Omzet */}
                    <div style={{ background: "var(--primary-brand)", borderRadius: 16, padding: "16px 14px", gridColumn: "1 / -1", position: "relative", overflow: "hidden" }}>
                        <div style={{ position: "absolute", top: -20, right: -20, width: 90, height: 90, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
                        <div style={{ position: "absolute", bottom: -30, left: 60, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", fontWeight: 600, marginBottom: 4, position: "relative" }}>Total Omzet</div>
                        <div style={{ fontSize: 28, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px", position: "relative" }}>{formatRp(revenue)}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8, position: "relative" }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: omzetGrowth >= 0 ? "#A8F0C6" : "#FFB3B3", background: "rgba(255,255,255,0.15)", padding: "4px 10px", borderRadius: 10, display: "flex", alignItems: "center", gap: 4 }}>
                                {omzetGrowth >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />} {Math.abs(omzetGrowth)}% vs periode lalu
                            </span>
                        </div>
                    </div>

                    <div style={{ background: "var(--bg-surface)", borderRadius: 16, padding: "14px", border: "1.5px solid var(--border-light)" }}>
                        <div style={{ fontSize: 11, color: "var(--text-tertiary)", fontWeight: 500, marginBottom: 4 }}>Transaksi</div>
                        <div style={{ fontSize: 24, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.5px" }}>{orders}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600, color: trxGrowth >= 0 ? "var(--status-green)" : "var(--status-red)", marginTop: 4 }}>
                            {trxGrowth >= 0 ? "↑" : "↓"} {Math.abs(trxGrowth)}%
                        </div>
                    </div>

                    <div style={{ background: "var(--bg-surface)", borderRadius: 16, padding: "14px", border: "1.5px solid var(--border-light)" }}>
                        <div style={{ fontSize: 11, color: "var(--text-tertiary)", fontWeight: 500, marginBottom: 4 }}>Rata-rata/Trx</div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px", marginTop: 2 }}>{formatRp(avgPerTrx)}</div>
                    </div>
                </div>

                {/* Bar Chart */}
                <div style={{ background: "var(--bg-surface)", borderRadius: 16, padding: 16, border: "1.5px solid var(--border-light)", marginBottom: 14 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                        <div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>Grafik Penjualan</div>
                            <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 2 }}>Hari terbaik: <span style={{ fontWeight: 700, color: "var(--primary-brand)" }}>{maxDay.label} ({formatRp(maxDay.total)})</span></div>
                        </div>
                        {activeBar !== null && (
                            <button onClick={() => setActiveBar(null)}
                                style={{ fontSize: 11, color: "var(--text-tertiary)", background: "var(--bg-app-alt)", border: "none", borderRadius: 8, padding: "4px 10px", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                                ✕ Reset
                            </button>
                        )}
                    </div>
                    <BarChart data={trend} activeBar={activeBar} onBarClick={(i) => { haptic.tap(); setActiveBar(activeBar === i ? null : i); }} />

                    {activeBar !== null && trend[activeBar] && (
                        <div style={{ marginTop: 12, background: "var(--primary-light)", borderRadius: 11, padding: "10px 14px", display: "flex", justifyContent: "space-between", animation: "fadeIn 0.2s ease" }}>
                            <div style={{ textAlign: "center" }}>
                                <div style={{ fontSize: 10, color: "var(--primary-brand)", fontWeight: 600 }}>OMZET</div>
                                <div style={{ fontSize: 14, fontWeight: 800, color: "var(--primary-brand)" }}>{formatRp(Number(trend[activeBar].total))}</div>
                            </div>
                            <div style={{ width: 1, background: `var(--primary-brand)33` }} />
                            <div style={{ textAlign: "center" }}>
                                <div style={{ fontSize: 10, color: "var(--primary-brand)", fontWeight: 600 }}>TRANSAKSI</div>
                                <div style={{ fontSize: 14, fontWeight: 800, color: "var(--primary-brand)" }}>{trend[activeBar].trx}x</div>
                            </div>
                            <div style={{ width: 1, background: `var(--primary-brand)33` }} />
                            <div style={{ textAlign: "center" }}>
                                <div style={{ fontSize: 10, color: "var(--primary-brand)", fontWeight: 600 }}>RATA-RATA</div>
                                <div style={{ fontSize: 14, fontWeight: 800, color: "var(--primary-brand)" }}>{formatRp(Math.round(trend[activeBar].total / (trend[activeBar].trx || 1)))}</div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Payment method section removed as per request */}

                {/* Top Products */}
                <div style={{ background: "var(--bg-surface)", borderRadius: 16, border: "1.5px solid var(--border-light)", overflow: "hidden", marginBottom: 14 }}>
                    <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border-light)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>Produk Terlaris</div>
                    </div>

                    {(top_products || []).map((p, i) => {
                        const maxQty = top_products[0]?.qty || 1;
                        const pct = (p.qty / maxQty) * 100;
                        const medals = ["🥇", "🥈", "🥉"];
                        return (
                            <div key={i} style={{ padding: "13px 16px", borderBottom: i < (top_products?.length || 0) - 1 ? "1px solid var(--border-light)" : "none" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 7 }}>
                                    <div style={{ fontSize: 18, flexShrink: 0, width: 28 }}>{medals[i] || `${i + 1}`}</div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
                                        <div style={{ fontSize: 11, color: "var(--text-tertiary)" }}>{p.category || 'Tanpa Kategori'}</div>
                                    </div>
                                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                                        <div style={{ fontSize: 13, fontWeight: 800, color: "var(--text-primary)" }}>{p.qty} pcs</div>
                                        <div style={{ fontSize: 11, color: "var(--primary-brand)", fontWeight: 600 }}>{formatRp(p.revenue)}</div>
                                    </div>
                                </div>
                                <div style={{ height: 5, background: "var(--border-light)", borderRadius: 3, overflow: "hidden" }}>
                                    <div style={{ width: `${pct}%`, height: "100%", background: i === 0 ? "#F39C12" : i === 1 ? "#95A5A6" : i === 2 ? "#CD7F32" : "var(--primary-brand)", borderRadius: 3, transition: "width 0.5s ease" }} />
                                </div>
                            </div>
                        );
                    })}
                    {(top_products?.length || 0) === 0 && (
                        <div style={{ padding: 40, textAlign: "center", color: "var(--text-tertiary)", fontSize: 13 }}>
                            <Package size={32} style={{ marginBottom: 8, opacity: 0.3 }} />
                            <p>Belum ada produk terjual di periode ini</p>
                        </div>
                    )}
                </div>

                {/* Quick stats row */}
                <div style={{ background: "var(--bg-surface)", borderRadius: 16, border: "1.5px solid var(--border-light)", padding: "14px 16px", marginBottom: 14 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 12 }}>Ringkasan Cepat</div>
                    {[
                        { label: "Produk terjual", val: `${top_products.reduce((s, p) => s + (parseInt(p.qty) || 0), 0)} pcs`, icon: <Package size={16} color="var(--primary-brand)" /> },
                        { label: "Jam tersibuk", val: "12.00 – 14.00", icon: <Clock size={16} color="var(--primary-brand)" /> },
                        { label: "Pelanggan terlayani", val: `${orders} orang`, icon: <Users size={16} color="var(--primary-brand)" /> },
                        { label: "Transaksi terbesar", val: formatRp(trend && trend.length > 0 ? maxDay.total : 0), icon: <Gem size={16} color="var(--primary-brand)" /> },
                    ].map((row, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: i < 3 ? 10 : 0, marginBottom: i < 3 ? 10 : 0, borderBottom: i < 3 ? "1px solid var(--border-light)" : "none" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                {row.icon}
                                <span style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 500 }}>{row.label}</span>
                            </div>
                            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{row.val}</span>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
}

const pageStyle = { fontFamily: "'Plus Jakarta Sans', sans-serif", background: "var(--bg-app)", minHeight: "100vh", maxWidth: "100%", margin: "0 auto", display: "flex", flexDirection: "column", position: "relative" };

const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
  .topbar { background: var(--bg-surface); padding: 16px 20px 0; border-bottom: 1px solid var(--border-light); position: sticky; top: 0; z-index: 20; }
  .topbar-row { display: flex; align-items: center; gap: 12px; }
  .topbar-title { font-size: 18px; font-weight: 700; color: var(--text-primary); letter-spacing: -0.4px; }
  .back-btn { width: 40px; height: 40px; border-radius: 12px; background: var(--bg-app-alt); border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--text-primary); flex-shrink: 0; transition: background 0.15s; }
  .back-btn:active { background: var(--border-light); }
  .content { flex: 1; padding: 16px; padding-bottom: 40px; overflow-y: auto; color: var(--text-primary); }
  .chart-scroll::-webkit-scrollbar { display: none; }
  .chart-scroll { -ms-overflow-style: none; scrollbar-width: none; }
  
  @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
  
  /* Print styling optimization */
  @media print {
    .topbar, .back-btn, .topbar-row > button { display: none !important; }
    .content { padding: 0 !important; }
    .auth-card { border: none !important; box-shadow: none !important; }
  }
`;
