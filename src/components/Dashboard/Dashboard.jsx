import React from 'react';
import './Dashboard.css';
import { DollarSign, ShoppingBag, Users, ShoppingCart, Search, ArrowUp, ArrowDown, Grid } from 'lucide-react';
import { useData } from '../../context/DataContext';
import API_BASE_URL from '../../config';

const Dashboard = () => {
    const { dashboardData, loadingDashboard, refreshDashboard } = useData();

    // Still fetch in background on mount to keep data fresh, 
    // but we don't block the UI if dashboardData already exists.
    React.useEffect(() => {
        refreshDashboard(true); // silent refresh if data exists
    }, [refreshDashboard]);

    const summary = dashboardData || {
        omzet_today: 0,
        sell_today: 0,
        trending: [],
        out_of_stock: [],
        chart_data: []
    };

    const todayDate = new Date().toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });

    if (loadingDashboard && !dashboardData) {
        return (
            <div className="dashboard-container">
                <div className="skeleton-dashboard">
                    <div className="stats-grid">
                        {[1, 2, 3, 4].map(i => <div key={i} className="stat-card skeleton skeleton-box"></div>)}
                    </div>
                    <div className="charts-row">
                        <div className="chart-card skeleton skeleton-box" style={{ height: 300 }}></div>
                        <div className="chart-card skeleton skeleton-box" style={{ height: 300 }}></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div>
                    <h1>Dashboard</h1>
                    <p className="date-text">{todayDate}</p>
                </div>
            </header>

            <div className="stats-grid">
                <StatCard
                    icon={<DollarSign size={24} />}
                    label="Omzet Hari Ini"
                    value={`Rp ${summary.omzet_today.toLocaleString()}`}
                    trend="+12%"
                    color="var(--primary-brand)"
                    bgColor="var(--bg-primary-light)"
                />
                <StatCard
                    icon={<ShoppingBag size={24} />}
                    label="Total Order"
                    value={summary.sell_today}
                    trend="+5%"
                    color="var(--primary-brand)"
                    bgColor="var(--bg-primary-light)"
                />
                <StatCard
                    icon={<Users size={24} />}
                    label="Total Pendapatan"
                    value={`Rp ${Number(summary.omzet_today || 0).toLocaleString()}`}
                    trend="+2%"
                    color="var(--primary-brand)"
                    bgColor="var(--bg-primary-light)"
                />
                <StatCard
                    icon={<Grid size={24} />}
                    label="Total Barang"
                    value={summary.total_products}
                    trend="Live"
                    color="var(--primary-brand)"
                    bgColor="var(--bg-primary-light)"
                />
            </div>

            <div className="charts-row">
                <div className="chart-card main-chart">
                    <div className="chart-header">
                        <h3>Tren Penjualan Harian</h3>
                    </div>
                    <div className="chart-placeholder">
                        {summary.chart_data.length > 0 ? (
                            <div className="simple-bar-chart">
                                {summary.chart_data.slice(-5).map((d, i) => (
                                    <div key={i} className="bar-row">
                                        <span className="bar-label">{d.date.split('-').slice(1).join('/')}</span>
                                        <div className="bar-bg">
                                            <div className="bar-fill" style={{ width: Math.min(100, (d.total / 100000) * 100) + '%' }}></div>
                                        </div>
                                        <span className="bar-value">Rp {Number(d.total).toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <span className="empty-msg">No data for chart yet</span>
                        )}
                    </div>
                </div>

                <div className="chart-card pie-chart-card">
                    <div className="chart-header">
                        <h3>Ringkasan Pendapatan</h3>
                    </div>
                    <div className="pie-container">
                        <div className="pie-visual">
                            <div className="pie-center-text">
                                <h3>Rp {summary.omzet_today.toLocaleString()}</h3>
                                <p>Today</p>
                            </div>
                        </div>
                    </div>
                    <div className="pie-legend">
                        <div className="legend-item"><span className="dot" style={{ background: 'var(--primary-brand)' }}></span> Omzet</div>
                    </div>
                </div>
            </div>

            <div className="bottom-section">
                <div className="out-of-stock-section">
                    <div className="section-header">
                        <h3>Notifikasi Stok</h3>
                    </div>
                    <div className="dish-list">
                        {summary.out_of_stock.length === 0 ? <p className="empty-msg">Full stock!</p> :
                            summary.out_of_stock.map((item, idx) => (
                                <DishItem
                                    key={idx}
                                    name={item.name}
                                    stock={item.stock}
                                    isStockAlert
                                />
                            ))
                        }
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ icon, label, value, trend, color, bgColor, disabled }) => (
    <div className={`stat-card ${disabled ? 'disabled' : ''}`}>
        <div className="stat-header">
            <div className="stat-icon-wrapper" style={{ color: color, backgroundColor: bgColor }}>
                {icon}
            </div>
            <span className="trend-badge" style={{ color: '#28C76F' }}>{trend} <ArrowUp size={12} /></span>
        </div>
        <div className="stat-content">
            <h2>{value}</h2>
            <p>{label}</p>
        </div>
    </div>
);

const DishItem = ({ name, order, stock, isStockAlert }) => {
    const isOutOfStock = stock <= 0;

    return (
        <div className={`dish-item ${isStockAlert && isOutOfStock ? 'disabled' : ''}`}>
            <div className="dish-info">
                <h4>{name}</h4>
                {isStockAlert ? (
                    <p style={{ color: isOutOfStock ? '#FF6B6B' : '#FFC107', fontWeight: 600 }}>
                        {isOutOfStock ? 'Stok Habis' : 'Restock Segera'}
                    </p>
                ) : (
                    <p>Sold : {order}</p>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
