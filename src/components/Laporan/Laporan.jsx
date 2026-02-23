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

const TEAL = "#4A9BAD";
const TEAL_LIGHT = "#EAF5F7";
const TEAL_DARK = "#357585";

const formatRp = (n) => "Rp" + new Intl.NumberFormat("id-ID").format(n || 0);

// ── MINI BAR CHART ─────────────────────────────────────────────────────────────
function BarChart({ data = [], activeBar, onBarClick }) {
    const maxVal = Math.max(...(data || []).map((d) => d.total || 0), 1);
    return (
        <div style={{ display: "flex", alignItems: "flex-end", gap: 5, height: 100 }}>
            {(data || []).map((d, i) => {
                const pct = (d.total / maxVal) * 100;
                const isActive = activeBar === i;
                return (
                    <div key={i} onClick={() => onBarClick(i)}
                        style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5, height: "100%", justifyContent: "flex-end", cursor: "pointer" }}>
                        {isActive && (
                            <div style={{ fontSize: 9, fontWeight: 700, color: TEAL, background: TEAL_LIGHT, padding: "2px 5px", borderRadius: 5, whiteSpace: "nowrap", position: "absolute", bottom: "105%", zIndex: 5 }}>
                                {formatRp(d.total)}
                            </div>
                        )}
                        <div style={{ position: "relative", width: "100%", height: `${Math.max(pct, 4)}%`, borderRadius: "5px 5px 0 0", background: d.today ? TEAL_DARK : isActive ? TEAL : "#D5EEF2", transition: "all 0.2s" }} />
                        <div style={{ fontSize: (data?.length || 0) > 15 ? 8 : ((data?.length || 0) > 8 ? 9 : 10), fontWeight: 600, color: d.today ? TEAL : isActive ? "#333" : "#bbb", whiteSpace: "nowrap" }}>
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
    const total = data.reduce((s, d) => s + (d.value || 0), 0);
    if (total === 0) return <div style={{ width: 112, height: 112, borderRadius: "50%", border: "10px solid #F5F7F8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#aaa" }}>No data</div>;

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
            <text x={cx} y={cy - 4} textAnchor="middle" style={{ fontSize: 13, fontWeight: 800, fill: "#111", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {total}%
            </text>
            <text x={cx} y={cy + 11} textAnchor="middle" style={{ fontSize: 9, fill: "#aaa", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                metode
            </text>
        </svg>
    );
}

// ── MAIN ───────────────────────────────────────────────────────────────────────
export default function Laporan() {
    const [period, setPeriod] = useState("Minggu Ini");
    const [activeBar, setActiveBar] = useState(null);
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(true);

    const PERIOD_MAP = {
        "Minggu Ini": 7,
        "Bulan Ini": 30,
        "3 Bulan": 90
    };

    useEffect(() => {
        fetchReport();
    }, [period]);

    const fetchReport = async () => {
        setLoading(true);
        try {
            const response = await apiFetch(`/reports/sales?range=${PERIOD_MAP[period]}`);
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
                <p style={{ marginTop: 16, color: TEAL, fontWeight: 600 }}>Menyiapkan Laporan...</p>
                <style>{`.loader { border: 4px solid #f3f3f3; border-top: 4px solid ${TEAL}; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; } @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
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
                    <span className="topbar-title">Laporan <span style={{ color: TEAL }}>Penjualan</span></span>
                    <button onClick={() => { haptic.tap(); window.print(); }} style={{ marginLeft: "auto", width: 38, height: 38, borderRadius: 12, background: TEAL_LIGHT, border: `1px solid ${TEAL}22`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Share2 size={18} color={TEAL} />
                    </button>
                </div>

                {/* Period tabs */}
                <div style={{ display: "flex", gap: 0, borderBottom: "2px solid #F0F2F4" }}>
                    {["Minggu Ini", "Bulan Ini", "3 Bulan"].map((t) => (
                        <button key={t} onClick={() => { haptic.tap(); setPeriod(t); setActiveBar(null); }}
                            style={{ flex: 1, padding: "10px 4px", fontSize: 13, fontWeight: 600, cursor: "pointer", border: "none", background: "none", color: period === t ? TEAL : "#aaa", borderBottom: `2.5px solid ${period === t ? TEAL : "transparent"}`, fontFamily: "'Plus Jakarta Sans', sans-serif", marginBottom: -2, transition: "all 0.15s" }}>
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            <div className="content">

                {/* KPI Cards */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
                    {/* Omzet */}
                    <div style={{ background: TEAL, borderRadius: 16, padding: "16px 14px", gridColumn: "1 / -1", position: "relative", overflow: "hidden" }}>
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

                    <div style={{ background: "#fff", borderRadius: 16, padding: "14px", border: "1.5px solid #ECEEF0" }}>
                        <div style={{ fontSize: 11, color: "#aaa", fontWeight: 500, marginBottom: 4 }}>Transaksi</div>
                        <div style={{ fontSize: 24, fontWeight: 800, color: "#111", letterSpacing: "-0.5px" }}>{orders}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600, color: trxGrowth >= 0 ? "#27AE60" : "#E74C3C", marginTop: 4 }}>
                            {trxGrowth >= 0 ? "↑" : "↓"} {Math.abs(trxGrowth)}%
                        </div>
                    </div>

                    <div style={{ background: "#fff", borderRadius: 16, padding: "14px", border: "1.5px solid #ECEEF0" }}>
                        <div style={{ fontSize: 11, color: "#aaa", fontWeight: 500, marginBottom: 4 }}>Rata-rata/Trx</div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: "#111", letterSpacing: "-0.3px", marginTop: 2 }}>{formatRp(avgPerTrx)}</div>
                    </div>
                </div>

                {/* Bar Chart */}
                <div style={{ background: "#fff", borderRadius: 16, padding: 16, border: "1.5px solid #ECEEF0", marginBottom: 14 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                        <div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: "#111" }}>Grafik Penjualan</div>
                            <div style={{ fontSize: 11, color: "#aaa", marginTop: 2 }}>Hari terbaik: <span style={{ fontWeight: 700, color: TEAL }}>{maxDay.label} ({formatRp(maxDay.total)})</span></div>
                        </div>
                        {activeBar !== null && (
                            <button onClick={() => setActiveBar(null)}
                                style={{ fontSize: 11, color: "#aaa", background: "#F5F7F8", border: "none", borderRadius: 8, padding: "4px 10px", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                                ✕ Reset
                            </button>
                        )}
                    </div>
                    <BarChart data={trend} activeBar={activeBar} onBarClick={(i) => { haptic.tap(); setActiveBar(activeBar === i ? null : i); }} />

                    {activeBar !== null && trend[activeBar] && (
                        <div style={{ marginTop: 12, background: TEAL_LIGHT, borderRadius: 11, padding: "10px 14px", display: "flex", justifyContent: "space-between", animation: "fadeIn 0.2s ease" }}>
                            <div style={{ textAlign: "center" }}>
                                <div style={{ fontSize: 10, color: TEAL, fontWeight: 600 }}>OMZET</div>
                                <div style={{ fontSize: 14, fontWeight: 800, color: TEAL }}>{formatRp(trend[activeBar].total)}</div>
                            </div>
                            <div style={{ width: 1, background: `${TEAL}33` }} />
                            <div style={{ textAlign: "center" }}>
                                <div style={{ fontSize: 10, color: TEAL, fontWeight: 600 }}>TRANSAKSI</div>
                                <div style={{ fontSize: 14, fontWeight: 800, color: TEAL }}>{trend[activeBar].trx}x</div>
                            </div>
                            <div style={{ width: 1, background: `${TEAL}33` }} />
                            <div style={{ textAlign: "center" }}>
                                <div style={{ fontSize: 10, color: TEAL, fontWeight: 600 }}>RATA-RATA</div>
                                <div style={{ fontSize: 14, fontWeight: 800, color: TEAL }}>{formatRp(Math.round(trend[activeBar].total / (trend[activeBar].trx || 1)))}</div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Payment Method donut */}
                <div style={{ background: "#fff", borderRadius: 16, padding: 16, border: "1.5px solid #ECEEF0", marginBottom: 14 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#111", marginBottom: 14 }}>Metode Pembayaran</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <DonutChart data={payment_methods} />
                        <div style={{ flex: 1 }}>
                            {(payment_methods || []).map((m) => (
                                <div key={m.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        <div style={{ width: 10, height: 10, borderRadius: 3, background: m.color, flexShrink: 0 }} />
                                        <span style={{ fontSize: 13, fontWeight: 600, color: "#555" }}>{m.icon} {m.label}</span>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                        <div style={{ width: 60, height: 6, background: "#F0F2F4", borderRadius: 3, overflow: "hidden" }}>
                                            <div style={{ width: `${m.value}%`, height: "100%", background: m.color, borderRadius: 3 }} />
                                        </div>
                                        <span style={{ fontSize: 13, fontWeight: 800, color: m.color, minWidth: 30, textAlign: "right" }}>{m.value}%</span>
                                    </div>
                                </div>
                            ))}
                            {(payment_methods?.length || 0) === 0 && <p style={{ fontSize: 12, color: "#aaa", textAlign: "center" }}>Belum ada data pembayaran</p>}
                        </div>
                    </div>
                </div>

                {/* Top Products */}
                <div style={{ background: "#fff", borderRadius: 16, border: "1.5px solid #ECEEF0", overflow: "hidden", marginBottom: 14 }}>
                    <div style={{ padding: "14px 16px", borderBottom: "1px solid #F5F7F8", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#111" }}>Produk Terlaris</div>
                    </div>

                    {(top_products || []).map((p, i) => {
                        const maxQty = top_products[0]?.qty || 1;
                        const pct = (p.qty / maxQty) * 100;
                        const medals = ["🥇", "🥈", "🥉"];
                        return (
                            <div key={i} style={{ padding: "13px 16px", borderBottom: i < top_products.length - 1 ? "1px solid #F5F7F8" : "none" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 7 }}>
                                    <div style={{ fontSize: 18, flexShrink: 0, width: 28 }}>{medals[i] || `${i + 1}`}</div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: 13, fontWeight: 700, color: "#111", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
                                        <div style={{ fontSize: 11, color: "#aaa" }}>{p.category || 'Tanpa Kategori'}</div>
                                    </div>
                                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                                        <div style={{ fontSize: 13, fontWeight: 800, color: "#111" }}>{p.qty} pcs</div>
                                        <div style={{ fontSize: 11, color: TEAL, fontWeight: 600 }}>{formatRp(p.revenue)}</div>
                                    </div>
                                </div>
                                <div style={{ height: 5, background: "#F0F2F4", borderRadius: 3, overflow: "hidden" }}>
                                    <div style={{ width: `${pct}%`, height: "100%", background: i === 0 ? "#F39C12" : i === 1 ? "#95A5A6" : i === 2 ? "#CD7F32" : TEAL, borderRadius: 3, transition: "width 0.5s ease" }} />
                                </div>
                            </div>
                        );
                    })}
                    {(top_products?.length || 0) === 0 && (
                        <div style={{ padding: 40, textAlign: "center", color: "#aaa", fontSize: 13 }}>
                            <Package size={32} style={{ marginBottom: 8, opacity: 0.3 }} />
                            <p>Belum ada produk terjual di periode ini</p>
                        </div>
                    )}
                </div>

                {/* Quick stats row */}
                <div style={{ background: "#fff", borderRadius: 16, border: "1.5px solid #ECEEF0", padding: "14px 16px", marginBottom: 14 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#111", marginBottom: 12 }}>Ringkasan Cepat</div>
                    {[
                        { label: "Produk terjual", val: `${top_products.reduce((s, p) => s + (parseInt(p.qty) || 0), 0)} pcs`, icon: <Package size={16} color={TEAL} /> },
                        { label: "Jam tersibuk", val: "12.00 – 14.00", icon: <Clock size={16} color={TEAL} /> },
                        { label: "Pelanggan terlayani", val: `${orders} orang`, icon: <Users size={16} color={TEAL} /> },
                        { label: "Transaksi terbesar", val: formatRp(trend && trend.length > 0 ? maxDay.total : 0), icon: <Gem size={16} color={TEAL} /> },
                    ].map((row, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: i < 3 ? 10 : 0, marginBottom: i < 3 ? 10 : 0, borderBottom: i < 3 ? "1px solid #F5F7F8" : "none" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                {row.icon}
                                <span style={{ fontSize: 13, color: "#666", fontWeight: 500 }}>{row.label}</span>
                            </div>
                            <span style={{ fontSize: 13, fontWeight: 700, color: "#111" }}>{row.val}</span>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
}

const pageStyle = { fontFamily: "'Plus Jakarta Sans', sans-serif", background: "#F5F7F8", minHeight: "100vh", maxWidth: "100%", margin: "0 auto", display: "flex", flexDirection: "column", position: "relative" };

const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
  .topbar { background: #fff; padding: 16px 20px 0; border-bottom: 1px solid #ECEEF0; position: sticky; top: 0; z-index: 20; }
  .topbar-row { display: flex; align-items: center; gap: 12px; }
  .topbar-title { font-size: 18px; font-weight: 700; color: #111; letter-spacing: -0.4px; }
  .back-btn { width: 40px; height: 40px; border-radius: 12px; background: #F5F7F8; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #333; flex-shrink: 0; transition: background 0.15s; }
  .back-btn:active { background: #ECEEF0; }
  .content { flex: 1; padding: 16px; padding-bottom: 40px; overflow-y: auto; }
  
  @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
  
  /* Print styling optimization */
  @media print {
    .topbar, .back-btn, .topbar-row > button { display: none !important; }
    .content { padding: 0 !important; }
    .auth-card { border: none !important; box-shadow: none !important; }
  }
`;
