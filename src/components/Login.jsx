import React, { useState } from 'react';
import { User, Lock, LogIn } from 'lucide-react';
import { apiFetch } from '../config';
import { useNotification } from '../context/NotificationContext';
import './Login.css';

const Login = ({ onLoginSuccess }) => {
    const { notify } = useNotification();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isRegister, setIsRegister] = useState(false);

    // Register Form State
    const [regData, setRegData] = useState({
        nama_usaha: '',
        tipe_bisnis: '',
        no_hp: '',
        password: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            console.log('Attempting login...');
            const response = await apiFetch('/login', {
                method: 'POST',
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok && data.status === 'success') {
                notify(`Selamat datang, ${data.user.nama_usaha || data.user.name}!`, 'success');
                onLoginSuccess(data.user);
            } else {
                notify(data.message || 'Username atau password salah', 'error');
            }
        } catch (err) {
            console.error('Login error:', err);
            notify('Tidak dapat terhubung ke server.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await apiFetch('/register', {
                method: 'POST',
                body: JSON.stringify({
                    ...regData,
                    name: regData.nama_usaha // Use business name as user name
                })
            });

            const data = await response.json();

            if (response.ok && data.status === 'success') {
                notify('Registrasi berhasil! Silahkan masuk.', 'success');
                setIsRegister(false);
                setUsername(regData.no_hp);
            } else {
                // Handle Laravel validation errors specifically
                if (data.errors) {
                    const firstError = Object.values(data.errors)[0][0];
                    notify(firstError, 'error');
                } else {
                    notify(data.message || 'Registrasi Gagal', 'error');
                }
            }
        } catch (err) {
            notify('Koneksi ke server gagal.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className={`login-card ${isRegister ? 'register-mode' : ''}`}>
                <div className="login-header">
                    <img src="/logo pointly.png" alt="Logo" style={{ width: '80px', marginBottom: '1rem' }} />
                    <p>{isRegister ? 'Daftarkan usaha anda sekarang' : 'Silahkan masuk ke akun anda'}</p>
                </div>

                {isRegister ? (
                    <form className="login-form" onSubmit={handleRegister}>
                        <div className="login-input-group">
                            <label>Nama Usaha</label>
                            <input
                                type="text"
                                placeholder="Contoh: Toko Berkah"
                                value={regData.nama_usaha}
                                onChange={(e) => setRegData({ ...regData, nama_usaha: e.target.value })}
                                required
                            />
                        </div>

                        <div className="login-input-group">
                            <label>Tipe Bisnis</label>
                            <select
                                value={regData.tipe_bisnis}
                                onChange={(e) => setRegData({ ...regData, tipe_bisnis: e.target.value })}
                                required
                            >
                                <option value="">Pilih Tipe Bisnis</option>
                                <option value="Food & Beverage">Food & Beverage</option>
                                <option value="Retail">Retail</option>
                                <option value="Jasa">Jasa</option>
                                <option value="Lainnya">Lainnya</option>
                            </select>
                        </div>

                        <div className="login-input-group">
                            <label>No HP</label>
                            <input
                                type="tel"
                                placeholder="08123456789"
                                value={regData.no_hp}
                                onChange={(e) => setRegData({ ...regData, no_hp: e.target.value })}
                                required
                            />
                        </div>

                        <div className="login-input-group">
                            <label>Password</label>
                            <input
                                type="password"
                                placeholder="Buat password"
                                value={regData.password}
                                onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                                required
                            />
                        </div>

                        <button type="submit" className="login-submit-btn" disabled={loading}>
                            {loading ? 'Mendaftarkan...' : 'Daftar Sekarang'}
                        </button>

                        <div className="auth-toggle">
                            Sudah punya akun? <button type="button" onClick={() => setIsRegister(false)}>Masuk</button>
                        </div>
                    </form>
                ) : (
                    <form className="login-form" onSubmit={handleSubmit}>
                        <div className="login-input-group">
                            <label><User size={16} /> Nama Usaha / No HP</label>
                            <input
                                type="text"
                                placeholder="Masukkan nama usaha atau no hp"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>

                        <div className="login-input-group">
                            <label><Lock size={16} /> Password</label>
                            <input
                                type="password"
                                placeholder="Masukkan password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button type="submit" className="login-submit-btn" disabled={loading}>
                            {loading ? 'Sedang Masuk...' : <><LogIn size={18} /> Masuk Sekarang</>}
                        </button>

                        <div className="auth-toggle">
                            Belum punya akun? <button type="button" onClick={() => setIsRegister(true)}>Daftar Usaha</button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Login;
