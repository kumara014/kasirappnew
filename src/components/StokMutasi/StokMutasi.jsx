import React, { useState, useEffect } from 'react';
import { Search, ArrowLeft, ArrowUpRight, ArrowDownLeft, Package, Trash2, Edit3, AlertTriangle, CheckCircle2, MoreHorizontal, Filter, RefreshCcw, Plus, Minus } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { apiFetch } from '../../config';
import { useNotification } from '../../context/NotificationContext';
import { haptic } from '../../utils/haptics';
import { motion, AnimatePresence } from 'framer-motion';

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

const MUTATION_TYPES = {
    masuk: { label: "Stok Masuk", color: "var(--status-green)", bg: "var(--status-green-light)", icon: "📥" },
    keluar: { label: "Stok Keluar", color: "var(--status-red)", bg: "var(--status-red-light)", icon: "📤" },
    rusak: { label: "Barang Rusak", color: "var(--status-blue)", bg: "var(--status-blue-light)", icon: "🗑️" },
};

function isToday(d) {
    return new Date(d).toDateString() === new Date().toDateString();
}
function isYesterday(d) {
    const y = new Date(); y.setDate(y.getDate() - 1);
    return new Date(d).toDateString() === y.toDateString();
}
function dayLabel(d) {
    if (isToday(d)) return "Hari Ini";
    if (isYesterday(d)) return "Kemarin";
    return formatDate(d);
}

const FILTER_TYPES = ["Semua", "masuk", "keluar", "rusak"];

// ── SEARCHABLE PICKER ────────────────────────────────────────────────────────
const SearchableProductPicker = ({ products, value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const productList = products || [];
    const selected = productList.find(p => String(p.id_barang) === String(value));

    const filtered = productList.filter(p =>
        p.nama_barang.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="searchable-picker-container">
            <div className={`picker-trigger ${isOpen ? 'active' : ''}`} onClick={() => setIsOpen(!isOpen)} style={{ background: "var(--bg-surface-alt)", borderColor: "var(--border-strong)" }}>
                <div className="trigger-val">
                    {selected ? (
                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                            <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{selected.nama_barang}</span>
                            <span style={{ color: "var(--primary-brand)", fontSize: '13px' }}>Stok: {selected.stok}</span>
                        </div>
                    ) : (
                        <span style={{ color: 'var(--text-tertiary)' }}>-- Pilih produk --</span>
                    )}
                </div>
                <div className="trigger-arrow" style={{ color: "var(--text-tertiary)" }}>▼</div>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div className="picker-overlay" onClick={() => setIsOpen(false)} />
                        <motion.div
                            className="picker-dropdown"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                        >
                            <div className="picker-search-wrap" style={{ borderBottom: "1px solid var(--border-light)" }}>
                                <Search size={16} color="var(--text-tertiary)" className="p-search-ico" />
                                <input
                                    className="p-search-input"
                                    placeholder="Cari nama produk..."
                                    autoFocus
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    style={{ background: "var(--bg-app-alt)", borderColor: "var(--border-strong)", color: "var(--text-primary)" }}
                                />
                            </div>
                            <div className="picker-list">
                                {(filtered || []).length === 0 ? (
                                    <div className="picker-empty">Produk tidak ditemukan</div>
                                ) : (
                                    filtered.map(p => (
                                        <div
                                            key={p.id_barang}
                                            className={`picker-item ${String(p.id_barang) === String(value) ? 'selected' : ''}`}
                                            onClick={() => {
                                                onChange(p.id_barang);
                                                setIsOpen(false);
                                                setSearch("");
                                            }}
                                        >
                                            <div className="p-item-name">{p.nama_barang}</div>
                                            <div className="p-item-stock">Stok: {p.stok}</div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

// ── ADD MUTATION FORM ─────────────────────────────────────────────────────────
const AddMutationForm = ({ products, onBack, onSave, isProcessing }) => {
    const [form, setForm] = useState({ id_barang: "", jenis: "masuk", jumlah: "", keterangan: "" });
    const isOut = ["keluar", "rusak"].includes(form.jenis);
    const isNeutral = form.jenis === "koreksi";
    const selectedProduct = (products || []).find((p) => String(p.id_barang) === String(form.id_barang));

    const canSave = form.id_barang && form.jumlah && Number(form.jumlah) > 0;

    const handleSave = () => {
        if (!canSave) return;
        onSave(form);
    };

    return (
        <div className="stok-mutasi-teal">
            <style>{globalCSS}</style>
            <div className="topbar" style={{ paddingBottom: 16 }}>
                <div className="topbar-row">
                    <button className="back-btn" onClick={onBack}>
                        <ArrowLeft size={20} />
                    </button>
                    <span className="topbar-title">Tambah <span style={{ color: "var(--primary-brand)" }}>Mutasi</span></span>
                </div>
            </div>

            <div className="content">
                {/* Tipe mutasi */}
                <div className="form-card" style={{ background: "var(--bg-surface)", borderColor: "var(--border-light)" }}>
                    <div className="input-label" style={{ color: "var(--text-secondary)" }}>Jenis Mutasi</div>
                    <div className="mutation-type-grid">
                        {Object.entries(MUTATION_TYPES).map(([key, val]) => {
                            const isActive = form.jenis === key;
                            return (
                                <button key={key} onClick={() => setForm({ ...form, jenis: key })}
                                    className={`type-btn ${isActive ? 'active' : ''}`}
                                    style={isActive ? { borderColor: val.color, background: val.bg, color: val.color } : {}}>
                                    <span style={{ fontSize: 18 }}>{val.icon}</span>
                                    <span>{val.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Produk */}
                <div className="form-card" style={{ background: "var(--bg-surface)", borderColor: "var(--border-light)" }}>
                    <div className="input-label" style={{ color: "var(--text-secondary)" }}>Pilih Produk</div>
                    <SearchableProductPicker
                        products={products}
                        value={form.id_barang}
                        onChange={(val) => setForm({ ...form, id_barang: val })}
                    />

                    {selectedProduct && (
                        <div className="stock-info-strip" style={{ background: "var(--primary-light)" }}>
                            <span className="stock-info-label" style={{ color: "var(--text-secondary)" }}>Stok saat ini</span>
                            <span className="stock-info-val" style={{ color: "var(--primary-brand)" }}>{selectedProduct.stok} pcs</span>
                        </div>
                    )}
                </div>

                {/* Jumlah & Catatan */}
                <div className="form-card" style={{ background: "var(--bg-surface)", borderColor: "var(--border-light)" }}>
                    <div className="input-label" style={{ color: "var(--text-secondary)" }}>Jumlah {isNeutral ? "(Update Stok)" : isOut ? "Keluar" : "Masuk"}</div>
                    <div className="qty-input-row" style={{ marginBottom: 16 }}>
                        <button onClick={() => setForm((f) => ({ ...f, jumlah: String(Math.max(0, Number(f.jumlah) - 1)) }))} className="qty-adjust-btn minus" style={{ background: "var(--bg-app-alt)", borderColor: "var(--border-light)", color: "var(--text-secondary)" }}><Minus size={24} /></button>
                        <input className="form-input qty-box" type="number" min="0" placeholder="0"
                            value={form.jumlah} onChange={(e) => setForm({ ...form, jumlah: e.target.value })} style={{ background: "var(--bg-surface-alt)", color: "var(--text-primary)", borderColor: "var(--border-strong)" }} />
                        <button onClick={() => setForm((f) => ({ ...f, jumlah: String(Number(f.jumlah) + 1) }))} className="qty-adjust-btn plus" style={{ background: "var(--primary-brand)", color: "#fff" }}><Plus size={24} /></button>
                    </div>

                    {/* Stok preview */}
                    {selectedProduct && form.jumlah && Number(form.jumlah) > 0 && (
                        <div className="stock-preview-box" style={{ background: "var(--bg-app-alt)" }}>
                            <div className="preview-item">
                                <div className="p-label" style={{ color: "var(--text-tertiary)" }}>Sebelum</div>
                                <div className="p-val old" style={{ color: "var(--text-primary)" }}>{selectedProduct.stok}</div>
                            </div>
                            <div className="preview-arrow">
                                {isOut ? <ArrowDownLeft size={20} color="var(--status-red)" /> : <ArrowUpRight size={20} color="var(--status-green)" />}
                            </div>
                            <div className="preview-item">
                                <div className="p-label" style={{ color: "var(--text-tertiary)" }}>Sesudah</div>
                                <div className={`p-val new ${isOut ? 'red' : 'green'}`} style={{ color: isOut ? "var(--status-red)" : "var(--status-green)" }}>
                                    {isNeutral ? Number(form.jumlah) : (isOut ? Number(selectedProduct.stok) - Number(form.jumlah) : Number(selectedProduct.stok) + Number(form.jumlah))}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="input-label" style={{ color: "var(--text-secondary)" }}>Catatan</div>
                    <input className="form-input" placeholder="Contoh: Restock, Barang pecah, dll..." value={form.keterangan} onChange={(e) => setForm({ ...form, keterangan: e.target.value })} style={{ marginBottom: 0, background: "var(--bg-surface-alt)", color: "var(--text-primary)", borderColor: "var(--border-strong)" }} />
                </div>
            </div>

            <div className="bottom-bar" style={{ background: "var(--bg-surface)", borderTop: "1px solid var(--border-light)" }}>
                <button onClick={onBack} className="btn-secondary" style={{ background: "var(--bg-app-alt)", borderColor: "var(--border-light)", color: "var(--text-secondary)" }}>Batal</button>
                <button onClick={handleSave} disabled={!canSave || isProcessing} className="btn-primary" style={{ background: "var(--primary-brand)", color: "#fff" }}>
                    {isProcessing ? 'Menyimpan...' : '💾 Simpan Mutasi'}
                </button>
            </div>
        </div>
    );
};

// ── MAIN LIST ─────────────────────────────────────────────────────────────────
const StokMutasi = () => {
    const { productsData, refreshProducts } = useData();
    const { notify } = useNotification();
    const [mutations, setMutations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState("Semua");
    const [search, setSearch] = useState("");
    const [screen, setScreen] = useState("list"); // list | form
    const [isProcessing, setIsProcessing] = useState(false);

    const fetchMutations = async () => {
        setLoading(true);
        try {
            const res = await apiFetch('/stok-mutasi');
            if (res.ok) {
                const data = await res.json();
                setMutations(data);
            }
        } catch (err) {
            console.error("Error fetching mutations:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMutations();
    }, []);

    const handleSaveMutation = async (formData) => {
        haptic.tap();
        if (isProcessing) return;
        setIsProcessing(true);

        try {
            const res = await apiFetch('/stok-mutasi', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                haptic.success();
                notify("Mutasi stok berhasil disimpan", "success");
                setScreen("list");
                fetchMutations();
                refreshProducts(true);
            } else {
                const data = await res.json();
                throw new Error(data.message || "Gagal menyimpan mutasi");
            }
        } catch (err) {
            haptic.error();
            notify("Error: " + err.message, "error");
        } finally {
            setIsProcessing(false);
        }
    };

    if (screen === "form") {
        return <AddMutationForm products={productsData} onBack={() => setScreen("list")} onSave={handleSaveMutation} isProcessing={isProcessing} />;
    }

    const processedMutations = mutations.map(m => {
        let realType = m.jenis;
        const ket = m.keterangan || "";
        if (ket.includes("[RUSAK]")) realType = "rusak";
        if (ket.includes("[PENJUALAN]")) realType = "penjualan";
        return { ...m, realType };
    });

    const filtered = processedMutations.filter((m) => {
        const matchType = filterType === "Semua" || m.realType === filterType;
        const productName = m.barang?.nama_barang || "";
        const matchSearch = productName.toLowerCase().includes(search.toLowerCase()) || (m.keterangan || "").toLowerCase().includes(search.toLowerCase());
        return matchType && matchSearch;
    });

    const totalMasuk = filtered.filter((m) => m.realType === 'masuk').reduce((s, m) => s + Number(m.jumlah), 0);
    const totalKeluar = filtered.filter((m) => ['keluar', 'rusak', 'penjualan'].includes(m.realType)).reduce((s, m) => s + Math.abs(Number(m.jumlah)), 0);

    // Grouping
    const grouped = {};
    filtered.forEach((m) => {
        const k = formatDate(m.created_at);
        if (!grouped[k]) grouped[k] = [];
        grouped[k].push(m);
    });

    return (
        <div className="stok-mutasi-teal">
            <style>{globalCSS}</style>

            <div className="topbar">
                <div className="topbar-row" style={{ marginBottom: 14 }}>
                    <span className="topbar-title">Mutasi <span style={{ color: "var(--primary-brand)" }}>Stok</span></span>
                    <button onClick={() => setScreen("form")} className="btn-add-teal"><Plus size={18} /> Tambah</button>
                </div>

                <div className="search-wrap">
                    <span className="search-ico"><Search size={16} color="#bbb" /></span>
                    <input className="search-input" placeholder="Cari barang atau catatan..." value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>

                <div className="filter-scroll">
                    {FILTER_TYPES.map((t) => {
                        const isActive = filterType === t;
                        const mt = t !== "Semua" ? MUTATION_TYPES[t] : null;
                        return (
                            <button key={t} onClick={() => setFilterType(t)} className={`filter-pill ${isActive ? 'active' : ''}`}
                                style={isActive && mt ? { borderColor: mt.color, background: mt.bg, color: mt.color } : {}}>
                                {t === "Semua" ? "Semua" : `${mt.icon} ${mt.label}`}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="content">
                <div className="summary-grid">
                    <div className="stat-card">
                        <div className="stat-label">Total Mutasi</div>
                        <div className="stat-val">{(filtered || []).length}</div>
                    </div>
                    <div className="stat-card green">
                        <div className="stat-label">📥 Masuk</div>
                        <div className="stat-val">+{totalMasuk}</div>
                    </div>
                    <div className="stat-card red">
                        <div className="stat-label">📤 Keluar</div>
                        <div className="stat-val">-{totalKeluar}</div>
                    </div>
                </div>

                {loading && (mutations?.length || 0) === 0 ? (
                    <div className="skeleton-list">
                        {[1, 2, 3, 4].map(i => <div key={i} className="skeleton-card" />)}
                    </div>
                ) : Object.keys(grouped).length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📭</div>
                        <div className="empty-text">Tidak ada data mutasi</div>
                    </div>
                ) : Object.entries(grouped).map(([dateKey, list]) => (
                    <div key={dateKey} className="date-group">
                        <div className="date-header">
                            <div className="date-label">
                                {isToday(list[0].created_at) && "🟢 "}{dayLabel(list[0].created_at)}
                            </div>
                            <div className="date-line" />
                            <div className="date-count">{(list || []).length} mutasi</div>
                        </div>

                        {list.map((m) => {
                            const type = m.realType;
                            const ket = m.keterangan || "";
                            const mt = MUTATION_TYPES[type] || { label: type, color: '#333', bg: '#eee', icon: '📦' };
                            const isPositive = type === 'masuk';
                            const cleanKeterangan = ket.replace(/\[(RUSAK|PENJUALAN|KOREKSI)\]\s*/, "");

                            return (
                                <div key={m.id_mutasi} className="mutation-card">
                                    <div className="mut-ico-box" style={{ background: mt.bg, color: mt.color }}>
                                        {mt.icon}
                                    </div>
                                    <div className="mut-info">
                                        <div className="mut-top">
                                            <div className="mut-name">{m.barang?.nama_barang || "Produk Terhapus"}</div>
                                            <div className={`mut-qty ${isPositive ? 'green' : 'red'}`}>
                                                {isPositive ? "+" : "-"}{Math.abs(m.jumlah)}
                                            </div>
                                        </div>
                                        <div className="mut-mid">
                                            <span className="mut-badge" style={{ background: mt.bg, color: mt.color }}>{mt.label}</span>
                                            <span className="mut-time">• {formatTime(m.created_at)}</span>
                                        </div>
                                        {cleanKeterangan && cleanKeterangan !== "-" && (
                                            <div className="mut-note">📝 {cleanKeterangan}</div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>

            <button onClick={() => setScreen("form")} className="fab-btn"><Plus size={32} /></button>
        </div>
    );
};

const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
  
  .stok-mutasi-teal { 
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
  .topbar-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
  .topbar-title { font-size: 18px; font-weight: 800; color: var(--text-primary); letter-spacing: -0.4px; }
  
  .back-btn { width: 38px; height: 38px; border-radius: 10px; background: var(--bg-app-alt); border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--text-primary); transition: all 0.2s; }
  
  .btn-add-teal { padding: 8px 16px; border-radius: 12px; background: var(--primary-brand); border: none; color: #fff; font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 6px; }
  .btn-add-teal:active { transform: scale(0.95); }

  .search-wrap { position: relative; margin: 14px 0; }
  .search-input { width: 100%; padding: 10px 16px 10px 40px; border: 1.5px solid var(--border-strong); border-radius: 12px; font-size: 14px; background: var(--bg-surface-alt); color: var(--text-primary); outline: none; transition: all 0.2s; font-family: inherit; }
  .search-input:focus { border-color: var(--primary-brand); background: var(--bg-surface); }
  .search-ico { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); display: flex; }

  .filter-scroll { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 12px; scrollbar-width: none; }
  .filter-scroll::-webkit-scrollbar { display: none; }
  .filter-pill { flex-shrink: 0; padding: 6px 14px; border-radius: 20px; border: 1.5px solid var(--border-strong); background: var(--bg-surface); color: var(--text-tertiary); font-size: 11px; font-weight: 700; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 6px; white-space: nowrap; font-family: inherit; }
  .filter-pill.active { border-color: var(--text-primary); background: var(--text-primary); color: var(--bg-surface); }

  .content { flex: 1; padding: 16px; padding-bottom: 100px; }

  .summary-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 18px; }
  .stat-card { background: var(--bg-surface); border-radius: 14px; padding: 12px 10px; border: 1.5px solid var(--border-light); }
  .stat-card.green { background: var(--status-green-light); border-color: var(--status-green); opacity: 0.9; }
  .stat-card.red { background: var(--status-red-light); border-color: var(--status-red); opacity: 0.9; }
  .stat-label { font-size: 9px; color: var(--text-tertiary); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
  .stat-card.green .stat-label { color: var(--status-green); }
  .stat-card.red .stat-label { color: var(--status-red); }
  .stat-val { font-size: 18px; font-weight: 800; color: var(--text-primary); }
  .stat-card.green .stat-val { color: var(--status-green); }
  .stat-card.red .stat-val { color: var(--status-red); }

  .date-group { margin-bottom: 6px; }
  .date-header { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; margin-top: 6px; }
  .date-label { font-size: 12px; font-weight: 700; color: var(--text-secondary); white-space: nowrap; }
  .date-line { flex: 1; height: 1.5px; background: var(--border-light); border-radius: 2px; }
  .date-count { font-size: 11px; color: var(--text-tertiary); font-weight: 700; white-space: nowrap; }

  .mutation-card { background: var(--bg-surface); border-radius: 18px; padding: 14px; margin-bottom: 10px; border: 1.5px solid var(--border-light); display: flex; gap: 12px; align-items: flex-start; }
  .mut-ico-box { width: 46px; height: 46px; border-radius: 14px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 22px; }
  
  .mut-info { flex: 1; min-width: 0; }
  .mut-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px; }
  .mut-name { font-size: 14px; font-weight: 700; color: var(--text-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; margin-right: 8px; }
  .mut-qty { font-size: 16px; font-weight: 800; }
  .mut-qty.green { color: var(--status-green); }
  .mut-qty.red { color: var(--status-red); }

  .mut-mid { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
  .mut-badge { font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 6px; }
  .mut-time { font-size: 11px; color: var(--text-tertiary); font-weight: 500; }
  .mut-note { font-size: 11px; color: var(--text-tertiary); font-style: italic; opacity: 0.8; }

  .fab-btn { position: fixed; bottom: 24px; right: 26px; width: 62px; height: 62px; border-radius: 20px; background: var(--primary-brand); border: none; color: #fff; display: flex; align-items: center; justify-content: center; box-shadow: 0 12px 30px rgba(74, 155, 173, 0.4); cursor: pointer; z-index: 100; transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
  .fab-btn:active { transform: scale(0.85); box-shadow: 0 4px 12px rgba(74, 155, 173, 0.3); }

  /* Form Styles */
  .form-card { background: var(--bg-surface); border-radius: 20px; padding: 18px; border: 1.5px solid var(--border-light); margin-bottom: 14px; }
  .input-label { font-size: 11px; font-weight: 800; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 10px; }
  .form-input { width: 100%; padding: 12px 14px; border: 1.5px solid var(--border-strong); border-radius: 12px; font-size: 14px; outline: none; background: var(--bg-surface-alt); color: var(--text-primary); margin-bottom: 16px; font-family: inherit; transition: all 0.2s; }
  .form-input:focus { border-color: var(--primary-brand); background: var(--bg-surface); }
  
  .mutation-type-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .type-btn { padding: 10px; border-radius: 12px; border: 1.5px solid var(--border-strong); background: var(--bg-surface-alt); color: var(--text-secondary); font-size: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all 0.2s; font-family: inherit; }
  .type-btn.active { border-width: 1.5px; }

  .stock-info-strip { background: var(--primary-light); border-radius: 10px; padding: 10px 14px; display: flex; justify-content: space-between; align-items: center; margin-top: -6px; }
  .stock-info-label { font-size: 13px; color: var(--text-secondary); font-weight: 600; }
  .stock-info-val { font-size: 16px; font-weight: 800; color: var(--primary-brand); }

  .qty-input-row { display: flex; align-items: center; gap: 12px; }
  .qty-adjust-btn { width: 48px; height: 48px; border-radius: 14px; display: flex; align-items: center; justify-content: center; cursor: pointer; border: none; transition: all 0.2s; }
  .qty-adjust-btn:active { transform: scale(0.9); }
  .qty-adjust-btn.minus { background: var(--bg-app-alt); border: 1.5px solid var(--border-light); color: var(--text-secondary); }
  .qty-adjust-btn.plus { background: var(--primary-brand); color: #fff; }
  .qty-box { flex: 1; text-align: center; font-size: 20px; font-weight: 800; margin-bottom: 0 !important; }

  .stock-preview-box { background: var(--bg-app-alt); border-radius: 14px; padding: 14px; margin-bottom: 18px; display: flex; align-items: center; justify-content: space-between; }
  .preview-item { text-align: center; flex: 1; }
  .p-label { font-size: 10px; color: var(--text-tertiary); font-weight: 700; text-transform: uppercase; margin-bottom: 4px; }
  .p-val { font-size: 20px; font-weight: 800; color: var(--text-primary); }
  .p-val.green { color: var(--status-green); }
  .p-val.red { color: var(--status-red); }
  .preview-arrow { padding: 0 10px; }

  .bottom-bar { position: fixed; bottom: 0; left: 0; width: 100%; background: var(--bg-surface); border-top: 1px solid var(--border-light); padding: 12px 20px 32px; display: flex; gap: 12px; z-index: 100; box-shadow: var(--shadow-lg); }
  .btn-secondary { flex: 1; padding: 14px; border-radius: 14px; border: 1.5px solid var(--border-light); background: var(--bg-app-alt); color: var(--text-secondary); font-size: 14px; font-weight: 700; cursor: pointer; font-family: inherit; }
  .btn-primary { flex: 2; padding: 14px; border-radius: 14px; border: none; background: var(--primary-brand); color: #fff; font-size: 14px; font-weight: 700; cursor: pointer; font-family: inherit; }
  .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

  .empty-state { text-align: center; padding: 80px 20px; }
  .empty-icon { font-size: 48px; margin-bottom: 12px; }
  .empty-text { font-size: 14px; font-weight: 700; color: var(--text-tertiary); }

  @keyframes skeleton { 0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; } }
  .skeleton-card { height: 90px; background: var(--bg-surface); border-radius: 18px; border: 1.5px solid var(--border-light); margin-bottom: 10px; animation: skeleton 1.5s infinite; }

  /* Searchable Picker Styles */
  .searchable-picker-container { position: relative; width: 100%; margin-bottom: 16px; }
  .picker-trigger { padding: 12px 14px; background: var(--bg-surface-alt); border: 1.5px solid var(--border-strong); border-radius: 12px; display: flex; align-items: center; justify-content: space-between; cursor: pointer; transition: all 0.2s; }
  .picker-trigger.active { border-color: var(--primary-brand); background: var(--bg-surface); }
  .trigger-val { font-size: 14px; flex: 1; margin-right: 10px; }
  .trigger-arrow { font-size: 10px; color: var(--text-tertiary); }
  
  .picker-overlay { position: fixed; inset: 0; z-index: 998; }
  .picker-dropdown { position: absolute; top: calc(100% + 8px); left: 0; width: 100%; background: var(--bg-surface); border-radius: 16px; box-shadow: var(--shadow-lg); border: 1px solid var(--border-light); z-index: 999; overflow: hidden; }
  
  .picker-search-wrap { padding: 12px; border-bottom: 1px solid var(--border-light); position: relative; }
  .p-search-ico { position: absolute; left: 24px; top: 50%; transform: translateY(-50%); }
  .p-search-input { width: 100%; padding: 10px 10px 10px 34px; border: 1.5px solid var(--border-strong); border-radius: 10px; font-size: 13px; outline: none; background: var(--bg-app-alt); color: var(--text-primary); font-family: inherit; }
  .p-search-input:focus { border-color: var(--primary-brand); background: var(--bg-surface); }
  
  .picker-list { max-height: 240px; overflow-y: auto; padding: 4px; }
  .picker-item { padding: 12px 16px; border-radius: 10px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; transition: all 0.15s; color: var(--text-primary); }
  .picker-item:hover { background: var(--bg-app-alt); }
  .picker-item.selected { background: var(--primary-light); }
  .p-item-name { font-size: 14px; font-weight: 600; }
  .p-item-stock { font-size: 12px; color: var(--primary-brand); font-weight: 700; }
  .picker-empty { padding: 30px 20px; text-align: center; color: var(--text-tertiary); font-size: 13px; }
`;

export default StokMutasi;
