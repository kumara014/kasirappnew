import React, { useState, useEffect, useRef } from 'react';
import { Home, Grid, Menu, ShoppingCart, Clock, PieChart, ShoppingBag, LogOut, User, Sun, Moon, Maximize, Minimize, History, MessageCircleMore } from 'lucide-react';
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

  const hasPermission = (view) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    if (!user.permissions || user.permissions.length === 0) return true;
    return user.permissions.includes(view);
  };

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
              {hasPermission('dashboard') && (
                <NavItem
                  icon={<Grid size={20} />}
                  label="Dashboard"
                  active={activeView === 'dashboard'}
                  onClick={() => { onNavigate('dashboard'); onClose(); }}
                />
              )}

              {hasPermission('menu') && (
                <NavItem
                  icon={<Menu size={20} />}
                  label="Kelola Barang"
                  active={activeView === 'menu'}
                  onClick={() => { onNavigate('menu'); onClose(); }}
                />
              )}

              {hasPermission('order') && (
                <NavItem
                  icon={<ShoppingCart size={20} />}
                  label="Kasir"
                  active={activeView === 'order'}
                  onClick={() => { onNavigate('order'); onClose(); }}
                />
              )}

              {hasPermission('history') && (
                <NavItem
                  icon={<Clock size={20} />}
                  label="Riwayat"
                  active={activeView === 'history'}
                  onClick={() => { onNavigate('history'); onClose(); }}
                />
              )}

              {hasPermission('report') && (
                <NavItem
                  icon={<PieChart size={20} />}
                  label="Laporan"
                  active={activeView === 'report'}
                  onClick={() => { onNavigate('report'); onClose(); }}
                />
              )}

              {hasPermission('stok-mutasi') && (
                <NavItem
                  icon={<History size={20} />}
                  label="Stok Mutasi"
                  active={activeView === 'stok-mutasi'}
                  onClick={() => { onNavigate('stok-mutasi'); onClose(); }}
                />
              )}
            </nav>

            <div className="sidebar-bottom">
              <NavItem
                icon={<MessageCircleMore size={20} />}
                label="Bantuan"
                active={activeView === 'cs'}
                onClick={() => { onNavigate('cs'); onClose(); }}
              />
              <div className="nav-divider" />
              <NavItem
                icon={<User size={20} />}
                label="Pengaturan"
                active={activeView === 'settings'}
                onClick={() => { onNavigate('settings'); onClose(); }}
              />
              <NavItem
                icon={<LogOut size={20} />}
                label="Keluar"
                onClick={() => {
                  if (window.confirm("Apakah anda yakin ingin keluar?")) {
                    onLogout();
                  }
                }}
                isLogout
              />
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
