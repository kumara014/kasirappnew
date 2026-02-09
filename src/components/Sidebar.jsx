import React, { useState, useEffect, useRef } from 'react';
import { Home, Grid, Menu, ShoppingCart, Clock, PieChart, ShoppingBag, LogOut, User, Sun, Moon, Maximize, Minimize } from 'lucide-react';
import './Sidebar.css';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar = ({ activeView, onNavigate, user, onLogout, theme, onToggleTheme, isOpen, onClose }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  // isAdmin removed - everyone can access all features

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const [showSettings, setShowSettings] = useState(false);
  const settingsRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setShowSettings(false);
      }
    };

    if (showSettings) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSettings]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <>
      {/* Backdrop for mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="sidebar-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {(isOpen || window.innerWidth > 768) && (
          <motion.div
            className={`sidebar ${isOpen ? 'open' : ''}`}
            initial={{ x: window.innerWidth <= 768 ? '-100%' : 0 }}
            animate={{ x: 0 }}
            exit={{ x: window.innerWidth <= 768 ? '-100%' : 0 }}
            transition={{ type: "tween", ease: "circOut", duration: 0.3 }}
          >
            <div className="sidebar-logo">
              <img src="logo pointly.png" alt="Logo" style={{ width: '40px' }} />
            </div>

            <nav className="sidebar-nav">
              <NavItem
                icon={<Grid size={20} />}
                label="Dashboard"
                active={activeView === 'dashboard'}
                onClick={() => { onNavigate('dashboard'); onClose(); }}
              />

              <NavItem
                icon={<Menu size={20} />}
                label="Kelola Barang"
                active={activeView === 'menu'}
                onClick={() => { onNavigate('menu'); onClose(); }}
              />

              <NavItem
                icon={<ShoppingCart size={20} />}
                label="Kasir"
                active={activeView === 'order'}
                onClick={() => { onNavigate('order'); onClose(); }}
              />

              <NavItem
                icon={<Clock size={20} />}
                label="Riwayat"
                active={activeView === 'history'}
                onClick={() => { onNavigate('history'); onClose(); }}
              />
              <NavItem
                icon={<PieChart size={20} />}
                label="Laporan"
                active={activeView === 'report'}
                onClick={() => { onNavigate('report'); onClose(); }}
              />
            </nav>

            <div className="sidebar-bottom">
              <div className="nav-divider" />

              <div className="settings-wrapper" ref={settingsRef}>
                <NavItem
                  icon={<User size={20} />}
                  label="Lainnya"
                  active={showSettings}
                  onClick={() => setShowSettings(!showSettings)}
                />

                <AnimatePresence>
                  {showSettings && (
                    <motion.div
                      className="settings-popover"
                      initial={{ opacity: 0, scale: 0.9, y: 10, x: 0 }}
                      animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: 10, x: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    >
                      <div className="popover-item" onClick={toggleFullscreen}>
                        {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
                        <span>{isFullscreen ? 'Normal' : 'Layar Penuh'}</span>
                      </div>

                      <div className="popover-item" onClick={onToggleTheme}>
                        {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                        <span>{theme === 'light' ? 'Mode Gelap' : 'Mode Terang'}</span>
                      </div>

                      <div className="popover-divider" />

                      <div className="popover-item logout-item" onClick={() => {
                        if (window.confirm("Apakah anda yakin ingin keluar?")) {
                          onLogout();
                        }
                      }}>
                        <LogOut size={18} />
                        <span>Log Out</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};


const NavItem = ({ icon, label, active, onClick, isLogout }) => {
  return (
    <div
      className={`nav-item ${active ? 'active' : ''} ${isLogout ? 'logout' : ''}`}
      onClick={onClick}
      style={isLogout ? { color: '#ff6b6b' } : {}}
    >
      <motion.div
        className="nav-icon"
        whileHover={{ scale: 1.15, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
      >
        {icon}
      </motion.div>
      <span className="nav-label">{label}</span>
    </div>
  );
};

export default Sidebar;
