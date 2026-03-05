import React, { useState, useEffect } from 'react';
import { Search, Calendar as CalendarIcon, ArrowLeft, Printer, Send } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { apiFetch } from '../../config';
import { haptic } from '../../utils/haptics';
import SafeImage from '../Common/SafeImage';

const TEAL = "var(--primary-brand)";
const TEAL_LIGHT = "var(--primary-light)";
const TEAL_DARK = "var(--primary-dark)";

const formatRp = (n) => "Rp" + new Intl.NumberFormat("id-ID").format(n);
const formatDate = (d) => {
    if (!d) return "-";
    return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
};
const formatTime = (d) => {
    if (!d) return "-";
    return new Date(d).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
};

const METHOD_ICON = { Tunai: "💵", QRIS: "📱", Transfer: "🏦", Cash: "💵" };
const METHOD_COLOR = {
    Tunai: { bg: "var(--status-green-light)", color: "var(--status-green)" },
    Cash: { bg: "var(--status-green-light)", color: "var(--status-green)" },
    QRIS: { bg: "var(--primary-light)", color: "var(--primary-brand)" },
    Transfer: { bg: "var(--status-blue-light)", color: "var(--status-blue)" }
};

function isToday(d) {
    const now = new Date();
    return new Date(d).toDateString() === now.toDateString();
}
function isYesterday(d) {
    const y = new Date(); y.setDate(y.getDate() - 1);
    return new Date(d).toDateString() === y.toDateString();
}
function dayLabel(key) {
    const d = new Date(key);
    if (isToday(d)) return "Hari Ini";
    if (isYesterday(d)) return "Kemarin";
    return key;
}

const FILTER_METHODS = ["Semua", "Tunai", "QRIS", "Transfer"];

// ── DETAIL SCREEN ─────────────────────────────────────────────────────────────
const DetailScreen = ({ trx, onBack, user }) => {
    const methodFormatted = trx.metode_pembayaran || 'Tunai';
    const mc = METHOD_COLOR[methodFormatted] || { bg: TEAL_LIGHT, color: TEAL };

    return (
        <div className="history-teal">
            <style>{globalCSS}</style>

            <div className="topbar" style={{ paddingBottom: 16 }}>
                <div className="topbar-row">
                    <button className="back-btn" onClick={onBack}>
                        <ArrowLeft size={20} />
                    </button>
                    <span className="topbar-title">Detail <span style={{ color: "var(--primary-brand)" }}>Transaksi</span></span>
                </div>
            </div>

            <div className="content">
                {/* Invoice header card */}
                <div className="invoice-header-card">
                    <div className="circle-bg-1" />
                    <div className="circle-bg-2" />
                    <div className="label-light">No. Invoice</div>
                    <div className="invoice-id">{trx.id_transaksi}</div>
                    <div className="badge-row">
                        <div className="badge-light">
                            📅 {formatDate(trx.tanggal_transaksi || trx.date)}
                        </div>
                        <div className="badge-light">
                            🕐 {formatTime(trx.tanggal_transaksi || trx.date)}
                        </div>
                        <div className="badge-method" style={{ background: mc.bg, color: mc.color }}>
                            {METHOD_ICON[methodFormatted] || "💰"} {methodFormatted}
                        </div>
                    </div>
                </div>

                {/* Items */}
                <div className="card-box">
                    <div className="card-header">
                        <span className="card-title">Daftar Item</span>
                        <span className="card-subtitle">{trx.details?.length || 0} produk</span>
                    </div>
                    {trx.details?.map((item, i) => (
                        <div key={i} className="item-row" style={{ borderBottom: i < (trx.details?.length || 0) - 1 ? "1px solid var(--border-light)" : "none" }}>
                            <div>
                                <div className="item-name">{item.barang?.nama_barang || 'Produk'}</div>
                                <div className="item-qty-price">{formatRp(item.harga)} × {item.qty}</div>
                            </div>
                            <div className="item-total">{formatRp(item.harga * item.qty)}</div>
                        </div>
                    ))}
                </div>

                {/* Payment summary */}
                <div className="card-box">
                    <div className="card-header">
                        <span className="card-title">Ringkasan Pembayaran</span>
                    </div>
                    <div className="summary-body">
                        <div className="summary-row">
                            <span className="summary-label">Subtotal</span>
                            <span className="summary-val">{formatRp(trx.total_harga)}</span>
                        </div>
                        <div className="summary-row">
                            <span className="summary-label">Metode Bayar</span>
                            <span className="summary-val">{METHOD_ICON[methodFormatted] || "💰"} {methodFormatted}</span>
                        </div>
                        {(methodFormatted === "Tunai" || methodFormatted === "Cash") && (
                            <>
                                <div className="summary-row">
                                    <span className="summary-label">Uang Diterima</span>
                                    <span className="summary-val">{formatRp(trx.uang_bayar)}</span>
                                </div>
                                <div className="summary-row">
                                    <span className="summary-label">Kembalian</span>
                                    <span className="summary-val highlight" style={{ color: "var(--primary-brand)" }}>{formatRp(trx.kembalian)}</span>
                                </div>
                            </>
                        )}
                        <div className="summary-total-row">
                            <span className="total-label">Total</span>
                            <span className="total-val" style={{ color: "var(--primary-brand)" }}>{formatRp(trx.total_harga)}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bottom-bar">
                <button className="btn-print" onClick={() => window.print()}>
                    <Printer size={18} /> Cetak Struk
                </button>
                <button className="btn-share">
                    <Send size={18} /> Kirim
                </button>
            </div>

            {/* Hidden Receipt for Printing */}
            <div className="print-receipt-only">
                <div className="r-header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'var(--primary-brand)', padding: '24px 16px', borderRadius: '16px 16px 0 0', marginBottom: 15, color: '#fff' }}>
                    {user?.logo_usaha && (
                        <SafeImage src={user.logo_usaha} alt="Logo" style={{ maxWidth: "100%", maxHeight: 60, marginBottom: 8, objectFit: "contain" }} />
                    )}
                    <div className="r-brand" style={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>{user?.nama_usaha || "Toko Kamu"}</div>
                    {user?.alamat_usaha && <div className="r-sub" style={{ fontSize: 13, marginTop: 2, color: "rgba(255,255,255,0.85)" }}>{user.alamat_usaha}</div>}
                    {user?.no_telepon_usaha && <div className="r-sub" style={{ fontSize: 13, marginTop: 2, color: "rgba(255,255,255,0.85)" }}>{user.no_telepon_usaha}</div>}

                    <div className="r-line" style={{ width: '40px', height: '2px', background: 'rgba(255,255,255,0.3)', margin: '12px auto', borderRadius: '4px' }} />
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>{formatDate(trx.tanggal_transaksi)} • {formatTime(trx.tanggal_transaksi)}</div>
                    <div style={{ fontSize: 12, marginTop: 4, color: "rgba(255,255,255,0.7)" }}>No: {trx.id_transaksi}</div>
                </div>
                <div className="r-line" />
                {trx.details?.map((item, i) => (
                    <div key={i} className="r-item">
                        <div>
                            <div>{item.barang?.nama_barang || 'Produk'}</div>
                            <div style={{ fontSize: 11, opacity: 0.7 }}>{formatRp(item.harga)} x {item.qty}</div>
                        </div>
                        <div>{formatRp(item.harga * item.qty)}</div>
                    </div>
                ))}
                <div className="r-total-section">
                    <div className="r-item">
                        <span>TOTAL</span>
                        <span>{formatRp(trx.total_harga)}</span>
                    </div>
                    <div className="r-item" style={{ fontWeight: 400, marginTop: 4 }}>
                        <span>Metode</span>
                        <span>{methodFormatted}</span>
                    </div>
                </div>
                <div className="r-footer">
                    <div>Terima Kasih Telah Berbelanja!</div>
                    <div>{new Date().toLocaleString()}</div>
                </div>
            </div>
        </div>
    );
};

// ── MAIN LIST SCREEN ──────────────────────────────────────────────────────────
const History = () => {
    const {
        user,
        ordersData,
        loadingOrders,
        refreshOrders,
        ordersPagination,
        fetchMoreOrders
    } = useData();
    const [search, setSearch] = useState("");
    const [filterMethod, setFilterMethod] = useState("Semua");
    const [selectedMonth, setSelectedMonth] = useState("");
    const [selected, setSelected] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        const filters = selectedMonth ? { month: selectedMonth } : {};
        refreshOrders(true, filters);
    }, [refreshOrders, selectedMonth]);

    const handleViewDetail = async (trx) => {
        haptic.tap();
        if (isProcessing) return;
        setIsProcessing(true);
        try {
            const res = await apiFetch(`/transaksi/${trx.id_transaksi}`);
            if (res.ok) {
                const data = await res.json();
                if (data && data.details) {
                    setSelected(data);
                } else {
                    alert("Data tidak lengkap.");
                }
            } else {
                throw new Error("Gagal mengambil detail");
            }
        } catch (err) {
            console.error(err);
            alert("Error: " + err.message);
        } finally {
            setIsProcessing(false);
        }
    };

    if (selected) return <DetailScreen trx={selected} user={user} onBack={() => setSelected(null)} />;

    const orders = ordersData || [];
    const filtered = orders.filter((t) => {
        const methodFormatted = t.metode_pembayaran || 'Tunai';
        const matchMethod = filterMethod === "Semua" || methodFormatted === filterMethod;
        const matchSearch = String(t.id_transaksi).toLowerCase().includes(search.toLowerCase());
        return matchMethod && matchSearch;
    });

    const totalOmzet = filtered.reduce((s, t) => s + Number(t.total_harga || 0), 0);

    // Grouping logic
    const grouped = {};
    filtered.forEach((t) => {
        const key = formatDate(t.tanggal_transaksi || t.date);
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(t);
    });

    return (
        <div className="history-teal">
            <style>{globalCSS}</style>

            <div className="topbar">
                <div className="topbar-row" style={{ marginBottom: 14 }}>
                    <span className="topbar-title">Riwayat <span style={{ color: "var(--primary-brand)" }}>Transaksi</span></span>
                </div>

                <div className="search-wrap">
                    <span className="search-ico"><Search size={16} color="var(--text-tertiary)" /></span>
                    <input
                        className="search-input"
                        placeholder="Cari No. Invoice..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 14 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)" }}>Bulan:</span>
                    <input
                        type="month"
                        style={{ padding: "8px 12px", border: "1.5px solid var(--border-strong)", borderRadius: 10, outline: "none", fontFamily: "inherit", fontSize: 13, color: "var(--text-primary)", background: "var(--bg-surface-alt)", cursor: "pointer" }}
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                    />
                    {selectedMonth && (
                        <button
                            onClick={() => setSelectedMonth("")}
                            style={{ padding: "8px 12px", borderRadius: 10, border: "none", background: "var(--bg-app-alt)", color: "var(--text-tertiary)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                        >
                            ✕
                        </button>
                    )}
                </div>

                <div className="filter-scroll">
                    {FILTER_METHODS.map((m) => {
                        const isActive = filterMethod === m;
                        const mc = m !== "Semua" ? (METHOD_COLOR[m] || METHOD_COLOR['Tunai']) : null;
                        return (
                            <button key={m} onClick={() => setFilterMethod(m)} className={`filter-pill ${isActive ? 'active' : ''}`}
                                style={isActive && mc ? { background: mc.bg, color: mc.color, borderColor: mc.color } : {}}>
                                {m !== "Semua" && (METHOD_ICON[m] || "💰")} {m}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="content">
                <div className="summary-grid">
                    <div className="stat-card">
                        <div className="stat-label">Total Transaksi</div>
                        <div className="stat-val">{(filtered || []).length}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Total Omzet</div>
                        <div className="stat-val omzet">{formatRp(totalOmzet)}</div>
                    </div>
                </div>

                {loadingOrders && (ordersData?.length || 0) === 0 ? (
                    <div className="skeleton-list">
                        {[1, 2, 3, 4].map(i => <div key={i} className="skeleton-card" />)}
                    </div>
                ) : Object.keys(grouped).length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">🔍</div>
                        <div className="empty-text">Transaksi tidak ditemukan</div>
                    </div>
                ) : Object.entries(grouped).map(([dateKey, list]) => (
                    <div key={dateKey} className="date-group">
                        <div className="date-header">
                            <div className="date-label">
                                {isToday(list[0].tanggal_transaksi) && "🟢 "}{dayLabel(dateKey)}
                            </div>
                            <div className="date-line" />
                            <div className="date-amount">
                                {formatRp(list.reduce((s, t) => s + Number(t.total_harga || 0), 0))}
                            </div>
                        </div>

                        {list.map((t) => {
                            const methodFormatted = t.metode_pembayaran || 'Tunai';
                            const mc = METHOD_COLOR[methodFormatted] || METHOD_COLOR['Tunai'];
                            return (
                                <div key={t.id_transaksi} className="trx-card" onClick={() => handleViewDetail(t)}>
                                    <div className="trx-method-ico" style={{ background: mc.bg }}>
                                        {METHOD_ICON[methodFormatted] || "💰"}
                                    </div>

                                    <div className="trx-info">
                                        <div className="trx-top-row">
                                            <div className="trx-id">{t.id_transaksi}</div>
                                            <div className="trx-total">{formatRp(t.total_harga)}</div>
                                        </div>
                                        <div className="trx-bottom-row">
                                            <div className="trx-left">
                                                <span className="trx-method-badge" style={{ background: mc.bg, color: mc.color }}>{methodFormatted}</span>
                                                <span className="trx-time">{formatTime(t.tanggal_transaksi || t.date)}</span>
                                            </div>
                                            <div className="trx-arrow">›</div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ))}

                {ordersPagination?.next_page_url && (
                    <div style={{ marginTop: '24px', textAlign: 'center' }}>
                        <button
                            onClick={fetchMoreOrders}
                            disabled={loadingOrders}
                            className="btn-secondary"
                            style={{ width: 'auto', padding: '10px 24px' }}
                        >
                            {loadingOrders ? 'Memuat...' : 'Muat Lebih Banyak'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
  
  @media print {
    body, html, #root, .app-main-wrapper, .app-layout, .main-content, .view-wrapper, .history-teal {
      display: block !important;
      height: auto !important;
      min-height: 0 !important;
      padding: 0 !important;
      margin: 0 !important;
      overflow: visible !important;
    }
    .desktop-sidebar, .sidebar-teal, .sidebar-overlay, .mobile-top-bar-teal, .topbar, .content, .bottom-bar { display: none !important; }
    .print-receipt-only { 
      position: relative !important; 
      display: block !important;
      width: 58mm !important; 
      margin: 0 auto !important; 
      padding: 0 !important; 
      background: #fff !important;
      color: #000 !important;
    }
    .r-header { background: var(--primary-brand) !important; color: #fff !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .r-brand { color: #fff !important; }
    .r-sub { color: rgba(255,255,255,0.85) !important; }
    .r-line { background: rgba(255,255,255,0.3) !important; }
  }

  .print-receipt-only { display: none; font-family: 'Plus Jakarta Sans', sans-serif; }
  .r-header { text-align: center; margin-bottom: 15px; }
  .r-brand { font-size: 20px; font-weight: 800; }
  .r-sub { font-size: 12px; opacity: 0.7; }
  .r-line { width: 40px; height: 2px; background: rgba(255,255,255,0.3); margin: 16px auto; border-radius: 4px; }
  .r-item { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 5px; }
  .r-total-section { margin-top: 10px; font-weight: 700; border-top: 1px dashed #000; padding-top: 10px; }
  .r-footer { text-align: center; margin-top: 20px; font-size: 11px; opacity: 0.6; }

  .history-teal { 
    font-family: 'Plus Jakarta Sans', sans-serif; 
    background: var(--bg-app); 
    min-height: 100vh; 
    width: 100%;
    display: flex; 
    flex-direction: column; 
    position: relative; 
    color: var(--text-primary);
  }

  .topbar { background: var(--bg-surface); padding: 12px 20px 0; border-bottom: 1px solid var(--border-light); position: sticky; top: 0; z-index: 100; }
  .topbar-row { display: flex; align-items: center; gap: 12px; }
  .topbar-title { font-size: 18px; font-weight: 800; color: var(--text-primary); letter-spacing: -0.4px; }
  
  .back-btn { width: 38px; height: 38px; border-radius: 10px; background: var(--bg-app-alt); border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--text-primary); transition: all 0.2s; }
  .back-btn:active { transform: scale(0.9); background: var(--border-light); }

  .search-wrap { position: relative; margin: 14px 0; }
  .search-input { width: 100%; padding: 10px 16px 10px 40px; border: 1.5px solid var(--border-strong); border-radius: 12px; font-size: 14px; background: var(--bg-surface-alt); color: var(--text-primary); outline: none; transition: all 0.2s; font-family: inherit; }
  .search-input:focus { border-color: var(--primary-brand); background: var(--bg-surface); }
  .search-ico { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); display: flex; }

  .filter-scroll { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 12px; scrollbar-width: none; }
  .filter-scroll::-webkit-scrollbar { display: none; }
  .filter-pill { flex-shrink: 0; padding: 6px 14px; border-radius: 20px; border: 1.5px solid var(--border-strong); background: var(--bg-surface); color: var(--text-tertiary); font-size: 11px; font-weight: 700; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 6px; white-space: nowrap; font-family: inherit; }
  .filter-pill.active { border-color: var(--text-primary); background: var(--text-primary); color: var(--bg-surface); }

  .content { flex: 1; padding: 16px; padding-bottom: 100px; }

  .summary-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 18px; }
  .stat-card { background: var(--bg-surface); border-radius: 16px; padding: 12px 14px; border: 1.5px solid var(--border-light); }
  .stat-label { font-size: 10px; color: var(--text-tertiary); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
  .stat-val { font-size: 20px; font-weight: 800; color: var(--text-primary); letter-spacing: -0.5px; }
  .stat-val.omzet { color: var(--primary-brand); font-size: 15px; margin-top: 2px; }

  .date-group { margin-bottom: 8px; }
  .date-header { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; margin-top: 6px; }
  .date-label { font-size: 12px; font-weight: 700; color: var(--text-secondary); white-space: nowrap; }
  .date-line { flex: 1; height: 1.5px; background: var(--border-light); border-radius: 2px; }
  .date-amount { font-size: 11px; color: var(--text-tertiary); font-weight: 700; white-space: nowrap; }

  .trx-card { background: var(--bg-surface); border-radius: 18px; padding: 14px; margin-bottom: 10px; border: 1.5px solid var(--border-light); cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 12px; }
  .trx-card:active { transform: scale(0.97); border-color: var(--primary-brand); }
  
  .trx-method-ico { width: 46px; height: 46px; border-radius: 14px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 22px; }
  
  .trx-info { flex: 1; min-width: 0; }
  .trx-top-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; }
  .trx-id { font-size: 13px; font-weight: 700; color: var(--text-primary); font-family: monospace; }
  .trx-total { font-size: 15px; font-weight: 800; color: var(--text-primary); letter-spacing: -0.3px; }
  
  .trx-bottom-row { display: flex; align-items: center; justify-content: space-between; }
  .trx-left { display: flex; align-items: center; gap: 8px; }
  .trx-method-badge { font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 6px; }
  .trx-time { font-size: 11px; color: var(--text-tertiary); font-weight: 500; }
  .trx-arrow { font-size: 18px; color: var(--border-strong); font-weight: 400; }

  /* Detail Screen Styles */
  .invoice-header-card { background: var(--primary-brand); border-radius: 18px; padding: 20px; margin-bottom: 16px; position: relative; overflow: hidden; box-shadow: 0 8px 24px rgba(74, 155, 173, 0.2); }
  .circle-bg-1 { position: absolute; top: -30px; right: -30px; width: 110px; height: 110px; border-radius: 50%; background: rgba(255,255,255,0.08); }
  .circle-bg-2 { position: absolute; bottom: -20px; left: 20px; width: 80px; height: 80px; border-radius: 50%; background: rgba(255,255,255,0.05); }
  .label-light { font-size: 11px; color: rgba(255,255,255,0.65); font-weight: 700; text-transform: uppercase; margin-bottom: 6px; }
  .invoice-id { font-size: 20px; font-weight: 800; color: #fff; letter-spacing: -0.3px; font-family: monospace; margin-bottom: 14px; }
  .badge-row { display: flex; gap: 8px; flex-wrap: wrap; }
  .badge-light { background: rgba(255,255,255,0.15); border-radius: 8px; padding: 4px 10px; font-size: 10px; color: #fff; font-weight: 700; }
  .badge-method { border-radius: 8px; padding: 4px 10px; font-size: 10px; font-weight: 800; }

  .card-box { background: var(--bg-surface); border-radius: 18px; border: 1.5px solid var(--border-light); overflow: hidden; margin-bottom: 14px; }
  .card-header { padding: 14px 16px; border-bottom: 1px solid var(--border-light); display: flex; justify-content: space-between; align-items: center; }
  .card-title { font-size: 13px; font-weight: 800; color: var(--text-primary); }
  .card-subtitle { font-size: 11px; color: var(--text-tertiary); font-weight: 600; }

  .item-row { padding: 13px 16px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-light); }
  .item-name { font-size: 14px; font-weight: 700; color: var(--text-primary); margin-bottom: 2px; }
  .item-qty-price { font-size: 12px; color: var(--text-tertiary); font-weight: 600; }
  .item-total { font-size: 14px; font-weight: 800; color: var(--text-primary); }

  .summary-body { padding: 16px; }
  .summary-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
  .summary-label { font-size: 13px; color: var(--text-secondary); font-weight: 600; }
  .summary-val { font-size: 13px; font-weight: 700; color: var(--text-primary); }
  
  .summary-total-row { margin-top: 14px; padding-top: 14px; border-top: 1.5px dashed var(--border-light); display: flex; justify-content: space-between; align-items: center; }
  .total-label { font-size: 15px; font-weight: 800; color: var(--text-primary); }
  .total-val { font-size: 22px; font-weight: 800; color: var(--primary-brand); letter-spacing: -0.5px; }

  .bottom-bar { position: fixed; bottom: 0; left: 0; width: 100%; background: var(--bg-surface); border-top: 1px solid var(--border-light); padding: 12px 20px 32px; display: flex; gap: 10px; z-index: 100; box-shadow: var(--shadow-lg); }
  .btn-print { flex: 1; padding: 13px; border-radius: 14px; border: 1.5px solid var(--primary-brand); background: var(--primary-light); color: var(--primary-brand); font-size: 14px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; font-family: inherit; }
  .btn-share { flex: 1; padding: 13px; border-radius: 14px; border: 1.5px solid var(--border-light); background: var(--bg-app-alt); color: var(--text-secondary); font-size: 14px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; font-family: inherit; }

  .empty-state { text-align: center; padding: 80px 20px; }
  .empty-icon { font-size: 48px; margin-bottom: 12px; }
  .empty-text { font-size: 14px; font-weight: 700; color: var(--text-tertiary); }

  @keyframes skeleton { 0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; } }
  .skeleton-card { height: 80px; background: var(--bg-surface); border-radius: 18px; border: 1.5px solid var(--border-light); margin-bottom: 10px; animation: skeleton 1.5s infinite; }
`;

export default History;
