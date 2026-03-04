import React, { useState, useEffect } from "react";
import { useData } from "../../context/DataContext";
import { useNotification } from "../../context/NotificationContext";
import { X, CheckCircle, AlertCircle, Info, ArrowRight } from "lucide-react";
import SafeImage from "../Common/SafeImage";

const TEAL = "#4A9BAD";
const TEAL_LIGHT = "#EAF5F7";

const LEVEL_CONFIG = {
    habis: { label: "Habis", color: "#FF4757", bg: "#FFF0F1", border: "#FFCDD1", icon: "🚫", dot: "#FF4757" },
    kritis: { label: "Kritis", color: "#E74C3C", bg: "#FFF0F1", border: "#FFCDD1", icon: "🔴", dot: "#E74C3C" },
    menipis: { label: "Menipis", color: "#F39C12", bg: "#FFF8EC", border: "#F5CBA7", icon: "🟡", dot: "#F39C12" },
    aman: { label: "Aman", color: "#27AE60", bg: "#EAFAF1", border: "#A9DFBF", icon: "🟢", dot: "#27AE60" },
};

export const NotificationDropdown = ({ onClose, onRestok, onManageStock }) => {
    const { lowStockItems } = useData();
    const { notify } = useNotification();
    const [readIds, setReadIds] = useState(() => {
        const saved = localStorage.getItem('pos_read_notifs');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('pos_read_notifs', JSON.stringify(readIds));
    }, [readIds]);

    const unreadCount = lowStockItems.filter(p => !readIds.includes(p.id_barang)).length;

    const handleMarkAllRead = () => {
        setReadIds(lowStockItems.map(p => p.id_barang));
    };

    return (
        <div
            className="notif-dropdown"
            style={{
                position: "absolute",
                top: "calc(100% + 12px)",
                right: 0,
                width: 340,
                background: "var(--bg-surface)",
                borderRadius: 24,
                border: "1.5px solid var(--border-light)",
                boxShadow: "var(--shadow-lg)",
                zIndex: 1000,
                overflow: "hidden",
                animation: "dropIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
            }}
        >
            <style>{`
                @keyframes dropIn { 
                    from { opacity: 0; transform: translateY(-10px) scale(0.95); } 
                    to { opacity: 1; transform: translateY(0) scale(1); } 
                }
            `}</style>

            {/* Header */}
            <div style={{ padding: "18px 20px 16px", borderBottom: "1px solid var(--border-light)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.3px" }}>Notifikasi Stok</div>
                    {unreadCount > 0 && (
                        <div style={{ fontSize: 12, color: "var(--status-red)", fontWeight: 600, marginTop: 2 }}>{unreadCount} produk baru</div>
                    )}
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    {unreadCount > 0 && (
                        <button
                            onClick={handleMarkAllRead}
                            style={{
                                fontSize: 11,
                                color: "var(--primary-brand)",
                                fontWeight: 700,
                                background: "var(--primary-light)",
                                border: "none",
                                cursor: "pointer",
                                borderRadius: 8,
                                padding: "6px 10px"
                            }}
                        >
                            Tandai semua
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        style={{
                            width: 30,
                            height: 30,
                            borderRadius: 10,
                            background: "var(--bg-app-alt)",
                            border: "none",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "var(--text-tertiary)"
                        }}
                    >
                        <X size={16} />
                    </button>
                </div>
            </div>

            {/* List */}
            <div style={{ maxHeight: 420, overflowY: "auto" }}>
                {lowStockItems.length === 0 ? (
                    <div style={{ padding: "40px 20px", textAlign: "center" }}>
                        <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>Semua Stok Aman</div>
                        <div style={{ fontSize: 13, color: "var(--text-tertiary)", marginTop: 4 }}>Produk Anda masih tercukupi.</div>
                    </div>
                ) : (
                    lowStockItems.sort((a, b) => {
                        const order = { habis: 0, kritis: 1, menipis: 2 };
                        return order[a.level] - order[b.level];
                    }).map((p, i) => {
                        const cfg = LEVEL_CONFIG[p.level];
                        const isUnread = !readIds.includes(p.id_barang);
                        const pct = Math.min(100, (Number(p.stok) / Number(p.stok_minimum || 5)) * 100);

                        return (
                            <div
                                key={p.id_barang}
                                style={{
                                    padding: "16px 20px",
                                    borderBottom: i < lowStockItems.length - 1 ? "1px solid var(--border-light)" : "none",
                                    background: isUnread ? "rgba(255, 140, 0, 0.03)" : "transparent",
                                    position: "relative",
                                    transition: "background 0.2s"
                                }}
                            >
                                {isUnread && <div style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", width: 6, height: 6, borderRadius: "50%", background: cfg.dot }} />}
                                <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                                    <div
                                        style={{
                                            width: 44,
                                            height: 44,
                                            borderRadius: 14,
                                            background: cfg.bg,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: 22,
                                            flexShrink: 0
                                        }}
                                    >
                                        {p.gambar ? (
                                            <SafeImage
                                                src={p.gambar}
                                                alt={p.nama_barang}
                                                className="img-notif-full"
                                                style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 14 }}
                                            />
                                        ) : (
                                            "📦"
                                        )}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                                            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, marginRight: 8, letterSpacing: "-0.2px" }}>{p.nama_barang}</div>
                                            <div style={{ flexShrink: 0, padding: "3px 8px", borderRadius: 8, background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                                                <span style={{ fontSize: 10, fontWeight: 800, color: cfg.color, textTransform: "uppercase" }}>{cfg.label}</span>
                                            </div>
                                        </div>
                                        <div style={{ fontSize: 12, color: "var(--text-tertiary)", marginBottom: 10, fontWeight: 500 }}>
                                            Sisa: <strong style={{ color: cfg.color }}>{p.stok} pcs</strong> · Min: {p.stok_minimum || 5} pcs
                                        </div>

                                        {/* Progress bar */}
                                        <div style={{ height: 6, background: "var(--bg-app-alt)", borderRadius: 10, overflow: "hidden", marginBottom: 12 }}>
                                            <div style={{ width: `${pct}%`, height: "100%", background: cfg.color, borderRadius: 10, transition: "width 0.4s" }} />
                                        </div>

                                        <button
                                            onClick={() => {
                                                setReadIds(prev => prev.includes(p.id_barang) ? prev : [...prev, p.id_barang]);
                                                onRestok(p);
                                            }}
                                            style={{
                                                fontSize: 12,
                                                fontWeight: 700,
                                                color: cfg.color,
                                                background: cfg.bg,
                                                border: `1.5px solid ${cfg.border}`,
                                                borderRadius: 10,
                                                padding: "6px 14px",
                                                cursor: "pointer",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 6
                                            }}
                                        >
                                            📥 Restok Sekarang
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Footer */}
            {lowStockItems.length > 0 && (
                <div style={{ padding: "14px 20px", borderTop: "1px solid var(--border-light)", background: "var(--bg-app-alt)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ fontSize: 12, color: "var(--text-tertiary)", fontWeight: 500 }}>{lowStockItems.length} produk perlu restok</div>
                        <button
                            onClick={() => { onClose(); onManageStock(); }}
                            style={{ fontSize: 12, fontWeight: 700, color: "var(--primary-brand)", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
                        >
                            Kelola Stok <ArrowRight size={14} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export const RestokModal = ({ product, onClose, onSave }) => {
    const [qty, setQty] = useState(Math.max(1, (product.stok_minimum || 5) - Number(product.stok)));
    const cfg = LEVEL_CONFIG[product.level || 'aman'];
    const newStock = Number(product.stok) + Number(qty);

    return (
        <>
            <div
                style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 10000, backdropFilter: "blur(4px)" }}
                onClick={onClose}
            />
            <div
                style={{
                    position: "fixed",
                    bottom: 0,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "100%",
                    maxWidth: 450,
                    background: "var(--bg-surface)",
                    borderRadius: "28px 28px 0 0",
                    zIndex: 10001,
                    padding: "24px 24px 40px",
                    boxShadow: "0 -10px 40px rgba(0,0,0,0.2)",
                    animation: "slideUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
                }}
            >
                <style>{`
                    @keyframes slideUp { 
                        from { opacity: 0; transform: translateX(-50%) translateY(100%); } 
                        to { opacity: 1; transform: translateX(-50%) translateY(0); } 
                    }
                `}</style>
                <div style={{ width: 40, height: 5, background: "var(--border-bold)", borderRadius: 10, margin: "0 auto 20px" }} />

                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24, padding: "14px", background: cfg.bg, borderRadius: 20, border: `1.5px solid ${cfg.border}` }}>
                    <div style={{ width: 64, height: 64, borderRadius: 20, background: "var(--bg-app-alt)", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {product.gambar ? (
                            <SafeImage src={product.gambar} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                            <span style={{ fontSize: 32 }}>📦</span>
                        )}
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 16, fontWeight: 800, color: "var(--text-primary)" }}>{product.nama_barang}</div>
                        <div style={{ fontSize: 13, color: cfg.color, fontWeight: 600, marginTop: 2 }}>{cfg.label} · Tersisa {product.stok} pcs</div>
                    </div>
                </div>

                <div style={{ fontSize: 14, fontWeight: 800, color: "var(--text-secondary)", marginBottom: 14, paddingLeft: 4 }}>Jumlah Restok</div>
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
                    <button
                        onClick={() => setQty(q => Math.max(1, q - 1))}
                        style={{ width: 54, height: 54, borderRadius: 18, border: "2px solid var(--border-light)", background: "var(--bg-surface)", fontSize: 24, fontWeight: 700, cursor: "pointer", color: "var(--text-primary)" }}
                    >
                        −
                    </button>
                    <div style={{ flex: 1, textAlign: "center" }}>
                        <div style={{ fontSize: 36, fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-1px" }}>{qty}</div>
                        <div style={{ fontSize: 12, color: "var(--text-tertiary)", fontWeight: 600, marginTop: -4 }}>pcs</div>
                    </div>
                    <button
                        onClick={() => setQty(q => q + 1)}
                        style={{ width: 54, height: 54, borderRadius: 18, border: "none", background: "var(--primary-brand)", fontSize: 24, fontWeight: 700, color: "#fff", cursor: "pointer" }}
                    >
                        +
                    </button>
                </div>

                {/* Quick select */}
                <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
                    {[5, 10, 20, 50].map(v => (
                        <button
                            key={v}
                            onClick={() => setQty(v)}
                            style={{
                                flex: 1,
                                padding: "10px 0",
                                borderRadius: 12,
                                border: `2px solid ${qty === v ? "var(--primary-brand)" : "var(--border-light)"}`,
                                background: qty === v ? "var(--primary-light)" : "var(--bg-surface)",
                                color: qty === v ? "var(--primary-brand)" : "var(--text-secondary)",
                                fontSize: 13,
                                fontWeight: 700,
                                cursor: "pointer"
                            }}
                        >
                            +{v}
                        </button>
                    ))}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--bg-app-alt)", borderRadius: 18, padding: "16px 20px", marginBottom: 24 }}>
                    <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 12, color: "var(--text-tertiary)", fontWeight: 600 }}>Stok Awal</div>
                        <div style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)" }}>{product.stok}</div>
                    </div>
                    <div style={{ fontSize: 24 }}>➡️</div>
                    <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 12, color: "var(--text-tertiary)", fontWeight: 600 }}>Stok Baru</div>
                        <div style={{ fontSize: 22, fontWeight: 800, color: "var(--status-green)" }}>{newStock}</div>
                    </div>
                </div>

                <button
                    onClick={() => onSave(product.id_barang, qty)}
                    style={{
                        width: "100%",
                        padding: "18px",
                        borderRadius: 18,
                        background: "var(--primary-brand)",
                        color: "#fff",
                        border: "none",
                        cursor: "pointer",
                        fontSize: 16,
                        fontWeight: 800,
                        boxShadow: "0 8px 20px rgba(74, 155, 173, 0.3)"
                    }}
                >
                    Konfirmasi Restok +{qty} pcs
                </button>
            </div>
        </>
    );
};
