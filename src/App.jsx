import React, { useState, useEffect, lazy, Suspense } from 'react';
import Sidebar from './components/Sidebar';
const Menu = lazy(() => import('./components/Barang/Barang'));
const Dashboard = lazy(() => import('./components/Dashboard/Dashboard'));
const History = lazy(() => import('./components/Riwayat/Riwayat'));
const Report = lazy(() => import('./components/Laporan/Laporan'));
const StokMutasi = lazy(() => import('./components/StokMutasi/StokMutasi'));
const Settings = lazy(() => import('./components/Settings/Settings'));
const Kasir = lazy(() => import('./components/Kasir/Kasir'));
import Login from './components/Login';
const CustomerService = lazy(() => import('./components/CustomerService/CustomerService'));
const ManajemenKaryawan = lazy(() => import('./components/ManajemenKaryawan/ManajemenKaryawan'));
import './App.css';
import { motion, AnimatePresence } from 'framer-motion';
import { DataProvider, useData } from './context/DataContext';
import { NotificationProvider } from './context/NotificationContext';
import { NotificationDropdown, RestokModal } from './components/Notifications/NotificationDropdown';
import { BellButton } from './components/Notifications/BellButton';
import ErrorBoundary from './components/Common/ErrorBoundary';
import { Bell, X, Menu as MenuIcon } from 'lucide-react';

const TEAL = "var(--primary-brand)";

const AppContent = ({
  user, theme, currentView, setCurrentView, isSidebarOpen, setIsSidebarOpen,
  showLogoutConfirm, setShowLogoutConfirm,
  handleLoginSuccess, confirmLogout, toggleTheme,
  showNotifications, setShowNotifications,
  showSettings, setShowSettings
}) => {
  const {
    dashboardData, lowStockItems, performRestock
  } = useData();

  const [restokProduct, setRestokProduct] = useState(null);

  const handleSaveRestok = async (productId, qty) => {
    const res = await performRestock(productId, qty);
    if (res.success) {
      setRestokProduct(null);
    }
  };

  // Use the global lowStockItems calculation for consistency
  const notifications = lowStockItems || [];

  // Close notifications automatically when navigating to a different view
  useEffect(() => {
    setShowNotifications(false);
  }, [currentView, setShowNotifications]);

  return (
    <div className="app-main-wrapper" style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-app)' }}>
      <style>{`
        .mobile-top-bar-teal {
          background: ${TEAL};
          padding: 12px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
          z-index: 1001;
          color: #fff;
        }
        .hamburger-teal { 
          background: rgba(255,255,255,0.2); border: none; cursor: pointer; 
          width: 36px; height: 36px; border-radius: 10px; 
          display: flex; align-items: center; justify-content: center;
          color: #fff;
        }
        .store-logo-header { font-size: 16px; font-weight: 800; color: #fff; letter-spacing: -0.5px; position: absolute; left: 50%; transform: translateX(-50%); }
        .store-logo-header span { opacity: 0.65; }
        .top-bar-btn { width: 34px; height: 34px; border-radius: 9px; background: rgba(255,255,255,0.2); border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #fff; position: relative; }
        .notif-dot { position: absolute; top: 7px; right: 7px; width: 7px; height: 7px; border-radius: 50%; background: var(--status-red); border: 2px solid #fff; }
      `}</style>

      {!user ? (
        <Login onLoginSuccess={handleLoginSuccess} />
      ) : (
        <div className="app-layout" style={{ display: 'flex', height: '100%', position: 'relative', overflow: 'hidden' }}>

          {/* Top Bar - Hidden when Kasir (order) is active on mobile to prevent header overlap */}
          <div className="mobile-top-bar-teal" style={{
            display: (currentView === 'order' && window.innerWidth <= 1024) ? 'none' : 'flex'
          }}>
            <motion.button
              className="hamburger-teal"
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsSidebarOpen(true)}
            >
              <MenuIcon size={20} />
            </motion.button>
            <div className="store-logo-header">Pointly</div>
            <div className="mobile-top-right">
              <div style={{ position: 'relative' }}>
                <BellButton
                  count={notifications.length}
                  onClick={() => setShowNotifications(!showNotifications)}
                  hasNew={notifications.length > 0}
                />

                {showNotifications && (
                  <NotificationDropdown
                    onClose={() => setShowNotifications(false)}
                    onRestok={(p) => setRestokProduct(p)}
                  />
                )}
              </div>
            </div>
          </div>

          <Sidebar
            activeView={currentView}
            onNavigate={setCurrentView}
            user={user}
            onLogout={() => setShowLogoutConfirm(true)}
            theme={theme}
            onToggleTheme={toggleTheme}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />

          {restokProduct && (
            <RestokModal
              product={restokProduct}
              onClose={() => setRestokProduct(null)}
              onSave={handleSaveRestok}
            />
          )}

          <main className="main-content" style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>
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
                <Suspense fallback={
                  <div className="view-loading-skeleton" style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ height: '40px', width: '200px', background: 'var(--bg-app-alt)', borderRadius: '8px', animation: 'pulse 1.5s infinite' }}></div>
                    <div style={{ flex: 1, background: 'var(--bg-app-alt)', borderRadius: '12px', animation: 'pulse 1.5s infinite' }}></div>
                  </div>
                }>
                  <ErrorBoundary key={currentView}>
                    {currentView === 'dashboard' && <Dashboard onNavigate={setCurrentView} />}
                    {currentView === 'menu' && <Menu />}
                    {currentView === 'order' && <Kasir onToggleSidebar={() => setIsSidebarOpen(true)} />}
                    {currentView === 'history' && <History />}
                    {currentView === 'report' && <Report />}
                    {currentView === 'stok-mutasi' && <StokMutasi />}
                    {currentView === 'settings' && <Settings user={user} theme={theme} onToggleTheme={toggleTheme} onLogout={() => setShowLogoutConfirm(true)} onUpdateUser={handleLoginSuccess} />}
                    {currentView === 'cs' && <CustomerService onBack={() => setCurrentView('dashboard')} />}
                    {currentView === 'employee' && <ManajemenKaryawan onBack={() => setCurrentView('dashboard')} />}
                  </ErrorBoundary>
                </Suspense>
              </motion.div>
            </AnimatePresence>
          </main>

          {/* Global Logout Selection UI */}
          <AnimatePresence>
            {showLogoutConfirm && (
              <div className="modal-overlay" style={{ zIndex: 10000 }}>
                <motion.div
                  className="modal-content"
                  style={{ width: 320, textAlign: 'center', padding: '30px', background: 'var(--bg-surface)', borderRadius: '24px', border: '1px solid var(--border-light)' }}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <h3 style={{ margin: '0 0 15px 0', fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)' }}>Keluar Aplikasi?</h3>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: 25, fontSize: 14 }}>
                    Anda akan diarahkan kembali ke halaman login.
                  </p>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <button
                      onClick={() => setShowLogoutConfirm(false)}
                      style={{ flex: 1, padding: 12, borderRadius: 14, background: 'var(--bg-app-alt)', color: 'var(--text-secondary)', fontWeight: 600 }}
                    >
                      Batal
                    </button>
                    <button
                      onClick={confirmLogout}
                      style={{ flex: 1, padding: 12, borderRadius: 14, background: 'var(--status-red)', color: 'white', fontWeight: 600 }}
                    >
                      Ya, Keluar
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

const App = () => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('pos_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error("Failed to parse user from localStorage:", e);
      localStorage.removeItem('pos_user');
      return null;
    }
  });
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('pos_theme') || 'light';
  });
  const [currentView, setCurrentView] = useState(() => {
    return localStorage.getItem('pos_view') || 'dashboard';
  });

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    localStorage.setItem('pos_view', currentView);
  }, [currentView]);

  useEffect(() => {
    localStorage.setItem('pos_theme', theme);
    const metaThemeColor = document.getElementById('theme-color-meta');
    if (theme === 'dark') {
      document.body.classList.add('dark-theme');
      if (metaThemeColor) metaThemeColor.setAttribute('content', '#4A9BAD');
    } else {
      document.body.classList.remove('dark-theme');
      if (metaThemeColor) metaThemeColor.setAttribute('content', '#4A9BAD');
    }
  }, [theme]);

  const handleLoginSuccess = (userData, token) => {
    setUser(userData);
    localStorage.setItem('pos_user', JSON.stringify(userData));
    if (token) {
      localStorage.setItem('pos_token', token);
    }
    setCurrentView('dashboard');
  };

  const confirmLogout = async () => {
    try {
      const token = localStorage.getItem('pos_token');
      if (token) {
        await import('./config').then(({ apiFetch }) =>
          apiFetch('/logout', { method: 'POST' })
        );
      }
    } catch (e) {
      // Ignore errors — still log out locally
      console.warn('Logout API call failed, logging out locally:', e);
    }
    setUser(null);
    localStorage.removeItem('pos_user');
    localStorage.removeItem('pos_token');
    setShowLogoutConfirm(false);
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <NotificationProvider>
      <DataProvider key={user?.id_user || 'guest'} user={user}>
        <AppContent
          user={user}
          theme={theme}
          currentView={currentView}
          setCurrentView={setCurrentView}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          showLogoutConfirm={showLogoutConfirm}
          setShowLogoutConfirm={setShowLogoutConfirm}
          handleLoginSuccess={handleLoginSuccess}
          confirmLogout={confirmLogout}
          toggleTheme={toggleTheme}
          showNotifications={showNotifications}
          setShowNotifications={setShowNotifications}
          showSettings={showSettings}
          setShowSettings={setShowSettings}
        />
      </DataProvider>
    </NotificationProvider>
  );
};

export default App;
