import React, { useState, useEffect, lazy, Suspense } from 'react';
import Sidebar from './components/Sidebar';
const Menu = lazy(() => import('./components/Menu/Menu'));
const Dashboard = lazy(() => import('./components/Dashboard/Dashboard'));
const History = lazy(() => import('./components/History/History'));
const Report = lazy(() => import('./components/Report/Report'));
const StokMutasi = lazy(() => import('./components/StokMutasi/StokMutasi'));
const Settings = lazy(() => import('./components/Settings/Settings'));
import { apiFetch } from './config';
const Kasir = lazy(() => import('./components/Kasir/Kasir'));
import Login from './components/Login';
const CustomerService = lazy(() => import('./components/CustomerService/CustomerService'));
import './App.css';
import { motion, AnimatePresence } from 'framer-motion';
import { DataProvider, useData } from './context/DataContext';
import { NotificationProvider } from './context/NotificationContext';
import { Bell, Info, X, User, LogOut, Sun, Moon, Maximize, Minimize } from 'lucide-react';

const AppContent = ({
  user, theme, currentView, setCurrentView, isSidebarOpen, setIsSidebarOpen,
  showLogoutConfirm, setShowLogoutConfirm,
  handleLoginSuccess, confirmLogout, toggleTheme,
  showNotifications, setShowNotifications,
  showSettings, setShowSettings
}) => {
  const {
    dashboardData,
    refreshDashboard,
    refreshProducts,
    refreshOrders,
    refreshStockOnly
  } = useData();


  const outOfStockItems = dashboardData?.out_of_stock || [];

  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
    }
  };

  return (
    <div className="app-main-wrapper" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {!user ? (
        <Login onLoginSuccess={handleLoginSuccess} />
      ) : (
        <div className="app-layout" style={{ display: 'flex', height: '100%', position: 'relative' }}>
          {/* Top Bar for Mobile */}
          <div className="mobile-top-bar">
            <div className="mobile-top-left">
              <div className="mobile-menu-btn" onClick={() => setIsSidebarOpen(true)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
              </div>
              <h1 className="mobile-view-title">
                {currentView === 'dashboard' && 'Beranda'}
                {currentView === 'menu' && (user?.role === 'kasir' ? null : 'Kelola Barang')}
                {currentView === 'order' && 'Kasir'}
                {currentView === 'history' && (user?.role === 'kasir' ? null : 'Riwayat')}
                {currentView === 'report' && 'Laporan Penjualan'}
                {currentView === 'stok-mutasi' && 'Stok Mutasi'}
                {currentView === 'settings' && 'Pengaturan'}
                {currentView === 'cs' && 'Customer Service'}
              </h1>
            </div>

            <div className="mobile-top-right">
              <div className="notification-bell-wrapper" onClick={() => setShowNotifications(!showNotifications)}>
                <Bell size={22} className={outOfStockItems.length > 0 ? 'bell-anim' : ''} />
                {outOfStockItems.length > 0 && (
                  <span className="notification-badge">{outOfStockItems.length}</span>
                )}
              </div>
            </div>

            {/* Notification Popover */}
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  className="notification-popover"
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                >
                  <div className="popover-header">
                    <h3>Notifikasi</h3>
                    <button onClick={() => setShowNotifications(false)}><X size={18} /></button>
                  </div>
                  <div className="notification-list">
                    {outOfStockItems.length === 0 ? (
                      <div className="empty-notif">
                        <Info size={32} />
                        <p>Semua stok aman</p>
                      </div>
                    ) : (
                      outOfStockItems.map((item, idx) => (
                        <div key={idx} className="notif-item">
                          <div className="notif-icon danger">!</div>
                          <div className="notif-content">
                            <p className="notif-title">Stok Menipis!</p>
                            <p className="notif-desc"><strong>{item.name}</strong> sisa {item.stock} unit</p>
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
          <main className="main-content" style={{ flex: 1, overflowY: 'auto' }}>
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
                    <div style={{ height: '40px', width: '200px', background: 'var(--bg-app)', borderRadius: '8px', animation: 'pulse 1.5s infinite' }}></div>
                    <div style={{ flex: 1, background: 'var(--bg-app)', borderRadius: '12px', animation: 'pulse 1.5s infinite' }}></div>
                  </div>
                }>
                  {currentView === 'dashboard' && <Dashboard onNavigate={setCurrentView} />}
                  {currentView === 'menu' && <Menu />}
                  {currentView === 'order' && <Kasir />}
                  {currentView === 'history' && <History />}
                  {currentView === 'report' && <Report />}
                  {currentView === 'stok-mutasi' && <StokMutasi />}
                  {currentView === 'settings' && <Settings user={user} theme={theme} onToggleTheme={toggleTheme} />}
                  {currentView === 'cs' && <CustomerService />}
                </Suspense>
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
    </div>
  );
};

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
      if (metaThemeColor) metaThemeColor.setAttribute('content', '#0A0A0A');
    } else {
      document.body.classList.remove('dark-theme');
      if (metaThemeColor) metaThemeColor.setAttribute('content', '#73AABE');
    }
  }, [theme]);

  useEffect(() => {
    // Permission-based protection
    if (user && user.role !== 'admin') {
      const hasPermission = (view) => {
        if (!user.permissions || user.permissions.length === 0) return true;
        return user.permissions.includes(view);
      };

      const restrictedViews = ['menu', 'history', 'report', 'stok-mutasi'];
      if (restrictedViews.includes(currentView) && !hasPermission(currentView)) {
        setCurrentView('dashboard');
      }
    }
  }, [user, currentView, setCurrentView]);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('pos_user', JSON.stringify(userData));

    // Redirect to dashboard on login if restricted
    if (userData.role !== 'admin') {
      const hasPermission = (view) => {
        if (!userData.permissions || userData.permissions.length === 0) return true;
        return userData.permissions.includes(view);
      };
      const restrictedViews = ['menu', 'history', 'report', 'stok-mutasi'];
      if (restrictedViews.includes(currentView) && !hasPermission(currentView)) {
        setCurrentView('dashboard');
      }
    }
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
