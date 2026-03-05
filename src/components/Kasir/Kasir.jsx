import React, { useState, useEffect, useRef } from 'react';
import './Kasir.css';
import './PaymentStyles.css';
import { Search, Coffee, Utensils, User, Edit, Plus, Minus, X, Printer, CheckCircle, Wallet, Trash2, Filter, Menu } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { apiFetch, STORAGE_URL } from '../../config';
import { useNotification } from '../../context/NotificationContext';
import SafeImage from '../Common/SafeImage';
import { haptic } from '../../utils/haptics';

const formatRp = (n) =>
    "Rp" + new Intl.NumberFormat("id-ID").format(n);

const TEAL = "var(--primary-brand)";
const TEAL_LIGHT = "var(--primary-light)";
const TEAL_DARK = "var(--primary-dark)";

const CAT_ICONS = {
    'makanan': '🍜',
    'minuman': '💧',
    'snack': '🍪',
    'sembako': '🌾',
    'perawatan': '🧴'
};

const CAT_COLORS = {
    'makanan': { bg: "var(--status-orange-light)", color: "var(--status-orange)" },
    'minuman': { bg: "var(--primary-light)", color: "var(--primary-brand)" },
    'snack': { bg: "var(--status-red-light)", color: "var(--status-red)" },
    'sembako': { bg: "var(--status-green-light)", color: "var(--status-green)" },
    'perawatan': { bg: "var(--status-blue-light)", color: "var(--status-blue)" },
};

const RANDOM_COLORS = [
    { bg: "var(--status-orange-light)", color: "var(--status-orange)" },
    { bg: "var(--status-green-light)", color: "var(--status-green)" },
    { bg: "var(--status-red-light)", color: "var(--status-red)" },
    { bg: "var(--status-blue-light)", color: "var(--status-blue)" },
];

const getIcon = (catName) => CAT_ICONS[(catName || "").toLowerCase()] || "📦";
const getColor = (catName) => CAT_COLORS[(catName || "").toLowerCase()] || RANDOM_COLORS[Math.abs((catName || "").length) % RANDOM_COLORS.length];

// ─── SCREEN: CASHIER ──────────────────────────────────────────────────────────
function CashierScreen({ onCheckout, products, categories, catFilter, setCatFilter, searchQuery, setSearchQuery, cart, setCart, loading, onToggleSidebar }) {
    const [showCart, setShowCart] = useState(false);

    const filtered = products.filter(p => {
        const name = p.nama_barang || '';
        const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = catFilter === 'All' || String(p.id_kategori) === String(catFilter);
        return matchesSearch && matchesCategory;
    });

    const addToCart = (product) => {
        haptic.tap();
        const qtyInCart = getItemQty(product.id_barang);
        const stockAvailable = Number(product.stok || 0);

        if (stockAvailable <= qtyInCart) {
            haptic.error();
            return;
        }

        const existing = cart.find(item => item.id_barang === product.id_barang);
        if (existing) {
            setCart(cart.map(item =>
                item.id_barang === product.id_barang ? { ...item, qty: item.qty + 1 } : item
            ));
        } else {
            setCart([...cart, { ...product, qty: 1 }]);
        }
    };

    const updateQty = (id_barang, delta) => {
        haptic.tap();
        setCart(prevCart => prevCart.map(item => {
            if (item.id_barang === id_barang) {
                return { ...item, qty: Math.max(0, item.qty + delta) };
            }
            return item;
        }).filter(item => item.qty > 0));
    };

    const removeItem = (id_barang) => {
        haptic.impact();
        setCart((prev) => prev.filter((c) => c.id_barang !== id_barang));
    };

    const getItemQty = (productId) => {
        const item = cart.find(i => i.id_barang === productId);
        return item ? item.qty : 0;
    };



    const total = cart.reduce((s, c) => s + (Number(c.harga) * c.qty), 0);
    const totalItems = cart.reduce((s, c) => s + c.qty, 0);

    return (
        <>
            <div className="topbar">
                <div className="topbar-row">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {window.innerWidth <= 1024 && (
                            <button
                                onClick={onToggleSidebar}
                                style={{
                                    background: TEAL_LIGHT, border: 'none', borderRadius: '10px',
                                    width: '40px', height: '40px', display: 'flex',
                                    alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                                }}
                            >
                                <Menu size={20} color="var(--primary-brand)" />
                            </button>
                        )}
                        <span className="topbar-title">Kasir <span style={{ color: "var(--primary-brand)" }}>Pointly</span></span>
                    </div>
                    <button className="cart-icon-btn" onClick={() => totalItems > 0 && setShowCart(true)}>
                        🛒
                        {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
                    </button>
                </div>

            </div>

            <div className="content">
                <>
                    <div className="pos-categories" style={{ marginBottom: 14 }}>
                        <select
                            value={catFilter}
                            onChange={(e) => {
                                haptic.select();
                                setCatFilter(e.target.value);
                            }}
                            className="category-select-teal"
                        >
                            <option value="All">Semua Kategori</option>
                            {categories.map(cat => (
                                <option key={cat.id_kategori} value={cat.id_kategori}>
                                    {cat.nama_kategori}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="search-wrap">
                        <span className="search-ico">🔍</span>
                        <input className="search-input" placeholder="Cari produk..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-tertiary)' }}>Memuat produk...</div>
                    ) : (
                        <div className="product-grid">
                            {filtered.map((p) => {
                                const qty = getItemQty(p.id_barang);
                                const category = categories.find(c => String(c.id_kategori) === String(p.id_kategori));
                                const catName = p.nama_kategori || category?.nama_kategori || "";

                                return (
                                    <div key={p.id_barang} className={`product-item${qty > 0 ? " in-cart" : ""}`} onClick={() => qty === 0 && Number(p.stok) > 0 && addToCart(p)}>
                                        <div className="product-icon">
                                            <SafeImage
                                                src={p.gambar}
                                                alt={p.nama_barang}
                                                fallback={<div>🍽️</div>}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        </div>
                                        <div className="product-info">
                                            <div className="product-info-name">{p.nama_barang}</div>
                                            <div className="product-info-cat" style={{
                                                background: getColor(catName).bg,
                                                color: getColor(catName).color
                                            }}>
                                                {getIcon(catName)} {catName || "Tanpa Kategori"}
                                            </div>
                                            <div className="product-info-sub">Stok: {p.stok}</div>
                                        </div>
                                        <div className="product-price-col">
                                            <div className="product-price-val">{formatRp(p.harga)}</div>
                                            <div className="qty-controls-wrapper">
                                                {qty > 0 ? (
                                                    <div className="qty-controls">
                                                        <button className="qty-btn minus" onClick={(e) => { e.stopPropagation(); updateQty(p.id_barang, -1); }}><Minus size={18} color="var(--text-secondary)" strokeWidth={2.5} /></button>
                                                        <span className="qty-num">{qty}</span>
                                                        <button className="qty-btn plus" onClick={(e) => { e.stopPropagation(); addToCart(p); }}><Plus size={18} color="white" strokeWidth={2.5} /></button>
                                                    </div>
                                                ) : (
                                                    <button className="add-btn" disabled={Number(p.stok) <= 0} onClick={(e) => { e.stopPropagation(); addToCart(p); }}>
                                                        {Number(p.stok) <= 0 ? <X size={20} /> : <Plus size={20} strokeWidth={3} />}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </>
            </div>

            <div className="bottom-bar">
                <div>
                    <div className="bottom-total-label">Total Tagihan</div>
                    <div className="bottom-total-val">{formatRp(total)}</div>
                </div>
                <button className="tagih-btn" disabled={(cart || []).length === 0} onClick={() => setShowCart(true)}>
                    Tagih • {totalItems} item
                </button>
            </div>

            {showCart && (
                <>
                    <div className="overlay" onClick={() => setShowCart(false)} />
                    <div className="cart-sheet">
                        <div className="sheet-handle" />
                        <div className="sheet-header">
                            <span className="sheet-title">Keranjang</span>
                            <span className="sheet-count">{totalItems} produk</span>
                        </div>
                        <div className="sheet-body">
                            {cart.map((c) => (
                                <div key={c.id_barang} className="cart-item">
                                    <button className="remove-btn" onClick={() => removeItem(c.id_barang)}>✕</button>
                                    <div className="cart-item-info">
                                        <div className="cart-item-name">{c.nama_barang}</div>
                                        <div className="cart-item-price">{formatRp(c.harga)} × {c.qty}</div>
                                    </div>
                                    <div className="cart-item-subtotal">{formatRp(Number(c.harga) * c.qty)}</div>
                                </div>
                            ))}
                        </div>
                        <div className="sheet-footer">
                            <div className="total-row">
                                <span className="total-label">Total Pembayaran</span>
                                <span className="total-val">{formatRp(total)}</span>
                            </div>
                            <button className="bayar-btn" onClick={() => { setShowCart(false); onCheckout(cart, total); }}>
                                💳 Bayar Sekarang
                            </button>
                        </div>
                    </div>
                </>
            )}
        </>
    );
}

// ─── SCREEN: PAYMENT METHOD ───────────────────────────────────────────────────
function PaymentScreen({ cart, total, onBack, onPay, isProcessing, user }) {
    const [method, setMethod] = useState("Cash");
    const [cashInput, setCashInput] = useState("");

    const cashNum = Number(cashInput.replace(/\D/g, ""));
    const kembalian = cashNum - total;
    const cashValid = method === "Cash" && cashNum >= total;
    const onlineValid = method === "QRIS" || method === "Transfer";
    const canPay = (cashValid || onlineValid) && !isProcessing;

    const handleQuick = (val) => {
        setCashInput(String(val));
        haptic.tap();
    };

    const methodOptions = [
        { id: "Cash", label: "Tunai", icon: "💵", desc: "Bayar dengan uang tunai" },
        { id: "QRIS", label: "QRIS", icon: "📱", desc: "Scan QR code" },
        { id: "Transfer", label: "Transfer Bank", icon: "🏦", desc: "Transfer ke rekening" },
    ];

    return (
        <>
            <div className="topbar" style={{ paddingBottom: 16 }}>
                <div className="topbar-row" style={{ marginBottom: 0 }}>
                    <button className="back-btn" onClick={onBack}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
                    </button>
                    <span className="topbar-title">Metode <span style={{ color: "var(--primary-brand)" }}>Pembayaran</span></span>
                </div>
            </div>

            <div className="content">
                <div className="payment-total-card">
                    <div className="payment-total-label">Total Tagihan</div>
                    <div className="payment-total-val">{formatRp(total)}</div>
                    <div className="payment-total-sub">{cart.reduce((s, c) => s + c.qty, 0)} item produk</div>
                </div>

                <div className="section-title">Pilih Metode</div>
                {methodOptions.map((m) => (
                    <div key={m.id}
                        onClick={() => { setMethod(m.id); setCashInput(""); haptic.select(); }}
                        className={`method-option ${method === m.id ? 'active' : ''}`}
                    >
                        <div className="method-icon-box">
                            {m.icon}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div className="method-label">{m.label}</div>
                            <div className="method-desc">{m.desc}</div>
                        </div>
                        <div className={`method-radio ${method === m.id ? 'active' : ''}`}>
                            {method === m.id && <div className="radio-dot" />}
                        </div>
                    </div>
                ))}

                {method === "Cash" && (
                    <div className="cash-input-area">
                        <div className="input-label">Uang Diterima</div>
                        <div className="input-with-prefix">
                            <span className="prefix-text">Rp</span>
                            <input
                                className="form-input"
                                placeholder="0"
                                value={cashInput ? new Intl.NumberFormat("id-ID").format(cashInput) : ""}
                                onChange={(e) => {
                                    const raw = e.target.value.replace(/\D/g, "");
                                    // Handle empty or zero
                                    if (!raw || raw === "0") {
                                        setCashInput("");
                                    } else {
                                        setCashInput(raw);
                                    }
                                }}
                            />
                        </div>
                        <div className="quick-cash-grid">
                            {[50000, 100000, 150000, 200000, 500000, 1000000].map((v) => (
                                <button key={v} onClick={() => handleQuick(v)} className={`quick-cash-btn ${cashNum === v ? 'active' : ''}`}>
                                    {v >= 1000000 ? "Rp1jt" : `Rp${v / 1000}rb`}
                                </button>
                            ))}
                        </div>
                        {cashNum >= total && (
                            <div className="kembalian-box">
                                <span className="kembalian-label">Kembalian</span>
                                <span className="kembalian-val">{formatRp(kembalian)}</span>
                            </div>
                        )}
                    </div>
                )}



                {method === "QRIS" && (
                    <div className="qris-box">
                        <div className="qris-desc">Scan QR berikut untuk membayar</div>
                        <div className="qris-placeholder">
                            {user?.qris_image ? (
                                <SafeImage
                                    src={user.qris_image}
                                    alt="QRIS"
                                    style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 12 }}
                                />
                            ) : (
                                <div style={{ padding: '20px', color: '#aaa', fontSize: '13px' }}>
                                    <div style={{ fontSize: '30px', marginBottom: '10px' }}>⚠️</div>
                                    QRIS belum diatur di Pengaturan.
                                </div>
                            )}
                        </div>
                        <div className="qris-total">{formatRp(total)}</div>
                    </div>
                )}

                {method === "Transfer" && (
                    <div className="transfer-box">
                        <div className="section-title">Rekening Tujuan</div>
                        {(user?.bank_info || []).length > 0 ? (
                            (user?.bank_info || []).map((bank, i) => (
                                <div key={i} className="transfer-item">
                                    <div>
                                        <div style={{ fontWeight: 700 }}>{bank.name}</div>
                                        <div style={{ fontFamily: 'monospace', color: 'var(--text-tertiary)' }}>{bank.account}</div>
                                    </div>
                                    <button className="copy-btn" onClick={() => {
                                        navigator.clipboard.writeText(bank.account);
                                        notify('Berhasil disalin!');
                                    }}>Salin</button>
                                </div>
                            ))
                        ) : (
                            <div style={{ textAlign: 'center', padding: '20px', color: '#aaa', fontSize: '13px' }}>
                                Belum ada rekening bank yang diatur di Pengaturan.
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="bottom-bar">
                <div>
                    <div className="bottom-total-label">Total Pembayaran</div>
                    <div className="bottom-total-val">{formatRp(total)}</div>
                </div>
                <button className="tagih-btn" disabled={!canPay}
                    onClick={() => onPay({ method, cashGiven: cashNum, kembalian: kembalian > 0 ? kembalian : 0 })}>
                    {isProcessing ? 'Memproses...' : '✓ Konfirmasi'}
                </button>
            </div>
        </>
    );
}

// ─── SCREEN: SUCCESS ──────────────────────────────────────────────────────────
function SuccessScreen({ cart, total, payInfo, onNew, transactionResult, user }) {
    const [showReceipt, setShowReceipt] = useState(false);
    const now = new Date();
    const dateStr = now.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
    const timeStr = now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

    if (showReceipt) {
        return (
            <>
                <div className="topbar">
                    <div className="topbar-row">
                        <span className="topbar-title">Struk <span style={{ color: "var(--primary-brand)" }}>Transaksi</span></span>
                        <button className="print-btn-receipt" onClick={() => window.print()}>🖨️ Cetak</button>
                    </div>
                </div>
                <div className="content">
                    <div className="receipt-paper-teal">
                        <div className="receipt-header-teal" style={{ textAlign: "center", marginBottom: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#fff', padding: '10px 0', borderBottom: '1px dashed #eee' }}>
                            {user?.logo_usaha && (
                                <SafeImage src={user.logo_usaha} alt="Logo" style={{ maxWidth: "100%", maxHeight: 60, marginBottom: 5, objectFit: "contain" }} />
                            )}
                            <div className="receipt-brand" style={{ fontSize: 18, fontWeight: 800, marginBottom: 2, color: "#111" }}>{user?.nama_usaha || "Toko Kamu"}</div>
                            {user?.alamat_usaha && <div className="receipt-sub" style={{ fontSize: 12, marginBottom: 2, color: "#666" }}>{user.alamat_usaha}</div>}
                            {user?.no_telepon_usaha && <div className="receipt-sub" style={{ fontSize: 12, marginBottom: 5, color: "#666" }}>{user.no_telepon_usaha}</div>}
                            <div className="receipt-line" style={{ width: '100%', borderBottom: '1.5px dashed #eee', margin: '10px 0' }} />
                            <div className="receipt-time" style={{ color: "#888", fontSize: '12px' }}>{dateStr} • {timeStr}</div>
                        </div>

                        <div className="receipt-inv">
                            <span>No. Invoice</span>
                            <span className="inv-num">{transactionResult?.id_pesanan || 'TRAN-AUTO'}</span>
                        </div>

                        <div className="receipt-items">
                            {cart.map((c) => (
                                <div key={c.id_barang} className="r-item-row">
                                    <div className="r-item-info">
                                        <div className="r-item-name">{c.nama_barang}</div>
                                        <div className="r-item-price">{formatRp(c.harga)} × {c.qty}</div>
                                    </div>
                                    <div className="r-item-total">{formatRp(Number(c.harga) * c.qty)}</div>
                                </div>
                            ))}
                        </div>

                        <div className="r-divider" />

                        <div className="receipt-totals">
                            <div className="r-total-row">
                                <span>Subtotal</span>
                                <span>{formatRp(total)}</span>
                            </div>
                            <div className="r-total-row">
                                <span>Metode</span>
                                <span>{payInfo.method}</span>
                            </div>
                            {payInfo.method === "Cash" && (
                                <>
                                    <div className="r-total-row">
                                        <span>Bayar</span>
                                        <span>{formatRp(payInfo.cashGiven)}</span>
                                    </div>
                                    <div className="r-total-row highlight">
                                        <span>Kembalian</span>
                                        <span>{formatRp(payInfo.kembalian)}</span>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="r-divider" />

                        <div className="receipt-final">
                            <span>TOTAL</span>
                            <span className="final-val">{formatRp(total)}</span>
                        </div>

                        <div className="receipt-footer-msg">
                            <div>Terima kasih telah berbelanja!</div>
                            <div style={{ marginTop: 4, opacity: 0.6 }}>Simpan struk ini sebagai bukti pembayaran</div>
                        </div>
                    </div>
                </div>
                <div className="success-bottom-bar">
                    <button className="new-trans-btn-big" onClick={onNew}>
                        🛒 Transaksi Baru
                    </button>
                </div>
            </>
        );
    }

    return (
        <>
            <div className="content success-container">
                <div className="success-header">
                    <div className="success-icon-box">
                        <CheckCircle size={48} color="white" />
                    </div>
                    <div className="success-title">Transaksi Berhasil!</div>
                    <div className="success-time">{dateStr} • {timeStr}</div>
                </div>

                <div className="success-card">
                    <div className="success-inv-row">
                        <span>No. Invoice</span>
                        <span className="inv-code">{transactionResult?.id_pesanan || 'TRAN-AUTO'}</span>
                    </div>
                    <div className="success-summary">
                        <div className="summary-row">
                            <span>Total Belanja</span>
                            <span>{formatRp(total)}</span>
                        </div>
                        <div className="summary-row">
                            <span>Metode</span>
                            <span>{payInfo.method}</span>
                        </div>
                        {payInfo.method === "Cash" && (
                            <div className="summary-row highlight">
                                <span>Kembalian</span>
                                <span>{formatRp(payInfo.kembalian)}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="success-items-list">
                    <div className="list-title">Ringkasan Item</div>
                    {cart.map((c) => (
                        <div key={c.id_barang} className="list-item">
                            <span>{c.nama_barang} ×{c.qty}</span>
                            <span>{formatRp(Number(c.harga) * c.qty)}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="success-bottom-bar">
                <button className="secondary-action" style={{ width: '100%', marginBottom: 12 }} onClick={() => setShowReceipt(true)}>📄 Lihat Struk</button>
                <button className="primary-action" onClick={onNew}>🛒 Transaksi Baru</button>
            </div>
        </>
    );
}

// ─── MAIN KASIR COMPONENT ─────────────────────────────────────────────────────
const Kasir = ({ onToggleSidebar }) => {
    const { notify } = useNotification();
    const { user, productsData, loadingProducts, refreshProducts, refreshDashboard, refreshOrders } = useData();
    const [catFilter, setCatFilter] = useState('All');
    const [categories, setCategories] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [cart, setCart] = useState([]);
    const [total, setTotal] = useState(0);
    const [payInfo, setPayInfo] = useState(null);
    const [screen, setScreen] = useState("cashier");
    const [isProcessing, setIsProcessing] = useState(false);
    const [transactionResult, setTransactionResult] = useState(null);

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

    const handleCheckout = (c, t) => {
        setCart(c);
        setTotal(t);
        haptic.tap();
        setScreen("payment");
    };

    const handlePay = (info) => {
        setPayInfo(info);
        processTransaction(info);
    };

    const processTransaction = (info) => {
        if (isProcessing) return;
        setIsProcessing(true);

        const paidAmount = info.method === 'Cash' ? info.cashGiven : total;

        const transactionData = {
            total_harga: total,
            uang_bayar: paidAmount,
            metode_pembayaran: info.method,
            items: cart.map(i => ({
                id_barang: i.id_barang,
                qty: i.qty,
                harga: i.harga
            }))
        };

        apiFetch('/transaksi', {
            method: 'POST',
            body: JSON.stringify(transactionData)
        })
            .then(async res => {
                const data = await res.json().catch(() => ({ message: 'Format respons tidak valid' }));
                if (!res.ok) throw new Error(data.message || `Server error: ${res.status}`);
                return data;
            })
            .then(data => {
                if (data.message === "Transaksi berhasil disimpan.") {
                    setTransactionResult(data);
                    refreshProducts(true);
                    refreshDashboard(true);
                    refreshOrders(true);
                    haptic.success();
                    setScreen("success");
                } else {
                    haptic.error();
                    notify(`Gagal: ${data.message}`, "error");
                }
            })
            .catch(err => {
                haptic.error();
                notify("Error: " + err.message, "error");
            })
            .finally(() => setIsProcessing(false));
    };

    const resetAll = () => {
        setCart([]);
        setTotal(0);
        setPayInfo(null);
        setTransactionResult(null);
        setScreen("cashier");
        haptic.impact();
    };

    return (
        <div className="kasir-teal-root">
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        
        @media print {
          body, html, #root, .app-main-wrapper, .app-layout, .main-content, .view-wrapper, .kasir-teal-root, .content {
            display: block !important;
            height: auto !important;
            min-height: 0 !important;
            padding: 0 !important;
            margin: 0 !important;
            overflow: visible !important;
          }
          .desktop-sidebar, .sidebar-teal, .sidebar-overlay, .mobile-top-bar-teal, .topbar, .bottom-bar, .success-bottom-bar, .overlay, .cart-sheet { display: none !important; }
          .receipt-paper-teal { 
            position: relative !important; 
            display: block !important;
            width: 58mm !important; 
            margin: 0 auto !important; 
            padding: 0 !important; 
            box-shadow: none !important; 
            border: none !important;
            background: #fff !important;
          }
          .receipt-header-teal { background: #fff !important; color: #000 !important; border-bottom: 1px dashed #000 !important; }
          .receipt-brand { color: #000 !important; }
          .receipt-sub { color: #000 !important; }
          .receipt-line { border-bottom: 1px dashed #000 !important; height: 1px !important; background: transparent !important; }
          .receipt-time { color: #000 !important; }
          .receipt-brand { color: #000 !important; }
          .final-val { color: #000 !important; }
          .receipt-line, .r-divider { border-bottom: 1px dashed #000 !important; }
        }

        .kasir-teal-root { 
          font-family: 'Plus Jakarta Sans', sans-serif; 
          background: var(--bg-app); 
          min-height: 100vh; 
          width: 100%;
          display: flex; 
          flex-direction: column; 
          position: relative; 
          overflow-x: hidden;
          color: var(--text-primary);
        }

        .topbar { 
          background: var(--bg-surface); 
          padding: 10px 20px 0; 
          border-bottom: 1px solid var(--border-light); 
          position: sticky; 
          top: 0; 
          z-index: 50;
          width: 100%;
        }
        .topbar-row { 
          display: flex; 
          align-items: center; 
          justify-content: space-between; 
          margin-bottom: 14px; 
          width: 100%;
        }
        .topbar-title { font-size: 20px; font-weight: 800; color: var(--text-primary); letter-spacing: -0.5px; }
        .cart-icon-btn { position: relative; width: 42px; height: 42px; border-radius: 12px; background: var(--primary-light); border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 20px; transition: transform 0.1s; }
        .cart-icon-btn:active { transform: scale(0.9); }
        .cart-badge { position: absolute; top: -5px; right: -5px; background: var(--status-red); color: #fff; border-radius: 10px; font-size: 10px; font-weight: 700; min-width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; padding: 0 4px; border: 2px solid var(--bg-surface); }
        .back-btn { width: 40px; height: 40px; border-radius: 12px; background: var(--bg-app-alt, #F5F7F8); border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--text-primary, #333); flex-shrink: 0; transition: all 0.2s; }
        .back-btn:active { background: var(--border-light, #ECEEF0); transform: scale(0.95); }
        
        .content { 
          flex: 1; 
          padding: 16px; 
          padding-bottom: 130px; 
          overflow-y: auto; 
          width: 100%;
        }
        
        .product-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
        }
        @media (min-width: 650px) {
          .product-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (min-width: 1000px) {
          .product-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        .category-select-teal {
          width: 100%;
          padding: 12px 14px;
          border-radius: 12px;
          border: 1.5px solid var(--border-strong);
          background: var(--bg-surface);
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
          outline: none;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%234A9BAD' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 14px center;
          background-size: 16px;
        }

        .search-wrap { position: relative; margin-bottom: 14px; }
        .search-input { width: 100%; padding: 12px 16px 12px 42px; border: 1.5px solid var(--border-strong); border-radius: 12px; font-size: 14px; background: var(--bg-surface); color: var(--text-primary); outline: none; transition: border-color 0.2s; }
        .search-input:focus { border-color: var(--primary-brand); }
        .search-ico { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); font-size: 16px; color: var(--text-tertiary); }
        
        .product-item { 
          background: var(--bg-surface); 
          border-radius: 14px; 
          padding: 12px 14px; 
          display: flex; 
          align-items: center; 
          gap: 12px; 
          border: 1.5px solid var(--border-light); 
          cursor: pointer; 
          transition: all 0.15s; 
          position: relative; 
          overflow: hidden; 
        }
        .product-item.in-cart { border-color: var(--primary-brand); background: var(--primary-light); }
        .product-icon { width: 54px; height: 54px; border-radius: 14px; background: var(--primary-light); flex-shrink: 0; display: flex; align-items: center; justify-content: center; overflow: hidden; }
        .product-info { flex: 1; min-width: 0; padding-right: 8px; }
        .product-info-name { font-size: 14px; font-weight: 700; color: var(--text-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-bottom: 2px; }
        .product-info-cat { display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; border-radius: 6px; font-size: 10px; font-weight: 700; margin-bottom: 4px; }
        .product-info-sub { font-size: 12px; color: var(--text-tertiary); }
        .product-price-col { text-align: right; flex-shrink: 0; display: flex; flex-direction: column; align-items: flex-end; min-width: 80px; }
        .product-price-val { font-size: 14px; font-weight: 700; color: var(--primary-brand); white-space: nowrap; }
        
        .qty-controls-wrapper { min-height: 34px; display: flex; align-items: flex-end; margin-top: 4px; }
        .qty-controls { display: flex; align-items: center; gap: 8px; }
        .qty-btn { width: 30px; height: 30px; border-radius: 9px; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
        .qty-btn.minus { background: var(--bg-app-alt); color: var(--text-secondary); }
        .qty-btn.plus { background: var(--primary-brand); color: #fff; }
        .qty-btn:active { transform: scale(0.9); }
        .qty-num { font-size: 13px; font-weight: 700; min-width: 20px; text-align: center; color: var(--text-primary); }
        .add-btn { width: 32px; height: 32px; border-radius: 50%; background: var(--primary-brand); border: none; color: #fff; cursor: pointer; margin-top: 4px; margin-left: auto; display: flex; align-items: center; justify-content: center; transition: all 0.2s; padding: 0; flex-shrink: 0; box-shadow: 0 4px 10px rgba(74, 155, 173, 0.3); }
        .add-btn svg { display: block; stroke: currentColor; }
        .add-btn:active { transform: scale(0.85); box-shadow: none; }
        .add-btn:disabled { background: var(--text-tertiary); opacity: 0.5; cursor: not-allowed; }
        
        .bottom-bar { 
          position: fixed; 
          bottom: 0; 
          left: 50%; 
          transform: translateX(-50%); 
          width: 100%; 
          background: var(--bg-surface); 
          border-top: 1px solid var(--border-light); 
          padding: 16px 20px 24px; 
          display: flex; 
          align-items: center; 
          justify-content: space-between; 
          gap: 20px;
          z-index: 100; 
          box-shadow: var(--shadow-lg); 
          border-radius: 24px 24px 0 0;
        }
        .bottom-total-label { font-size: 13px; color: var(--text-tertiary); font-weight: 600; }
        .bottom-total-val { font-size: 20px; font-weight: 800; color: var(--text-primary); margin-top: 2px; white-space: nowrap; }
        .tagih-btn { background: var(--primary-brand); color: #fff; border: none; border-radius: 14px; padding: 14px 16px; font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.2s; flex: 1; max-width: 200px; text-align: center; }
        .tagih-btn:active { transform: scale(0.96); opacity: 0.9; }
        .tagih-btn:disabled { background: var(--border-strong); color: var(--text-tertiary); cursor: not-allowed; }
        
        /* Payment Styles */
        .payment-total-card { background: var(--primary-brand); border-radius: 20px; padding: 24px; color: #fff; margin-bottom: 24px; position: relative; overflow: hidden; box-shadow: 0 8px 24px rgba(74, 155, 173, 0.4); width: 100%; }
        .payment-total-label { font-size: 13px; opacity: 0.8; margin-bottom: 6px; }
        .payment-total-val { font-size: 32px; font-weight: 800; }
        .payment-total-sub { font-size: 13px; opacity: 0.7; margin-top: 4px; }
        
        .section-title { font-size: 12px; font-weight: 700; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 12px; }
        .method-option { background: var(--bg-surface); border-radius: 16px; padding: 16px; margin-bottom: 12px; display: flex; align-items: center; gap: 16px; border: 1.5px solid var(--border-light); cursor: pointer; transition: all 0.2s; width: 100%; }
        .method-option.active { border-color: var(--primary-brand); background: var(--primary-light); box-shadow: 0 4px 12px rgba(74, 155, 173, 0.1); }
        .method-icon-box { width: 48px; height: 48px; border-radius: 14px; background: var(--bg-app-alt); display: flex; align-items: center; justify-content: center; font-size: 24px; }
        .method-option.active .method-icon-box { background: var(--bg-surface); color: var(--primary-brand); }
        .method-label { font-size: 16px; font-weight: 700; color: var(--text-primary); }
        .method-desc { font-size: 12px; color: var(--text-tertiary); margin-top: 2px; }
        .method-radio { width: 22px; height: 22px; border-radius: 50%; border: 2px solid var(--border-strong); display: flex; align-items: center; justify-content: center; }
        .method-radio.active { border-color: var(--primary-brand); background: var(--primary-brand); }
        .radio-dot { width: 8px; height: 8px; border-radius: 50%; background: #fff; }
        
        .cash-input-area { background: var(--bg-surface); border-radius: 20px; padding: 20px; border: 1.5px solid var(--border-light); width: 100%; }
        .input-label { font-size: 12px; font-weight: 800; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 8px; display: block; }
        .input-with-prefix { position: relative; width: 100%; margin-bottom: 16px; }
        .prefix-text { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); font-weight: 700; color: var(--primary-brand); font-size: 16px; }
        .input-with-prefix .form-input { width: 100%; padding: 14px 14px 14px 44px; border: 2px solid var(--border-light); border-radius: 12px; font-size: 18px; font-weight: 700; outline: none; color: var(--text-primary); background: var(--bg-surface-alt); margin: 0; box-sizing: border-box; transition: all 0.2s; }
        .input-with-prefix .form-input:focus { border-color: var(--primary-brand); box-shadow: 0 0 0 4px rgba(74, 155, 173, 0.1); }
        .quick-cash-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 14px; }
        .quick-cash-btn { padding: 12px 4px; border-radius: 12px; border: 1.5px solid var(--border-strong); background: var(--bg-surface-alt); color: var(--text-secondary); font-size: 12px; font-weight: 700; cursor: pointer; }
        .quick-cash-btn.active { border-color: var(--primary-brand); background: var(--primary-light); color: var(--primary-brand); }
        .kembalian-box { display: flex; justify-content: space-between; align-items: center; background: var(--primary-light); border-radius: 12px; padding: 14px 16px; margin-top: 16px; }
        .kembalian-label { font-size: 14px; color: var(--text-secondary); font-weight: 600; }
        .kembalian-val { font-size: 18px; font-weight: 800; color: var(--primary-brand); }
        
        .qris-box { background: var(--bg-surface); border-radius: 20px; padding: 24px; border: 1.5px solid var(--border-light); text-align: center; width: 100%; }
        .qris-desc { font-size: 14px; color: var(--text-tertiary); margin-bottom: 20px; }
        .qris-placeholder { background: #fff; padding: 24px; border-radius: 16px; display: inline-block; border: 2px dashed var(--border-strong); }
        .qris-total { font-size: 24px; font-weight: 800; color: var(--primary-brand); margin-top: 20px; }
        
        .transfer-box { background: var(--bg-surface); border-radius: 20px; padding: 20px; border: 1.5px solid var(--border-light); width: 100%; }
        .transfer-item { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--border-light); }
        .copy-btn { padding: 8px 14px; border-radius: 10px; border: 1.5px solid var(--primary-brand); background: var(--primary-light); color: var(--primary-brand); font-size: 12px; font-weight: 700; cursor: pointer; }
        
        /* Success Screen */
        .success-container { display: flex; flex-direction: column; align-items: center; justify-content: flex-start; min-height: 100vh; padding: 32px 20px 140px; width: 100%; }
        .success-header { text-align: center; margin-bottom: 32px; width: 100%; }
        .success-icon-box { width: 96px; height: 96px; border-radius: 50%; background: linear-gradient(135deg, var(--primary-brand), var(--primary-dark)); display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; box-shadow: 0 12px 32px rgba(74, 155, 173, 0.4); animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        .success-title { font-size: 26px; font-weight: 800; color: var(--text-primary); letter-spacing: -0.5px; }
        .success-time { font-size: 14px; color: var(--text-tertiary); margin-top: 8px; }
        
        .success-card { width: 100%; background: var(--bg-surface); border-radius: 20px; border: 1.5px solid var(--border-light); overflow: hidden; margin-bottom: 16px; flex-shrink: 0; }
        .success-inv-row { padding: 16px 20px; border-bottom: 1px solid var(--border-light); display: flex; justify-content: space-between; align-items: center; }
        .inv-code { font-weight: 700; color: var(--primary-brand); font-family: monospace; }
        .success-summary { padding: 20px; }
        .summary-row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 14px; color: var(--text-tertiary); }
        .summary-row span:last-child { font-weight: 700; color: var(--text-primary); }
        .summary-row.highlight span:last-child { color: var(--primary-brand); font-size: 18px; font-weight: 800; }
        
        .success-items-list { width: 100%; background: var(--bg-surface); border-radius: 20px; border: 1.5px solid var(--border-light); padding: 20px; flex-shrink: 0; }
        .list-title { font-size: 12px; font-weight: 700; color: var(--text-tertiary); text-transform: uppercase; margin-bottom: 16px; }
        .list-item { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; color: var(--text-primary); }
        .list-item span:last-child { font-weight: 700; }
        
        .success-bottom-bar { 
          position: fixed; 
          bottom: 0; 
          left: 0;
          width: 100%; 
          background: var(--bg-surface); 
          border-top: 1px solid var(--border-light); 
          padding: 16px 20px 32px; 
          z-index: 100; 
          box-shadow: var(--shadow-lg);
          border-radius: 20px 20px 0 0;
        }
        .action-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; }
        .secondary-action { padding: 14px; border-radius: 14px; border: 1.5px solid var(--border-light); background: var(--bg-app-alt); color: var(--text-secondary); font-weight: 700; cursor: pointer; }
        .primary-action, .new-trans-btn-big { width: 100%; padding: 16px; border-radius: 16px; background: var(--primary-brand); color: #fff; border: none; font-weight: 700; cursor: pointer; font-size: 16px; box-shadow: 0 8px 20px rgba(74, 155, 173, 0.3); }

        /* Cart Sheet Styles */
        .overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 400; backdrop-filter: blur(8px); }
        .cart-sheet { 
          position: fixed; 
          bottom: 0; 
          left: 50%; 
          transform: translateX(-50%); 
          width: 100%; 
          max-width: 650px; 
          background: var(--bg-surface); 
          border-radius: 28px 28px 0 0; 
          z-index: 500; 
          max-height: 85vh; 
          display: flex; 
          flex-direction: column; 
          box-shadow: var(--shadow-lg); 
          animation: slideUp 0.3s ease-out; 
        }
        .sheet-handle { width: 40px; height: 5px; background: var(--border-strong); border-radius: 10px; margin: 12px auto; }
        .sheet-header { padding: 8px 24px 16px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border-light); }
        .sheet-title { font-size: 18px; font-weight: 800; color: var(--text-primary); }
        .sheet-count { font-size: 12px; color: var(--primary-brand); background: var(--primary-light); padding: 6px 12px; border-radius: 20px; font-weight: 700; }
        .sheet-body { overflow-y: auto; flex: 1; padding: 16px 24px; }
        .cart-item { display: flex; align-items: center; gap: 14px; padding: 12px 0; border-bottom: 1px solid var(--border-light); }
        .remove-btn { width: 32px; height: 32px; border-radius: 10px; background: var(--status-red-light); border: none; cursor: pointer; color: var(--status-red); display: flex; align-items: center; justify-content: center; }
        .cart-item-info { flex: 1; min-width: 0; }
        .cart-item-name { font-size: 15px; font-weight: 600; color: var(--text-primary); }
        .cart-item-price { font-size: 13px; color: var(--text-tertiary); margin-top: 2px; }
        .cart-item-subtotal { font-size: 15px; font-weight: 700; color: var(--primary-brand); text-align: right; }
        .sheet-footer { padding: 20px 24px 32px; border-top: 1px solid var(--border-light); background: var(--bg-surface); }
        .total-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; }
        .total-label { font-size: 15px; color: var(--text-secondary); font-weight: 500; }
        .total-val { font-size: 24px; font-weight: 800; color: var(--text-primary); }
        .bayar-btn { width: 100%; padding: 18px; border-radius: 18px; background: var(--primary-brand); color: #fff; border: none; font-size: 17px; font-weight: 700; cursor: pointer; box-shadow: 0 8px 20px rgba(74, 155, 173, 0.3); }
        
        /* Receipt Paper Styles */
        .receipt-paper-teal { background: #fff; border-radius: 20px; border: 1.5px solid #ECEEF0; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); width: 100%; color: #000; }
        .receipt-header-teal { background: #fff; color: #000; padding: 24px 16px; text-align: center; border-bottom: 1px dashed #ECEEF0; }
        .receipt-brand { font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
        .receipt-sub { font-size: 13px; opacity: 0.8; margin-top: 4px; }
        .receipt-line { width: 40px; height: 2px; background: rgba(255,255,255,0.3); margin: 16px auto; border-radius: 4px; }
        .receipt-time { font-size: 12px; opacity: 0.7; }
        .receipt-inv { padding: 16px 24px; background: #FAFBFC; border-bottom: 1.5px dashed #ECEEF0; display: flex; justify-content: space-between; align-items: center; }
        .inv-num { font-weight: 700; color: var(--primary-brand); font-family: monospace; }
        .receipt-items { padding: 24px; }
        .r-item-row { display: flex; justify-content: space-between; margin-bottom: 12px; }
        .r-item-name { font-size: 14px; font-weight: 600; color: #111; }
        .r-item-price { font-size: 12px; color: #aaa; margin-top: 2px; }
        .r-item-total { font-size: 14px; font-weight: 700; color: #333; }
        .r-divider { border-top: 1.5px dashed #ECEEF0; margin: 0 24px; }
        .receipt-totals { padding: 20px 24px; }
        .r-total-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; color: #888; }
        .r-total-row.highlight span:last-child { color: var(--primary-brand); font-weight: 700; }
        .receipt-final { padding: 20px 24px; display: flex; justify-content: space-between; align-items: center; }
        .receipt-final span:first-child { font-size: 16px; font-weight: 700; color: #111; }
        .final-val { font-size: 22px; font-weight: 800; color: var(--primary-brand); }
        .receipt-footer-msg { padding: 0 24px 32px; text-align: center; font-size: 12px; color: #bbb; }
        .print-btn-receipt { margin-left: auto; padding: 8px 16px; border-radius: 12px; background: var(--primary-light); border: 1.5px solid var(--primary-brand); color: var(--primary-brand); font-weight: 700; cursor: pointer; }
        
        @keyframes popIn { from { transform: scale(0.6); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes slideUp { from { transform: translate(-50%, 100%); } to { transform: translate(-50%, 0); } }

      `}</style>

            {screen === "cashier" && (
                <CashierScreen
                    products={productsData}
                    categories={categories}
                    catFilter={catFilter}
                    setCatFilter={setCatFilter}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    cart={cart}
                    setCart={setCart}
                    loading={loadingProducts && (productsData || []).length === 0}
                    onCheckout={handleCheckout}
                    onToggleSidebar={onToggleSidebar}
                />
            )}

            {screen === "payment" && (
                <PaymentScreen
                    user={user}
                    cart={cart}
                    total={total}
                    isProcessing={isProcessing}
                    onBack={() => setScreen("cashier")}
                    onPay={handlePay}
                />
            )}

            {screen === "success" && (
                <SuccessScreen
                    cart={cart}
                    total={total}
                    payInfo={payInfo}
                    transactionResult={transactionResult}
                    user={user}
                    onNew={resetAll}
                />
            )}
        </div>
    );
};

export default Kasir;
