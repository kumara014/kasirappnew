import React, { useState, useEffect, useRef } from 'react';
import './Kasir.css';
import './PaymentStyles.css';
import { Search, Coffee, Utensils, User, Edit, Plus, Minus, X, Printer, CheckCircle, Wallet, Trash2, Filter, Menu } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { apiFetch } from '../../config';
import { useNotification } from '../../context/NotificationContext';
import SafeImage from '../Common/SafeImage';
import { haptic } from '../../utils/haptics';

const formatRp = (n) =>
    "Rp" + new Intl.NumberFormat("id-ID").format(n);

const TEAL = "#4A9BAD";
const TEAL_LIGHT = "#EAF5F7";
const TEAL_DARK = "#357585";

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

const getIcon = (catName) => CAT_ICONS[catName] || "📦";
const getColor = (catName) => CAT_COLORS[catName] || RANDOM_COLORS[Math.abs(catName.length || 0) % RANDOM_COLORS.length];

// ─── SCREEN: CASHIER ──────────────────────────────────────────────────────────
function CashierScreen({ onCheckout, products, categories, catFilter, setCatFilter, searchQuery, setSearchQuery, cart, setCart, loading, onToggleSidebar }) {
    const [tab, setTab] = useState("produk");
    const [manualName, setManualName] = useState("");
    const [manualPrice, setManualPrice] = useState("");
    const [manualQty, setManualQty] = useState(1);
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

    const addManual = () => {
        if (!manualName || !manualPrice) return;
        const price = Number(manualPrice.replace(/\D/g, ""));
        const item = {
            id_barang: `manual-${Date.now()}`,
            nama_barang: manualName,
            harga: price,
            qty: manualQty,
            isManual: true
        };
        setCart((prev) => [...prev, item]);
        setManualName(""); setManualPrice(""); setManualQty(1);
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
                                <Menu size={20} color={TEAL} />
                            </button>
                        )}
                        <span className="topbar-title">Kasir <span style={{ color: TEAL }}>Pointly</span></span>
                    </div>
                    <button className="cart-icon-btn" onClick={() => totalItems > 0 && setShowCart(true)}>
                        🛒
                        {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
                    </button>
                </div>
                <div className="tab-row">
                    <button className={`tab-btn${tab === "manual" ? " active" : ""}`} onClick={() => setTab("manual")}>✏️ Manual</button>
                    <button className={`tab-btn${tab === "produk" ? " active" : ""}`} onClick={() => setTab("produk")}>📦 Produk</button>
                </div>
            </div>

            <div className="content">
                {tab === "produk" ? (
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
                            <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>Memuat produk...</div>
                        ) : (
                            <div className="product-grid">
                                {filtered.map((p) => {
                                    const qty = getItemQty(p.id_barang);
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
                                                    background: getColor(p.nama_kategori).bg,
                                                    color: getColor(p.nama_kategori).color
                                                }}>
                                                    {getIcon(p.nama_kategori)} {p.nama_kategori || "Tanpa Kategori"}
                                                </div>
                                                <div className="product-info-sub">Stok: {p.stok}</div>
                                            </div>
                                            <div className="product-price-col">
                                                <div className="product-price-val">{formatRp(p.harga)}</div>
                                                <div className="qty-controls-wrapper">
                                                    {qty > 0 ? (
                                                        <div className="qty-controls">
                                                            <button className="qty-btn minus" onClick={(e) => { e.stopPropagation(); updateQty(p.id_barang, -1); }}>−</button>
                                                            <span className="qty-num">{qty}</span>
                                                            <button className="qty-btn plus" onClick={(e) => { e.stopPropagation(); addToCart(p); }}>+</button>
                                                        </div>
                                                    ) : (
                                                        <button className="add-btn" disabled={Number(p.stok) <= 0} onClick={(e) => { e.stopPropagation(); addToCart(p); }}>
                                                            {Number(p.stok) <= 0 ? 'X' : '+'}
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
                ) : (
                    <div className="manual-card">
                        <div className="input-label">Nama Barang</div>
                        <input className="form-input" placeholder="Masukkan nama barang" value={manualName} onChange={(e) => setManualName(e.target.value)} />
                        <div className="input-label">Harga Satuan</div>
                        <input className="form-input" placeholder="Rp 0" value={manualPrice}
                            onChange={(e) => {
                                const raw = e.target.value.replace(/\D/g, "");
                                setManualPrice(raw ? "Rp" + new Intl.NumberFormat("id-ID").format(raw) : "");
                            }}
                        />
                        <div className="input-label">Jumlah</div>
                        <div className="qty-row">
                            <button className="qty-row-btn" onClick={() => setManualQty((q) => Math.max(1, q - 1))}>−</button>
                            <span className="qty-row-val">{manualQty}</span>
                            <button className="qty-row-btn" onClick={() => setManualQty((q) => q + 1)}>+</button>
                        </div>
                        <button className="add-manual-btn" disabled={!manualName || !manualPrice} onClick={addManual}>
                            + Tambah ke Transaksi
                        </button>
                    </div>
                )}
            </div>

            <div className="bottom-bar">
                <div>
                    <div className="bottom-total-label">Total Tagihan</div>
                    <div className="bottom-total-val">{formatRp(total)}</div>
                </div>
                <button className="tagih-btn" disabled={cart.length === 0} onClick={() => setShowCart(true)}>
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
function PaymentScreen({ cart, total, onBack, onPay, isProcessing }) {
    const [method, setMethod] = useState("Cash");
    const [cashInput, setCashInput] = useState("");

    const cashNum = Number(cashInput.replace(/\D/g, ""));
    const kembalian = cashNum - total;
    const cashValid = method === "Cash" && cashNum >= total;
    const onlineValid = method === "QRIS" || method === "Transfer";
    const canPay = (cashValid || onlineValid) && !isProcessing;

    const handleQuick = (val) => {
        setCashInput("Rp" + new Intl.NumberFormat("id-ID").format(val));
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
                    <button className="back-btn" onClick={onBack}>←</button>
                    <span className="topbar-title">Metode <span style={{ color: TEAL }}>Pembayaran</span></span>
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
                        <input className="form-input" placeholder="Rp 0" value={cashInput}
                            onChange={(e) => {
                                const raw = e.target.value.replace(/\D/g, "");
                                setCashInput(raw ? "Rp" + new Intl.NumberFormat("id-ID").format(raw) : "");
                            }}
                        />
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
                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Logo_QRIS.svg/1200px-Logo_QRIS.svg.png" alt="QRIS" style={{ width: 80, marginBottom: 10 }} />
                            <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=RESTO_TRANSACTION_${Date.now()}_TOTAL_${total}`}
                                alt="QR Code"
                            />
                        </div>
                        <div className="qris-total">{formatRp(total)}</div>
                    </div>
                )}

                {method === "Transfer" && (
                    <div className="transfer-box">
                        <div className="section-title">Rekening Tujuan</div>
                        <div className="transfer-item">
                            <div>
                                <div style={{ fontWeight: 700 }}>BCA</div>
                                <div style={{ fontFamily: 'monospace', color: '#888' }}>1234567890</div>
                            </div>
                            <button className="copy-btn">Salin</button>
                        </div>
                        <div className="transfer-item">
                            <div>
                                <div style={{ fontWeight: 700 }}>Mandiri</div>
                                <div style={{ fontFamily: 'monospace', color: '#888' }}>0987654321</div>
                            </div>
                            <button className="copy-btn">Salin</button>
                        </div>
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
function SuccessScreen({ cart, total, payInfo, onNew, transactionResult }) {
    const [showReceipt, setShowReceipt] = useState(false);
    const now = new Date();
    const dateStr = now.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
    const timeStr = now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

    if (showReceipt) {
        return (
            <>
                <div className="topbar">
                    <div className="topbar-row">
                        <span className="topbar-title">Struk <span style={{ color: TEAL }}>Transaksi</span></span>
                        <button className="print-btn-receipt" onClick={() => window.print()}>🖨️ Cetak</button>
                    </div>
                </div>
                <div className="content">
                    <div className="receipt-paper-teal">
                        <div className="receipt-header-teal">
                            <div className="receipt-brand">Pointly</div>
                            <div className="receipt-sub">Digital POS System</div>
                            <div className="receipt-line" />
                            <div className="receipt-time">{dateStr} • {timeStr}</div>
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
                        <CheckCircle size={48} color="#fff" />
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
    const { productsData, loadingProducts, refreshProducts, refreshDashboard, refreshOrders } = useData();
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
                id_barang: i.isManual ? null : i.id_barang,
                nama_manual: i.isManual ? i.nama_barang : null,
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
                    notify("Transaksi Berhasil!", "success");
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
        
        .kasir-teal-root { 
          font-family: 'Plus Jakarta Sans', sans-serif; 
          background: #F5F7F8; 
          min-height: 100vh; 
          width: 100%;
          display: flex; 
          flex-direction: column; 
          position: relative; 
          overflow-x: hidden;
        }

        .topbar { 
          background: #fff; 
          padding: 10px 20px 0; 
          border-bottom: 1px solid #ECEEF0; 
          position: sticky; 
          top: 0; 
          z-index: 20;
          width: 100%;
        }
        .topbar-row { 
          display: flex; 
          align-items: center; 
          justify-content: space-between; 
          margin-bottom: 14px; 
          width: 100%;
        }
        .topbar-title { font-size: 20px; font-weight: 800; color: #111; letter-spacing: -0.5px; }
        .cart-icon-btn { position: relative; width: 42px; height: 42px; border-radius: 12px; background: ${TEAL_LIGHT}; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 20px; transition: transform 0.1s; }
        .cart-icon-btn:active { transform: scale(0.9); }
        .cart-badge { position: absolute; top: -5px; right: -5px; background: #FF4757; color: #fff; border-radius: 10px; font-size: 10px; font-weight: 700; min-width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; padding: 0 4px; border: 2px solid #fff; }
        
        .tab-row { display: flex; width: 100%; }
        .tab-btn { flex: 1; padding: 12px; text-align: center; font-size: 14px; font-weight: 700; cursor: pointer; border: none; background: none; color: #aaa; border-bottom: 2.5px solid transparent; transition: all 0.2s; }
        .tab-btn.active { color: ${TEAL}; border-bottom-color: ${TEAL}; }
        
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
          border: 1.5px solid #E5E9EC;
          background: #fff;
          font-size: 14px;
          font-weight: 600;
          color: #111;
          outline: none;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%234A9BAD' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 14px center;
          background-size: 16px;
        }

        .search-wrap { position: relative; margin-bottom: 14px; }
        .search-input { width: 100%; padding: 12px 16px 12px 42px; border: 1.5px solid #E5E9EC; border-radius: 12px; font-size: 14px; background: #fff; outline: none; transition: border-color 0.2s; }
        .search-input:focus { border-color: ${TEAL}; }
        .search-ico { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); font-size: 16px; color: #bbb; }
        
        .product-item { 
          background: #fff; 
          border-radius: 14px; 
          padding: 12px 14px; 
          display: flex; 
          align-items: center; 
          gap: 12px; 
          border: 1.5px solid #ECEEF0; 
          cursor: pointer; 
          transition: all 0.15s; 
          position: relative; 
          overflow: hidden; 
        }
        .product-item.in-cart { border-color: ${TEAL}; background: ${TEAL_LIGHT}11; }
        .product-icon { width: 54px; height: 54px; border-radius: 14px; background: ${TEAL_LIGHT}; flex-shrink: 0; display: flex; align-items: center; justify-content: center; overflow: hidden; }
        .product-info { flex: 1; min-width: 0; padding-right: 8px; }
        .product-info-name { font-size: 14px; font-weight: 700; color: #111; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-bottom: 2px; }
        .product-info-cat { display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; border-radius: 6px; font-size: 10px; font-weight: 700; margin-bottom: 4px; }
        .product-info-sub { font-size: 12px; color: #aaa; }
        .product-price-col { text-align: right; flex-shrink: 0; display: flex; flex-direction: column; align-items: flex-end; min-width: 80px; }
        .product-price-val { font-size: 14px; font-weight: 700; color: ${TEAL}; white-space: nowrap; }
        
        .qty-controls-wrapper { min-height: 34px; display: flex; align-items: flex-end; margin-top: 4px; }
        .qty-controls { display: flex; align-items: center; gap: 8px; }
        .qty-btn { width: 28px; height: 28px; border-radius: 8px; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; font-weight: 700; transition: transform 0.1s; }
        .qty-btn.minus { background: #F0F2F4; color: #555; }
        .qty-btn.plus { background: ${TEAL}; color: #fff; }
        .qty-num { font-size: 13px; font-weight: 700; min-width: 20px; text-align: center; }
        .add-btn { width: 30px; height: 30px; border-radius: 9px; background: ${TEAL}; border: none; color: #fff; font-weight: 700; cursor: pointer; margin-top: 4px; margin-left: auto; }
        .add-btn:disabled { background: #ddd; cursor: not-allowed; }

        .manual-card { background: #fff; border-radius: 16px; padding: 20px; border: 1.5px solid #ECEEF0; width: 100%; }
        .input-label { font-size: 12px; font-weight: 600; color: #888; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
        .form-input { width: 100%; padding: 14px; border: 1.5px solid #E5E9EC; border-radius: 12px; font-size: 14px; outline: none; background: #FAFBFC; margin-bottom: 16px; }
        .qty-row { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
        .qty-row-btn { width: 42px; height: 42px; border-radius: 12px; border: 1.5px solid #E5E9EC; background: #fff; cursor: pointer; font-size: 20px; }
        .qty-row-val { font-size: 20px; font-weight: 700; min-width: 40px; text-align: center; }
        .add-manual-btn { width: 100%; padding: 16px; border-radius: 14px; background: ${TEAL}; color: #fff; border: none; font-weight: 700; cursor: pointer; }

        .bottom-bar { 
          position: fixed; 
          bottom: 0; 
          left: 50%; 
          transform: translateX(-50%); 
          width: 100%; 
          background: #fff; 
          border-top: 1px solid #ECEEF0; 
          padding: 16px 20px 24px; 
          display: flex; 
          align-items: center; 
          justify-content: space-between; 
          gap: 20px;
          z-index: 30; 
          box-shadow: 0 -10px 30px rgba(0,0,0,0.08); 
          border-radius: 24px 24px 0 0;
        }
        .bottom-total-label { font-size: 13px; color: #aaa; font-weight: 600; }
        .bottom-total-val { font-size: 20px; font-weight: 800; color: #111; margin-top: 2px; white-space: nowrap; }
        .tagih-btn { background: ${TEAL}; color: #fff; border: none; border-radius: 14px; padding: 14px 16px; font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.2s; flex: 1; max-width: 200px; text-align: center; }
        .tagih-btn:active { transform: scale(0.96); opacity: 0.9; }
        .tagih-btn:disabled { background: #E0E3E7; color: #888; cursor: not-allowed; }
        
        /* Payment Styles */
        .payment-total-card { background: ${TEAL}; border-radius: 20px; padding: 24px; color: #fff; margin-bottom: 24px; position: relative; overflow: hidden; box-shadow: 0 8px 24px ${TEAL}44; width: 100%; }
        .payment-total-label { font-size: 13px; opacity: 0.8; margin-bottom: 6px; }
        .payment-total-val { font-size: 32px; font-weight: 800; }
        .payment-total-sub { font-size: 13px; opacity: 0.7; margin-top: 4px; }
        
        .section-title { font-size: 12px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 12px; }
        .method-option { background: #fff; border-radius: 16px; padding: 16px; margin-bottom: 12px; display: flex; align-items: center; gap: 16px; border: 1.5px solid #ECEEF0; cursor: pointer; transition: all 0.2s; width: 100%; }
        .method-option.active { border-color: ${TEAL}; background: ${TEAL_LIGHT}11; box-shadow: 0 4px 12px ${TEAL}11; }
        .method-icon-box { width: 48px; height: 48px; border-radius: 14px; background: #F5F7F8; display: flex; align-items: center; justify-content: center; font-size: 24px; }
        .method-option.active .method-icon-box { background: ${TEAL_LIGHT}; color: ${TEAL}; }
        .method-label { font-size: 16px; font-weight: 700; color: #111; }
        .method-desc { font-size: 12px; color: #aaa; margin-top: 2px; }
        .method-radio { width: 22px; height: 22px; border-radius: 50%; border: 2px solid #ddd; display: flex; align-items: center; justify-content: center; }
        .method-radio.active { border-color: ${TEAL}; background: ${TEAL}; }
        .radio-dot { width: 8px; height: 8px; border-radius: 50%; background: #fff; }
        
        .cash-input-area { background: #fff; border-radius: 20px; padding: 20px; border: 1.5px solid #ECEEF0; width: 100%; }
        .quick-cash-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 14px; }
        .quick-cash-btn { padding: 12px 4px; border-radius: 12px; border: 1.5px solid #E5E9EC; background: #FAFBFC; color: #555; font-size: 12px; font-weight: 700; cursor: pointer; }
        .quick-cash-btn.active { border-color: ${TEAL}; background: ${TEAL_LIGHT}; color: ${TEAL}; }
        .kembalian-box { display: flex; justify-content: space-between; align-items: center; background: ${TEAL_LIGHT}; border-radius: 12px; padding: 14px 16px; margin-top: 16px; }
        .kembalian-label { font-size: 14px; color: #555; font-weight: 600; }
        .kembalian-val { font-size: 18px; font-weight: 800; color: ${TEAL}; }
        
        .qris-box { background: #fff; border-radius: 20px; padding: 24px; border: 1.5px solid #ECEEF0; text-align: center; width: 100%; }
        .qris-desc { font-size: 14px; color: #888; margin-bottom: 20px; }
        .qris-placeholder { background: #F5F7F8; padding: 24px; border-radius: 16px; display: inline-block; border: 2px dashed #ddd; }
        .qris-total { font-size: 24px; font-weight: 800; color: ${TEAL}; margin-top: 20px; }
        
        .transfer-box { background: #fff; border-radius: 20px; padding: 20px; border: 1.5px solid #ECEEF0; width: 100%; }
        .transfer-item { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #F5F7F8; }
        .copy-btn { padding: 8px 14px; border-radius: 10px; border: 1.5px solid ${TEAL}; background: ${TEAL_LIGHT}; color: ${TEAL}; font-size: 12px; font-weight: 700; cursor: pointer; }
        
        /* Success Screen */
        .success-container { display: flex; flex-direction: column; align-items: center; justify-content: flex-start; min-height: 100vh; padding: 32px 20px 140px; width: 100%; }
        .success-header { text-align: center; margin-bottom: 32px; width: 100%; }
        .success-icon-box { width: 96px; height: 96px; border-radius: 50%; background: linear-gradient(135deg, ${TEAL}, ${TEAL_DARK}); display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; box-shadow: 0 12px 32px ${TEAL}44; animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        .success-title { font-size: 26px; font-weight: 800; color: #111; letter-spacing: -0.5px; }
        .success-time { font-size: 14px; color: #aaa; margin-top: 8px; }
        
        .success-card { width: 100%; background: #fff; border-radius: 20px; border: 1.5px solid #ECEEF0; overflow: hidden; margin-bottom: 16px; flex-shrink: 0; }
        .success-inv-row { padding: 16px 20px; border-bottom: 1px solid #F5F7F8; display: flex; justify-content: space-between; align-items: center; }
        .inv-code { font-weight: 700; color: ${TEAL}; font-family: monospace; }
        .success-summary { padding: 20px; }
        .summary-row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 14px; color: #888; }
        .summary-row span:last-child { font-weight: 700; color: #111; }
        .summary-row.highlight span:last-child { color: ${TEAL}; font-size: 18px; font-weight: 800; }
        
        .success-items-list { width: 100%; background: #fff; border-radius: 20px; border: 1.5px solid #ECEEF0; padding: 20px; flex-shrink: 0; }
        .list-title { font-size: 12px; font-weight: 700; color: #aaa; text-transform: uppercase; margin-bottom: 16px; }
        .list-item { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; }
        .list-item span:last-child { font-weight: 700; }
        
        .success-bottom-bar { 
          position: fixed; 
          bottom: 0; 
          left: 0;
          width: 100%; 
          background: #fff; 
          border-top: 1px solid #ECEEF0; 
          padding: 16px 20px 32px; 
          z-index: 100; 
          box-shadow: 0 -10px 40px rgba(0,0,0,0.05);
          border-radius: 20px 20px 0 0;
        }
        .action-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; }
        .secondary-action { padding: 14px; border-radius: 14px; border: 1.5px solid #ECEEF0; background: #fff; color: #555; font-weight: 700; cursor: pointer; }
        .primary-action, .new-trans-btn-big { width: 100%; padding: 16px; border-radius: 16px; background: ${TEAL}; color: #fff; border: none; font-weight: 700; cursor: pointer; font-size: 16px; box-shadow: 0 8px 20px ${TEAL}33; }

        /* Cart Sheet Styles */
        .overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 400; backdrop-filter: blur(4px); }
        .cart-sheet { 
          position: fixed; 
          bottom: 0; 
          left: 50%; 
          transform: translateX(-50%); 
          width: 100%; 
          max-width: 650px; 
          background: #fff; 
          border-radius: 28px 28px 0 0; 
          z-index: 500; 
          max-height: 85vh; 
          display: flex; 
          flex-direction: column; 
          box-shadow: 0 -12px 48px rgba(0,0,0,0.15); 
          animation: slideUp 0.3s ease-out; 
        }
        .sheet-handle { width: 40px; height: 5px; background: #E0E3E7; border-radius: 10px; margin: 12px auto; }
        .sheet-header { padding: 8px 24px 16px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #F0F2F4; }
        .sheet-title { font-size: 18px; font-weight: 800; color: #111; }
        .sheet-count { font-size: 12px; color: ${TEAL}; background: ${TEAL_LIGHT}; padding: 6px 12px; border-radius: 20px; font-weight: 700; }
        .sheet-body { overflow-y: auto; flex: 1; padding: 16px 24px; }
        .cart-item { display: flex; align-items: center; gap: 14px; padding: 12px 0; border-bottom: 1px solid #F5F7F8; }
        .remove-btn { width: 32px; height: 32px; border-radius: 10px; background: #FFF0F1; border: none; cursor: pointer; color: #FF4757; display: flex; align-items: center; justify-content: center; }
        .cart-item-info { flex: 1; min-width: 0; }
        .cart-item-name { font-size: 15px; font-weight: 600; color: #111; }
        .cart-item-price { font-size: 13px; color: #aaa; margin-top: 2px; }
        .cart-item-subtotal { font-size: 15px; font-weight: 700; color: ${TEAL}; text-align: right; }
        .sheet-footer { padding: 20px 24px 32px; border-top: 1px solid #F0F2F4; background: #fff; }
        .total-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; }
        .total-label { font-size: 15px; color: #888; font-weight: 500; }
        .total-val { font-size: 24px; font-weight: 800; color: #111; }
        .bayar-btn { width: 100%; padding: 18px; border-radius: 18px; background: ${TEAL}; color: #fff; border: none; font-size: 17px; font-weight: 700; cursor: pointer; box-shadow: 0 8px 20px ${TEAL}33; }
        
        /* Receipt Paper Styles */
        .receipt-paper-teal { background: #fff; border-radius: 20px; border: 1.5px solid #ECEEF0; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); width: 100%; }
        .receipt-header-teal { background: ${TEAL}; color: #fff; padding: 32px 24px; text-align: center; }
        .receipt-brand { font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
        .receipt-sub { font-size: 13px; opacity: 0.8; margin-top: 4px; }
        .receipt-line { width: 40px; height: 2px; background: rgba(255,255,255,0.3); margin: 16px auto; border-radius: 4px; }
        .receipt-time { font-size: 12px; opacity: 0.7; }
        .receipt-inv { padding: 16px 24px; background: #FAFBFC; border-bottom: 1.5px dashed #ECEEF0; display: flex; justify-content: space-between; align-items: center; }
        .inv-num { font-weight: 700; color: ${TEAL}; font-family: monospace; }
        .receipt-items { padding: 24px; }
        .r-item-row { display: flex; justify-content: space-between; margin-bottom: 12px; }
        .r-item-name { font-size: 14px; font-weight: 600; color: #111; }
        .r-item-price { font-size: 12px; color: #aaa; margin-top: 2px; }
        .r-item-total { font-size: 14px; font-weight: 700; color: #333; }
        .r-divider { border-top: 1.5px dashed #ECEEF0; margin: 0 24px; }
        .receipt-totals { padding: 20px 24px; }
        .r-total-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; color: #888; }
        .r-total-row.highlight span:last-child { color: ${TEAL}; font-weight: 700; }
        .receipt-final { padding: 20px 24px; display: flex; justify-content: space-between; align-items: center; }
        .receipt-final span:first-child { font-size: 16px; font-weight: 700; color: #111; }
        .final-val { font-size: 22px; font-weight: 800; color: ${TEAL}; }
        .receipt-footer-msg { padding: 0 24px 32px; text-align: center; font-size: 12px; color: #bbb; }
        .print-btn-receipt { margin-left: auto; padding: 8px 16px; border-radius: 12px; background: ${TEAL_LIGHT}; border: 1.5px solid ${TEAL}; color: ${TEAL}; font-weight: 700; cursor: pointer; }
        
        @keyframes popIn { from { transform: scale(0.6); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes slideUp { from { transform: translate(-50%, 100%); } to { transform: translate(-50%, 0); } }

        @media print {
          .kasir-teal-root > *:not(.content) { display: none !important; }
          .content { padding: 0 !important; overflow: visible !important; }
          .receipt-paper-teal { box-shadow: none !important; border: 1px solid #eee !important; }
        }
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
                    loading={loadingProducts && productsData.length === 0}
                    onCheckout={handleCheckout}
                    onToggleSidebar={onToggleSidebar}
                />
            )}

            {screen === "payment" && (
                <PaymentScreen
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
                    onNew={resetAll}
                />
            )}
        </div>
    );
};

export default Kasir;
