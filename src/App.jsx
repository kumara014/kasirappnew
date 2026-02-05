import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Menu from './components/Menu/Menu';
import Dashboard from './components/Dashboard/Dashboard';
import History from './components/History/History';
import Report from './components/Report/Report';
import Kasir from './components/Kasir/Kasir';
import Login from './components/Login';
import './App.css';
import { motion, AnimatePresence } from 'framer-motion';
import { DataProvider } from './context/DataContext';
import { NotificationProvider } from './context/NotificationContext';

const App = () => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('pos_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('pos_theme') || 'light';
  });
  const [currentView, setCurrentView] = useState(() => {
    return localStorage.getItem('pos_view') || 'dashboard';
  });

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    localStorage.setItem('pos_view', currentView);
  }, [currentView]);

  useEffect(() => {
    localStorage.setItem('pos_theme', theme);
    const metaThemeColor = document.getElementById('theme-color-meta');
    if (theme === 'dark') {
      document.body.classList.add('dark-theme');
      if (metaThemeColor) metaThemeColor.setAttribute('content', '#0A0A0A');
    } else {
      document.body.classList.remove('dark-theme');
      if (metaThemeColor) metaThemeColor.setAttribute('content', '#10B981');
    }
  }, [theme]);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('pos_user', JSON.stringify(userData));
  };

  const confirmLogout = () => {
    setUser(null);
    localStorage.removeItem('pos_user');
    setShowLogoutConfirm(false);
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <NotificationProvider>
      <DataProvider>
        {!user ? (
          <Login onLoginSuccess={handleLoginSuccess} />
        ) : (
          <div className="app-layout">
            <Sidebar
              activeView={currentView}
              onNavigate={setCurrentView}
              user={user}
              onLogout={() => setShowLogoutConfirm(true)}
              theme={theme}
              onToggleTheme={toggleTheme}
            />
            <main className="main-content">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentView}
                  className="view-wrapper"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  style={{ height: '100%' }}
                >
                  {currentView === 'dashboard' && <Dashboard />}
                  {currentView === 'menu' && <Menu />}
                  {currentView === 'order' && <Kasir />}
                  {currentView === 'history' && <History />}
                  {currentView === 'report' && <Report />}
                </motion.div>
              </AnimatePresence>
            </main>

            {/* Global Logout Selection UI */}
            <AnimatePresence>
              {showLogoutConfirm && (
                <div className="modal-overlay" style={{ zIndex: 9999 }}>
                  <motion.div
                    className="modal-content"
                    style={{ width: 320, textAlign: 'center', padding: '30px' }}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    <h3 style={{ margin: '0 0 15px 0' }}>Keluar Aplikasi?</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: 25, fontSize: 14 }}>
                      Anda akan diarahkan kembali ke halaman login.
                    </p>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <button
                        onClick={() => setShowLogoutConfirm(false)}
                        style={{ flex: 1, padding: 12, borderRadius: 10, background: 'var(--bg-app)', color: 'var(--text-primary)', fontWeight: 600 }}
                      >
                        Kembali
                      </button>
                      <button
                        onClick={confirmLogout}
                        style={{ flex: 1, padding: 12, borderRadius: 10, background: '#FF4D4F', color: 'white', fontWeight: 600 }}
                      >
                        Ya, Logout
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </div>
        )}
      </DataProvider>
    </NotificationProvider>
  );
};

export default App;
