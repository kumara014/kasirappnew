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
import './App.css';
import { motion, AnimatePresence } from 'framer-motion';
import { DataProvider, useData } from './context/DataContext';
import { NotificationProvider } from './context/NotificationContext';
import ErrorBoundary from './components/Common/ErrorBoundary';
import { Bell, X, Menu as MenuIcon } from 'lucide-react';

const TEAL = "#4A9BAD";

const AppContent = ({
  user, theme, currentView, setCurrentView, isSidebarOpen, setIsSidebarOpen,
  showLogoutConfirm, setShowLogoutConfirm,
  handleLoginSuccess, confirmLogout, toggleTheme,
  showNotifications, setShowNotifications,
  showSettings, setShowSettings
}) => {
  const {
    dashboardData, lowStockItems
  } = useData();

  // Use the global lowStockItems calculation for consistency
  const notifications = lowStockItems || [];

  return (
    <div className="app-main-wrapper" style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#F5F7F8' }}>
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
          background: rgba(255,255,255,0.15); border: none; cursor: pointer; 
          width: 36px; height: 36px; border-radius: 10px; 
          display: flex; align-items: center; justify-content: center;
        }
        .store-logo-header { font-size: 16px; font-weight: 800; color: #fff; letter-spacing: -0.5px; position: absolute; left: 50%; transform: translateX(-50%); }
        .store-logo-header span { opacity: 0.65; }
        .top-bar-btn { width: 34px; height: 34px; border-radius: 9px; background: rgba(255,255,255,0.15); border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #fff; position: relative; }
        .notif-dot { position: absolute; top: 7px; right: 7px; width: 7px; height: 7px; border-radius: 50%; background: #FF4757; border: 2px solid ${TEAL}; }
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
            <div className="store-logo-header">Pointly<span> POS</span></div>
            <div className="mobile-top-right">
              <button className="top-bar-btn" onClick={() => setShowNotifications(!showNotifications)}>
                <Bell size={20} />
                {notifications.length > 0 && <div className="notif-dot" />}
              </button>
            </div>

            {/* Notification Popover */}
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  className="notification-popover"
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  style={{
                    position: 'absolute', top: '100%', right: '20px',
                    width: '300px', background: '#fff', borderRadius: '18px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.15)', padding: '16px',
                    marginTop: '10px', color: '#333'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: '800' }}>Notifikasi</h3>
                    <button onClick={() => setShowNotifications(false)} style={{ background: 'none', border: 'none', color: '#999' }}><X size={18} /></button>
                  </div>
                  <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {notifications.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '20px' }}>
                        <p style={{ color: '#aaa', fontSize: '13px' }}>Semua stok aman</p>
                      </div>
                    ) : (
                      notifications.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: '12px', padding: '10px', background: '#F9FAFB', borderRadius: '12px', marginBottom: '8px' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#FEE2E2', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>!</div>
                          <div>
                            <p style={{ fontSize: '13px', fontWeight: '700' }}>Stok Menipis!</p>
                            <p style={{ fontSize: '12px', color: '#666' }}>{item.nama_barang} sisa {item.stok}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
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
                    <div style={{ height: '40px', width: '200px', background: '#e5e7eb', borderRadius: '8px', animation: 'pulse 1.5s infinite' }}></div>
                    <div style={{ flex: 1, background: '#e5e7eb', borderRadius: '12px', animation: 'pulse 1.5s infinite' }}></div>
                  </div>
                }>
                  <ErrorBoundary key={currentView}>
                    {currentView === 'dashboard' && <Dashboard onNavigate={setCurrentView} />}
                    {currentView === 'menu' && <Menu />}
                    {currentView === 'order' && <Kasir onToggleSidebar={() => setIsSidebarOpen(true)} />}
                    {currentView === 'history' && <History />}
                    {currentView === 'report' && <Report />}
                    {currentView === 'stok-mutasi' && <StokMutasi />}
                    {currentView === 'settings' && <Settings user={user} theme={theme} onToggleTheme={toggleTheme} />}
                    {currentView === 'cs' && <CustomerService />}
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
                  style={{ width: 320, textAlign: 'center', padding: '30px', background: '#fff', borderRadius: '24px' }}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <h3 style={{ margin: '0 0 15px 0', fontSize: '18px', fontWeight: '800' }}>Keluar Aplikasi?</h3>
                  <p style={{ color: '#666', marginBottom: 25, fontSize: 14 }}>
                    Anda akan diarahkan kembali ke halaman login.
                  </p>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <button
                      onClick={() => setShowLogoutConfirm(false)}
                      style={{ flex: 1, padding: 12, borderRadius: 14, background: '#F3F4F6', color: '#555', fontWeight: 600 }}
                    >
                      Kembali
                    </button>
                    <button
                      onClick={confirmLogout}
                      style={{ flex: 1, padding: 12, borderRadius: 14, background: '#FF4757', color: 'white', fontWeight: 600 }}
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
