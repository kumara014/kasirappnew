import React, { useState, useEffect } from 'react';
import { Home, Grid, Menu, ShoppingCart, Clock, PieChart, LogOut, User, Users, MessageCircleMore, X, Bell, ArrowLeftRight } from 'lucide-react';
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
    if (!user.permissions || (user.permissions || []).length === 0) return true;
    return user.permissions.includes(view);
  };

  const navItems = [
    { id: 'dashboard', icon: <Grid size={20} />, label: 'Dashboard', permission: 'Dashboard' },
    { id: 'order', icon: <ShoppingCart size={20} />, label: 'Kasir', permission: 'Kasir' },
    { id: 'menu', icon: <Menu size={20} />, label: 'Kelola Barang', permission: 'Kelola Produk' },
    { id: 'stok-mutasi', icon: <ArrowLeftRight size={20} />, label: 'Stok Mutasi', permission: 'Mutasi Stok' },
    { id: 'history', icon: <Clock size={20} />, label: 'Riwayat', permission: 'Riwayat' },
    { id: 'report', icon: <PieChart size={20} />, label: 'Laporan', permission: 'Laporan' },
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
              width: '280px', background: 'var(--bg-surface)',
              zIndex: 2001, display: 'flex', flexDirection: 'column',
              boxShadow: 'var(--shadow-lg)',
              overflowY: 'auto',
              borderRight: '1px solid var(--border-light)'
            }}
          >
            <div className="drawer-header-teal" style={{ background: 'var(--primary-brand)', padding: '52px 20px 24px', position: 'relative', overflow: 'hidden', color: '#fff' }}>
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
              <div style={{ fontSize: '10px', fontWeight: '700', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.8px', padding: '8px 10px 6px' }}>Menu Utama</div>
              {navItems.map((n) => hasPermission(n.permission) && (
                <div
                  key={n.id}
                  className={`nav-item-teal ${activeView === n.id ? 'active' : ''}`}
                  onClick={() => { haptic.tap(); onNavigate(n.id); onClose(); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '14px',
                    padding: '12px 14px', borderRadius: '13px',
                    cursor: 'pointer', marginBottom: '2px',
                    background: activeView === n.id ? 'var(--primary-light)' : 'transparent',
                    color: activeView === n.id ? 'var(--primary-brand)' : 'var(--text-secondary)',
                    position: 'relative',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ width: '38px', height: '38px', borderRadius: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: activeView === n.id ? 'var(--primary-light)' : 'var(--bg-app-alt)' }}>{n.icon}</div>
                  <div style={{ fontSize: '14px', fontWeight: '600' }}>{n.label}</div>
                  {activeView === n.id && <div style={{ width: '4px', height: '20px', borderRadius: '2px', background: 'var(--primary-brand)', marginLeft: 'auto' }} />}
                </div>
              ))}

              <div style={{ height: '1px', background: 'var(--border-light)', margin: '8px 12px' }} />
              <div style={{ fontSize: '10px', fontWeight: '700', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.8px', padding: '8px 10px 6px' }}>Lainnya</div>

              <div
                className={`nav-item-teal ${activeView === 'cs' ? 'active' : ''}`}
                onClick={() => { haptic.tap(); onNavigate('cs'); onClose(); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 14px', borderRadius: '13px', cursor: 'pointer', marginBottom: '2px',
                  background: activeView === 'cs' ? 'var(--primary-light)' : 'transparent',
                  color: activeView === 'cs' ? 'var(--primary-brand)' : 'var(--text-secondary)'
                }}
              >
                <div style={{ width: '38px', height: '38px', borderRadius: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: activeView === 'cs' ? 'var(--primary-light)' : 'var(--bg-app-alt)' }}><MessageCircleMore size={20} /></div>
                <div style={{ fontSize: '14px', fontWeight: '600' }}>Bantuan</div>
              </div>

              {hasPermission('Karyawan') && (
                <div
                  className={`nav-item-teal ${activeView === 'employee' ? 'active' : ''}`}
                  onClick={() => { haptic.tap(); onNavigate('employee'); onClose(); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 14px', borderRadius: '13px', cursor: 'pointer', marginBottom: '2px',
                    background: activeView === 'employee' ? 'var(--primary-light)' : 'transparent',
                    color: activeView === 'employee' ? 'var(--primary-brand)' : 'var(--text-secondary)'
                  }}
                >
                  <div style={{ width: '38px', height: '38px', borderRadius: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: activeView === 'employee' ? 'var(--primary-light)' : 'var(--bg-app-alt)' }}><Users size={20} /></div>
                  <div style={{ fontSize: '14px', fontWeight: '600' }}>Tim Karyawan</div>
                </div>
              )}

              <div
                className={`nav-item-teal ${activeView === 'settings' ? 'active' : ''}`}
                onClick={() => { haptic.tap(); onNavigate('settings'); onClose(); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 14px', borderRadius: '13px', cursor: 'pointer', marginBottom: '2px',
                  background: activeView === 'settings' ? 'var(--primary-light)' : 'transparent',
                  color: activeView === 'settings' ? 'var(--primary-brand)' : 'var(--text-secondary)'
                }}
              >
                <div style={{ width: '38px', height: '38px', borderRadius: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: activeView === 'settings' ? 'var(--primary-light)' : 'var(--bg-app-alt)' }}><User size={20} /></div>
                <div style={{ fontSize: '14px', fontWeight: '600' }}>Pengaturan</div>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
