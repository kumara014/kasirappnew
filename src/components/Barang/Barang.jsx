import React, { useState, useEffect } from 'react';
import { Search, Camera, ChevronRight, Trash2, ArrowLeft, Plus, X, Edit2, Package, Layers, AlertTriangle, CheckCircle } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { apiFetch } from '../../config';
import { useNotification } from '../../context/NotificationContext';
import SafeImage from '../Common/SafeImage';
import { haptic } from '../../utils/haptics';

const TEAL = "#4A9BAD";
const TEAL_LIGHT = "#EAF5F7";
const TEAL_DARK = "#357585";

const formatRp = (n) => "Rp" + new Intl.NumberFormat("id-ID").format(n);

const CAT_ICONS = {
    'Makanan': '🍜',
    'Minuman': '💧',
    'Snack': '🍪',
    'Sembako': '🌾',
    'Perawatan': '🧴'
};

const CAT_COLORS = {
    'Makanan': { bg: "#FFF3E8", color: "#F08030" },
    'Minuman': { bg: "#EAF5F7", color: "#4A9BAD" },
    'Snack': { bg: "#FFF0F4", color: "#FF4B7B" },
    'Sembako': { bg: "#F0FFF4", color: "#27AE60" },
    'Perawatan': { bg: "#EEF0FF", color: "#6C63FF" },
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
    const { productsData, loadingProducts, refreshProducts, lowStockItems } = useData();
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

    const getIcon = (catName) => CAT_ICONS[catName] || "📦";
    const getColor = (catName) => CAT_COLORS[catName] || RANDOM_COLORS[Math.abs(catName.length) % RANDOM_COLORS.length];

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
        formData.append('id_kategori', form.id_kategori);
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
                throw new Error(data.message || 'Gagal menyimpan');
            }
        } catch (err) {
            haptic.error();
            notify('Error: ' + err.message, 'error');
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
                setForm(f => ({ ...f, id_kategori: data.id_kategori }));
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
                        <input
                            className="form-input"
                            placeholder="0"
                            type="number"
                            value={form.harga}
                            onChange={(e) => setForm({ ...form, harga: e.target.value })}
                        />
                    </div>

                    {/* Kategori */}
                    <div className="form-card">
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                            <div className="input-label" style={{ marginBottom: 0 }}>Kategori</div>
                            <button onClick={() => setScreen("add_category")} className="add-cat-btn">+ Baru</button>
                        </div>
                        <div className="cat-grid">
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
                    <span className="topbar-title">Kelola <span style={{ color: TEAL }}>Produk</span></span>
                    <button onClick={openAdd} className="add-fab-header">+</button>
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
                        Semua ({productsData.length})
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
                        <AlertTriangle size={20} color="#E67E22" />
                        <div>
                            <div className="alert-title">{lowStockItems.length} produk stok menipis</div>
                            <div className="alert-desc">Segera lakukan restok</div>
                        </div>
                    </div>
                )}

                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-label">Total Produk</div>
                        <div className="stat-val">{productsData.length}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Stok Menipis</div>
                        <div className="stat-val" style={{ color: lowStockItems.length > 0 ? "#FF4757" : "#2ECC71" }}>
                            {lowStockItems.length}
                        </div>
                    </div>
                </div>

                <div className="results-count">{filtered.length} produk ditemukan</div>

                {loadingProducts && productsData.length === 0 ? (
                    <div className="empty-state">
                        <div className="skeleton-list">
                            {[1, 2, 3, 4].map(i => <div key={i} className="skeleton-card" />)}
                        </div>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="empty-state">
                        <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#bbb' }}>Produk tidak ditemukan</div>
                    </div>
                ) : filtered.map((p) => {
                    const col = getColor(p.nama_kategori || "");
                    const isLow = Number(p.stok) <= (p.stok_minimum || 5);
                    return (
                        <div key={p.id_barang} className="product-card">
                            {isLow && <div className="low-stock-badge">STOK TIPIS</div>}
                            <div className="product-card-main">
                                <div className="product-img-box" style={{ background: col.bg }}>
                                    {p.gambar ? <SafeImage src={p.gambar} className="img-full" /> : <span>{getIcon(p.nama_kategori)}</span>}
                                </div>
                                <div className="product-details">
                                    <div className="p-name">{p.nama_barang}</div>
                                    <div className="p-cat" style={{ background: col.bg, color: col.color }}>
                                        {getIcon(p.nama_kategori)} {p.nama_kategori || "Tanpa Kategori"}
                                    </div>
                                    <div className="p-price">{formatRp(p.harga)}</div>
                                </div>
                                <div className="p-actions">
                                    <button onClick={() => openEdit(p)} className="p-action-btn edit"><Edit2 size={16} /></button>
                                    <button onClick={() => confirmDelete(p)} className="p-action-btn delete"><Trash2 size={16} /></button>
                                </div>
                            </div>

                            <div className="p-stock-meter">
                                <div className="stock-label" style={{ color: stockColor(p), background: stockBg(p) }}>
                                    Stok: {p.stok}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <button onClick={openAdd} className="fab-btn">+</button>
        </div>
    );
};

const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
  
  .kelola-produk-teal { 
    font-family: 'Plus Jakarta Sans', sans-serif; 
    background: #F5F7F8; 
    min-height: 100vh; 
    width: 100%;
    display: flex; 
    flex-direction: column; 
    position: relative; 
    color: #111;
  }

  .topbar { background: #fff; padding: 12px 20px 0; border-bottom: 1px solid #ECEEF0; position: sticky; top: 0; z-index: 100; }
  .topbar-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
  .topbar-title { font-size: 18px; font-weight: 800; color: #111; letter-spacing: -0.4px; }
  
  .back-btn { width: 38px; height: 38px; border-radius: 10px; background: #F5F7F8; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #333; transition: all 0.2s; }
  .back-btn:active { transform: scale(0.9); background: #ECEEF0; }

  .add-fab-header { width: 36px; height: 36px; border-radius: 10px; background: ${TEAL}; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 22px; color: #fff; font-weight: 700; }

  .search-wrap { position: relative; margin: 14px 0; }
  .search-input { width: 100%; padding: 10px 16px 10px 40px; border: 1.5px solid #E5E9EC; border-radius: 12px; font-size: 14px; background: #fff; outline: none; transition: all 0.2s; }
  .search-input:focus { border-color: ${TEAL}; box-shadow: 0 0 0 4px ${TEAL}11; }
  .search-ico { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #bbb; display: flex; }

  .cat-tabs-scroll { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 12px; scrollbarWidth: "none"; }
  .cat-tabs-scroll::-webkit-scrollbar { display: none; }
  .cat-pill { flex-shrink: 0; padding: 6px 14px; borderRadius: 20px; border: 1.5px solid #E5E9EC; background: #fff; color: #777; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 6px; border-radius: 20px; }
  .cat-pill.active { border-color: ${TEAL}; background: ${TEAL_LIGHT}; color: ${TEAL}; }
  .cat-pill.active.all { background: #1a1a18; color: #fff; border-color: #1a1a18; }

  .content { flex: 1; padding: 16px; padding-bottom: 100px; }

  .alert-box { background: #FFF8EC; border: 1.5px solid #F5CBA7; border-radius: 14px; padding: 12px 14px; marginBottom: 16px; display: flex; alignItems: center; gap: 12px; margin-bottom: 16px; }
  .alert-title { font-size: 13px; font-weight: 700; color: #E67E22; }
  .alert-desc { font-size: 11px; color: #aaa; margin-top: 1px; }

  .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 18px; }
  .stat-card { background: #fff; border-radius: 16px; padding: 12px 16px; border: 1.5px solid #ECEEF0; }
  .stat-label { font-size: 11px; color: #aaa; fontWeight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
  .stat-val { font-size: 22px; font-weight: 800; color: #111; letter-spacing: -0.5px; }

  .results-count { font-size: 12px; color: #aaa; font-weight: 600; margin-bottom: 12px; }

  .product-card { background: #fff; border-radius: 18px; padding: 14px; marginBottom: 12px; border: 1.5px solid #ECEEF0; position: relative; overflow: hidden; margin-bottom: 12px; transition: transform 0.2s; }
  .low-stock-badge { position: absolute; top: 0; right: 0; background: #FF4757; color: #fff; font-size: 9px; font-weight: 800; padding: 4px 12px; border-radius: 0 0 0 12px; }
  
  .product-card-main { display: flex; gap: 14px; align-items: flex-start; }
  .product-img-box { width: 54px; height: 54px; border-radius: 14px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 24px; overflow: hidden; }
  .img-full { width: 100%; height: 100%; object-fit: cover; }
  
  .product-details { flex: 1; min-width: 0; }
  .p-name { font-size: 15px; font-weight: 700; color: #111; margin-bottom: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .p-cat { display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; border-radius: 8px; font-size: 10px; font-weight: 700; margin-bottom: 6px; }
  .p-price { font-size: 16px; font-weight: 800; color: ${TEAL}; }

  .p-actions { display: flex; flex-direction: column; gap: 8px; }
  .p-action-btn { width: 34px; height: 34px; border-radius: 10px; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; }
  .p-action-btn.edit { background: ${TEAL_LIGHT}; color: ${TEAL}; }
  .p-action-btn.delete { background: #FFF0F1; color: #FF4757; }

  .p-stock-meter { marginTop: 14px; display: flex; justifyContent: flex-end; align-items: center; gap: 12px; margin-top: 14px; }
  .stock-label { font-size: 11px; font-weight: 800; padding: 4px 12px; border-radius: 8px; flex-shrink: 0; }

  .fab-btn { position: fixed; bottom: 24px; right: 24px; width: 56px; height: 56px; border-radius: 18px; background: ${TEAL}; border: none; color: #fff; font-size: 28px; font-weight: 700; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 24px ${TEAL}44; cursor: pointer; z-index: 100; transition: transform 0.2s; }
  .fab-btn:active { transform: scale(0.9); }

  /* Form Styles */
  .form-card { background: #fff; border-radius: 20px; padding: 18px; border: 1.5px solid #ECEEF0; margin-bottom: 14px; }
  .input-label { font-size: 11px; font-weight: 800; color: #888; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 8px; }
  .form-input { width: 100%; padding: 12px 14px; border: 1.5px solid #E5E9EC; border-radius: 12px; font-size: 15px; outline: none; background: #FAFBFC; margin-bottom: 16px; font-family: inherit; transition: all 0.2s; }
  .form-input:focus { border-color: ${TEAL}; background: #fff; }

  .image-preview-box { width: 100px; height: 100px; border-radius: 24px; background: ${TEAL_LIGHT}; display: flex; align-items: center; justify-content: center; overflow: hidden; border: 2px dashed ${TEAL}33; }
  .camera-btn { position: absolute; bottom: -5px; right: -5px; width: 36px; height: 36px; border-radius: 12px; background: #fff; border: 1.5px solid #ECEEF0; display: flex; align-items: center; justify-content: center; color: ${TEAL}; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }

  .add-cat-btn { padding: 4px 12px; border-radius: 8px; border: 1.5px solid ${TEAL}; background: ${TEAL_LIGHT}; color: ${TEAL}; font-size: 11px; font-weight: 700; cursor: pointer; }
  .cat-grid { display: flex; flex-wrap: wrap; gap: 8px; }
  .cat-tab-btn { padding: 8px 14px; border-radius: 12px; border: 1.5px solid #E5E9EC; background: #FAFBFC; color: #666; font-size: 13px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px; }
  .cat-tab-btn.active { border-color: ${TEAL}; background: ${TEAL_LIGHT}; color: ${TEAL}; }

  .stock-tip { margin-top: 10px; padding: 8px 12px; background: #FFF8EC; border-radius: 10px; font-size: 11px; color: #E67E22; font-weight: 600; display: flex; align-items: center; gap: 8px; }

  .bottom-bar { position: fixed; bottom: 0; left: 0; width: 100%; background: #fff; border-top: 1px solid #ECEEF0; padding: 12px 20px 32px; display: flex; gap: 12px; z-index: 100; }
  .btn-secondary { flex: 1; padding: 14px; border-radius: 14px; border: 1.5px solid #ECEEF0; background: #F5F7F8; color: #555; font-size: 14px; font-weight: 700; cursor: pointer; }
  .btn-primary { flex: 2; padding: 14px; border-radius: 14px; border: none; background: ${TEAL}; color: #fff; font-size: 14px; font-weight: 700; cursor: pointer; }
  .btn-primary:disabled { background: #C5D8DC; cursor: not-allowed; }

  .confirm-card { background: #fff; border-radius: 24px; padding: 28px; border: 1.5px solid #ECEEF0; width: 90%; max-width: 400px; text-align: center; }
  .delete-icon-box { width: 64px; height: 64px; border-radius: 20px; background: #FFF0F1; display: flex; align-items: center; justify-content: center; fontSize: 32px; margin: 0 auto 16px; font-size: 32px; }
  .confirm-title { font-size: 20px; font-weight: 800; color: #111; margin-bottom: 8px; }
  .confirm-desc { font-size: 14px; color: #888; margin-bottom: 4px; }
  .confirm-target { font-size: 16px; font-weight: 700; color: #111; margin-bottom: 4px; }
  .confirm-warning { font-size: 12px; color: #aaa; margin-bottom: 24px; }
  .btn-delete-final { padding: 13px; border-radius: 14px; border: none; background: #FF4757; color: #fff; font-size: 14px; font-weight: 700; cursor: pointer; }

  @keyframes skeleton { 0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; } }
  .skeleton-card { height: 120px; background: #fff; border-radius: 18px; border: 1.5px solid #ECEEF0; margin-bottom: 12px; animation: skeleton 1.5s infinite; }
`;

export default Menu;
