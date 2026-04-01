import React, { useState, useEffect, lazy, Suspense } from 'react';
import Sidebar from './components/Sidebar';
import { App as CapacitorApp } from '@capacitor/app';
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
import { Bell, X, Menu as MenuIcon, RefreshCcw } from 'lucide-react';
import { preloadImage } from './components/Common/SafeImage';

const TEAL = "var(--primary-brand)";

const AppContent = ({
  user, theme, currentView, setCurrentView, isSidebarOpen, setIsSidebarOpen,
  showLogoutConfirm, setShowLogoutConfirm,
  handleLoginSuccess, confirmLogout, toggleTheme,
  showNotifications, setShowNotifications,
  showSettings, setShowSettings
}) => {
  const {
    dashboardData, lowStockItems, performRestock,
    refreshDashboard, refreshProducts, refreshOrders
  } = useData();

  const [restokProduct, setRestokProduct] = useState(null);
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 1024);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(
    () => localStorage.getItem('sidebar_collapsed') === 'true'
  );

  // Listen for resize to switch between desktop/mobile sidebar modes
  useEffect(() => {
    const onResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const handleToggleDesktopCollapse = () => {
    setIsDesktopCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('sidebar_collapsed', String(next));
      return next;
    });
  };

  const handleSaveRestok = async (productId, qty) => {
    const res = await performRestock(productId, qty);
    if (res.success) {
      setRestokProduct(null);
    }
  };

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshAll = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    // haptic? .impact();
    try {
      await Promise.all([
        refreshDashboard(true),
        refreshProducts(true),
        refreshOrders(true)
      ]);
      // haptic? .success();
    } catch (err) {
      console.error("Refresh failed:", err);
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  // Use the global lowStockItems calculation for consistency
  const notifications = lowStockItems || [];

  // Pull to refresh logic
  const [pullY, setPullY] = useState(0);
  const [startY, setStartY] = useState(0);
  const PULL_THRESHOLD = 80;

  const handleTouchStart = (e) => {
    // Only allow pull to refresh if at the top of the scroll
    const mainContent = document.querySelector('.main-content');
    if (mainContent && mainContent.scrollTop === 0) {
      setStartY(e.touches[0].pageY);
    } else {
      setStartY(0);
    }
  };

  const handleTouchMove = (e) => {
    if (startY === 0 || isRefreshing) return;
    const y = e.touches[0].pageY;
    const diff = y - startY;
    if (diff > 0) {
      // Apply quadratic resistance for a "bouncy" native feel
      const pull = Math.pow(diff, 0.85);
      setPullY(Math.min(pull, PULL_THRESHOLD + 40));
    }
  };

  const handleTouchEnd = () => {
    if (pullY >= PULL_THRESHOLD && !isRefreshing) {
      handleRefreshAll();
    }
    setPullY(0);
    setStartY(0);
  };

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
        <div
          className="app-layout"
          style={{
            display: 'flex',
            flexDirection: isDesktop ? 'row' : 'column',
            height: '100%',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Desktop persistent sidebar */}
          {isDesktop && (
            <Sidebar
              activeView={currentView}
              onNavigate={setCurrentView}
              user={user}
              onLogout={() => setShowLogoutConfirm(true)}
              theme={theme}
              onToggleTheme={toggleTheme}
              isOpen={false}
              onClose={() => { }}
              isDesktop={true}
              collapsed={isDesktopCollapsed}
              onToggleCollapse={handleToggleDesktopCollapse}
            />
          )}

          {/* Mobile overlay sidebar — moved up for absolute positioning reliability */}
          {!isDesktop && (
            <Sidebar
              activeView={currentView}
              onNavigate={setCurrentView}
              user={user}
              onLogout={() => setShowLogoutConfirm(true)}
              theme={theme}
              onToggleTheme={toggleTheme}
              isOpen={isSidebarOpen}
              onClose={() => setIsSidebarOpen(false)}
              isDesktop={false}
              collapsed={false}
              onToggleCollapse={() => { }}
            />
          )}

          {/* Right panel: top bar (mobile only) + main content */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

            {/* Mobile top bar — hidden on desktop */}
            {!isDesktop && (
              <div className="mobile-top-bar-teal" style={{
                display: (currentView === 'order') ? 'none' : 'flex'
              }}>
                <motion.button
                  className="hamburger-teal"
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsSidebarOpen(true)}
                >
                  <MenuIcon size={20} />
                </motion.button>
                <div className="store-logo-header">Pointly</div>
                <div className="mobile-top-right" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                        onManageStock={() => setCurrentView('stok-mutasi')}
                      />
                    )}
                  </div>
                </div>
              </div>
            )}

            {restokProduct && (
              <RestokModal
                product={restokProduct}
                onClose={() => setRestokProduct(null)}
                onSave={handleSaveRestok}
              />
            )}

            <main
              className="main-content"
              style={{ flex: 1, overflowY: 'auto', position: 'relative' }}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {/* Pull to Refresh Indicator */}
              <div style={{
                position: 'absolute',
                top: -40,
                left: 0,
                right: 0,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: 40,
                transform: `translateY(${pullY}px)`,
                opacity: pullY / PULL_THRESHOLD,
                zIndex: 100,
                pointerEvents: 'none'
              }}>
                <motion.div
                  animate={isRefreshing ? { rotate: 360 } : { rotate: pullY * 3 }}
                  transition={isRefreshing ? { duration: 1, repeat: Infinity, ease: "linear" } : { duration: 0 }}
                  style={{
                    background: 'white',
                    borderRadius: '50%',
                    padding: 8,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    color: TEAL
                  }}
                >
                  <RefreshCcw size={20} />
                </motion.div>
              </div>

              {/* Main Refresh Loading Overlay */}
              <AnimatePresence>
                {isRefreshing && pullY === 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    style={{
                      position: 'absolute',
                      top: 20,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      zIndex: 100,
                      background: 'white',
                      borderRadius: '50%',
                      padding: 8,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      color: TEAL
                    }}
                  >
                    <RefreshCcw className="spin-fast" size={20} />
                  </motion.div>
                )}
              </AnimatePresence>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentView}
                  className="view-wrapper"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
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
          </div>

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
  const [currentView, setCurrentViewRaw] = useState('dashboard');
  const [viewHistory, setViewHistory] = useState(['dashboard']);

  // Wrap setCurrentView to manage history
  const setCurrentView = (newView) => {
    if (newView === currentView) return;

    // If going to dashboard, clear history
    if (newView === 'dashboard') {
      setViewHistory(['dashboard']);
    } else {
      // Add to history
      setViewHistory(prev => {
        // If the view is already the last one, don't add
        if (prev[prev.length - 1] === newView) return prev;
        return [...prev, newView];
      });
    }
    setCurrentViewRaw(newView);
  };

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);



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

  // Handle Android Hardware Back Button
  useEffect(() => {
    const setupBackButton = async () => {
      return await CapacitorApp.addListener('backButton', ({ canGoBack }) => {
        if (showLogoutConfirm) {
          setShowLogoutConfirm(false);
        } else if (isSidebarOpen) {
          setIsSidebarOpen(false);
        } else if (showNotifications) {
          setShowNotifications(false);
        } else if (showSettings) {
          setShowSettings(false);
        } else if (viewHistory.length > 1) {
          // Go back in history
          const newHistory = [...viewHistory];
          newHistory.pop(); // Remove current view
          const prevView = newHistory[newHistory.length - 1];
          setViewHistory(newHistory);
          setCurrentViewRaw(prevView);
        } else if (currentView !== 'dashboard') {
          setCurrentView('dashboard');
        } else {
          // On dashboard with no UI overlays, exit the app
          CapacitorApp.exitApp();
        }
      });
    };

    const backButtonListener = setupBackButton();

    return () => {
      backButtonListener.then(l => l.remove());
    };
  }, [currentView, viewHistory, isSidebarOpen, showNotifications, showSettings, showLogoutConfirm]);

  const handleLoginSuccess = (userData, token) => {
    setUser(userData);
    localStorage.setItem('pos_user', JSON.stringify(userData));
    if (token) {
      localStorage.setItem('pos_token', token);
      if (userData.logo_usaha) preloadImage(userData.logo_usaha);
      setCurrentView('dashboard');
    }
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
