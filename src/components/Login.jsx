import React, { useState } from 'react';
import { Mail, Lock, LogIn, Store, ShoppingBag, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { apiFetch } from '../config';
import { useNotification } from '../context/NotificationContext';
import { haptic } from '../utils/haptics';

const TEAL = "#4A9BAD";
const TEAL_LIGHT = "#EAF5F7";
const TEAL_DARK = "#357585";

const BUSINESS_TYPES = [
    { id: "minimarket", label: "Minimarket", icon: "🏪" },
    { id: "warung", label: "Warung", icon: "🛖" },
    { id: "cafe", label: "Café / Resto", icon: "☕" },
    { id: "fashion", label: "Fashion", icon: "👗" },
    { id: "elektronik", label: "Elektronik", icon: "📱" },
    { id: "lainnya", label: "Lainnya", icon: "📦" },
];

// ── SHARED COMPONENTS ─────────────────────────────────────────────────────────
function TopWave() {
    return (
        <div className="auth-wave-container">
            <div className="auth-wave-top">
                <div className="circle circle-1" />
                <div className="circle circle-2" />
                <div className="circle circle-3" />
                <div className="auth-branding">
                    <div className="auth-logo-box">
                        <img src="/logo pointly.png" alt="Pointly" style={{ width: '42px' }} />
                    </div>
                    <div className="auth-app-name">Pointly</div>
                    <div className="auth-app-sub">Point of Sale System</div>
                </div>
            </div>
            <div className="wave-svg-wrap">
                <svg viewBox="0 0 430 40" preserveAspectRatio="none">
                    <path d="M0,0 C100,40 330,0 430,30 L430,0 Z" fill={TEAL} />
                </svg>
            </div>
        </div>
    );
}

// ── SUCCESS SCREEN ─────────────────────────────────────────────────────────────
function SuccessScreen({ type, data }) {
    return (
        <div className="auth-screen">
            <div className="success-content">
                <div className="success-check-box">
                    <CheckCircle2 size={42} color="#fff" strokeWidth={3} />
                </div>
                {type === "register" ? (
                    <>
                        <div className="success-title">Akun Berhasil Dibuat!</div>
                        <div className="success-sub">
                            Selamat datang di Pointly,<br />
                            <strong style={{ color: "#333" }}>{data.nama_usaha}</strong> 🎉<br />
                            <span style={{ fontSize: 12 }}>Tipe: {data.tipe_bisnis}</span>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="success-title">Login Berhasil!</div>
                        <div className="success-sub">
                            Selamat datang kembali,<br /><strong style={{ color: "#333" }}>{data.email}</strong>
                        </div>
                    </>
                )}
                <div className="success-loader">
                    {[0, 0.2, 0.4].map((delay, i) => (
                        <div key={i} className="loader-dot" style={{ animationDelay: `${delay}s` }} />
                    ))}
                </div>
                <div className="loader-text">Memuat dashboard...</div>
            </div>
        </div>
    );
}

// ── FORGOT PASSWORD ────────────────────────────────────────────────────────────
function ForgotScreen({ onBack }) {
    const [email, setEmail] = useState("");
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSend = () => {
        if (!email) return;
        setLoading(true);
        setTimeout(() => { setLoading(false); setSent(true); }, 1500);
    };

    if (sent) {
        return (
            <div className="auth-screen">
                <div className="success-content">
                    <div className="sent-icon-box">📧</div>
                    <div className="success-title">Email Terkirim!</div>
                    <div className="success-sub">
                        Link reset password dikirim ke<br /><strong style={{ color: TEAL }}>{email}</strong><br />
                        <span style={{ fontSize: 12 }}>Cek inbox atau folder spam kamu.</span>
                    </div>
                    <button onClick={onBack} className="btn-primary">← Kembali ke Login</button>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-screen">
            <div className="auth-inner-content">
                <button onClick={onBack} className="back-btn-auth">
                    <ArrowLeft size={20} />
                </button>
                <div className="auth-form-title">Lupa Password?</div>
                <div className="auth-form-sub">
                    Masukkan email kamu untuk menerima link reset password.
                </div>
                <div className="auth-input-group">
                    <label className="auth-label">Email</label>
                    <div className="auth-input-rel">
                        <Mail className="auth-input-ico" size={18} />
                        <input className="auth-input with-ico" placeholder="email@contoh.com" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                </div>
                <button onClick={handleSend} disabled={!email || loading} className="btn-primary" style={{ marginTop: 8 }}>
                    {loading ? 'Mengirim...' : 'Kirim Link Reset'}
                </button>
            </div>
        </div>
    );
}

// ── MAIN APP ───────────────────────────────────────────────────────────────────
const Login = ({ onLoginSuccess }) => {
    const { notify } = useNotification();
    const [screen, setScreen] = useState("login"); // login | register | forgot | success_login | success_register
    const [successData, setSuccessData] = useState(null);

    // Login state
    const [loginForm, setLoginForm] = useState({ email: "", password: "" });
    const [loginLoading, setLoginLoading] = useState(false);
    const [showLoginPass, setShowLoginPass] = useState(false);

    // Register state
    const [regStep, setRegStep] = useState(1);
    const [regForm, setRegForm] = useState({ nama_usaha: "", tipe_bisnis: "", email: "", password: "", confirmPass: "" });
    const [regLoading, setRegLoading] = useState(false);
    const [showRegPass, setShowRegPass] = useState(false);
    const [showConfirmPass, setShowConfirmPass] = useState(false);

    // ── HANDLERS ──────────────────────────────────────────────────────────────
    const handleLogin = async (e) => {
        if (e) e.preventDefault();
        if (!loginForm.email || !loginForm.password) {
            notify("Harap isi email dan password", "error");
            return;
        }

        setLoginLoading(true);
        haptic.tap();

        try {
            const response = await apiFetch('/login', {
                method: 'POST',
                body: JSON.stringify({
                    username: loginForm.email, // Backend checks username/email/phone
                    password: loginForm.password
                })
            });

            const data = await response.json();

            if (response.ok && data.status === 'success') {
                haptic.success();
                setSuccessData({ email: loginForm.email });
                setScreen("success_login");
                setTimeout(() => {
                    onLoginSuccess(data.user);
                }, 1500);
            } else {
                haptic.error();
                notify(data.message || 'Email atau password salah', 'error');
            }
        } catch (err) {
            haptic.error();
            notify('Koneksi server gagal', 'error');
        } finally {
            setLoginLoading(false);
        }
    };

    const handleRegister = async () => {
        if (regForm.password !== regForm.confirmPass) {
            notify("Password tidak cocok", "error");
            return;
        }

        setRegLoading(true);
        haptic.tap();

        try {
            const response = await apiFetch('/register', {
                method: 'POST',
                body: JSON.stringify({
                    name: regForm.nama_usaha,
                    nama_usaha: regForm.nama_usaha,
                    tipe_bisnis: regForm.tipe_bisnis,
                    email: regForm.email,
                    password: regForm.password
                })
            });

            const data = await response.json();

            if (response.ok && data.status === 'success') {
                haptic.success();
                setSuccessData({ nama_usaha: regForm.nama_usaha, tipe_bisnis: regForm.tipe_bisnis });
                setScreen("success_register");
                setTimeout(() => {
                    onLoginSuccess(data.user);
                }, 2000);
            } else {
                haptic.error();
                if (data.errors) {
                    const firstError = Object.values(data.errors)[0][0];
                    notify(firstError, 'error');
                } else {
                    notify(data.message || 'Registrasi Gagal', 'error');
                }
            }
        } catch (err) {
            haptic.error();
            notify('Koneksi server gagal', 'error');
        } finally {
            setRegLoading(false);
        }
    };

    if (screen === "success_login") return <SuccessScreen type="login" data={successData} />;
    if (screen === "success_register") return <SuccessScreen type="register" data={successData} />;
    if (screen === "forgot") return <ForgotScreen onBack={() => setScreen("login")} />;

    return (
        <div className="auth-screen">
            <style>{globalCSS}</style>
            <TopWave />

            <div className="auth-main-wrap">
                {/* Tab switcher */}
                <div className="auth-tab-row">
                    <button onClick={() => setScreen("login")} className={`auth-tab-btn ${screen === 'login' ? 'active' : ''}`}>
                        Masuk
                    </button>
                    <button onClick={() => { setScreen("register"); setRegStep(1); }} className={`auth-tab-btn ${screen === 'register' ? 'active' : ''}`}>
                        Daftar
                    </button>
                </div>

                {screen === "login" ? (
                    <div className="auth-card animate-in">
                        <div className="auth-card-header">
                            <div className="card-title">Selamat Datang 👋</div>
                            <div className="card-sub">Masuk ke akun Pointly kamu</div>
                        </div>

                        <div className="auth-input-group">
                            <label className="auth-label">Email</label>
                            <div className="auth-input-rel">
                                <Mail className="auth-input-ico" size={18} />
                                <input className="auth-input with-ico" placeholder="email@contoh.com" type="email" value={loginForm.email}
                                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} />
                            </div>
                        </div>

                        <div className="auth-input-group">
                            <label className="auth-label">Password</label>
                            <div className="auth-input-rel">
                                <Lock className="auth-input-ico" size={18} />
                                <input className="auth-input with-ico" style={{ paddingRight: 48 }} placeholder="Masukkan password" type={showLoginPass ? "text" : "password"}
                                    value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                                    onKeyDown={(e) => e.key === "Enter" && handleLogin()} />
                                <button onClick={() => setShowLoginPass(!showLoginPass)} className="pass-toggle-btn">
                                    {showLoginPass ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="forgot-link-box">
                            <span onClick={() => setScreen("forgot")} className="auth-link">Lupa password?</span>
                        </div>

                        <button onClick={handleLogin} disabled={loginLoading} className="btn-primary">
                            {loginLoading ? 'Masuk...' : 'Masuk Sekarang'}
                        </button>
                    </div>
                ) : (
                    /* REGISTER */
                    <>
                        <div className="reg-steps-indicator">
                            {[1, 2].map((s, i) => (
                                <div key={s} className={`step-item ${regStep >= s ? 'active' : ''}`}>
                                    <div className="step-circle">
                                        {regStep > s ? <CheckCircle2 size={16} /> : <span>{s}</span>}
                                    </div>
                                    <span className="step-label">{s === 1 ? "Info Usaha" : "Akun"}</span>
                                    {i < 1 && <div className={`step-line ${regStep > 1 ? 'active' : ''}`} />}
                                </div>
                            ))}
                        </div>

                        {regStep === 1 ? (
                            <div className="auth-card animate-in">
                                <div className="auth-card-header">
                                    <div className="card-title">Info Usaha 🏪</div>
                                    <div className="card-sub">Ceritakan sedikit tentang bisnis kamu</div>
                                </div>

                                <div className="auth-input-group">
                                    <label className="auth-label">Nama Usaha</label>
                                    <div className="auth-input-rel">
                                        <Store className="auth-input-ico" size={18} />
                                        <input className="auth-input with-ico" placeholder="Contoh: Warung Barokah" value={regForm.nama_usaha}
                                            onChange={(e) => setRegForm({ ...regForm, nama_usaha: e.target.value })} />
                                    </div>
                                </div>

                                <div className="auth-input-group">
                                    <label className="auth-label">Tipe Bisnis</label>
                                    <div className="biz-type-grid">
                                        {BUSINESS_TYPES.map((b) => {
                                            const isActive = regForm.tipe_bisnis === b.id;
                                            return (
                                                <button key={b.id} onClick={() => setRegForm({ ...regForm, tipe_bisnis: b.id })}
                                                    className={`biz-type-btn ${isActive ? 'active' : ''}`}>
                                                    <span className="biz-ico">{b.icon}</span>
                                                    <span className="biz-lbl">{b.label}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <button onClick={() => setRegStep(2)} disabled={!regForm.nama_usaha || !regForm.tipe_bisnis} className="btn-primary" style={{ marginTop: 12 }}>
                                    Lanjut <ArrowRight size={18} />
                                </button>
                            </div>
                        ) : (
                            <div className="auth-card animate-in">
                                <div className="reg-review-box">
                                    <div className="review-ico">{BUSINESS_TYPES.find(b => b.id === regForm.tipe_bisnis)?.icon}</div>
                                    <div className="review-info">
                                        <div className="review-name">{regForm.nama_usaha}</div>
                                        <div className="review-type">{BUSINESS_TYPES.find(b => b.id === regForm.tipe_bisnis)?.label}</div>
                                    </div>
                                    <button onClick={() => setRegStep(1)} className="btn-edit-auth">Ubah</button>
                                </div>

                                <div className="auth-card-header" style={{ marginTop: 20 }}>
                                    <div className="card-title">Buat Akun 🔐</div>
                                    <div className="card-sub">Email dan password untuk login</div>
                                </div>

                                <div className="auth-input-group">
                                    <label className="auth-label">Email</label>
                                    <div className="auth-input-rel">
                                        <Mail className="auth-input-ico" size={18} />
                                        <input className="auth-input with-ico" placeholder="email@contoh.com" type="email" value={regForm.email}
                                            onChange={(e) => setRegForm({ ...regForm, email: e.target.value })} />
                                    </div>
                                </div>

                                <div className="auth-input-group">
                                    <label className="auth-label">Password</label>
                                    <div className="auth-input-rel">
                                        <Lock className="auth-input-ico" size={18} />
                                        <input className="auth-input with-ico" style={{ paddingRight: 48 }} placeholder="Min. 8 karakter" type={showRegPass ? "text" : "password"}
                                            value={regForm.password} onChange={(e) => setRegForm({ ...regForm, password: e.target.value })} />
                                        <button onClick={() => setShowRegPass(!showRegPass)} className="pass-toggle-btn">
                                            {showRegPass ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="auth-input-group">
                                    <label className="auth-label">Konfirmasi Password</label>
                                    <div className="auth-input-rel">
                                        <Lock className="auth-input-ico" size={18} />
                                        <input className="auth-input with-ico" style={{ paddingRight: 48 }} placeholder="Ulangi password" type={showConfirmPass ? "text" : "password"}
                                            value={regForm.confirmPass} onChange={(e) => setRegForm({ ...regForm, confirmPass: e.target.value })} />
                                        <button onClick={() => setShowConfirmPass(!showConfirmPass)} className="pass-toggle-btn">
                                            {showConfirmPass ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="reg-actions">
                                    <button onClick={() => setRegStep(1)} className="btn-back-square">←</button>
                                    <button onClick={handleRegister} disabled={regLoading || !regForm.email || regForm.password.length < 6} className="btn-primary">
                                        {regLoading ? 'Mendaftar...' : 'Buat Akun'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}

                <div className="auth-footer-text">
                    {screen === 'login' ? (
                        <>Belum punya akun? <span onClick={() => { setScreen("register"); setRegStep(1); }} className="auth-link-bold">Daftar sekarang</span></>
                    ) : (
                        <>Sudah punya akun? <span onClick={() => setScreen("login")} className="auth-link-bold">Masuk di sini</span></>
                    )}
                </div>

                <div className="auth-copyright">Pointly POS v1.0.0 • © 2026</div>
            </div>
        </div>
    );
};

const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
  
  .auth-screen {
    font-family: 'Plus Jakarta Sans', sans-serif;
    background: #F5F7F8;
    min-height: 100vh;
    width: 100%;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    color: #111;
  }

  /* Wave Header */
  .auth-wave-container { position: relative; margin-bottom: 20px; }
  .auth-wave-top { background: ${TEAL}; padding: 60px 20px; position: relative; overflow: hidden; text-align: center; }
  .circle { position: absolute; border-radius: 50%; background: rgba(255,255,255,0.06); }
  .circle-1 { top: -50px; right: -50px; width: 200px; height: 200px; }
  .circle-2 { bottom: -60px; left: -40px; width: 180px; height: 180px; }
  .circle-3 { top: 20px; left: -20px; width: 120px; height: 120px; }
  
  .auth-branding { position: relative; z-index: 2; }
  .auth-logo-box { width: 72px; height: 72px; border-radius: 24px; background: rgba(255,255,255,0.22); display: flex; alignItems: center; justifyContent: center; margin: 0 auto 16px; border: 1.5px solid rgba(255,255,255,0.3); }
  .auth-app-name { fontSize: 26px; fontWeight: 800; color: #fff; letterSpacing: -0.6px; }
  .auth-app-sub { fontSize: 13px; color: rgba(255,255,255,0.7); marginTop: 4px; }
  
  .wave-svg-wrap { margin-top: -2px; }
  .wave-svg-wrap svg { display: block; width: 100%; height: 40px; }

  /* Content */
  .auth-main-wrap { flex: 1; padding: 0 24px 40px; }
  
  .auth-tab-row { display: flex; background: #ECEEF0; border-radius: 16px; padding: 4px; margin-bottom: 24px; }
  .auth-tab-btn { flex: 1; padding: 12px; border-radius: 12px; border: none; background: transparent; cursor: pointer; font-size: 14px; font-weight: 600; color: #aaa; transition: all 0.2s; font-family: inherit; }
  .auth-tab-btn.active { background: #fff; color: #111; font-weight: 700; box-shadow: 0 4px 12px rgba(0,0,0,0.06); }

  .auth-card { background: #fff; border-radius: 24px; padding: 24px; border: 1.5px solid #ECEEF0; box-shadow: 0 8px 30px rgba(0,0,0,0.04); margin-bottom: 20px; }
  .animate-in { animation: fadeIn 0.4s ease-out; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

  .auth-card-header { margin-bottom: 24px; }
  .card-title { font-size: 20px; font-weight: 800; color: #111; letter-spacing: -0.5px; margin-bottom: 6px; }
  .card-sub { font-size: 14px; color: #aaa; font-weight: 500; }

  .auth-input-group { margin-bottom: 20px; }
  .auth-label { display: block; font-size: 11px; font-weight: 800; color: #888; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 8px; }
  .auth-input-rel { position: relative; }
  .auth-input-ico { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: #bbb; pointer-events: none; }
  .auth-input { width: 100%; padding: 14px 16px; border: 1.5px solid #ECEEF0; border-radius: 14px; font-size: 15px; outline: none; background: #FAFBFC; transition: all 0.2s; font-family: inherit; }
  .auth-input.with-ico { padding-left: 48px; }
  .auth-input:focus { border-color: ${TEAL}; background: #fff; box-shadow: 0 0 0 4px ${TEAL}10; }
  
  .pass-toggle-btn { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: #bbb; padding: 4px; display: flex; }

  .forgot-link-box { text-align: right; margin-top: -10px; margin-bottom: 24px; }
  .auth-link { font-size: 13px; font-weight: 700; color: ${TEAL}; cursor: pointer; }
  .auth-link-bold { color: ${TEAL}; font-weight: 800; cursor: pointer; }

  .btn-primary { width: 100%; padding: 16px; border-radius: 16px; background: ${TEAL}; color: #fff; border: none; cursor: pointer; font-size: 16px; font-weight: 700; transition: all 0.2s; font-family: inherit; box-shadow: 0 8px 20px ${TEAL}33; display: flex; align-items: center; justify-content: center; gap: 8px; }
  .btn-primary:active { transform: scale(0.98); }
  .btn-primary:disabled { background: #C5D8DC; cursor: not-allowed; box-shadow: none; }

  /* Register Steps */
  .reg-steps-indicator { display: flex; margin-bottom: 24px; align-items: center; }
  .step-item { flex: 1; display: flex; flex-direction: column; align-items: center; position: relative; }
  .step-circle { width: 34px; height: 34px; border-radius: 50%; background: #E5E9EC; color: #bbb; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 800; z-index: 2; transition: all 0.3s; }
  .step-item.active .step-circle { background: ${TEAL}; color: #fff; }
  .step-label { font-size: 11px; font-weight: 700; color: #bbb; margin-top: 8px; transition: all 0.3s; }
  .step-item.active .step-label { color: ${TEAL}; }
  .step-line { position: absolute; top: 17px; left: 50%; width: 100%; height: 2px; background: #E5E9EC; z-index: 1; }
  .step-line.active { background: ${TEAL}; }

  .biz-type-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
  .biz-type-btn { padding: 14px 8px; border-radius: 16px; border: 1.5px solid #E5E9EC; background: #FAFBFC; cursor: pointer; transition: all 0.2s; display: flex; flexDirection: column; alignItems: center; gap: 6px; font-family: inherit; }
  .biz-type-btn.active { border-color: ${TEAL}; background: ${TEAL_LIGHT}; }
  .biz-ico { font-size: 26px; }
  .biz-lbl { font-size: 11px; font-weight: 700; color: #666; text-align: center; }
  .biz-type-btn.active .biz-lbl { color: ${TEAL}; }

  .reg-review-box { display: flex; align-items: center; background: ${TEAL_LIGHT}; border-radius: 18px; padding: 14px 18px; gap: 12px; }
  .review-ico { font-size: 20px; width: 42px; height: 42px; background: #fff; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
  .review-info { flex: 1; }
  .review-name { font-size: 14px; font-weight: 800; color: #111; }
  .review-type { font-size: 11px; color: ${TEAL}; font-weight: 700; }
  .btn-edit-auth { fontSize: 11px; color: ${TEAL}; background: #fff; border: 1.5px solid ${TEAL}44; border-radius: 10px; padding: 6px 12px; cursor: pointer; font-weight: 700; }

  .reg-actions { display: flex; gap: 12px; margin-top: 10px; }
  .btn-back-square { width: 56px; height: 56px; border-radius: 16px; border: 1.5px solid #ECEEF0; background: #fff; color: #555; font-size: 18px; cursor: pointer; }

  .auth-footer-text { text-align: center; font-size: 14px; color: #aaa; margin-top: 20px; font-weight: 500; }
  .auth-copyright { text-align: center; margin-top: 32px; fontSize: 11px; color: #ccc; fontWeight: 500; }

  /* Success Screen */
  .success-content { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px; text-align: center; }
  .success-check-box { width: 96px; height: 96px; border-radius: 32px; background: linear-gradient(135deg, ${TEAL}, ${TEAL_DARK}); display: flex; alignItems: center; justifyContent: center; margin-bottom: 28px; box-shadow: 0 14px 36px ${TEAL}55; animation: scaleIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
  .success-title { font-size: 24px; font-weight: 800; color: #111; letter-spacing: -0.6px; margin-bottom: 12px; }
  .success-sub { font-size: 15px; color: #aaa; line-height: 1.7; margin-bottom: 40px; }
  
  .success-loader { display: flex; gap: 8px; margin-bottom: 12px; }
  .loader-dot { width: 9px; height: 9px; border-radius: 50%; background: ${TEAL}; animation: bounce 1.2s ease-in-out infinite; }
  .loader-text { font-size: 12px; color: #bbb; font-weight: 600; }

  .sent-icon-box { font-size: 42px; margin-bottom: 24px; animation: scaleIn 0.5s; }
  .back-btn-auth { width: 42px; height: 42px; border-radius: 12px; background: #fff; border: 1.5px solid #ECEEF0; cursor: pointer; display: flex; alignItems: center; justifyContent: center; color: #333; margin-bottom: 24px; }
  .auth-form-title { font-size: 26px; font-weight: 800; color: #111; margin-bottom: 8px; }
  .auth-form-sub { font-size: 14px; color: #aaa; line-height: 1.6; margin-bottom: 30px; }

  @keyframes scaleIn { from { transform: scale(0.7); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  @keyframes bounce { 0%, 80%, 100% { transform: scale(0.6); opacity: 0.3; } 40% { transform: scale(1); opacity: 1; } }
`;

export default Login;
