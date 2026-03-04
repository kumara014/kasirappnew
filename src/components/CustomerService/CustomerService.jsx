import { useState } from "react";

const TEAL = "var(--primary-brand, #4A9BAD)";
const TEAL_LIGHT = "var(--primary-light, #EAF5F7)";
const TEAL_DARK = "var(--primary-dark, #357585)";
const WA_NUMBER = "6282299667686";
const WA_DISPLAY = "0822-9966-7686";

const FAQ_DATA = [
    {
        q: "Bagaimana cara menambah produk baru?",
        a: "Buka menu Kelola Produk → klik tombol + di pojok kanan atas → isi nama, harga, stok → klik Tambah Produk.",
    },
    {
        q: "Kenapa stok produk tidak berkurang otomatis?",
        a: "Stok berkurang otomatis saat transaksi selesai di kasir. Pastikan produk dipilih dari menu Produk, bukan input manual.",
    },
    {
        q: "Bagaimana cara mencetak struk?",
        a: "Setelah transaksi berhasil, klik tombol Lihat Struk → lalu klik Cetak Struk. Pastikan printer sudah terhubung.",
    },
    {
        q: "Apakah data saya aman jika ganti HP?",
        a: "Data tersimpan di server kami. Cukup login dengan akun yang sama di HP baru, semua data akan kembali.",
    },
    {
        q: "Bagaimana cara reset password?",
        a: "Di halaman Login → klik Lupa Password → masukkan email → cek inbox kamu untuk link reset.",
    },
    {
        q: "Apakah Pointly bisa dipakai offline?",
        a: "Saat ini Pointly membutuhkan koneksi internet. Mode offline sedang dalam pengembangan.",
    },
];

export default function HubungiSupport({ onBack }) {
    const [openFaq, setOpenFaq] = useState(null);
    const [topic, setTopic] = useState("");
    const [message, setMessage] = useState("");
    const [sent, setSent] = useState(false);

    const waLink = (msg) => `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;

    const handleSend = () => {
        if (!message.trim()) return;
        const text = topic
            ? `Halo, saya pengguna Pointly POS.\n\nTopik: ${topic}\n\nPesan:\n${message}`
            : `Halo, saya pengguna Pointly POS.\n\nPesan:\n${message}`;
        window.open(waLink(text), "_blank");
        setSent(true);
        setTimeout(() => setSent(false), 3000);
    };

    const quickTopics = [
        { label: "Masalah Login", icon: "🔑" },
        { label: "Error Kasir", icon: "🛒" },
        { label: "Stok Bermasalah", icon: "📦" },
        { label: "Laporan Error", icon: "📊" },
        { label: "Pertanyaan Lain", icon: "💬" },
    ];

    return (
        <div style={pageStyle}>
            <style>{globalCSS}</style>

            {/* Header */}
            <div className="topbar" style={{ paddingBottom: 16 }}>
                <div className="topbar-row">
                    <button className="back-btn" onClick={onBack}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
                    </button>
                    <span className="topbar-title">Hubungi <span style={{ color: TEAL }}>Support</span></span>
                </div>
            </div>

            <div className="content">

                {/* Hero card */}
                <div style={{ background: `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})`, borderRadius: 20, padding: "22px 20px", marginBottom: 16, position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", top: -40, right: -40, width: 150, height: 150, borderRadius: "50%", background: "rgba(255,255,255,0.07)", pointerEvents: "none" }} />
                    <div style={{ position: "absolute", bottom: -30, left: -20, width: 110, height: 110, borderRadius: "50%", background: "rgba(255,255,255,0.05)", pointerEvents: "none" }} />
                    <div style={{ position: "relative", zIndex: 2 }}>
                        <div style={{ fontSize: 36, marginBottom: 10 }}>🎧</div>
                        <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", letterSpacing: "-0.4px", marginBottom: 6 }}>Ada yang bisa kami bantu?</div>
                        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", lineHeight: 1.6, marginBottom: 16 }}>
                            Tim support Pointly siap membantu kamu. Hubungi kami langsung via WhatsApp untuk respon lebih cepat.
                        </div>
                        {/* WA button */}
                        <a href={waLink("Halo, saya pengguna Pointly POS. Saya butuh bantuan.")} target="_blank" rel="noreferrer"
                            style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "#25D366", borderRadius: 13, padding: "12px 20px", textDecoration: "none", boxShadow: "0 4px 16px rgba(37,211,102,0.4)" }}>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" /><path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.553 4.117 1.523 5.845L.057 23.116a.75.75 0 00.917.919l5.355-1.453A11.944 11.944 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.891 0-3.667-.502-5.2-1.379l-.374-.215-3.876 1.051 1.072-3.773-.234-.389A9.956 9.956 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" /></svg>
                            <div>
                                <div style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>Chat WhatsApp</div>
                                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.8)" }}>{WA_DISPLAY}</div>
                            </div>
                        </a>
                    </div>
                </div>

                {/* Jam operasional */}
                <div style={{ background: "var(--bg-surface, #fff)", borderRadius: 16, border: "1.5px solid var(--border-light, #ECEEF0)", padding: "14px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 13, background: "var(--primary-light, #FFF8EC)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>🕐</div>
                    <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary, #111)", marginBottom: 2 }}>Jam Operasional Support</div>
                        <div style={{ fontSize: 12, color: "var(--text-tertiary, #aaa)", lineHeight: 1.6 }}>Senin – Sabtu: <strong style={{ color: "var(--text-secondary, #555)" }}>08.00 – 21.00</strong><br />Minggu & Libur: <strong style={{ color: "var(--text-secondary, #555)" }}>09.00 – 17.00</strong></div>
                    </div>
                    <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 5, background: "rgba(39, 174, 96, 0.1)", borderRadius: 20, padding: "4px 10px", flexShrink: 0 }}>
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#27AE60" }} />
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#27AE60" }}>Online</span>
                    </div>
                </div>

                {/* Kirim pesan ke WA */}
                <div style={{ background: "var(--bg-surface, #fff)", borderRadius: 18, border: "1.5px solid var(--border-light, #ECEEF0)", padding: 18, marginBottom: 16 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary, #111)", marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(39, 174, 96, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>💬</div>
                        Kirim Pesan
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-tertiary, #aaa)", marginBottom: 16 }}>Pesan akan dikirim langsung ke WhatsApp support kami</div>

                    {/* Quick topic */}
                    <div className="input-label">Topik (opsional)</div>
                    <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 14, scrollbarWidth: "none" }}>
                        {quickTopics.map(t => (
                            <button key={t.label} onClick={() => setTopic(topic === t.label ? "" : t.label)}
                                style={{ flexShrink: 0, padding: "7px 12px", borderRadius: 20, border: `1.5px solid ${topic === t.label ? TEAL : "var(--border-light, #E5E9EC)"}`, background: topic === t.label ? TEAL_LIGHT : "var(--bg-app-alt, #FAFBFC)", color: topic === t.label ? TEAL : "var(--text-secondary, #666)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", display: "flex", alignItems: "center", gap: 5, transition: "all 0.15s", whiteSpace: "nowrap" }}>
                                {t.icon} {t.label}
                            </button>
                        ))}
                    </div>

                    <div className="input-label">Pesan *</div>
                    <textarea className="form-input" placeholder="Ceritakan masalah atau pertanyaan kamu di sini..." value={message} onChange={e => setMessage(e.target.value)}
                        style={{ minHeight: 100, resize: "none", lineHeight: 1.6, marginBottom: 14 }} />

                    <a href={message.trim() ? waLink(topic ? `Halo, saya pengguna Pointly POS.\n\nTopik: ${topic}\n\nPesan:\n${message}` : `Halo, saya pengguna Pointly POS.\n\nPesan:\n${message}`) : undefined}
                        target={message.trim() ? "_blank" : undefined}
                        rel="noreferrer"
                        onClick={e => { if (!message.trim()) e.preventDefault(); else handleSend(); }}
                        style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, width: "100%", padding: "14px", borderRadius: 13, background: !message.trim() ? "var(--border-strong, #C5D8DC)" : "#25D366", color: "#fff", border: "none", cursor: !message.trim() ? "not-allowed" : "pointer", fontSize: 15, fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif", textDecoration: "none", boxShadow: message.trim() ? "0 4px 16px rgba(37,211,102,0.35)" : "none", transition: "all 0.15s" }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" /><path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.553 4.117 1.523 5.845L.057 23.116a.75.75 0 00.917.919l5.355-1.453A11.944 11.944 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.891 0-3.667-.502-5.2-1.379l-.374-.215-3.876 1.051 1.072-3.773-.234-.389A9.956 9.956 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" /></svg>
                        Kirim via WhatsApp
                    </a>
                </div>

                {/* FAQ */}
                <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary, #111)", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 8, background: "var(--primary-light, #FFF8EC)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>❓</div>
                        Pertanyaan Umum (FAQ)
                    </div>
                    <div style={{ background: "var(--bg-surface, #fff)", borderRadius: 16, border: "1.5px solid var(--border-light, #ECEEF0)", overflow: "hidden" }}>
                        {FAQ_DATA.map((item, i) => (
                            <div key={i} style={{ borderBottom: i < FAQ_DATA.length - 1 ? "1px solid var(--border-light, #F5F7F8)" : "none" }}>
                                <div onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", cursor: "pointer", gap: 12 }}>
                                    <div style={{ fontSize: 13, fontWeight: 600, color: openFaq === i ? TEAL : "var(--text-primary, #111)", flex: 1, lineHeight: 1.4 }}>{item.q}</div>
                                    <div style={{ width: 22, height: 22, borderRadius: 7, background: openFaq === i ? TEAL_LIGHT : "var(--bg-app-alt, #F5F7F8)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.2s" }}>
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={openFaq === i ? TEAL : "var(--text-tertiary, #aaa)"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                                            style={{ transform: openFaq === i ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
                                            <path d="M6 9l6 6 6-6" />
                                        </svg>
                                    </div>
                                </div>
                                {openFaq === i && (
                                    <div style={{ padding: "0 16px 16px", animation: "fadeIn 0.2s ease" }}>
                                        <div style={{ background: TEAL_LIGHT, borderRadius: 11, padding: "12px 14px", fontSize: 13, color: "var(--text-secondary, #444)", lineHeight: 1.7 }}>
                                            {item.a}
                                        </div>
                                        <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 6 }}>
                                            <span style={{ fontSize: 11, color: "var(--text-tertiary, #aaa)" }}>Jawaban ini tidak membantu?</span>
                                            <a href={waLink(`Halo, saya punya pertanyaan tentang: "${item.q}"`)} target="_blank" rel="noreferrer"
                                                style={{ fontSize: 11, fontWeight: 700, color: "#25D366", textDecoration: "none" }}>Tanya di WA →</a>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Contact info card */}
                <div style={{ background: "var(--bg-surface, #fff)", borderRadius: 16, border: "1.5px solid var(--border-light, #ECEEF0)", overflow: "hidden", marginBottom: 8 }}>
                    <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border-light, #F5F7F8)" }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary, #111)" }}>Kontak Langsung</div>
                    </div>
                    {[
                        {
                            icon: "💬",
                            bg: "rgba(39, 174, 96, 0.1)",
                            label: "WhatsApp",
                            val: WA_DISPLAY,
                            sub: "Respon dalam 1×24 jam",
                            href: waLink("Halo, saya pengguna Pointly POS."),
                            btnColor: "#25D366",
                            btnLabel: "Chat Sekarang",
                        },
                    ].map((c, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px" }}>
                            <div style={{ width: 44, height: 44, borderRadius: 13, background: c.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{c.icon}</div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary, #111)" }}>{c.label}</div>
                                <div style={{ fontSize: 13, fontWeight: 600, color: TEAL }}>{c.val}</div>
                                <div style={{ fontSize: 11, color: "var(--text-tertiary, #aaa)", marginTop: 2 }}>{c.sub}</div>
                            </div>
                            <a href={c.href} target="_blank" rel="noreferrer"
                                style={{ padding: "8px 14px", borderRadius: 10, background: c.btnColor, color: "#fff", fontSize: 12, fontWeight: 700, textDecoration: "none", flexShrink: 0 }}>
                                {c.btnLabel}
                            </a>
                        </div>
                    ))}
                </div>

                <div style={{ textAlign: "center", fontSize: 11, color: "var(--text-tertiary, #ccc)", marginTop: 20 }}>Pointly POS v1.0.0 • © 2026</div>
            </div>
        </div>
    );
}

const pageStyle = { fontFamily: "'Plus Jakarta Sans', sans-serif", background: "var(--bg-app, #F5F7F8)", minHeight: "100%", width: "100%", overflowX: "hidden", margin: "0 auto", display: "flex", flexDirection: "column" };

const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
  .topbar { background: var(--bg-surface, #fff); padding: 16px 20px 0; border-bottom: 1px solid var(--border-light, #ECEEF0); position: sticky; top: 0; z-index: 20; color: var(--text-primary, #111) }
  .topbar-row { display: flex; align-items: center; gap: 12px; }
  .topbar-title { font-size: 18px; font-weight: 700; color: var(--text-primary, #111); letter-spacing: -0.4px; }
  .back-btn { width: 40px; height: 40px; border-radius: 12px; background: var(--bg-app-alt, #F5F7F8); border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--text-primary, #333); flex-shrink: 0; }
  .back-btn:active { background: var(--border-light, #ECEEF0); }
  .content { flex: 1; padding: 16px; padding-bottom: 80px; overflow-y: auto; color: var(--text-primary, #111); }
  .input-label { font-size: 11px; font-weight: 700; color: var(--text-tertiary, #888); text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 7px; }
  .form-input { width: 100%; padding: 13px 14px; border: 1.5px solid var(--border-light, #E5E9EC); border-radius: 12px; font-size: 14px; font-family: 'Plus Jakarta Sans', sans-serif; outline: none; color: var(--text-primary, #111); background: var(--bg-surface-alt, #FAFBFC); transition: border-color 0.2s; }
  .form-input:focus { border-color: ${TEAL}; background: var(--bg-surface, #fff); box-shadow: 0 0 0 3px ${TEAL}18; }
  .dark-theme .form-input { color: var(--text-primary); }
`;
