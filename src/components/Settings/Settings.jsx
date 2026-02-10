import React, { useState } from 'react';
import { User, Monitor, Sun, Moon } from 'lucide-react';
import './Settings.css';

const Settings = ({ user, theme, onToggleTheme }) => {
    const [activeTab, setActiveTab] = useState('profile');

    return (
        <div className="settings-container">
            <header className="settings-header">
                <h1>Pengaturan</h1>
                <p>Kelola akun dan preferensi aplikasi</p>
            </header>

            <div className="settings-layout">
                <aside className="settings-sidebar">
                    <button
                        className={`settings-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                        onClick={() => setActiveTab('profile')}
                    >
                        <User size={18} /> Profil Akun
                    </button>
                    <button
                        className={`settings-nav-item ${activeTab === 'system' ? 'active' : ''}`}
                        onClick={() => setActiveTab('system')}
                    >
                        <Monitor size={18} /> Sistem & Tampilan
                    </button>
                </aside>

                <main className="settings-content">
                    {activeTab === 'profile' && (
                        <section className="settings-section card">
                            <div className="section-header">
                                <h2>Profil Bisnis</h2>
                                <p>Informasi dasar usaha anda</p>
                            </div>
                            <div className="profile-grid">
                                <div className="info-group">
                                    <label>Nama Usaha</label>
                                    <input type="text" value={user.nama_usaha} disabled />
                                </div>
                                <div className="info-group">
                                    <label>Tipe Bisnis</label>
                                    <input type="text" value={user.tipe_bisnis} disabled />
                                </div>
                                <div className="info-group">
                                    <label>Nama Pemilik</label>
                                    <input type="text" value={user.name} disabled />
                                </div>
                                <div className="info-group">
                                    <label>No HP / Username</label>
                                    <input type="text" value={user.no_hp || user.username} disabled />
                                </div>
                            </div>
                        </section>
                    )}

                    {activeTab === 'system' && (
                        <section className="settings-section card">
                            <div className="section-header">
                                <h2>Tampilan & Preferensi</h2>
                                <p>Personalisasi pengalaman aplikasi anda</p>
                            </div>
                            <div className="system-options">
                                <div className="option-item">
                                    <div className="option-info">
                                        <h4>Mode Gelap</h4>
                                        <p>Gunakan tampilan gelap untuk mengurangi kelelahan mata</p>
                                    </div>
                                    <div className={`theme-toggle ${theme}`} onClick={onToggleTheme}>
                                        <div className="toggle-thumb">
                                            {theme === 'light' ? <Sun size={14} /> : <Moon size={14} />}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}
                </main>
            </div>
        </div>
    );
};

export default Settings;
