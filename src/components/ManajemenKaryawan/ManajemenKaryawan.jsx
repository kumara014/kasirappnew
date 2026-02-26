import React, { useState, useEffect } from "react";
import { apiFetch } from "../../config";

const TEAL = "#4A9BAD";
const TEAL_LIGHT = "#EAF5F7";
const TEAL_DARK = "#357585";

const ROLES = {
    admin: {
        label: "Admin",
        icon: "👑",
        color: "#F39C12",
        bg: "#FFF8EC",
        border: "#F5CBA7",
        access: ["Dashboard", "Kasir", "Kelola Produk", "Laporan", "Riwayat", "Mutasi Stok", "Karyawan"],
    },
    kasir: {
        label: "Kasir",
        icon: "🛒",
        color: TEAL,
        bg: TEAL_LIGHT,
        border: "#B2DFE8",
        access: ["Dashboard", "Kasir", "Riwayat"],
    },
};

const AVATAR_COLORS = [
    { bg: "#EAF5F7", color: TEAL },
    { bg: "#FFF8EC", color: "#F39C12" },
    { bg: "#EEF0FF", color: "#6C63FF" },
    { bg: "#FFF0F4", color: "#FF4B7B" },
    { bg: "#F0FFF4", color: "#27AE60" },
    { bg: "#F5F0FF", color: "#7C4DFF" },
];

function Toast({ msg, type }) {
    return (
        <div style={{ position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)", background: type === "error" ? "#FF4757" : "#1a1a18", color: "#fff", padding: "12px 20px", borderRadius: 14, fontSize: 13, fontWeight: 600, zIndex: 200, whiteSpace: "nowrap", boxShadow: "0 4px 20px rgba(0,0,0,0.2)", animation: "slideDown 0.3s ease" }}>
            {type === "error" ? "🗑️" : "✅"} {msg}
        </div>
    );
}

function Avatar({ name, colorIdx, size = 44 }) {
    const c = AVATAR_COLORS[(colorIdx || 0) % AVATAR_COLORS.length];
    const initials = (name || "?").split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
    return (
        <div style={{ width: size, height: size, borderRadius: size * 0.3, background: c.bg, border: `1.5px solid ${c.color}33`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.36, fontWeight: 800, color: c.color, flexShrink: 0, letterSpacing: "-0.5px" }}>
            {initials}
        </div>
    );
}

function DetailKaryawan({ employee, onBack, onEdit, onDelete }) {
    const role = ROLES[employee.role] || ROLES.kasir;
    const joinDate = new Date(employee.created_at || employee.joinDate || Date.now()).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
    const now = new Date();
    const join = new Date(employee.created_at || employee.joinDate || Date.now());
    const months = (now.getFullYear() - join.getFullYear()) * 12 + (now.getMonth() - join.getMonth());
    const duration = months >= 12 ? `${Math.floor(months / 12)} tahun ${months % 12} bulan` : `${months} bulan`;

    return (
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <div className="topbar" style={{ paddingBottom: 16 }}>
                <div className="topbar-row">
                    <button className="back-btn" onClick={onBack}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
                    </button>
                    <span className="topbar-title">Detail <span style={{ color: TEAL }}>Karyawan</span></span>
                    <button onClick={() => onEdit(employee)} style={{ marginLeft: "auto", padding: "7px 14px", borderRadius: 11, background: TEAL_LIGHT, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700, color: TEAL, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>✏️ Edit</button>
                </div>
            </div>

            <div className="content">
                {/* Profile card */}
                <div style={{ background: `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})`, borderRadius: 20, padding: "24px 20px", marginBottom: 16, position: "relative", overflow: "hidden", textAlign: "center" }}>
                    <div style={{ position: "absolute", top: -40, right: -40, width: 150, height: 150, borderRadius: "50%", background: "rgba(255,255,255,0.07)", pointerEvents: "none" }} />
                    <div style={{ width: 72, height: 72, borderRadius: 22, background: "rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 800, color: "#fff", margin: "0 auto 12px", border: "2.5px solid rgba(255,255,255,0.35)", letterSpacing: "-1px" }}>
                        {(employee.name || "?").split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()}
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", letterSpacing: "-0.4px", marginBottom: 6 }}>{employee.name}</div>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.2)", borderRadius: 20, padding: "5px 14px" }}>
                        <span style={{ fontSize: 14 }}>{role.icon}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>{role.label}</span>
                    </div>
                </div>

                {/* Info */}
                <div style={{ background: "#fff", borderRadius: 16, border: "1.5px solid #ECEEF0", overflow: "hidden", marginBottom: 14 }}>
                    <div style={{ padding: "12px 16px", borderBottom: "1px solid #F5F7F8" }}><span style={{ fontSize: 12, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.5px" }}>Informasi Kontak</span></div>
                    {[
                        { icon: "📧", label: "Email", val: employee.email },
                        { icon: "📅", label: "Bergabung", val: joinDate },
                        { icon: "⏳", label: "Lama Kerja", val: duration },
                    ].map((r, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 16px", borderBottom: i < 2 ? "1px solid #F5F7F8" : "none" }}>
                            <div style={{ width: 36, height: 36, borderRadius: 10, background: "#F5F7F8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 }}>{r.icon}</div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 11, color: "#aaa", fontWeight: 500, marginBottom: 2 }}>{r.label}</div>
                                <div style={{ fontSize: 13, fontWeight: 600, color: "#111" }}>{r.val}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Akses */}
                <div style={{ background: "#fff", borderRadius: 16, border: "1.5px solid #ECEEF0", overflow: "hidden", marginBottom: 14 }}>
                    <div style={{ padding: "12px 16px", borderBottom: "1px solid #F5F7F8", display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.5px" }}>Hak Akses Menu</span>
                        <div style={{ marginLeft: "auto", padding: "3px 10px", borderRadius: 20, background: role.bg, border: `1.5px solid ${role.border}` }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: role.color }}>{role.icon} {role.label}</span>
                        </div>
                    </div>
                    <div style={{ padding: "14px 16px", display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {ROLES.admin.access.map(menu => {
                            const hasAccess = (employee.permissions || role.access).includes(menu);
                            return (
                                <div key={menu} style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 11px", borderRadius: 20, background: hasAccess ? "#EAFAF1" : "#F5F7F8", border: `1.5px solid ${hasAccess ? "#A9DFBF" : "#ECEEF0"}` }}>
                                    <span style={{ fontSize: 11, color: hasAccess ? "#27AE60" : "#ccc" }}>{hasAccess ? "✓" : "✗"}</span>
                                    <span style={{ fontSize: 11, fontWeight: 600, color: hasAccess ? "#27AE60" : "#bbb" }}>{menu}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Hapus */}
                {!employee.master_owner && (
                    <button onClick={() => onDelete(employee)}
                        style={{ width: "100%", padding: "14px", borderRadius: 14, border: "1.5px solid #FFDDE0", background: "#FFF5F5", color: "#FF4757", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                        🗑️ Hapus Karyawan
                    </button>
                )}
            </div>
        </div>
    );
}

const Field = ({ label, icon, error, children }) => (
    <div style={{ marginBottom: 16 }}>
        <div className="input-label">{label}</div>
        <div style={{ position: "relative" }}>
            {icon && <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 16, pointerEvents: "none", zIndex: 1 }}>{icon}</span>}
            {children}
        </div>
        {error && <div className="error-msg" style={{ marginTop: 5 }}>⚠ {error}</div>}
    </div>
);

// ── FORM KARYAWAN ──────────────────────────────────────────────────────────────
function FormKaryawan({ employee, onBack, onSave }) {
    const isEdit = !!employee;
    const [form, setForm] = useState({
        name: employee?.name || "",
        email: employee?.email || "",
        role: employee?.role || "kasir",
        permissions: employee?.permissions || ROLES[employee?.role || "kasir"].access,
        password: "",
        confirmPass: "",
    });
    const [errors, setErrors] = useState({});
    const [showPass, setShowPass] = useState(false);
    const [showConf, setShowConf] = useState(false);
    const [loading, setLoading] = useState(false);

    const validate = () => {
        const e = {};
        if (!form.name.trim()) e.name = "Nama tidak boleh kosong";
        if (!form.email) e.email = "Email tidak boleh kosong";
        else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Format email tidak valid";
        if (!isEdit) {
            if (!form.password) e.password = "Password tidak boleh kosong";
            else if (form.password.length < 8) e.password = "Password minimal 8 karakter";
            if (form.password !== form.confirmPass) e.confirmPass = "Password tidak cocok";
        } else if (form.password && form.password.length < 8) {
            e.password = "Password minimal 8 karakter";
        } else if (form.password && form.password !== form.confirmPass) {
            e.confirmPass = "Password tidak cocok";
        }
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSave = () => {
        if (!validate()) return;
        setLoading(true);
        // API Call triggers from parent
        onSave(form, setLoading);
    };

    const togglePermission = (p) => {
        let newPerms;
        if (form.permissions.includes(p)) {
            newPerms = form.permissions.filter(x => x !== p);
        } else {
            newPerms = [...form.permissions, p];
        }
        setForm({ ...form, permissions: newPerms });
    };

    const role = ROLES[form.role] || ROLES.kasir;

    return (
        <div style={{ ...pageStyle, minHeight: "100vh" }}>
            {/* Topbar */}
            <div style={{ background: "#fff", padding: "16px 20px", borderBottom: "1px solid #ECEEF0", position: "sticky", top: 0, zIndex: 20, display: "flex", alignItems: "center", gap: 12 }}>
                <button onClick={onBack} style={{ width: 40, height: 40, borderRadius: 12, background: "#F5F7F8", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
                </button>
                <span style={{ fontSize: 18, fontWeight: 700, color: "#111", letterSpacing: "-0.4px" }}>
                    {isEdit ? "Edit" : "Tambah"} <span style={{ color: TEAL }}>Karyawan</span>
                </span>
            </div>

            {/* Content */}
            <div style={{ padding: 16, paddingBottom: 160, overflowY: "auto", flex: 1 }}>

                {/* Role picker */}
                <div style={{ background: "#fff", borderRadius: 18, border: "1.5px solid #ECEEF0", padding: 18, marginBottom: 14 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#111", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 8, background: "#F5F7F8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🎭</div>
                        Pilih Role
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
                        {Object.entries(ROLES).map(([key, r]) => {
                            const isA = form.role === key;
                            return (
                                <button key={key} onClick={() => setForm({ ...form, role: key, permissions: r.access })}
                                    style={{ padding: "16px 14px", borderRadius: 14, border: `2px solid ${isA ? r.color : "#E5E9EC"}`, background: isA ? r.bg : "#FAFBFC", cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", textAlign: "left", transition: "all 0.15s", width: "100%" }}>
                                    <div style={{ fontSize: 26, marginBottom: 8 }}>{r.icon}</div>
                                    <div style={{ fontSize: 14, fontWeight: 800, color: isA ? r.color : "#333", marginBottom: 4 }}>{r.label}</div>
                                    <div style={{ fontSize: 11, color: isA ? r.color : "#aaa", lineHeight: 1.5 }}>
                                        {key === "admin" ? "Akses penuh ke semua menu" : "Hanya kasir & riwayat"}
                                    </div>
                                    {isA && (
                                        <div style={{ display: "inline-flex", marginTop: 10, background: r.color, borderRadius: 7, padding: "3px 10px" }}>
                                            <span style={{ fontSize: 11, fontWeight: 700, color: "#fff" }}>✓ Dipilih</span>
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                    {/* Access selection */}
                    <div style={{ background: "#F5F7F8", borderRadius: 12, padding: "12px 14px" }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "#888", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.4px" }}>Akses yang diberikan</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                            {ROLES.admin.access.map(a => {
                                const hasAccess = form.permissions.includes(a);
                                return (
                                    <button
                                        key={a}
                                        type="button"
                                        onClick={() => togglePermission(a)}
                                        style={{
                                            fontSize: 11, fontWeight: 600,
                                            color: hasAccess ? role.color : "#888",
                                            background: hasAccess ? role.bg : "#fff",
                                            border: `1.5px solid ${hasAccess ? role.border : "#ECEEF0"}`,
                                            padding: "5px 10px", borderRadius: 8, cursor: "pointer",
                                            display: "flex", alignItems: "center", gap: 4, transition: "all 0.15s"
                                        }}
                                    >
                                        {hasAccess ? "✓" : "+"} {a}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Data pribadi */}
                <div style={{ background: "#fff", borderRadius: 18, border: "1.5px solid #ECEEF0", padding: 18, marginBottom: 14 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#111", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 8, background: "#F5F7F8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>👤</div>
                        Data Pribadi
                    </div>

                    <Field label="Nama Lengkap *" error={errors.name}>
                        <input className={`form-input${errors.name ? " input-error" : ""}`}
                            style={{ width: "100%", marginBottom: 0 }}
                            placeholder="Nama lengkap karyawan"
                            value={form.name}
                            onChange={e => { setForm({ ...form, name: e.target.value }); setErrors({ ...errors, name: "" }); }} />
                    </Field>

                    <Field label="Email *" icon="📧" error={errors.email}>
                        <input className={`form-input${errors.email ? " input-error" : ""}`}
                            style={{ width: "100%", paddingLeft: 44, marginBottom: 0 }}
                            placeholder="email@minimart.com"
                            type="email"
                            value={form.email}
                            onChange={e => { setForm({ ...form, email: e.target.value }); setErrors({ ...errors, email: "" }); }} />
                    </Field>
                </div>

                {/* Password */}
                <div style={{ background: "#fff", borderRadius: 18, border: "1.5px solid #ECEEF0", padding: 18 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#111", marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 8, background: "#F5F7F8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🔒</div>
                        {isEdit ? "Ubah Password" : "Password Login"}
                    </div>
                    {isEdit && <div style={{ fontSize: 12, color: "#aaa", marginBottom: 14 }}>Kosongkan jika tidak ingin mengubah</div>}

                    <div style={{ marginBottom: 16, marginTop: isEdit ? 0 : 14 }}>
                        <div className="input-label">{isEdit ? "Password Baru" : "Password *"}</div>
                        <div style={{ position: "relative" }}>
                            <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 16, pointerEvents: "none" }}>🔒</span>
                            <input className={`form-input${errors.password ? " input-error" : ""}`}
                                style={{ width: "100%", paddingLeft: 44, paddingRight: 48, marginBottom: 0 }}
                                placeholder="Min. 8 karakter"
                                type={showPass ? "text" : "password"}
                                value={form.password}
                                onChange={e => { setForm({ ...form, password: e.target.value }); setErrors({ ...errors, password: "" }); }} />
                            <button onClick={() => setShowPass(!showPass)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 17, color: "#bbb", padding: 0 }}>{showPass ? "🙈" : "👁️"}</button>
                        </div>
                        {errors.password && <div className="error-msg" style={{ marginTop: 5 }}>⚠ {errors.password}</div>}
                    </div>

                    <div>
                        <div className="input-label">Konfirmasi Password</div>
                        <div style={{ position: "relative" }}>
                            <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 16, pointerEvents: "none" }}>🔐</span>
                            <input className={`form-input${errors.confirmPass ? " input-error" : form.confirmPass && form.password === form.confirmPass ? " input-success" : ""}`}
                                style={{ width: "100%", paddingLeft: 44, paddingRight: 48, marginBottom: 0 }}
                                placeholder="Ulangi password"
                                type={showConf ? "text" : "password"}
                                value={form.confirmPass}
                                onChange={e => { setForm({ ...form, confirmPass: e.target.value }); setErrors({ ...errors, confirmPass: "" }); }} />
                            <button onClick={() => setShowConf(!showConf)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 17, color: "#bbb", padding: 0 }}>{showConf ? "🙈" : "👁️"}</button>
                            {form.confirmPass && form.password === form.confirmPass && (
                                <span style={{ position: "absolute", right: 44, top: "50%", transform: "translateY(-50%)", color: "#27AE60", fontSize: 16 }}>✓</span>
                            )}
                        </div>
                        {errors.confirmPass && <div className="error-msg" style={{ marginTop: 5 }}>⚠ {errors.confirmPass}</div>}
                    </div>
                </div>
            </div>

            {/* Bottom bar */}
            <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: "#fff", borderTop: "1px solid #ECEEF0", padding: "12px 16px 28px", display: "flex", gap: 10, zIndex: 30 }}>
                <button onClick={onBack}
                    style={{ flex: 1, padding: "14px", borderRadius: 13, border: "1.5px solid #ECEEF0", background: "#F5F7F8", color: "#555", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    Batal
                </button>
                <button onClick={handleSave} disabled={loading}
                    style={{ flex: 2, padding: "14px", borderRadius: 13, border: "none", background: loading ? "#C5D8DC" : TEAL, color: "#fff", fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: loading ? "none" : `0 4px 16px ${TEAL}44` }}>
                    {loading ? <><span className="spin" />{isEdit ? "Menyimpan..." : "Menambahkan..."}</> : isEdit ? "💾 Simpan Perubahan" : "✅ Tambah Karyawan"}
                </button>
            </div>
        </div>
    );
}

// ── KONFIRMASI HAPUS ───────────────────────────────────────────────────────────
function ConfirmDelete({ employee, onConfirm, onCancel }) {
    const [loading, setLoading] = useState(false);
    return (
        <div style={{ display: "flex", flexDirection: "column", flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
            <div style={{ background: "#fff", borderRadius: 20, padding: 28, border: "1.5px solid #ECEEF0", width: "100%", textAlign: "center" }}>
                <div style={{ width: 68, height: 68, borderRadius: 20, background: "#FFF0F1", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, margin: "0 auto 16px" }}>🗑️</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#111", marginBottom: 8 }}>Hapus Karyawan?</div>
                <div style={{ marginBottom: 6 }}>
                    <Avatar name={employee.name} colorIdx={employee.id_user || employee.id} size={40} />
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#111", marginBottom: 4, marginTop: 6 }}>{employee.name}</div>
                <div style={{ fontSize: 12, color: "#aaa", marginBottom: 24, lineHeight: 1.6 }}>
                    Akun karyawan ini akan dihapus permanen.<br />Data transaksi yang sudah dibuat tetap tersimpan.
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <button onClick={onCancel} disabled={loading} style={{ padding: "13px", borderRadius: 13, border: "1.5px solid #ECEEF0", background: "#F5F7F8", color: "#555", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Batal</button>
                    <button onClick={() => { setLoading(true); onConfirm(setLoading); }} disabled={loading} style={{ padding: "13px", borderRadius: 13, border: "none", background: "#FF4757", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{loading ? "Menghapus..." : "Hapus"}</button>
                </div>
            </div>
        </div>
    );
}

// ── MAIN ───────────────────────────────────────────────────────────────────────
export default function ManajemenKaryawan({ onBack }) {
    const [screen, setScreen] = useState("list"); // list | detail | form | delete
    const [employees, setEmployees] = useState([]);
    const [selected, setSelected] = useState(null);
    const [search, setSearch] = useState("");
    const [filterRole, setFilterRole] = useState("Semua");
    const [toast, setToast] = useState(null);
    const [loadingInitial, setLoadingInitial] = useState(true);

    const showToast = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 2500); };

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const res = await apiFetch("/employees");
            const data = await res.json();
            setEmployees(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error(e);
            showToast("Gagal memuat data karyawan", "error");
        } finally {
            setLoadingInitial(false);
        }
    };

    const filtered = employees.filter(e => {
        const rOK = filterRole === "Semua" || e.role === filterRole.toLowerCase();
        const sOK = e.name.toLowerCase().includes(search.toLowerCase()) || e.email.toLowerCase().includes(search.toLowerCase());
        return rOK && sOK;
    });

    const totalAdmin = employees.filter(e => e.role === "admin").length;
    const totalKasir = employees.filter(e => e.role === "kasir").length;

    const handleSave = async (form, setLoading) => {
        try {
            const isEdit = !!selected;
            const endpoint = isEdit ? `/employees/${selected.id_user}` : "/employees";
            const method = isEdit ? "PUT" : "POST";

            const res = await apiFetch(endpoint, {
                method,
                body: JSON.stringify(form)
            });
            const data = await res.json();

            if (data.status === "success") {
                if (isEdit) {
                    setEmployees(prev => prev.map(e => e.id_user === data.data.id_user ? data.data : e));
                    showToast("Data karyawan berhasil diperbarui");
                } else {
                    setEmployees(prev => [data.data, ...prev]);
                    showToast("Karyawan berhasil ditambahkan");
                }
                setScreen("list");
                setSelected(null);
            } else {
                showToast(data.message || "Gagal menyimpan", "error");
            }
        } catch (e) {
            console.error(e);
            showToast("Terjadi kesalahan jaringan", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (setLoading) => {
        try {
            const res = await apiFetch(`/employees/${selected.id_user}`, { method: "DELETE" });
            const data = await res.json();
            if (data.status === "success") {
                setEmployees(prev => prev.filter(e => e.id_user !== selected.id_user));
                showToast("Karyawan berhasil dihapus", "error"); // using error toast for red UI
                setScreen("list");
                setSelected(null);
            } else {
                showToast(data.message || "Gagal menghapus", "error");
            }
        } catch (e) {
            console.error(e);
            showToast("Terjadi kesalahan jaringan", "error");
        } finally {
            setLoading(false);
        }
    };

    if (screen === "form") return (
        <div style={pageStyle}>
            <style>{globalCSS}</style>
            <FormKaryawan employee={selected} onBack={() => { setScreen(selected ? "detail" : "list"); }} onSave={handleSave} />
        </div>
    );
    if (screen === "detail" && selected) return (
        <div style={pageStyle}>
            <style>{globalCSS}</style>
            <DetailKaryawan employee={selected} onBack={() => { setScreen("list"); setSelected(null); }}
                onEdit={(e) => { setSelected(e); setScreen("form"); }}
                onDelete={(e) => { setSelected(e); setScreen("delete"); }} />
        </div>
    );
    if (screen === "delete" && selected) return (
        <div style={pageStyle}>
            <style>{globalCSS}</style>
            <ConfirmDelete employee={selected} onConfirm={handleDelete} onCancel={() => setScreen("detail")} />
        </div>
    );

    return (
        <div style={{ ...pageStyle, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
            <style>{globalCSS}</style>
            {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

            {screen === "list" && (
                <div style={{ padding: 16, paddingBottom: 110, flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                        <h2 className="page-title" style={{ margin: 0 }}>Manajemen <span style={{ color: TEAL }}>Karyawan</span></h2>
                    </div>

                    {/* Stats & Add */}
                    <div style={{ background: `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})`, borderRadius: 20, padding: 20, marginBottom: 16, position: "relative", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ position: "absolute", top: -30, right: -20, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.07)", pointerEvents: "none" }} />
                        <div>
                            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", marginBottom: 4 }}>Total Karyawan</div>
                            <div style={{ fontSize: 32, fontWeight: 800, color: "#fff", letterSpacing: "-1px" }}>{employees.length}</div>
                        </div>
                        <button onClick={() => setScreen("form")} style={{ background: "#fff", color: TEAL, border: "none", padding: "12px 18px", borderRadius: 14, fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", zIndex: 1 }}>
                            <span style={{ fontSize: 18 }}>+</span> Tambah
                        </button>
                    </div>

                    {/* Sebaris Filter & Search */}
                    <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                        <div style={{ position: "relative", flex: 1 }}>
                            <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#aaa", fontSize: 16 }}>🔍</span>
                            <input
                                className="form-input"
                                style={{ width: "100%", paddingLeft: 42, marginBottom: 0, height: 46 }}
                                placeholder="Cari nama atau email..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                        <div style={{ position: "relative", width: 120 }}>
                            <select
                                className="form-input"
                                style={{ width: "100%", marginBottom: 0, height: 46, appearance: "none", paddingRight: 30, color: filterRole === "Semua" ? "#555" : ROLES[filterRole.toLowerCase()]?.color || "#555", fontWeight: filterRole !== "Semua" ? 700 : 500 }}
                                value={filterRole}
                                onChange={e => setFilterRole(e.target.value)}
                            >
                                <option value="Semua">Semua Role</option>
                                <option value="Admin">Admin</option>
                                <option value="Kasir">Kasir</option>
                            </select>
                            <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "#aaa", pointerEvents: "none", fontSize: 12 }}>▼</span>
                        </div>
                    </div>

                    {/* Employee List */}
                    {loadingInitial ? (
                        <div style={{ display: "flex", justifyContent: "center", padding: 40 }}><span className="spin" style={{ width: 30, height: 30, borderTopColor: TEAL }} /></div>
                    ) : filtered.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "40px 20px", background: "#f8f9fa", borderRadius: 16, border: "2px dashed #ECEEF0" }}>
                            <div style={{ fontSize: 40, marginBottom: 12 }}>👥</div>
                            <div style={{ fontSize: 16, fontWeight: 700, color: "#333", marginBottom: 8 }}>Belum ada karyawan</div>
                            <div style={{ fontSize: 13, color: "#888", marginBottom: 20 }}>Tambahkan karyawan untuk membantu mengelola toko Anda.</div>
                            <button onClick={() => setScreen("form")} style={{ padding: "10px 20px", borderRadius: 10, background: TEAL, color: "#fff", border: "none", fontWeight: 600, cursor: "pointer" }}>Daftarkan Karyawan</button>
                        </div>
                    ) : (
                        <div style={{ display: "grid", gap: 12 }}>
                            {filtered.map(emp => {
                                const r = ROLES[emp.role] || ROLES.kasir;
                                return (
                                    <div key={emp.id_user || emp.id} onClick={() => { setSelected(emp); setScreen("detail"); }}
                                        style={{ background: "#fff", borderRadius: 16, padding: 16, border: "1.5px solid #ECEEF0", display: "flex", alignItems: "center", gap: 14, cursor: "pointer", transition: "all 0.2s", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
                                        <Avatar name={emp.name} colorIdx={emp.id_user || emp.id} />
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: 15, fontWeight: 700, color: "#111", marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{emp.name}</div>
                                            <div style={{ fontSize: 12, color: "#888" }}>{emp.email}</div>
                                        </div>
                                        <div style={{ padding: "5px 10px", borderRadius: 20, background: r.bg, border: `1.5px solid ${r.border}`, display: "flex", alignItems: "center", gap: 4 }}>
                                            <span style={{ fontSize: 12 }}>{r.icon}</span>
                                            <span style={{ fontSize: 11, fontWeight: 800, color: r.color }}>{r.label}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {screen === "detail" && selected && (
                <DetailKaryawan
                    employee={selected}
                    onBack={() => { setScreen("list"); setSelected(null); }}
                    onEdit={emp => { setSelected(emp); setScreen("form"); }}
                    onDelete={emp => { setSelected(emp); setScreen("delete"); }}
                />
            )}

            {screen === "form" && (
                <FormKaryawan
                    employee={selected}
                    onBack={() => { setScreen(selected ? "detail" : "list"); if (!selected) setSelected(null); }}
                    onSave={handleSave}
                />
            )}

            {screen === "delete" && selected && (
                <ConfirmDelete
                    employee={selected}
                    onConfirm={handleDelete}
                    onCancel={() => setScreen("detail")}
                />
            )}
        </div>
    );
}

const pageStyle = { fontFamily: "'Plus Jakarta Sans', sans-serif", background: "var(--bg-app, #F5F7F8)", minHeight: "100%", width: "100%", margin: "0 auto", display: "flex", flexDirection: "column" };

const globalCSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
* { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
@keyframes slideDown { from { opacity: 0; transform: translateX(-50%) translateY(-10px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
.topbar { background: var(--bg-surface, #fff); padding: 16px 20px 0; border-bottom: 1px solid var(--border-light, #ECEEF0); position: sticky; top: 0; z-index: 20; width: 100%; color: var(--text-primary, #111) }
.topbar-row { display: flex; align-items: center; gap: 12px; }
.topbar-title { font-size: 18px; font-weight: 700; color: var(--text-primary, #111); letter-spacing: -0.4px; }
.back-btn { width: 40px; height: 40px; border-radius: 12px; background: var(--bg-app-alt, #F5F7F8); border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--text-primary, #333); flex-shrink: 0; }
.back-btn:active { background: var(--border-light, #ECEEF0); }
.content { flex: 1; padding: 16px; padding-bottom: 100px; overflow-y: auto; width: 100%; color: var(--text-primary, #111); }
.search-wrap { position: relative; width: 100%; }
.search-input { width: 100%; padding: 11px 16px 11px 42px; border: 1.5px solid var(--border-light, #E5E9EC); border-radius: 12px; font-size: 14px; font-family: 'Plus Jakarta Sans', sans-serif; background: var(--bg-surface, #fff); outline: none; color: var(--text-primary, #111); transition: border-color 0.2s; }
.search-input:focus { border-color: ${TEAL}; }
.search-ico { position: absolute; left: 13px; top: 50%; transform: translateY(-50%); display: flex; align-items: center; pointer-events: none; }
.input-label { font-size: 11px; font-weight: 700; color: var(--text-tertiary, #888); text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 7px; display: block; }
.form-input { width: 100%; padding: 13px 14px; border: 1.5px solid var(--border-light, #E5E9EC); border-radius: 12px; font-size: 14px; font-family: 'Plus Jakarta Sans', sans-serif; outline: none; color: var(--text-primary, #111); background: var(--bg-surface-alt, #FAFBFC); margin-bottom: 14px; transition: border-color 0.2s, box-shadow 0.2s; display: block; }
.form-input:focus { border-color: ${TEAL}; background: var(--bg-surface, #fff); box-shadow: 0 0 0 3px ${TEAL}18; }
.dark-theme .form-input { color: var(--text-primary); }
.input-error { border-color: #FF4757 !important; background: #FFF5F5 !important; }
.input-success { border-color: #27AE60 !important; background: #F0FFF4 !important; }
.error-msg { font-size: 11px; color: #FF4757; font-weight: 600; padding-left: 2px; display: block; }
.bottom-bar { position: sticky; bottom: 0; left: 0; right: 0; width: 100%; background: #fff; border-top: 1px solid #ECEEF0; padding: 12px 20px 24px; display: flex; align-items: center; gap: 10px; z-index: 20; }
.spin { width: 16px; height: 16px; border: 2.5px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; display: inline-block; flex-shrink: 0; }
.fab { position: fixed; bottom: 24px; right: 24px; width: 54px; height: 54px; border-radius: 18px; background: ${TEAL}; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 26px; color: #fff; box-shadow: 0 6px 20px ${TEAL}66; z-index: 35; }
`;

