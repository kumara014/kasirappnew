import React, { useState, useEffect } from 'react';
import {
  Home, Grid, Menu, ShoppingCart, Clock, PieChart, LogOut,
  User, Users, MessageCircleMore, X, Bell, ArrowLeftRight,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import './Sidebar.css';
import { motion, AnimatePresence } from 'framer-motion';
import { haptic } from '../utils/haptics';
import SafeImage from './Common/SafeImage';

const TEAL = "#4A9BAD";
const TEAL_LIGHT = "#EAF5F7";

/**
 * Sidebar — supports two modes:
 *   1. Mobile  (<1024px): overlay drawer (isOpen / onClose)
 *   2. Desktop (≥1024px): persistent left panel (always visible, collapsible)
 *
 * Props:
 *   activeView, onNavigate, user, onLogout, theme, onToggleTheme
 *   isOpen       — mobile drawer open state
 *   onClose      — mobile drawer close callback
 *   isDesktop    — true when viewport ≥ 1024px
 *   collapsed    — desktop collapsed state (icons only)
 *   onToggleCollapse — toggle desktop collapsed state
 */
const Sidebar = ({
  activeView, onNavigate, user, onLogout, theme, onToggleTheme,
  isOpen, onClose,
  isDesktop, collapsed, onToggleCollapse
}) => {
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

  const otherItems = [
    { id: 'employee', icon: <Users size={20} />, label: 'Tim Karyawan', permission: 'Karyawan' },
    { id: 'settings', icon: <User size={20} />, label: 'Pengaturan', permission: null },
    { id: 'cs', icon: <MessageCircleMore size={20} />, label: 'Bantuan', permission: null },
  ];

  /* ── Nav item renderer (shared between mobile & desktop) ── */
  const NavItem = ({ item, isCollapsed }) => {
    const active = activeView === item.id;
    return (
      <div
        className={`nav-item-teal ${active ? 'active' : ''}`}
        onClick={() => {
          haptic.tap();
          onNavigate(item.id);
          if (!isDesktop) onClose();
        }}
        title={isCollapsed ? item.label : undefined}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: isCollapsed ? 0 : '14px',
          padding: isCollapsed ? '10px 0' : '10px 12px',
          justifyContent: isCollapsed ? 'center' : 'flex-start',
          borderRadius: '13px',
          cursor: 'pointer',
          marginBottom: '2px',
          background: active ? 'var(--primary-light)' : 'transparent',
          color: active ? 'var(--primary-brand)' : 'var(--text-secondary)',
          position: 'relative',
          transition: 'all 0.2s',
        }}
      >
        <div style={{
          width: '38px', height: '38px', borderRadius: '11px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: active ? 'var(--primary-light)' : 'var(--bg-app-alt)',
          flexShrink: 0,
        }}>
          {item.icon}
        </div>
        {!isCollapsed && (
          <div style={{ fontSize: '14px', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {item.label}
          </div>
        )}
        {active && !isCollapsed && (
          <div style={{ width: '4px', height: '20px', borderRadius: '2px', background: 'var(--primary-brand)', marginLeft: 'auto' }} />
        )}
        {/* Active indicator dot for collapsed mode */}
        {active && isCollapsed && (
          <div style={{
            position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)',
            width: '5px', height: '5px', borderRadius: '50%', background: 'var(--primary-brand)'
          }} />
        )}
      </div>
    );
  };

  /* ── Section label ── */
  const SectionLabel = ({ label, isCollapsed }) => (
    isCollapsed ? (
      <div style={{ height: '1px', background: 'var(--border-light)', margin: '8px 10px' }} />
    ) : (
      <div style={{ fontSize: '10px', fontWeight: '700', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.8px', padding: '8px 10px 6px' }}>
        {label}
      </div>
    )
  );

  /* ══════════════════════════════════════════
   *  DESKTOP PERSISTENT SIDEBAR
   * ══════════════════════════════════════════ */
  if (isDesktop) {
    return (
      <div
        className="desktop-sidebar"
        style={{
          width: collapsed ? '68px' : '260px',
          transition: 'width 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
          flexShrink: 0,
          background: 'var(--bg-surface)',
          borderRight: '1px solid var(--border-light)',
          display: 'flex',
          flexDirection: 'column',
          overflowX: 'hidden',
          overflowY: 'auto',
          position: 'relative',
          zIndex: 100,
          boxShadow: '2px 0 8px rgba(0,0,0,0.04)',
        }}
      >
        {/* Header */}
        <div style={{
          background: 'var(--primary-brand)',
          padding: collapsed ? '20px 0 18px' : '24px 16px 18px',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: collapsed ? 'center' : 'flex-start',
          minHeight: '80px',
          justifyContent: 'flex-end',
        }}>
          {/* BG circle decoration */}
          {!collapsed && <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />}

          {/* Avatar */}
          <div style={{
            width: collapsed ? '36px' : '44px',
            height: collapsed ? '36px' : '44px',
            borderRadius: collapsed ? '12px' : '14px',
            background: user?.logo_usaha ? '#fff' : 'rgba(255,255,255,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: collapsed ? '16px' : '18px', fontWeight: '800', color: '#fff',
            marginBottom: collapsed ? 0 : '8px',
            transition: 'all 0.28s',
            flexShrink: 0,
            overflow: 'hidden'
          }}>
            {user?.logo_usaha ? <SafeImage src={user.logo_usaha} style={{ width: "100%", height: "100%", objectFit: "contain", padding: 4 }} /> : (user?.nama_usaha?.substring(0, 1).toUpperCase() || 'U')}
          </div>

          {!collapsed && (
            <>
              <div style={{ fontSize: '14px', fontWeight: '800', color: '#fff', letterSpacing: '-0.3px', position: 'relative', zIndex: 2 }}>
                {user?.name || 'User'}
              </div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.65)', marginTop: '2px', position: 'relative', zIndex: 2 }}>
                {user?.role === 'admin' ? 'Owner' : 'Staff'} · Pointly
              </div>
            </>
          )}
        </div>

        {/* Toggle collapse button */}
        <button
          onClick={onToggleCollapse}
          title={collapsed ? 'Perluas sidebar' : 'Ciutkan sidebar'}
          style={{
            position: 'absolute',
            top: '72px',
            right: '-12px',
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-strong)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--text-secondary)',
            boxShadow: 'var(--shadow-sm)',
            zIndex: 200,
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-brand)' + ' ' || (e.currentTarget.style.color = '#fff')}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-surface)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
        >
          {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
        </button>

        {/* Nav */}
        <nav style={{ flex: 1, padding: collapsed ? '10px 6px' : '12px 10px', overflowY: 'auto' }}>
          <SectionLabel label="Menu Utama" isCollapsed={collapsed} />
          {navItems.map(n => hasPermission(n.permission) && (
            <NavItem key={n.id} item={n} isCollapsed={collapsed} />
          ))}

          <SectionLabel label="Lainnya" isCollapsed={collapsed} />
          {otherItems.map(n => (n.permission ? hasPermission(n.permission) : true) && (
            <NavItem key={n.id} item={n} isCollapsed={collapsed} />
          ))}
        </nav>

        {/* Brand tag at bottom */}
        {!collapsed && (
          <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border-light)', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: '600' }}>
              Pointly POS
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ══════════════════════════════════════════
   *  MOBILE OVERLAY DRAWER (unchanged)
   * ══════════════════════════════════════════ */
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
            className="sidebar-teal open"
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
            <div style={{ background: 'var(--primary-brand)', padding: '56px 20px 24px', position: 'relative', overflow: 'hidden', color: '#fff', flexShrink: 0 }}>
              <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
              <button
                onClick={(e) => { e.stopPropagation(); onClose(); }}
                style={{ position: 'absolute', top: '12px', right: '12px', width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}
              >
                <X size={18} />
              </button>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', position: 'relative', zIndex: 2 }}>
                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '16px',
                  background: user?.logo_usaha ? '#fff' : 'rgba(255,255,255,0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  fontWeight: '800',
                  overflow: 'hidden'
                }}>
                  {user?.logo_usaha ? <SafeImage src={user.logo_usaha} style={{ width: "100%", height: "100%", objectFit: "contain", padding: 4 }} /> : (user?.nama_usaha?.substring(0, 1).toUpperCase() || 'U')}
                </div>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: '800', letterSpacing: '-0.3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {user?.name || 'User'}
                  </div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.65)', marginTop: '1px' }}>
                    {user?.role === 'admin' ? 'Owner' : 'Staff'} • Pointly POS
                  </div>
                </div>
              </div>
            </div>

            <nav style={{ flex: 1, padding: '12px' }}>
              <SectionLabel label="Menu Utama" isCollapsed={false} />
              {navItems.map(n => hasPermission(n.permission) && (
                <NavItem key={n.id} item={n} isCollapsed={false} />
              ))}
              <div style={{ height: '1px', background: 'var(--border-light)', margin: '8px 12px' }} />
              <SectionLabel label="Lainnya" isCollapsed={false} />
              {otherItems.map(n => (n.permission ? hasPermission(n.permission) : true) && (
                <NavItem key={n.id} item={n} isCollapsed={false} />
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
