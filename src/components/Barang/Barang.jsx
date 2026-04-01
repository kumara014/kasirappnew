import React, { useState, useEffect } from 'react';
import { Search, Camera, ChevronRight, Trash2, ArrowLeft, Plus, X, Edit2, Package, Layers, AlertTriangle, CheckCircle } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { apiFetch } from '../../config';
import { useNotification } from '../../context/NotificationContext';
import SafeImage from '../Common/SafeImage';
import { haptic } from '../../utils/haptics';
import { motion, AnimatePresence } from 'framer-motion';

const TEAL = "#4A9BAD";
const TEAL_LIGHT = "#EAF5F7";
const TEAL_DARK = "#357585";

const formatRp = (n) => "Rp" + new Intl.NumberFormat("id-ID").format(n);

const CAT_ICONS = {
    'makanan': '🍜',
    'minuman': '💧',
    'snack': '🍪',
    'sembako': '🌾',
    'perawatan': '🧴'
};

const CAT_COLORS = {
    'makanan': { bg: "#FFF3E8", color: "#F08030" },
    'minuman': { bg: "#EAF5F7", color: "#4A9BAD" },
    'snack': { bg: "#FFF0F4", color: "#FF4B7B" },
    'sembako': { bg: "#F0FFF4", color: "#27AE60" },
    'perawatan': { bg: "#EEF0FF", color: "#6C63FF" },
};

const RANDOM_COLORS = [
    { bg: "#FFF8E7", color: "#E6A817" },
    { bg: "#F0FFF4", color: "#22A355" },
    { bg: "#FFF0FB", color: "#C945A8" },
    { bg: "#F5F0FF", color: "#7C4DFF" },
    { bg: "#FFF5F0", color: "#E8500A" },
    { bg: "#F0F8FF", color: "#1A8FD1" },
];
const RANDOM_EMOJIS = ["📁", "🏷️", "🛍️", "📌", "⭐", "🔖", "🧺", "🪣", "🧃", "🥡"];

const Menu = () => {
    const { notify } = useNotification();
    const {
        productsData,
        loadingProducts,
        refreshProducts,
        lowStockItems,
        productsPagination,
        fetchMoreProducts
    } = useData();
    const [categories, setCategories] = useState([]);

    const [activeCategory, setActiveCategory] = useState("Semua");
    const [search, setSearch] = useState("");
    const [screen, setScreen] = useState("list"); // list | form | delete_confirm | add_category
    const [editProduct, setEditProduct] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const [form, setForm] = useState({
        nama_barang: "",
        id_kategori: "",
        harga: "",
        stok: "",
        stok_minimum: "5", // Default
        gambar: null
    });

    const [selectedFile, setSelectedFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);

    // New category modal state
    const [newCatName, setNewCatName] = useState("");
    const [newCatEmoji, setNewCatEmoji] = useState("📁");

    useEffect(() => {
        refreshProducts(true);
        fetchCategories();
    }, [refreshProducts]);

    const fetchCategories = async () => {
        try {
            const res = await apiFetch('/categories');
            if (res.ok) {
                const data = await res.json();
                setCategories(data);
            }
        } catch (error) {
            console.error('Failed to load categories', error);
        }
    };

    const getIcon = (catName) => CAT_ICONS[(catName || "").toLowerCase()] || "📦";
    const getColor = (catName) => CAT_COLORS[(catName || "").toLowerCase()] || RANDOM_COLORS[Math.abs((catName || "").length) % RANDOM_COLORS.length];

    const filtered = productsData.filter((p) => {
        const matchCat = activeCategory === "Semua" || String(p.id_kategori) === String(activeCategory);
        const matchSearch = p.nama_barang.toLowerCase().includes(search.toLowerCase());
        return matchCat && matchSearch;
    });

    const openAdd = () => {
        haptic.tap();
        setEditProduct(null);
        setForm({ nama_barang: "", id_kategori: "", harga: "", stok: "", stok_minimum: "5" });
        setSelectedFile(null);
        setImagePreview(null);
        setScreen("form");
    };

    const openEdit = (p) => {
        haptic.tap();
        setEditProduct(p);
        setForm({
            nama_barang: p.nama_barang,
            id_kategori: p.id_kategori,
            harga: p.harga,
            stok: p.stok,
            stok_minimum: p.stok_minimum || "5"
        });
        setImagePreview(p.gambar);
        setSelectedFile(null);
        setScreen("form");
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Check size (max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                notify('Ukuran gambar terlalu besar (maks 10MB)', 'error');
                e.target.value = null;
                return;
            }
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const saveProduct = async () => {
        if (!form.nama_barang || !form.harga || form.stok === "") return;
        if (isProcessing) return;
        setIsProcessing(true);

        const isEdit = !!editProduct;
        const url = isEdit ? `/barang/${editProduct.id_barang}` : `/barang`;

        const formData = new FormData();
        formData.append('nama_barang', form.nama_barang);
        formData.append('harga', form.harga);
        formData.append('stok', form.stok);
        formData.append('id_kategori', form.id_kategori || '');
        formData.append('stok_minimum', form.stok_minimum);

        if (selectedFile) {
            formData.append('gambar', selectedFile);
        }
        if (isEdit) {
            formData.append('_method', 'PUT');
        }

        try {
            const res = await apiFetch(url, {
                method: 'POST',
                body: formData
            });
            const data = await res.json();

            if (res.ok) {
                haptic.success();
                notify(isEdit ? 'Produk diperbarui' : 'Produk ditambahkan', 'success');
                setScreen("list");
                refreshProducts(true);
            } else {
                if (res.status === 422 && data.errors) {
                    const firstError = Object.values(data.errors)[0][0];
                    throw new Error(firstError);
                }
                throw new Error(data.message || 'Gagal menyimpan');
            }
        } catch (err) {
            haptic.error();
            notify('Gagal: ' + err.message, 'error');
        } finally {
            setIsProcessing(false);
        }
    };

    const confirmDelete = (p) => {
        haptic.tap();
        setDeleteTarget(p);
        setScreen("delete_confirm");
    };

    const doDelete = async () => {
        if (isProcessing) return;
        setIsProcessing(true);
        try {
            const res = await apiFetch(`/barang/${deleteTarget.id_barang}`, { method: 'DELETE' });
            if (res.ok) {
                haptic.success();
                notify("Produk dihapus", "success");
                setScreen("list");
                refreshProducts(true);
            } else {
                throw new Error('Gagal menghapus');
            }
        } catch (err) {
            notify("Error menghapus: " + err.message, "error");
        } finally {
            setIsProcessing(false);
        }
    };

    const saveNewCategory = async () => {
        if (!newCatName.trim()) return;
        if (isProcessing) return;
        setIsProcessing(true);

        try {
            const res = await apiFetch('/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nama_kategori: newCatName.trim() })
            });

            if (res.ok) {
                haptic.success();
                const data = await res.json();
                notify(`Kategori "${newCatName}" ditambahkan`, 'success');
                fetchCategories();
                const newId = data.id_kategori || data.data?.id_kategori || data.id;
                setForm(f => ({ ...f, id_kategori: newId }));
                setNewCatName("");
                setScreen("form");
            } else {
                throw new Error('Gagal menambah kategori');
            }
        } catch (err) {
            notify(err.message, 'error');
        } finally {
            setIsProcessing(false);
        }
    };

    const stockColor = (p) => Number(p.stok) <= (p.stok_minimum || 5) ? "#FF4757" : Number(p.stok) <= (p.stok_minimum || 5) * 1.5 ? "#F39C12" : "#2ECC71";
    const stockBg = (p) => Number(p.stok) <= (p.stok_minimum || 5) ? "#FFF0F1" : Number(p.stok) <= (p.stok_minimum || 5) * 1.5 ? "#FFF8EC" : "#EAFAF1";

    // ── ADD CATEGORY MODAL ──────────────────────────────────────────────────
    if (screen === "add_category") {
        return (
            <div className="kelola-produk-teal">
                <style>{globalCSS}</style>
                <div className="topbar">
                    <div className="topbar-row">
                        <button className="back-btn" onClick={() => setScreen("form")}>
                            <ArrowLeft size={20} />
                        </button>
                        <span className="topbar-title">Tambah <span style={{ color: TEAL }}>Kategori</span></span>
                    </div>
                </div>

                <div className="content">
                    <div className="form-card">
                        <div className="input-label">Nama Kategori *</div>
                        <input
                            className="form-input"
                            placeholder="Contoh: Rokok, Obat-obatan..."
                            value={newCatName}
                            onChange={(e) => setNewCatName(e.target.value)}
                            autoFocus
                        />

                        <div className="input-label">Review</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{ width: 46, height: 46, borderRadius: 13, background: TEAL_LIGHT, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>📁</div>
                            <div>
                                <div style={{ fontSize: 15, fontWeight: 700, color: "#111" }}>{newCatName.trim() || "Nama Kategori"}</div>
                                <div style={{ fontSize: 12, color: "#aaa", marginTop: 2 }}>Kategori baru</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bottom-bar">
                    <button onClick={() => setScreen("form")} className="btn-secondary">Batal</button>
                    <button
                        onClick={saveNewCategory}
                        disabled={!newCatName.trim() || isProcessing}
                        className="btn-primary"
                    >
                        {isProcessing ? 'Menyimpan...' : 'Simpan Kategori'}
                    </button>
                </div>
            </div>
        );
    }

    // ── FORM SCREEN ──────────────────────────────────────────────────────────
    if (screen === "form") {
        return (
            <div className="kelola-produk-teal">
                <style>{globalCSS}</style>
                <div className="topbar">
                    <div className="topbar-row">
                        <button className="back-btn" onClick={() => setScreen("list")}>
                            <ArrowLeft size={20} />
                        </button>
                        <span className="topbar-title">{editProduct ? "Ubah Produk" : "Tambah Produk"}</span>
                    </div>
                </div>

                <div className="content">
                    {/* Image Upload */}
                    <div className="form-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px' }}>
                        <div style={{ position: 'relative' }}>
                            <div className="image-preview-box">
                                {imagePreview ? (
                                    <SafeImage src={imagePreview} className="img-full" />
                                ) : (
                                    <Package size={40} color={TEAL} />
                                )}
                            </div>
                            <label className="camera-btn">
                                <Camera size={18} />
                                <input type="file" hidden accept="image/*" onChange={handleFileChange} />
                            </label>
                        </div>
                        <div style={{ marginTop: 12, fontSize: 12, color: '#aaa' }}>Ketuk kamera untuk upload foto</div>
                    </div>

                    <div className="form-card">
                        <div className="input-label">Nama Produk *</div>
                        <input
                            className="form-input"
                            placeholder="Contoh: Aqua 600ml"
                            value={form.nama_barang}
                            onChange={(e) => setForm({ ...form, nama_barang: e.target.value })}
                        />

                        <div className="input-label">Harga Jual *</div>
                        <div className="input-with-prefix">
                            <span className="prefix-text">Rp</span>
                            <input
                                className="form-input"
                                placeholder="0"
                                type="text"
                                inputMode="numeric"
                                value={form.harga ? new Intl.NumberFormat("id-ID").format(form.harga) : ""}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, "");
                                    setForm({ ...form, harga: val });
                                }}
                            />
                        </div>
                    </div>

                    {/* Kategori */}
                    <div className="form-card">
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                            <div className="input-label" style={{ marginBottom: 0 }}>Kategori</div>
                            <button onClick={() => setScreen("add_category")} className="add-cat-btn">+ Baru</button>
                        </div>
                        <div className="cat-grid">
                            {/* Option for No Category */}
                            <button
                                onClick={() => setForm({ ...form, id_kategori: "" })}
                                className={`cat-tab-btn ${!form.id_kategori ? 'active' : ''}`}
                            >
                                <span>📁</span> Tanpa Kategori
                            </button>

                            {categories.map((c) => {
                                const isActive = String(form.id_kategori) === String(c.id_kategori);
                                return (
                                    <button
                                        key={c.id_kategori}
                                        onClick={() => setForm({ ...form, id_kategori: c.id_kategori })}
                                        className={`cat-tab-btn ${isActive ? 'active' : ''}`}
                                    >
                                        <span>{getIcon(c.nama_kategori)}</span> {c.nama_kategori}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Stok */}
                    <div className="form-card">
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                            <div>
                                <div className="input-label">Stok *</div>
                                <input
                                    className="form-input"
                                    type="number"
                                    placeholder="0"
                                    value={form.stok}
                                    onChange={(e) => setForm({ ...form, stok: e.target.value })}
                                    style={{ marginBottom: 0 }}
                                />
                            </div>
                            <div>
                                <div className="input-label">Min. Stok</div>
                                <input
                                    className="form-input"
                                    type="number"
                                    placeholder="5"
                                    value={form.stok_minimum}
                                    onChange={(e) => setForm({ ...form, stok_minimum: e.target.value })}
                                    style={{ marginBottom: 0 }}
                                />
                            </div>
                        </div>
                        <div className="stock-tip">
                            <AlertTriangle size={14} />
                            Peringatan stok menipis muncul saat stok ≤ minimum stok
                        </div>
                    </div>
                </div>

                <div className="bottom-bar">
                    <button onClick={() => setScreen("list")} className="btn-secondary">Batal</button>
                    <button
                        onClick={saveProduct}
                        disabled={!form.nama_barang || !form.harga || form.stok === "" || isProcessing}
                        className="btn-primary"
                    >
                        {isProcessing ? 'Menyimpan...' : editProduct ? "💾 Simpan Perubahan" : "Tambah Produk"}
                    </button>
                </div>
            </div>
        );
    }

    // ── DELETE CONFIRM ────────────────────────────────────────────────────────
    if (screen === "delete_confirm") {
        return (
            <div className="kelola-produk-teal">
                <style>{globalCSS}</style>
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, minHeight: "100vh" }}>
                    <div className="confirm-card">
                        <div className="delete-icon-box">🗑️</div>
                        <div className="confirm-title">Hapus Produk?</div>
                        <div className="confirm-desc">Kamu akan menghapus</div>
                        <div className="confirm-target">{deleteTarget?.nama_barang}</div>
                        <div className="confirm-warning">Tindakan ini tidak bisa dibatalkan.</div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                            <button onClick={() => setScreen("list")} className="btn-secondary">Batal</button>
                            <button onClick={doDelete} disabled={isProcessing} className="btn-delete-final">
                                {isProcessing ? 'Menghapus...' : 'Hapus'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ── LIST SCREEN ───────────────────────────────────────────────────────────
    return (
        <div className="kelola-produk-teal">
            <style>{globalCSS}</style>

            <div className="topbar">
                <div className="topbar-row" style={{ marginBottom: 14 }}>
                    <span className="topbar-title">Kelola <span style={{ color: "var(--primary-brand)" }}>Produk</span></span>
                    <button onClick={openAdd} className="add-fab-header"><Plus size={22} /></button>
                </div>

                <div className="search-wrap">
                    <span className="search-ico"><Search size={16} /></span>
                    <input
                        className="search-input"
                        placeholder="Cari produk..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="cat-tabs-scroll">
                    <button
                        onClick={() => setActiveCategory("Semua")}
                        className={`cat-pill ${activeCategory === "Semua" ? 'active all' : ''}`}
                    >
                        Semua ({productsPagination?.total ?? (productsData || []).length})
                    </button>
                    {categories.map((c) => {
                        const isActive = String(activeCategory) === String(c.id_kategori);
                        const col = getColor(c.nama_kategori);
                        return (
                            <button
                                key={c.id_kategori}
                                onClick={() => setActiveCategory(c.id_kategori)}
                                className={`cat-pill ${isActive ? 'active' : ''}`}
                                style={isActive ? { background: col.bg, color: col.color, borderColor: col.color } : {}}
                            >
                                <span>{getIcon(c.nama_kategori)}</span> {c.nama_kategori}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="content">
                {lowStockItems.length > 0 && (
                    <div className="alert-box">
                        <AlertTriangle size={20} color="var(--status-orange)" />
                        <div>
                            <div className="alert-title">{(lowStockItems || []).length} produk stok menipis</div>
                            <div className="alert-desc">Segera lakukan restok</div>
                        </div>
                    </div>
                )}

                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-label">Total Produk</div>
                        <div className="stat-val">{productsPagination?.total ?? (productsData || []).length}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Stok Menipis</div>
                        <div className="stat-val" style={{ color: (lowStockItems || []).length > 0 ? "var(--status-red)" : "var(--status-green)" }}>
                            {(lowStockItems || []).length}
                        </div>
                    </div>
                </div>

                <div className="results-count">{(filtered || []).length} produk ditemukan</div>

                {loadingProducts && (productsData || []).length === 0 ? (
                    <div className="empty-state">
                        <div className="skeleton-list">
                            {[1, 2, 3, 4].map(i => <div key={i} className="skeleton-card" />)}
                        </div>
                    </div>
                ) : (
                    <>
                        <motion.div
                            layout
                            className="product-list-container"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                        >
                            <AnimatePresence mode='popLayout'>
                                {filtered.map((p, index) => {
                                    const category = categories.find(c => String(c.id_kategori) === String(p.id_kategori));
                                    const catName = p.nama_kategori || category?.nama_kategori || "";
                                    const col = getColor(catName);
                                    const isLow = Number(p.stok) <= (p.stok_minimum || 5);
                                    return (
                                        <motion.div
                                            key={p.id_barang}
                                            layout
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ duration: 0.2, delay: Math.min(index * 0.03, 0.3) }}
                                            className="product-card"
                                            onClick={() => openEdit(p)}
                                            style={{ cursor: "pointer" }}
                                        >
                                            {isLow && <div className="low-stock-badge">STOK TIPIS</div>}
                                            <div className="product-card-main">
                                                <div className="product-img-box" style={{ background: col.bg }}>
                                                    {p.gambar ? <SafeImage src={p.gambar} className="img-full" /> : <span>{getIcon(catName)}</span>}
                                                </div>
                                                <div className="product-details">
                                                    <div className="p-name">{p.nama_barang}</div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
                                                        <div className="p-cat" style={{ background: col.bg, color: col.color, border: `1px solid ${col.color}44`, marginBottom: 0 }}>
                                                            {getIcon(catName)} {catName || "Tanpa Kategori"}
                                                        </div>
                                                        <div className="stock-tag" style={{ color: stockColor(p), background: stockBg(p) }}>
                                                            📦 {p.stok}
                                                        </div>
                                                    </div>
                                                    <div className="p-price">{formatRp(p.harga)}</div>
                                                </div>
                                                <div className="p-actions">
                                                    <button onClick={(e) => { e.stopPropagation(); confirmDelete(p); }} className="p-action-btn delete"><Trash2 size={16} /></button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </motion.div>

                    </>
                )}
            </div>

            <button onClick={openAdd} className="fab-btn"><Plus size={32} /></button>
        </div>
    );
};

const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
  
  .kelola-produk-teal { 
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
  
  .back-btn { width: 38px; height: 38px; border-radius: 10px; background: var(--bg-app-alt); border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--text-secondary); transition: all 0.2s; }
  .back-btn:active { transform: scale(0.9); background: var(--border-light); }

  .add-fab-header { width: 36px; height: 36px; border-radius: 10px; background: var(--primary-brand); border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #fff; transition: all 0.2s; }
  .add-fab-header:active { transform: scale(0.9); }

  .search-wrap { position: relative; margin: 14px 0; }
  .search-input { width: 100%; padding: 10px 16px 10px 40px; border: 1.5px solid var(--border-strong); border-radius: 12px; font-size: 14px; background: var(--bg-surface); color: var(--text-primary); outline: none; transition: all 0.2s; }
  .search-input:focus { border-color: var(--primary-brand); box-shadow: 0 0 0 4px rgba(74, 155, 173, 0.1); }
  .search-ico { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--text-tertiary); display: flex; }

  .cat-tabs-scroll { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 12px; scrollbar-width: none; }
  .cat-tabs-scroll::-webkit-scrollbar { display: none; }
  .cat-pill { flex-shrink: 0; padding: 6px 14px; border-radius: 20px; border: 1.5px solid var(--border-strong); background: var(--bg-surface); color: var(--text-secondary); font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 6px; }
  .cat-pill.active { border-color: var(--primary-brand); background: var(--primary-light); color: var(--primary-brand); }
  .cat-pill.active.all { background: var(--text-primary); color: var(--bg-surface); border-color: var(--text-primary); }

  .content { flex: 1; padding: 16px; padding-bottom: 100px; }

  .alert-box { background: var(--status-orange-light); border: 1.5px solid var(--status-orange); border-radius: 14px; padding: 12px 14px; margin-bottom: 16px; display: flex; align-items: center; gap: 12px; border-color: rgba(245, 158, 11, 0.3); }
  .alert-title { font-size: 13px; font-weight: 700; color: var(--status-orange); }
  .alert-desc { font-size: 11px; color: var(--text-tertiary); margin-top: 1px; }

  .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 18px; }
  .stat-card { background: var(--bg-surface); border-radius: 16px; padding: 12px 16px; border: 1.5px solid var(--border-light); }
  .stat-label { font-size: 11px; color: var(--text-tertiary); font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
  .stat-val { font-size: 22px; font-weight: 800; color: var(--text-primary); letter-spacing: -0.5px; }

  .results-count { font-size: 12px; color: var(--text-tertiary); font-weight: 600; margin-bottom: 12px; }

  .product-card { background: var(--bg-surface); border-radius: 18px; padding: 14px; border: 1.5px solid var(--border-light); position: relative; overflow: hidden; margin-bottom: 12px; transition: transform 0.2s; }
  .low-stock-badge { position: absolute; top: 0; right: 0; background: var(--status-red); color: #fff; font-size: 9px; font-weight: 800; padding: 4px 12px; border-radius: 0 0 0 12px; }
  
  .product-card-main { display: flex; gap: 14px; align-items: flex-start; }
  .product-img-box { width: 54px; height: 54px; border-radius: 14px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 24px; overflow: hidden; background: var(--bg-app-alt); }
  .img-full { width: 100%; height: 100%; object-fit: cover; }
  
  .product-details { flex: 1; min-width: 0; }
  .p-name { font-size: 15px; font-weight: 700; color: var(--text-primary); margin-bottom: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .p-cat { display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; border-radius: 8px; font-size: 10px; font-weight: 700; margin-bottom: 6px; }
  .p-price { font-size: 16px; font-weight: 800; color: var(--primary-brand); }

  .p-actions { display: flex; flex-direction: column; gap: 8px; }
  .p-action-btn { width: 34px; height: 34px; border-radius: 10px; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; }
  .p-action-btn.edit { background: var(--primary-light); color: var(--primary-brand); }
  .p-action-btn.delete { background: var(--status-red-light); color: var(--status-red); }

  .stock-tag { font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 8px; flex-shrink: 0; }

  .fab-btn { position: fixed; bottom: calc(24px + env(safe-area-inset-bottom, 20px)); right: 24px; width: 60px; height: 60px; border-radius: 20px; background: var(--primary-brand); border: none; color: #fff; display: flex; align-items: center; justify-content: center; box-shadow: 0 12px 30px rgba(74, 155, 173, 0.3); cursor: pointer; z-index: 100; transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
  .fab-btn:active { transform: scale(0.85); box-shadow: 0 4px 10px rgba(74, 155, 173, 0.2); }

  /* Form Styles */
  .form-card { background: var(--bg-surface); border-radius: 20px; padding: 18px; border: 1.5px solid var(--border-light); margin-bottom: 14px; }
  .input-label { font-size: 11px; font-weight: 800; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 8px; }
  .form-input { width: 100%; padding: 12px 14px; border: 1.5px solid var(--border-strong); border-radius: 12px; font-size: 15px; outline: none; background: var(--bg-surface-alt); color: var(--text-primary); margin-bottom: 16px; font-family: inherit; transition: all 0.2s; }
  .form-input:focus { border-color: var(--primary-brand); background: var(--bg-surface); }

  .input-with-prefix { position: relative; width: 100%; margin-bottom: 16px; }
  .prefix-text { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); font-weight: 700; color: var(--primary-brand); font-size: 15px; }
  .input-with-prefix .form-input { padding-left: 44px; margin-bottom: 0; }

  .image-preview-box { width: 100px; height: 100px; border-radius: 24px; background: var(--primary-light); display: flex; align-items: center; justify-content: center; overflow: hidden; border: 2px dashed rgba(74, 155, 173, 0.2); }
  .camera-btn { position: absolute; bottom: -5px; right: -5px; width: 36px; height: 36px; border-radius: 12px; background: var(--bg-surface); border: 1.5px solid var(--border-light); display: flex; align-items: center; justify-content: center; color: var(--primary-brand); cursor: pointer; box-shadow: var(--shadow-sm); }

  .add-cat-btn { padding: 4px 12px; border-radius: 8px; border: 1.5px solid var(--primary-brand); background: var(--primary-light); color: var(--primary-brand); font-size: 11px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; }
  .cat-grid { display: flex; flex-wrap: wrap; gap: 8px; }
  .cat-tab-btn { padding: 8px 14px; border-radius: 12px; border: 1.5px solid var(--border-strong); background: var(--bg-surface-alt); color: var(--text-secondary); font-size: 13px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px; }
  .cat-tab-btn.active { border-color: var(--primary-brand); background: var(--primary-light); color: var(--primary-brand); }

  .stock-tip { margin-top: 10px; padding: 8px 12px; background: var(--status-orange-light); border-radius: 10px; font-size: 11px; color: var(--status-orange); font-weight: 600; display: flex; align-items: center; gap: 8px; }

  .bottom-bar { position: fixed; bottom: 0; left: 0; width: 100%; background: var(--bg-surface); border-top: 1px solid var(--border-light); padding: 12px 20px calc(24px + env(safe-area-inset-bottom, 20px)); display: flex; gap: 12px; z-index: 100; }
  .btn-secondary { flex: 1; padding: 14px; border-radius: 14px; border: 1.5px solid var(--border-light); background: var(--bg-app-alt); color: var(--text-secondary); font-size: 14px; font-weight: 700; cursor: pointer; }
  .btn-primary { flex: 2; padding: 14px; border-radius: 14px; border: none; background: var(--primary-brand); color: #fff; font-size: 14px; font-weight: 700; cursor: pointer; }
  .btn-primary:disabled { background: var(--text-tertiary); opacity: 0.5; cursor: not-allowed; }

  .confirm-card { background: var(--bg-surface); border-radius: 24px; padding: 28px; border: 1.5px solid var(--border-light); width: 90%; max-width: 400px; text-align: center; }
  .delete-icon-box { width: 64px; height: 64px; border-radius: 20px; background: var(--status-red-light); display: flex; align-items: center; justify-content: center; font-size: 32px; margin: 0 auto 16px; }
  .confirm-title { font-size: 20px; font-weight: 800; color: var(--text-primary); margin-bottom: 8px; }
  .confirm-desc { font-size: 14px; color: var(--text-secondary); margin-bottom: 4px; }
  .confirm-target { font-size: 16px; font-weight: 700; color: var(--text-primary); margin-bottom: 4px; }
  .confirm-warning { font-size: 12px; color: var(--text-tertiary); margin-bottom: 24px; }
  .btn-delete-final { padding: 13px; border-radius: 14px; border: none; background: var(--status-red); color: #fff; font-size: 14px; font-weight: 700; cursor: pointer; }

  @keyframes skeleton { 0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; } }
  .skeleton-card { height: 120px; background: var(--bg-surface); border-radius: 18px; border: 1.5px solid var(--border-light); margin-bottom: 12px; animation: skeleton 1.5s infinite; }
`;

export default Menu;
