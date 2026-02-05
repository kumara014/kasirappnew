import React, { useState } from 'react';
import { User, Lock, LogIn } from 'lucide-react';
import API_BASE_URL, { apiFetch } from '../config';
import { useNotification } from '../context/NotificationContext';
import './Login.css';

const Login = ({ onLoginSuccess }) => {
    const { notify } = useNotification();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            console.log('Attempting login...');
            const response = await apiFetch('/login', {
                method: 'POST',
                body: JSON.stringify({ username, password })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Server responded with error:', response.status, errorText);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.status === 'success') {
                notify(`Selamat datang, ${data.user.name}!`, 'success');
                onLoginSuccess(data.user);
            } else {
                notify(data.message || 'Login Gagal', 'error');
            }
        } catch (err) {
            notify('Koneksi ke server gagal.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-header">
                    <img src="/gjb.png" alt="Logo" style={{ width: '80px', marginBottom: '1rem' }} />
                    <h2>Smart Kasir</h2>
                    <p>Silahkan masuk ke akun anda</p>
                </div>

                <form className="login-form" onSubmit={handleSubmit}>

                    <div className="login-input-group">
                        <label><User size={16} /> Username</label>
                        <input
                            type="text"
                            placeholder="Masukkan username"
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
                </form>

                <div className="login-footer">
                    <p>© {new Date().getFullYear()} Smart Kasir POS</p>
                </div>
            </div>
        </div>
    );
};

export default Login;
