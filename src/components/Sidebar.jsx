import React, { useState, useEffect } from 'react';
import { Home, Grid, Menu, ShoppingCart, Clock, PieChart, LogOut, User, MessageCircleMore, X, Bell, ArrowLeftRight } from 'lucide-react';
import './Sidebar.css';
import { motion, AnimatePresence } from 'framer-motion';
import { haptic } from '../utils/haptics';

const TEAL = "#4A9BAD";
const TEAL_LIGHT = "#EAF5F7";
const TEAL_DARK = "#357585";

const Sidebar = ({ activeView, onNavigate, user, onLogout, theme, onToggleTheme, isOpen, onClose }) => {
  const hasPermission = (view) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    if (!user.permissions || user.permissions.length === 0) return true;
    return user.permissions.includes(view);
  };

  const navItems = [
    { id: 'dashboard', icon: <Grid size={20} />, label: 'Dashboard', permission: 'dashboard' },
    { id: 'order', icon: <ShoppingCart size={20} />, label: 'Kasir', permission: 'order' },
    { id: 'menu', icon: <Menu size={20} />, label: 'Kelola Barang', permission: 'menu' },
    { id: 'stok-mutasi', icon: <ArrowLeftRight size={20} />, label: 'Stok Mutasi', permission: 'stok-mutasi' },
    { id: 'history', icon: <Clock size={20} />, label: 'Riwayat', permission: 'history' },
    { id: 'report', icon: <PieChart size={20} />, label: 'Laporan', permission: 'report' },
  ];

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="sidebar-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
              zIndex: 2000, backdropFilter: 'blur(3px)'
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={`sidebar-teal open`}
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: "tween", ease: "circOut", duration: 0.32 }}
            style={{
              position: 'fixed', top: 0, left: 0, bottom: 0,
              width: '280px', background: '#fff',
              zIndex: 2001, display: 'flex', flexDirection: 'column',
              boxShadow: '4px 0 32px rgba(0,0,0,0.12)',
              overflowY: 'auto'
            }}
          >
            <div className="drawer-header-teal" style={{ background: TEAL, padding: '52px 20px 24px', position: 'relative', overflow: 'hidden', color: '#fff' }}>
              <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
              <button
                onClick={onClose}
                style={{ position: 'absolute', top: '16px', right: '16px', width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={16} />
              </button>
              <div className="drawer-avatar" style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: '800', marginBottom: '12px' }}>
                {user?.name?.substring(0, 1).toUpperCase() || 'U'}
              </div>
              <div className="drawer-name" style={{ fontSize: '16px', fontWeight: '800', letterSpacing: '-0.3px' }}>{user?.name || 'User'}</div>
              <div className="drawer-role" style={{ fontSize: '12px', color: 'rgba(255,255,255,0.65)', marginTop: '2px' }}>{user?.role === 'admin' ? 'Owner' : 'Staff'} • Pointly POS</div>
            </div>

            <nav className="drawer-nav" style={{ flex: 1, padding: '12px' }}>
              <div style={{ fontSize: '10px', fontWeight: '700', color: '#bbb', textTransform: 'uppercase', letterSpacing: '0.8px', padding: '8px 10px 6px' }}>Menu Utama</div>
              {navItems.map((n) => hasPermission(n.permission) && (
                <div
                  key={n.id}
                  className={`nav-item-teal ${activeView === n.id ? 'active' : ''}`}
                  onClick={() => { haptic.tap(); onNavigate(n.id); onClose(); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '14px',
                    padding: '12px 14px', borderRadius: '13px',
                    cursor: 'pointer', marginBottom: '2px',
                    background: activeView === n.id ? TEAL_LIGHT : 'transparent',
                    color: activeView === n.id ? TEAL : '#555',
                    position: 'relative',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ width: '38px', height: '38px', borderRadius: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: activeView === n.id ? `${TEAL}22` : '#F5F7F8' }}>{n.icon}</div>
                  <div style={{ fontSize: '14px', fontWeight: '600' }}>{n.label}</div>
                  {activeView === n.id && <div style={{ width: '4px', height: '20px', borderRadius: '2px', background: TEAL, marginLeft: 'auto' }} />}
                </div>
              ))}

              <div style={{ height: '1px', background: '#F0F2F4', margin: '8px 12px' }} />
              <div style={{ fontSize: '10px', fontWeight: '700', color: '#bbb', textTransform: 'uppercase', letterSpacing: '0.8px', padding: '8px 10px 6px' }}>Lainnya</div>

              <div
                className={`nav-item-teal ${activeView === 'cs' ? 'active' : ''}`}
                onClick={() => { haptic.tap(); onNavigate('cs'); onClose(); }}
                style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 14px', borderRadius: '13px', cursor: 'pointer', marginBottom: '2px' }}
              >
                <div style={{ width: '38px', height: '38px', borderRadius: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F5F7F8' }}><MessageCircleMore size={20} /></div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#555' }}>Bantuan</div>
              </div>

              <div
                className={`nav-item-teal ${activeView === 'settings' ? 'active' : ''}`}
                onClick={() => { haptic.tap(); onNavigate('settings'); onClose(); }}
                style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 14px', borderRadius: '13px', cursor: 'pointer', marginBottom: '2px' }}
              >
                <div style={{ width: '38px', height: '38px', borderRadius: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F5F7F8' }}><User size={20} /></div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#555' }}>Pengaturan</div>
              </div>
            </nav>

            <div className="drawer-footer" style={{ padding: '14px 12px 28px', borderTop: '1px solid #F0F2F4' }}>
              <div
                className="logout-btn-teal"
                onClick={() => {
                  haptic.tap();
                  if (window.confirm("Apakah anda yakin ingin keluar?")) {
                    onLogout();
                  }
                }}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', borderRadius: '13px', cursor: 'pointer', background: '#FFF0F1' }}
              >
                <div style={{ width: '38px', height: '38px', borderRadius: '11px', background: '#FFDDE0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FF4757' }}><LogOut size={20} /></div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#FF4757' }}>Keluar</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
