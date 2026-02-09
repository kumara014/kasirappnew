import React from 'react';
import './Dashboard.css';
import { DollarSign, ShoppingBag, Users, ShoppingCart, Search, ArrowUp, ArrowDown, Grid, Menu, Clock, PieChart } from 'lucide-react';
import { useData } from '../../context/DataContext';

const Dashboard = ({ onNavigate }) => {
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
                    <p className="date-text">{todayDate}</p>
                </div>
            </header>

            <section className="shortcuts-section">
                <div className="shortcut-grid">
                    <button className="shortcut-card" onClick={() => onNavigate('menu')}>
                        <div className="shortcut-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                            <Menu size={24} color="white" />
                        </div>
                        <span>Kelola Barang</span>
                    </button>
                    <button className="shortcut-card" onClick={() => onNavigate('order')}>
                        <div className="shortcut-icon" style={{ background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' }}>
                            <ShoppingCart size={24} color="white" />
                        </div>
                        <span>Kasir</span>
                    </button>
                    <button className="shortcut-card" onClick={() => onNavigate('history')}>
                        <div className="shortcut-icon" style={{ background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)' }}>
                            <Clock size={24} color="white" />
                        </div>
                        <span>Riwayat</span>
                    </button>
                    <button className="shortcut-card" onClick={() => onNavigate('report')}>
                        <div className="shortcut-icon" style={{ background: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)' }}>
                            <PieChart size={24} color="white" />
                        </div>
                        <span>Laporan</span>
                    </button>
                </div>
            </section>

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
