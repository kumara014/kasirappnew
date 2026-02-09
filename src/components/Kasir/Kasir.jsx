import React, { useState } from 'react';
import './Kasir.css';
import './PaymentStyles.css';
import { Search, Coffee, Utensils, User, Edit, Plus, Minus, X, Printer, CheckCircle, Wallet, Trash2 } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { apiFetch } from '../../config';
import { useNotification } from '../../context/NotificationContext';
import SafeImage from '../Common/SafeImage';

const Kasir = () => {
    const { notify } = useNotification();
    const { productsData, loadingProducts, refreshProducts, refreshDashboard, refreshOrders } = useData();
    // const [catFilter, setCatFilter] = useState('All'); // Removed Category Filter
    const [searchQuery, setSearchQuery] = useState('');
    const [cart, setCart] = useState([]);
    const [selectedPayment, setSelectedPayment] = useState('Cash');
    const [animatingId, setAnimatingId] = useState(null);
    const [discount, setDiscount] = useState(0);

    // Payment Logic State
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [paymentStep, setPaymentStep] = useState('input');
    const [paidAmount, setPaidAmount] = useState('');
    const [changeAmount, setChangeAmount] = useState(0);

    React.useEffect(() => {
        refreshProducts(true);
    }, [refreshProducts]);

    const products = productsData;
    const loading = loadingProducts && products.length === 0;

    // Filter Logic
    const filteredProducts = products.filter(p => {
        // const matchesCat = catFilter === 'All' || p.category === catFilter;
        const matchesSearch = p.nama_barang.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
    });

    // Cart Logic
    // Cart Logic
    const addToCart = (product) => {
        const qtyInCart = getItemQty(product.id_barang);
        const stockAvailable = Number(product.stok || 0);

        if (stockAvailable <= qtyInCart) {
            return; // No more stock
        }

        setAnimatingId(product.id_barang);
        setTimeout(() => setAnimatingId(null), 300);

        const existing = cart.find(item => item.id_barang === product.id_barang);
        if (existing) {
            setCart(cart.map(item =>
                item.id_barang === product.id_barang ? { ...item, qty: item.qty + 1 } : item
            ));
        } else {
            setCart([...cart, { ...product, qty: 1 }]);
        }
    };

    const clearCart = () => {
        if (cart.length === 0) return;
        if (window.confirm("Hapus semua item di keranjang?")) {
            setCart([]);
            setDiscount(0);
            notify("Keranjang dikosongkan", "info");
        }
    };

    const updateQty = (productId, delta) => {
        setCart(prevCart => prevCart.map(item => {
            if (item.id_barang === productId) {
                return { ...item, qty: Math.max(0, item.qty + delta) };
            }
            return item;
        }).filter(item => item.qty > 0));
    };

    const getItemQty = (productId) => {
        const item = cart.find(i => i.id_barang === productId);
        return item ? item.qty : 0;
    };

    // Calculation
    const subtotal = cart.reduce((acc, item) => acc + (item.harga * item.qty), 0);
    const total = Math.max(0, subtotal - discount);

    // Payment Handlers
    const handlePayButton = () => {
        if (cart.length === 0) return notify("Keranjang masih kosong!", "info");
        setPaymentStep('input');
        setPaidAmount('');
        setChangeAmount(0);
        setIsPaymentModalOpen(true);
    };

    const handleProcessPayment = () => {
        const paid = selectedPayment === 'QRIS' ? total : parseFloat(paidAmount);
        if (selectedPayment === 'Cash' && (isNaN(paid) || paid < total)) {
            notify("Uang pembayaran tidak cukup!", "error");
            return;
        }

        const currentPaidAmount = selectedPayment === 'QRIS' ? total : paid;

        // Prepare Data for API
        const transactionData = {
            total_harga: total,
            diskon: discount,
            uang_bayar: currentPaidAmount,
            metode_pembayaran: selectedPayment,
            items: cart.map(i => ({
                id_barang: i.id_barang,
                qty: i.qty,
                harga: i.harga
            }))
        };

        // Save to Database
        apiFetch('/transaksi', {
            method: 'POST',
            body: JSON.stringify(transactionData)
        })
            .then(res => res.json())
            .then(data => {
                if (data.message === "Transaksi berhasil disimpan.") {
                    setChangeAmount(currentPaidAmount - total);
                    setPaidAmount(currentPaidAmount.toString());
                    setPaymentStep('receipt');
                    refreshProducts(true);
                    refreshDashboard(true);
                    refreshOrders(true);
                    notify("Transaksi Berhasil!", "success");
                } else {
                    notify(`Gagal: ${data.message} (${data.error || 'Check DB'})`, "error");
                }
            })
            .catch(err => notify("Error Sistem: Cek koneksi backend " + err, "error"));
    };

    const handleNewTransaction = () => {
        setCart([]);
        setIsPaymentModalOpen(false);
        setPaidAmount('');
        setChangeAmount(0);
        setDiscount(0); // RESET DISCOUNT
    };

    return (
        <div className="kasir-layout">
            {/* LEFT: Product Grid */}
            <div className="pos-product-section">
                <div className="pos-header">
                    <div className="pos-search-wrapper">
                        <div className="pos-search-input-container">
                            <Search size={18} color="#999" />
                            <input
                                type="text"
                                placeholder="Cari produk..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <button className="pos-search-btn">Cari</button>
                    </div>

                    <div className="pos-categories">
                        {/* Categories Removed */}
                    </div>
                </div>

                <div className="pos-grid-container">
                    <div className="pos-grid">
                        {loading ? (
                            [1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                <div key={i} className="pos-card skeleton skeleton-box"></div>
                            ))
                        ) : (
                            filteredProducts.map(product => {
                                const qty = getItemQty(product.id_barang);
                                return (
                                    <div
                                        key={product.id_barang}
                                        className={`pos-card ${animatingId === product.id_barang ? 'pulse-animation' : ''} ${qty > 0 ? 'active-card' : ''} ${Number(product.stok) <= 0 ? 'out-of-stock' : ''}`}
                                        onClick={() => (qty === 0 && Number(product.stok) > 0) && addToCart(product)}
                                    >
                                        <div className="pos-card-img">
                                            <SafeImage
                                                src={product.gambar}
                                                alt={product.nama_barang}
                                                fallback={<div className="pos-card-no-img">🍽️</div>}
                                            />
                                        </div>
                                        {Number(product.stok) <= 0 && <div className="stock-badge-soldout">Stok Habis</div>}
                                        <div className="pos-card-info">
                                            <h4>{product.nama_barang}</h4>
                                            <div className="pos-card-price">Rp {Number(product.harga).toLocaleString()}</div>
                                            <div className="pos-card-stock">Stok: {product.stok}</div>

                                            {qty > 0 && (
                                                <div className="qty-controls" onClick={e => e.stopPropagation()}>
                                                    <button className="qty-btn minus" onClick={() => updateQty(product.id_barang, -1)}>
                                                        <Minus size={14} />
                                                    </button>
                                                    <span className="qty-val">{qty}</span>
                                                    <button className="qty-btn plus" onClick={() => addToCart(product)}>
                                                        <Plus size={14} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* RIGHT: Cart / Receipt */}
            <div className="pos-cart-section">
                <div className="pos-cart-header">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ margin: 0 }}>Keranjang</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {cart.length > 0 && (
                                <button
                                    onClick={clearCart}
                                    style={{
                                        background: 'rgba(234, 84, 85, 0.1)',
                                        color: '#EA5455',
                                        border: 'none',
                                        padding: '5px 8px',
                                        borderRadius: '6px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <Trash2 size={14} /> Clear
                                </button>
                            )}
                            <div style={{ background: 'rgba(0,0,0,0.05)', padding: '5px 10px', borderRadius: '6px', fontSize: '12px', color: '#888', fontWeight: '500' }}>
                                {new Date().toLocaleDateString('id-ID')}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="cart-items-container">
                    {cart.length === 0 ? <p style={{ textAlign: 'center', color: '#ccc', marginTop: '50px' }}>Belum ada item</p> :
                        cart.map(item => (
                            <div key={item.id_barang} className="cart-item">

                                <div className="cart-item-details">
                                    <div className="cart-item-title">{item.nama_barang}</div>
                                    <div className="cart-item-calc">Rp {Number(item.harga).toLocaleString()} x {item.qty}</div>
                                </div>
                                <div className="cart-item-total">
                                    Rp {Number(item.harga * item.qty).toLocaleString()}
                                </div>
                            </div>
                        ))}
                </div>

                <div className="pos-cart-footer">
                    <div className="promo-section">
                        <label className="promo-label">Promo & Diskon</label>
                        <div className="promo-chips">
                            <div className={`promo-chip ${discount === 0 ? 'active' : ''}`} onClick={() => setDiscount(0)}>Normal</div>
                            <div className={`promo-chip ${discount === subtotal * 0.05 ? 'active' : ''}`} onClick={() => setDiscount(subtotal * 0.05)}>5%</div>
                            <div className={`promo-chip ${discount === subtotal * 0.10 ? 'active' : ''}`} onClick={() => setDiscount(subtotal * 0.10)}>10%</div>
                            <div className="promo-chip" onClick={() => {
                                const val = prompt("Masukkan jumlah diskon (Rp):");
                                if (val !== null) setDiscount(Number(val));
                            }}>Lainnya</div>
                        </div>
                    </div>

                    <label className="payment-methods-label">Metode Pembayaran</label>
                    <div className="payment-methods-grid">
                        <PaymentButton
                            label="Cash" icon={<Wallet size={20} />}
                            active={selectedPayment === 'Cash'}
                            onClick={() => setSelectedPayment('Cash')}
                        />
                        <PaymentButton
                            label="QRIS" icon={<span style={{ fontSize: '14px', fontWeight: '900' }}></span>}
                            active={selectedPayment === 'QRIS'}
                            onClick={() => setSelectedPayment('QRIS')}
                        />
                    </div>

                    <div className="cart-summary-row">
                        <span>Subtotal ({cart.reduce((a, c) => a + c.qty, 0)} Items)</span>
                        <span>Rp {subtotal.toLocaleString()}</span>
                    </div>

                    {discount > 0 && (
                        <div className="cart-summary-row summary-discount">
                            <span>Diskon</span>
                            <span>- Rp {discount.toLocaleString()}</span>
                        </div>
                    )}

                    <div className="cart-total-row">
                        <span>Total Tagihan</span>
                        <span>Rp {total.toLocaleString()}</span>
                    </div>

                    <button className="pay-btn" onClick={handlePayButton}>
                        Bayar Sekarang
                    </button>
                </div>
            </div>

            {/* PAYMENT MODAL */}
            {isPaymentModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content payment-modal">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <h3>{paymentStep === 'input' ? 'Pembayaran' : 'Struk Belanja'}</h3>
                            {paymentStep === 'input' && <X style={{ cursor: 'pointer' }} onClick={() => setIsPaymentModalOpen(false)} />}
                        </div>

                        {paymentStep === 'input' ? (
                            <div className="payment-input-step">
                                <div className="total-display">
                                    <span className="label">Total Yang Harus Dibayar</span>
                                    <span className="value">Rp {total.toLocaleString()}</span>
                                </div>

                                {selectedPayment === 'QRIS' ? (
                                    <div className="qris-display-container">
                                        <div className="qris-header">
                                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Logo_QRIS.svg/1200px-Logo_QRIS.svg.png" alt="QRIS" className="qris-logo" />
                                            <p>Scan untuk membayar</p>
                                        </div>
                                        <div className="qr-code-wrapper">
                                            <img
                                                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=RESTO_TRANSACTION_${Date.now()}_TOTAL_${total}`}
                                                alt="QR Code"
                                            />
                                        </div>
                                        <div className="qris-footer">
                                            <p className="status-polling">Menunggu pembayaran...</p>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="input-group">
                                            <label>Uang Tunai (Cash)</label>
                                            <input
                                                type="number"
                                                placeholder="Masukkan jumlah uang..."
                                                value={paidAmount}
                                                onChange={e => setPaidAmount(e.target.value)}
                                                autoFocus
                                            />
                                        </div>

                                        <div className="quick-amounts">
                                            <button onClick={() => setPaidAmount(total)}>Uang Pas</button>
                                            <button onClick={() => setPaidAmount(10000)}>10K</button>
                                            <button onClick={() => setPaidAmount(20000)}>20K</button>
                                            <button onClick={() => setPaidAmount(50000)}>50K</button>
                                            <button onClick={() => setPaidAmount(100000)}>100K</button>
                                        </div>
                                    </>
                                )}

                                <button className="process-btn" onClick={handleProcessPayment}>
                                    {selectedPayment === 'QRIS' ? 'Konfirmasi Sudah Bayar' : 'Proses Bayar'}
                                </button>
                            </div>
                        ) : (
                            <div className="receipt-view">
                                <div className="receipt-paper" id="printable-receipt">
                                    <div className="receipt-header">
                                        <h4>Smart Kasir</h4>
                                        <p>Struk Pembayaran</p>
                                    </div>
                                    <div className="receipt-divider">--------------------------------</div>
                                    <div className="receipt-date">{new Date().toLocaleString()}</div>
                                    <div className="receipt-divider">--------------------------------</div>
                                    {cart.map(item => (
                                        <div key={item.id_barang} className="receipt-item">
                                            <div className="r-name">{item.nama_barang}</div>
                                            <div className="r-details">
                                                <span>{item.qty} x {item.harga.toLocaleString()}</span>
                                                <span>{(item.qty * item.harga).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="receipt-divider">--------------------------------</div>
                                    <div className="receipt-row">
                                        <span>Total</span>
                                        <span>{total.toLocaleString()}</span>
                                    </div>
                                    <div className="receipt-row">
                                        <span>Tunai</span>
                                        <span>{parseFloat(paidAmount).toLocaleString()}</span>
                                    </div>
                                    <div className="receipt-row change">
                                        <span>Kembali</span>
                                        <span>{changeAmount.toLocaleString()}</span>
                                    </div>
                                    <div className="receipt-divider">--------------------------------</div>
                                    <div className="receipt-footer">
                                        <p>Terima Kasih</p>
                                        <p>Silahkan Datang Kembali</p>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: 10, width: '100%' }}>
                                    <button className="new-trans-btn" onClick={() => window.print()} style={{ background: '#333', flex: 1, justifyContent: 'center' }}>
                                        <Printer size={18} /> Cetak Struk
                                    </button>
                                    <button className="new-trans-btn" onClick={handleNewTransaction} style={{ flex: 1, justifyContent: 'center' }}>
                                        <CheckCircle size={18} /> Transaksi Baru
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const CategoryChip = ({ label, icon, active, onClick }) => (
    <div className={`pos-cat-chip ${active ? 'active' : ''}`} onClick={onClick}>
        {icon}
        <span>{label}</span>
    </div>
);

const PaymentButton = ({ label, icon, active, onClick }) => (
    <button className={`payment-method-btn ${active ? 'active' : ''}`} onClick={onClick}>
        <span className="method-icon">{icon}</span>
        <span>{label}</span>
    </button>
);

export default Kasir;
