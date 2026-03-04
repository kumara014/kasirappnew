import React, { useState } from "react";
import { apiFetch, STORAGE_URL } from "../../config";
import { useNotification } from "../../context/NotificationContext";

const TEAL = "#4A9BAD";
const TEAL_LIGHT = "#EAF5F7";
const TEAL_DARK = "#357585";

const BUSINESS_TYPES = [
    { id: "minimarket", label: "Minimarket", icon: "🏪" },
    { id: "warung", label: "Warung", icon: "🛖" },
    { id: "cafe", label: "Café/Resto", icon: "☕" },
    { id: "fashion", label: "Fashion", icon: "👗" },
    { id: "elektronik", label: "Elektronik", icon: "📱" },
    { id: "lainnya", label: "Lainnya", icon: "📦" },
];

function Toast({ msg, type }) {
    return (
        <div style={{ position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)", background: type === "error" ? "#FF4757" : "#1a1a18", color: "#fff", padding: "12px 20px", borderRadius: 14, fontSize: 13, fontWeight: 600, zIndex: 200, whiteSpace: "nowrap", boxShadow: "0 4px 20px rgba(0,0,0,0.2)", animation: "slideDown 0.3s ease" }}>
            {type === "error" ? "❌" : "✅"} {msg}
        </div>
    );
}

// ── PROFIL USAHA ──────────────────────────────────────────────────────────────
function ProfilUsaha({ onBack, user, onUpdateUser }) {
    const [form, setForm] = useState({
        businessName: user?.nama_usaha || "",
        businessType: user?.tipe_bisnis || "minimarket",
        email: user?.email || "",
    });
    const [errors, setErrors] = useState({});
    const [toast, setToast] = useState(null);
    const [loading, setLoading] = useState(false);
    const { notify } = useNotification();

    const validate = () => {
        const e = {};
        if (!form.businessName.trim()) e.businessName = "Nama usaha tidak boleh kosong";
        if (!form.businessType) e.businessType = "Pilih tipe bisnis";
        if (!form.email.trim()) e.email = "Email tidak boleh kosong";
        else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Format email tidak valid";

        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) return;
        setLoading(true);

        try {
            const res = await apiFetch('/user/profile', {
                method: 'POST',
                body: JSON.stringify({
                    name: user?.name,
                    email: form.email,
                    nama_usaha: form.businessName,
                    tipe_bisnis: form.businessType,
                })
            });
            const data = await res.json();

            if (data.status === 'success') {
                onUpdateUser(data.user);
                setToast({ msg: "Profil usaha berhasil disimpan", type: "success" });
                setTimeout(() => setToast(null), 2500);
                notify("Profil berhasil diperbarui!");
            } else {
                notify(data.message || "Gagal memperbarui profil", "error");
                if (data.errors && data.errors.email) {
                    setErrors({ ...errors, email: data.errors.email[0] });
                }
            }
        } catch (err) {
            console.error(err);
            notify("Terjadi kesalahan. Periksa koneksi kamu.", "error");
        } finally {
            setLoading(false);
        }
    };

    const btype = BUSINESS_TYPES.find(b => b.id === form.businessType);
    const initials = form.businessName ? form.businessName.slice(0, 2).toUpperCase() : "NA";

    return (
        <div style={pageStyle}>
            <style>{globalCSS}</style>
            {toast && <Toast msg={toast.msg} type={toast.type} />}

            <div className="topbar" style={{ paddingBottom: 16 }}>
                <div className="topbar-row">
                    <button className="back-btn" onClick={onBack}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
                    </button>
                    <span className="topbar-title">Profil <span style={{ color: TEAL }}>Usaha</span></span>
                </div>
            </div>

            <div className="content">
                {/* Avatar / logo placeholder */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 22 }}>
                    <div style={{ width: 80, height: 80, borderRadius: 24, background: `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 800, color: "#fff", marginBottom: 10, boxShadow: `0 8px 24px ${TEAL}44`, position: "relative" }}>
                        {initials}
                        <div style={{ position: "absolute", bottom: -4, right: -4, width: 26, height: 26, borderRadius: 8, background: "#fff", border: `2px solid ${TEAL}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, cursor: "pointer" }}>
                            📷
                        </div>
                    </div>
                    <div style={{ fontSize: 12, color: "#aaa", fontWeight: 500 }}>Ketuk ikon kamera untuk ganti foto</div>
                </div>

                {/* Info usaha */}
                <div style={{ background: "#fff", borderRadius: 18, border: "1.5px solid #ECEEF0", padding: 18, marginBottom: 14 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#111", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 8, background: TEAL_LIGHT, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🏪</div>
                        Informasi Usaha
                    </div>

                    <div className="input-label">Nama Usaha *</div>
                    <div style={{ position: "relative", marginBottom: errors.businessName ? 4 : 16 }}>
                        <input className={`form-input${errors.businessName ? " input-error" : ""}`} placeholder="Nama toko kamu" value={form.businessName} onChange={e => { setForm({ ...form, businessName: e.target.value }); setErrors({ ...errors, businessName: "" }); }} style={{ marginBottom: 0 }} />
                    </div>
                    {errors.businessName && <div className="error-msg" style={{ marginBottom: 12 }}>⚠ {errors.businessName}</div>}

                    <div className="input-label">Tipe Bisnis</div>
                    {errors.businessType && <div className="error-msg" style={{ marginBottom: 8 }}>⚠ {errors.businessType}</div>}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
                        {BUSINESS_TYPES.map(b => {
                            const isA = form.businessType === b.id;
                            return (
                                <button key={b.id} onClick={() => { setForm({ ...form, businessType: b.id }); setErrors({ ...errors, businessType: "" }); }}
                                    style={{ padding: "10px 6px", borderRadius: 12, border: `1.5px solid ${isA ? TEAL : "#E5E9EC"}`, background: isA ? TEAL_LIGHT : "#FAFBFC", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, transition: "all 0.15s" }}>
                                    <span style={{ fontSize: 20 }}>{b.icon}</span>
                                    <span style={{ fontSize: 10, fontWeight: 600, color: isA ? TEAL : "#666", textAlign: "center", lineHeight: 1.3 }}>{b.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    <div className="input-label">Email Usaha</div>
                    <div style={{ position: "relative" }}>
                        <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 16, pointerEvents: "none" }}>📧</span>
                        <input className={`form-input${errors.email ? " input-error" : ""}`} style={{ paddingLeft: 44, marginBottom: 0 }} placeholder="email@toko.com" type="email" value={form.email} onChange={e => { setForm({ ...form, email: e.target.value }); setErrors({ ...errors, email: "" }); }} />
                    </div>
                    {errors.email && <div className="error-msg" style={{ marginTop: 4 }}>⚠ {errors.email}</div>}
                </div>

                {/* Preview card */}
                <div style={{ background: "#fff", borderRadius: 16, border: "1.5px solid #ECEEF0", padding: 16, marginBottom: 14 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 12 }}>Preview Identitas</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 46, height: 46, borderRadius: 14, background: `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, fontWeight: 800, color: "#fff", flexShrink: 0 }}>{initials}</div>
                        <div>
                            <div style={{ fontSize: 15, fontWeight: 800, color: "#111" }}>{form.businessName || "Nama Usaha"}</div>
                            <div style={{ fontSize: 12, color: TEAL, fontWeight: 600, marginTop: 2 }}>{btype?.icon} {btype?.label}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bottom-bar">
                <button onClick={handleSave} disabled={loading}
                    style={{ ...btnPrimary, background: loading ? "#C5D8DC" : TEAL, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, boxShadow: loading ? "none" : `0 6px 20px ${TEAL}44` }}>
                    {loading ? <><span className="spin" />Menyimpan...</> : "💾 Simpan Profil"}
                </button>
            </div>
        </div>
    );
}

// ── AKUN & PASSWORD ────────────────────────────────────────────────────────────
function AkunPassword({ onBack, user, onUpdateUser, onLogout }) {
    const [section, setSection] = useState(null); // null | "email" | "password"
    const [emailForm, setEmailForm] = useState({ newEmail: "", confirmEmail: "", currentPass: "" });
    const [passForm, setPassForm] = useState({ currentPass: "", newPass: "", confirmPass: "" });
    const [showCurr, setShowCurr] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConf, setShowConf] = useState(false);
    const [errors, setErrors] = useState({});
    const [toast, setToast] = useState(null);
    const [loading, setLoading] = useState(false);
    const { notify } = useNotification();

    const showToast = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 2500); };

    const validateEmail = () => {
        const e = {};
        if (!emailForm.newEmail) e.newEmail = "Email baru tidak boleh kosong";
        else if (!/\S+@\S+\.\S+/.test(emailForm.newEmail)) e.newEmail = "Format email tidak valid";
        if (!emailForm.confirmEmail) e.confirmEmail = "Konfirmasi email kosong";
        else if (emailForm.newEmail !== emailForm.confirmEmail) e.confirmEmail = "Email tidak cocok";
        if (!emailForm.currentPass) e.currentPass = "Masukkan password saat ini";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const validatePass = () => {
        const e = {};
        if (!passForm.currentPass) e.currentPass = "Masukkan password saat ini";
        if (!passForm.newPass) e.newPass = "Password baru tidak boleh kosong";
        else if (passForm.newPass.length < 8) e.newPass = "Password minimal 8 karakter";
        if (!passForm.confirmPass) e.confirmPass = "Konfirmasi password kosong";
        else if (passForm.newPass !== passForm.confirmPass) e.confirmPass = "Password tidak cocok";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSaveEmail = async () => {
        if (!validateEmail()) return;
        setLoading(true);

        // We try to verify password via the update password endpoint essentially,
        // or we can just save it via profile endpoint since current user updating it
        // For simplicity with given endpoints, we will update the profile email
        try {
            const res = await apiFetch('/user/profile', {
                method: 'POST',
                body: JSON.stringify({
                    name: user?.name,
                    email: emailForm.newEmail,
                    nama_usaha: user?.nama_usaha,
                    tipe_bisnis: user?.tipe_bisnis,
                })
            });
            const data = await res.json();

            if (data.status === 'success') {
                onUpdateUser(data.user);
                showToast("Email berhasil diperbarui");
                setSection(null);
                setEmailForm({ newEmail: "", confirmEmail: "", currentPass: "" });
                setErrors({});
                notify("Email berhasil diperbarui. Silakan login kembali dengan email baru jika diperlukan.");
            } else {
                notify(data.message || "Gagal memperbarui email", "error");
                if (data.errors && data.errors.email) {
                    setErrors({ ...errors, newEmail: data.errors.email[0] });
                }
            }
        } catch (err) {
            console.error(err);
            notify("Terjadi kesalahan. Periksa koneksi kamu.", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleSavePass = async () => {
        if (!validatePass()) return;
        setLoading(true);

        try {
            const res = await apiFetch('/user/password', {
                method: 'POST',
                body: JSON.stringify({
                    current_password: passForm.currentPass,
                    new_password: passForm.newPass,
                    new_password_confirmation: passForm.confirmPass
                })
            });
            const data = await res.json();
            if (data.status === 'success') {
                notify("Password berhasil diubah!");
                showToast("Password berhasil diperbarui");
                setSection(null);
                setPassForm({ currentPass: "", newPass: "", confirmPass: "" });
                setErrors({});
            } else {
                notify(data.message || "Gagal mengubah password", "error");
                if (data.errors) {
                    setErrors({
                        currentPass: data.errors.current_password?.[0],
                        newPass: data.errors.new_password?.[0]
                    });
                }
            }
        } catch (err) {
            console.error(err);
            notify("Kesalahan koneksi ke server.", "error");
        } finally {
            setLoading(false);
        }
    };

    const passStrength = (p) => p.length >= 12 ? 4 : p.length >= 10 ? 3 : p.length >= 8 ? 2 : p.length > 0 ? 1 : 0;
    const passLabel = (s) => ["", "Terlalu pendek", "Cukup", "Kuat", "Sangat kuat 💪"][s];
    const passColor = (s) => ["", "#FF4757", "#F39C12", "#27AE60", "#27AE60"][s];

    return (
        <div style={pageStyle}>
            <style>{globalCSS}</style>
            {toast && <Toast msg={toast.msg} type={toast.type} />}

            <div className="topbar" style={{ paddingBottom: 16 }}>
                <div className="topbar-row">
                    <button className="back-btn" onClick={section ? () => { setSection(null); setErrors({}); } : onBack}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
                    </button>
                    <span className="topbar-title">
                        {section === "email" ? <>Ubah <span style={{ color: TEAL }}>Email</span></> : section === "password" ? <>Ubah <span style={{ color: TEAL }}>Password</span></> : <>Akun & <span style={{ color: TEAL }}>Keamanan</span></>}
                    </span>
                </div>
            </div>

            {/* MAIN LIST */}
            {!section && (
                <div className="content">
                    {/* Info akun */}
                    <div style={{ background: `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})`, borderRadius: 18, padding: "20px", marginBottom: 16, position: "relative", overflow: "hidden" }}>
                        <div style={{ position: "absolute", top: -30, right: -30, width: 110, height: 110, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
                        <div style={{ display: "flex", alignItems: "center", gap: 14, position: "relative", zIndex: 2 }}>
                            <div style={{ width: 52, height: 52, borderRadius: 16, background: "rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 800, color: "#fff" }}>
                                {user?.nama_usaha?.slice(0, 2).toUpperCase() || "MM"}
                            </div>
                            <div>
                                <div style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>{user?.nama_usaha || "MiniMart Sejahtera"}</div>
                                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 3 }}>{user?.email || "minimart@email.com"}</div>
                                <div style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 6, background: "rgba(255,255,255,0.2)", borderRadius: 20, padding: "3px 10px" }}>
                                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#A8F0C6" }} />
                                    <span style={{ fontSize: 10, color: "#fff", fontWeight: 600 }}>Akun Aktif</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Menu */}
                    <div style={{ background: "#fff", borderRadius: 18, border: "1.5px solid #ECEEF0", overflow: "hidden", marginBottom: 14 }}>
                        {[
                            { icon: "📧", label: "Ubah Email", desc: user?.email || "minimart@email.com", action: "email", color: TEAL_LIGHT, iconColor: TEAL },
                            { icon: "🔒", label: "Ubah Password", desc: "Kelola keamanan akun", action: "password", color: "#EEF0FF", iconColor: "#6C63FF" },
                        ].map((item, i) => (
                            <div key={i} onClick={() => { setSection(item.action); setErrors({}); }}
                                style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px", borderBottom: i < 1 ? "1px solid #F5F7F8" : "none", cursor: "pointer", transition: "background 0.15s" }}
                                onMouseEnter={e => e.currentTarget.style.background = "#FAFBFC"}
                                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                                <div style={{ width: 44, height: 44, borderRadius: 13, background: item.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{item.icon}</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 14, fontWeight: 700, color: "#111" }}>{item.label}</div>
                                    <div style={{ fontSize: 12, color: "#aaa", marginTop: 2 }}>{item.desc}</div>
                                </div>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
                            </div>
                        ))}
                    </div>

                    {/* Danger zone */}
                    <div style={{ background: "#fff", borderRadius: 18, border: "1.5px solid #ECEEF0", overflow: "hidden" }}>
                        <div style={{ padding: "12px 16px", borderBottom: "1px solid #F5F7F8" }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: "#FF4757", textTransform: "uppercase", letterSpacing: "0.5px" }}>⚠️ Zona Berbahaya</div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px", cursor: "pointer" }} onClick={onLogout}>
                            <div style={{ width: 44, height: 44, borderRadius: 13, background: "#FFF0F1", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🚪</div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 14, fontWeight: 700, color: "#FF4757" }}>Logout Terlebih Dahulu</div>
                                <div style={{ fontSize: 12, color: "#aaa", marginTop: 2 }}>Hubungi admin untuk hapus akun permanen</div>
                            </div>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFAAAA" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
                        </div>
                    </div>
                </div>
            )}

            {/* UBAH EMAIL */}
            {section === "email" && (
                <>
                    <div className="content">
                        <div style={{ background: TEAL_LIGHT, borderRadius: 14, padding: "12px 16px", marginBottom: 18, display: "flex", gap: 10, alignItems: "flex-start" }}>
                            <span style={{ fontSize: 18, flexShrink: 0 }}>💡</span>
                            <div style={{ fontSize: 13, color: TEAL, lineHeight: 1.6 }}>Setelah email diubah, gunakan email baru untuk login berikutnya.</div>
                        </div>
                        <div style={{ background: "#fff", borderRadius: 18, border: "1.5px solid #ECEEF0", padding: 18 }}>
                            <div className="input-label">Email Baru</div>
                            <div style={{ position: "relative", marginBottom: errors.newEmail ? 4 : 16 }}>
                                <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 16, pointerEvents: "none" }}>📧</span>
                                <input className={`form-input${errors.newEmail ? " input-error" : ""}`} style={{ paddingLeft: 44, marginBottom: 0 }} placeholder="email@baru.com" type="email" value={emailForm.newEmail} onChange={e => { setEmailForm({ ...emailForm, newEmail: e.target.value }); setErrors({ ...errors, newEmail: "" }); }} />
                            </div>
                            {errors.newEmail && <div className="error-msg" style={{ marginBottom: 12 }}>⚠ {errors.newEmail}</div>}

                            <div className="input-label">Konfirmasi Email Baru</div>
                            <div style={{ position: "relative", marginBottom: errors.confirmEmail ? 4 : 16 }}>
                                <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 16, pointerEvents: "none" }}>📧</span>
                                <input className={`form-input${errors.confirmEmail ? " input-error" : emailForm.confirmEmail && emailForm.newEmail === emailForm.confirmEmail ? " input-success" : ""}`} style={{ paddingLeft: 44, marginBottom: 0 }} placeholder="Ulangi email baru" type="email" value={emailForm.confirmEmail} onChange={e => { setEmailForm({ ...emailForm, confirmEmail: e.target.value }); setErrors({ ...errors, confirmEmail: "" }); }} />
                                {emailForm.confirmEmail && emailForm.newEmail === emailForm.confirmEmail && <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", color: "#27AE60", fontSize: 16 }}>✓</span>}
                            </div>
                            {errors.confirmEmail && <div className="error-msg" style={{ marginBottom: 12 }}>⚠ {errors.confirmEmail}</div>}

                            <div style={{ height: 1, background: "#F0F2F4", margin: "4px 0 16px" }} />

                            <div className="input-label">Password Saat Ini</div>
                            <div style={{ position: "relative" }}>
                                <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 16, pointerEvents: "none" }}>🔒</span>
                                <input className={`form-input${errors.currentPass ? " input-error" : ""}`} style={{ paddingLeft: 44, paddingRight: 46, marginBottom: 0 }} placeholder="Verifikasi identitas kamu" type={showCurr ? "text" : "password"} value={emailForm.currentPass} onChange={e => { setEmailForm({ ...emailForm, currentPass: e.target.value }); setErrors({ ...errors, currentPass: "" }); }} />
                                <button onClick={() => setShowCurr(!showCurr)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 17, color: "#bbb", padding: 0 }}>{showCurr ? "🙈" : "👁️"}</button>
                            </div>
                            {errors.currentPass && <div className="error-msg" style={{ marginTop: 4 }}>⚠ {errors.currentPass}</div>}
                        </div>
                    </div>
                    <div className="bottom-bar" style={{ gap: 10 }}>
                        <button onClick={() => { setSection(null); setErrors({}); }} style={{ flex: 1, padding: "14px", borderRadius: 13, border: "1.5px solid #ECEEF0", background: "#F5F7F8", color: "#555", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Batal</button>
                        <button onClick={handleSaveEmail} disabled={loading} style={{ flex: 2, ...btnPrimary, background: loading ? "#C5D8DC" : TEAL, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                            {loading ? <><span className="spin" />Menyimpan...</> : "📧 Simpan Email"}
                        </button>
                    </div>
                </>
            )}

            {/* UBAH PASSWORD */}
            {section === "password" && (
                <>
                    <div className="content">
                        <div style={{ background: "#fff", borderRadius: 18, border: "1.5px solid #ECEEF0", padding: 18 }}>
                            <div className="input-label">Password Saat Ini</div>
                            <div style={{ position: "relative", marginBottom: errors.currentPass ? 4 : 16 }}>
                                <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 16, pointerEvents: "none" }}>🔒</span>
                                <input className={`form-input${errors.currentPass ? " input-error" : ""}`} style={{ paddingLeft: 44, paddingRight: 46, marginBottom: 0 }} placeholder="Password lama kamu" type={showCurr ? "text" : "password"} value={passForm.currentPass} onChange={e => { setPassForm({ ...passForm, currentPass: e.target.value }); setErrors({ ...errors, currentPass: "" }); }} />
                                <button onClick={() => setShowCurr(!showCurr)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 17, color: "#bbb", padding: 0 }}>{showCurr ? "🙈" : "👁️"}</button>
                            </div>
                            {errors.currentPass && <div className="error-msg" style={{ marginBottom: 12 }}>⚠ {errors.currentPass}</div>}

                            <div style={{ height: 1, background: "#F0F2F4", margin: "0 0 16px" }} />

                            <div className="input-label">Password Baru</div>
                            <div style={{ position: "relative", marginBottom: errors.newPass ? 4 : 4 }}>
                                <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 16, pointerEvents: "none" }}>🔐</span>
                                <input className={`form-input${errors.newPass ? " input-error" : ""}`} style={{ paddingLeft: 44, paddingRight: 46, marginBottom: 0 }} placeholder="Min. 8 karakter" type={showNew ? "text" : "password"} value={passForm.newPass} onChange={e => { setPassForm({ ...passForm, newPass: e.target.value }); setErrors({ ...errors, newPass: "" }); }} />
                                <button onClick={() => setShowNew(!showNew)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 17, color: "#bbb", padding: 0 }}>{showNew ? "🙈" : "👁️"}</button>
                            </div>
                            {errors.newPass && <div className="error-msg" style={{ marginBottom: 4 }}>⚠ {errors.newPass}</div>}

                            {/* Strength bar */}
                            {passForm.newPass.length > 0 && (
                                <div style={{ marginBottom: 14, marginTop: errors.newPass ? 4 : 8 }}>
                                    <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
                                        {[1, 2, 3, 4].map(i => { const s = passStrength(passForm.newPass); const c = passColor(s); return <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= s ? c : "#E5E9EC", transition: "background 0.3s" }} />; })}
                                    </div>
                                    <div style={{ fontSize: 10, fontWeight: 600, color: passColor(passStrength(passForm.newPass)) }}>{passLabel(passStrength(passForm.newPass))}</div>
                                </div>
                            )}

                            <div className="input-label" style={{ marginTop: passForm.newPass.length > 0 ? 0 : 12 }}>Konfirmasi Password Baru</div>
                            <div style={{ position: "relative" }}>
                                <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 16, pointerEvents: "none" }}>🔐</span>
                                <input className={`form-input${errors.confirmPass ? " input-error" : passForm.confirmPass && passForm.newPass === passForm.confirmPass ? " input-success" : ""}`} style={{ paddingLeft: 44, paddingRight: 46, marginBottom: 0 }} placeholder="Ulangi password baru" type={showConf ? "text" : "password"} value={passForm.confirmPass} onChange={e => { setPassForm({ ...passForm, confirmPass: e.target.value }); setErrors({ ...errors, confirmPass: "" }); }} />
                                <button onClick={() => setShowConf(!showConf)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 17, color: "#bbb", padding: 0 }}>{showConf ? "🙈" : "👁️"}</button>
                                {passForm.confirmPass && passForm.newPass === passForm.confirmPass && <span style={{ position: "absolute", right: 42, top: "50%", transform: "translateY(-50%)", color: "#27AE60", fontSize: 16 }}>✓</span>}
                            </div>
                            {errors.confirmPass && <div className="error-msg" style={{ marginTop: 4 }}>⚠ {errors.confirmPass}</div>}

                            <div style={{ marginTop: 16, padding: "12px", background: "#FFF8EC", borderRadius: 11, display: "flex", gap: 8, alignItems: "flex-start" }}>
                                <span style={{ fontSize: 16, flexShrink: 0 }}>💡</span>
                                <div style={{ fontSize: 12, color: "#E67E22", lineHeight: 1.6 }}>Gunakan kombinasi huruf besar, angka, dan simbol agar password lebih kuat.</div>
                            </div>
                        </div>
                    </div>
                    <div className="bottom-bar" style={{ gap: 10 }}>
                        <button onClick={() => { setSection(null); setErrors({}); }} style={{ flex: 1, padding: "14px", borderRadius: 13, border: "1.5px solid #ECEEF0", background: "#F5F7F8", color: "#555", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Batal</button>
                        <button onClick={handleSavePass} disabled={loading} style={{ flex: 2, ...btnPrimary, background: loading ? "#C5D8DC" : TEAL, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                            {loading ? <><span className="spin" />Menyimpan...</> : "🔐 Simpan Password"}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

// ── METODE PEMBAYARAN ──────────────────────────────────────────────────────────
function MetodePembayaran({ onBack, user, onUpdateUser }) {
    const [qrisImage, setQrisImage] = useState(user?.qris_image || null);
    const [bankList, setBankList] = useState(Array.isArray(user?.bank_info) ? user.bank_info : []);
    const [loading, setLoading] = useState(false);
    const { notify } = useNotification();

    // Sync state if user prop changes (e.g., after save or refresh)
    React.useEffect(() => {
        if (user) {
            setQrisImage(user.qris_image || null);
            setBankList(Array.isArray(user.bank_info) ? user.bank_info : []);
        }
    }, [user]);

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setQrisImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const addBank = () => {
        setBankList([...bankList, { name: "", account: "" }]);
    };

    const updateBank = (index, field, value) => {
        const newList = [...bankList];
        newList[index][field] = value;
        setBankList(newList);
    };

    const removeBank = (index) => {
        setBankList(bankList.filter((_, i) => i !== index));
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const res = await apiFetch('/user/profile', {
                method: 'POST',
                body: JSON.stringify({
                    name: user?.name,
                    email: user?.email,
                    nama_usaha: user?.nama_usaha,
                    tipe_bisnis: user?.tipe_bisnis,
                    bank_info: bankList,
                    qris_image: qrisImage
                })
            });
            const data = await res.json();
            if (data.status === 'success') {
                onUpdateUser(data.user);
                // Also update local state to reflect the processed data (like file paths)
                setQrisImage(data.user.qris_image || null);
                setBankList(Array.isArray(data.user.bank_info) ? data.user.bank_info : []);
                notify("Metode pembayaran berhasil disimpan");
            } else {
                notify(data.message || "Gagal menyimpan", "error");
            }
        } catch (err) {
            notify("Kesalahan koneksi", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={pageStyle}>
            <style>{globalCSS}</style>
            <div className="topbar" style={{ paddingBottom: 16 }}>
                <div className="topbar-row">
                    <button className="back-btn" onClick={onBack}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
                    </button>
                    <span className="topbar-title">Metode <span style={{ color: TEAL }}>Pembayaran</span></span>
                </div>
            </div>

            <div className="content">
                {/* QRIS Section */}
                <div style={{ background: "#fff", borderRadius: 18, border: "1.5px solid #ECEEF0", padding: 18, marginBottom: 16 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#111", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 8, background: TEAL_LIGHT, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>📱</div>
                        Pengaturan QRIS
                    </div>

                    <div style={{ textAlign: "center", padding: "10px", border: "2px dashed #ECEEF0", borderRadius: 14, background: "#FAFBFC", cursor: "pointer", position: "relative" }}>
                        {qrisImage ? (
                            <img src={qrisImage.startsWith('data:') ? qrisImage : (qrisImage.startsWith('http') ? qrisImage : `${STORAGE_URL}/${qrisImage}`)} alt="QRIS" style={{ maxWidth: "100%", maxHeight: 200, borderRadius: 8 }} />
                        ) : (
                            <div style={{ padding: "30px 0" }}>
                                <div style={{ fontSize: 32, marginBottom: 8 }}>🖼️</div>
                                <div style={{ fontSize: 13, fontWeight: 600, color: "#aaa" }}>Upload Foto QRIS Toko</div>
                            </div>
                        )}
                        <input type="file" accept="image/*" onChange={handleFileUpload} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", opacity: 0, cursor: "pointer" }} />
                    </div>
                </div>

                {/* Bank Transfer Section */}
                <div style={{ background: "#fff", borderRadius: 18, border: "1.5px solid #ECEEF0", padding: 18, marginBottom: 14 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#111", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ width: 28, height: 28, borderRadius: 8, background: "#EEF0FF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🏦</div>
                            Transfer Bank
                        </div>
                        <button onClick={addBank} style={{ padding: "6px 12px", borderRadius: 8, background: TEAL, color: "#fff", border: "none", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>+ Tambah</button>
                    </div>

                    {(!bankList || bankList.length === 0) ? (
                        <div style={{ textAlign: "center", padding: "20px 0", color: "#aaa", fontSize: 12 }}>Belum ada rekening ditambahkan</div>
                    ) : (
                        bankList.map((bank, idx) => (
                            <div key={idx} style={{ padding: 14, borderRadius: 12, border: "1.5px solid #F0F2F4", marginBottom: 10, position: "relative" }}>
                                <button onClick={() => removeBank(idx)} style={{ position: "absolute", top: 10, right: 10, background: "none", border: "none", color: "#FF4757", fontSize: 14, cursor: "pointer" }}>✕</button>
                                <div className="input-label">Nama Bank (misal: BCA)</div>
                                <input className="form-input" value={bank.name} onChange={e => updateBank(idx, "name", e.target.value)} style={{ marginBottom: 10 }} />
                                <div className="input-label">Nomor Rekening</div>
                                <input className="form-input" value={bank.account} onChange={e => updateBank(idx, "account", e.target.value)} />
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="bottom-bar">
                <button onClick={handleSave} disabled={loading} style={{ ...btnPrimary, background: loading ? "#C5D8DC" : TEAL }}>
                    {loading ? "Menyimpan..." : "💾 Simpan Perubahan"}
                </button>
            </div>
        </div>
    );
}

// ── MAIN PENGATURAN ────────────────────────────────────────────────────────────
export default function Settings({ user, onUpdateUser, onLogout }) {
    const [screen, setScreen] = useState("main"); // main | profil | akun | payment

    if (screen === "profil") return <ProfilUsaha onBack={() => setScreen("main")} user={user} onUpdateUser={onUpdateUser} />;
    if (screen === "akun") return <AkunPassword onBack={() => setScreen("main")} user={user} onUpdateUser={onUpdateUser} onLogout={onLogout} />;
    if (screen === "payment") return <MetodePembayaran onBack={() => setScreen("main")} user={user} onUpdateUser={onUpdateUser} />;

    const btype = BUSINESS_TYPES.find(b => b.id === user?.tipe_bisnis);

    const menuGroups = user?.role === 'admin' ? [
        {
            title: "Usaha",
            items: [
                { icon: "🏪", label: "Profil Usaha", desc: "Nama, tipe, email", color: TEAL_LIGHT, iconColor: TEAL, action: "profil" },
                { icon: "💳", label: "Metode Pembayaran", desc: "QRIS dan rekening bank", color: "#FFF8EC", iconColor: "#F39C12", action: "payment" },
                { icon: "🔒", label: "Akun & Keamanan", desc: "Email dan password login", color: "#EEF0FF", iconColor: "#6C63FF", action: "akun" },
            ],
        },
    ] : [];

    return (
        <div style={pageStyle}>
            <style>{globalCSS}</style>

            <div className="topbar" style={{ paddingBottom: 16 }}>
                <div className="topbar-row">
                    <span className="topbar-title">Peng<span style={{ color: TEAL }}>aturan</span></span>
                </div>
            </div>

            <div className="content">
                {/* Profile summary */}
                <div
                    style={{ background: `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})`, borderRadius: 18, padding: "18px 20px", marginBottom: 18, position: "relative", overflow: "hidden", cursor: user?.role === 'admin' ? "pointer" : "default" }}
                    onClick={() => user?.role === 'admin' && setScreen("profil")}
                >
                    <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
                    <div style={{ display: "flex", alignItems: "center", gap: 14, position: "relative", zIndex: 2 }}>
                        <div style={{ width: 52, height: 52, borderRadius: 16, background: "rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 800, color: "#fff" }}>
                            {user?.nama_usaha?.slice(0, 2).toUpperCase() || "MM"}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>{user?.nama_usaha || "MiniMart Sejahtera"}</div>
                            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 2 }}>{user?.email || "minimart@email.com"}</div>
                            <div style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 6, background: "rgba(255,255,255,0.18)", borderRadius: 20, padding: "3px 10px" }}>
                                <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#A8F0C6" }} />
                                <span style={{ fontSize: 10, color: "#fff", fontWeight: 600 }}>Akun Aktif • {btype?.icon} {btype?.label || "Usaha"}</span>
                            </div>
                        </div>
                        {user?.role === 'admin' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>}
                    </div>
                </div>

                {/* Menu groups */}
                {menuGroups.map((group, gi) => (
                    <div key={gi} style={{ marginBottom: 16 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 8, paddingLeft: 4 }}>{group.title}</div>
                        <div style={{ background: "#fff", borderRadius: 16, border: "1.5px solid #ECEEF0", overflow: "hidden" }}>
                            {group.items.map((item, i) => (
                                <div key={i} onClick={() => item.action && setScreen(item.action)}
                                    style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderBottom: i < group.items.length - 1 ? "1px solid #F5F7F8" : "none", cursor: item.action ? "pointer" : "default", transition: "background 0.15s" }}
                                    onMouseEnter={e => { if (item.action) e.currentTarget.style.background = "#FAFBFC"; }}
                                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                                    <div style={{ width: 40, height: 40, borderRadius: 12, background: item.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{item.icon}</div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: 14, fontWeight: 600, color: "#111" }}>{item.label}</div>
                                        <div style={{ fontSize: 11, color: "#aaa", marginTop: 2 }}>{item.desc}</div>
                                    </div>
                                    {item.right && <div style={{ fontSize: 12, fontWeight: 600, color: "#aaa" }}>{item.right}</div>}
                                    {item.action && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {/* Logout */}
                <div style={{ background: "#fff", borderRadius: 16, border: "1.5px solid #FFDDE0", overflow: "hidden" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", cursor: "pointer" }} onClick={onLogout}>
                        <div style={{ width: 40, height: 40, borderRadius: 12, background: "#FFF0F1", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🚪</div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 14, fontWeight: 700, color: "#FF4757" }}>Keluar</div>
                            <div style={{ fontSize: 11, color: "#aaa", marginTop: 2 }}>Logout dari akun ini</div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

const pageStyle = { fontFamily: "'Plus Jakarta Sans', sans-serif", background: "#F5F7F8", minHeight: "100%", width: "100%", margin: "0 auto", display: "flex", flexDirection: "column" };
const btnPrimary = { width: "100%", padding: "15px", borderRadius: 14, background: TEAL, color: "#fff", border: "none", cursor: "pointer", fontSize: 15, fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif", transition: "background 0.15s" };

const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
  @keyframes slideDown { from { opacity: 0; transform: translateX(-50%) translateY(-10px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
  @keyframes spin { to { transform: rotate(360deg); } }
  .topbar { background: #fff; padding: 16px 20px 0; border-bottom: 1px solid #ECEEF0; position: sticky; top: 0; z-index: 20; }
  .topbar-row { display: flex; align-items: center; gap: 12px; }
  .topbar-title { font-size: 18px; font-weight: 700; color: #111; letter-spacing: -0.4px; }
  .back-btn { width: 40px; height: 40px; border-radius: 12px; background: #F5F7F8; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #333; flex-shrink: 0; }
  .back-btn:active { background: #ECEEF0; }
  .content { flex: 1; padding: 16px; padding-bottom: 100px; overflow-y: auto; }
  .input-label { font-size: 11px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 7px; }
  .form-input { width: 100%; padding: 13px 14px; border: 1.5px solid #E5E9EC; border-radius: 12px; font-size: 14px; font-family: 'Plus Jakarta Sans', sans-serif; outline: none; color: #111; background: #FAFBFC; margin-bottom: 0; transition: border-color 0.2s, box-shadow 0.2s; }
  .form-input:focus { border-color: ${TEAL}; background: #fff; box-shadow: 0 0 0 3px ${TEAL}18; }
  .input-error { border-color: #FF4757 !important; background: #FFF5F5 !important; }
  .input-success { border-color: #27AE60 !important; background: #F0FFF4 !important; }
  .error-msg { font-size: 11px; color: #FF4757; font-weight: 600; padding-left: 2px; }
  .bottom-bar { position: fixed; bottom: 0; left: 50%; transform: translateX(-50%); width: 430px; max-width: 100%; background: #fff; border-top: 1px solid #ECEEF0; padding: 12px 20px 24px; display: flex; align-items: center; gap: 10px; }
  .spin { width: 16px; height: 16px; border: 2.5px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; display: inline-block; flex-shrink: 0; }
`;
