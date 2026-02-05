import React, { useState, useEffect, useRef } from 'react';
import { Home, Grid, Menu, ShoppingCart, Clock, PieChart, ShoppingBag, LogOut, User, Sun, Moon, Maximize, Minimize } from 'lucide-react';
import './Sidebar.css';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar = ({ activeView, onNavigate, user, onLogout, theme, onToggleTheme }) => {
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
    <div className="sidebar">
      <div className="sidebar-logo">
        <img src="gjb.png" alt="Logo" style={{ width: '40px' }} />
      </div>

      <nav className="sidebar-nav">
        <NavItem
          icon={<Grid size={20} />}
          label="Dashboard"
          active={activeView === 'dashboard'}
          onClick={() => onNavigate('dashboard')}
        />

        <NavItem
          icon={<Menu size={20} />}
          label="Barang"
          active={activeView === 'menu'}
          onClick={() => onNavigate('menu')}
        />

        <NavItem
          icon={<ShoppingCart size={20} />}
          label="Kasir"
          active={activeView === 'order'}
          onClick={() => onNavigate('order')}
        />

        <NavItem
          icon={<Clock size={20} />}
          label="Riwayat"
          active={activeView === 'history'}
          onClick={() => onNavigate('history')}
        />
        <NavItem
          icon={<PieChart size={20} />}
          label="Laporan"
          active={activeView === 'report'}
          onClick={() => onNavigate('report')}
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

    </div>
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
