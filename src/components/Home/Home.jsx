import React, { useState, useEffect } from 'react';
import './Home.css';
import { DollarSign, ShoppingBag, Users, ShoppingCart, Search, ArrowUp, ArrowDown } from 'lucide-react';
import { apiFetch } from '../../config';

const Home = () => {
    const [summary, setSummary] = useState({
        omzet_today: 0,
        sell_today: 0,
        trending: [],
        out_of_stock: [],
        chart_data: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiFetch('/dashboard')
            .then(res => res.json())
            .then(data => {
                setSummary(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching summary:", err);
                setLoading(false);
            });
    }, []);

    const todayDate = new Date().toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });

    return (
        <div className="home-container">
            <header className="dashboard-header">
                <div className="home-logo-section">
                    <img src="/logo pointly.png" alt="Logo" className="logo-img-large" />
                    <h1>Smart Kasir</h1>
                    <p>Sistem Kasir Pintar untuk Solusi Usaha Anda</p>
                </div>
                <div className="search-bar-header">
                    <Search size={18} color="var(--text-tertiary)" />
                    <input type="text" placeholder="Search category, menu or etc" />
                </div>
            </header>

            <div className="stats-grid">
                <StatCard
                    icon={<DollarSign size={24} />}
                    label="Total Omzet Today"
                    value={`Rp ${summary.omzet_today.toLocaleString()}`}
                    trend="+12%"
                    color="var(--status-orange)"
                    bgColor="var(--status-orange-light)"
                />
                <StatCard
                    icon={<ShoppingBag size={24} />}
                    label="Total Sell Today (Kasir)"
                    value={summary.sell_today}
                    trend="+5%"
                    color="var(--primary-brand)"
                    bgColor="var(--primary-light)"
                />
                <StatCard
                    icon={<Users size={24} />}
                    label="Dine in"
                    value="Mock Only"
                    trend="+0%"
                    color="var(--status-red)"
                    bgColor="var(--status-red-light)"
                    disabled
                />
                <StatCard
                    icon={<ShoppingCart size={24} />}
                    label="Take away"
                    value="Mock Only"
                    trend="+0%"
                    color="var(--status-orange)"
                    bgColor="var(--status-orange-light)"
                    disabled
                />
            </div>

            <div className="charts-row">
                <div className="chart-card main-chart">
                    <div className="chart-header">
                        <h3>Daily Sales Trend</h3>
                    </div>
                    <div style={{ height: 250, background: 'var(--bg-app-alt)', borderRadius: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--border-light)' }}>
                        {summary?.chart_data?.length > 0 ? (
                            <div style={{ width: '100%', padding: 20 }}>
                                {summary.chart_data.slice(-5).map((d, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 12 }}>
                                        <span>{d.date}</span>
                                        <div style={{ flex: 1, height: 10, background: 'var(--status-orange)', margin: '0 10px', borderRadius: 5, maxWidth: (d.total / 100000) * 100 + '%' }}></div>
                                        <span style={{ color: "var(--text-primary)" }}>Rp {Number(d.total).toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <span style={{ color: 'var(--text-tertiary)' }}>No data for chart yet</span>
                        )}
                    </div>
                </div>

                <div className="chart-card pie-chart-card">
                    <div className="chart-header">
                        <h3>Total Income Breakdown</h3>
                    </div>
                    <div className="pie-container">
                        <div style={{ height: 180, width: 180, borderRadius: '50%', border: '15px solid var(--status-orange)', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 0 10px rgba(0,0,0,0.05)' }}>
                            <div className="pie-center-text">
                                <h3 style={{ fontSize: 16, color: 'var(--text-primary)' }}>Rp {summary.omzet_today.toLocaleString()}</h3>
                                <p style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>Today</p>
                            </div>
                        </div>
                    </div>
                    <div className="pie-legend" style={{ marginTop: 20 }}>
                        <div className="legend-item"><span className="dot" style={{ background: 'var(--status-orange)' }}></span> Omzet</div>
                    </div>
                </div>
            </div>

            <div className="bottom-section">
                <div className="trending-section" style={{ flex: 2 }}>
                    <div className="section-header">
                        <h3>Trending Items</h3>
                    </div>
                    <div className="dish-list">
                        {summary?.trending?.length === 0 ? <p>No trending items yet</p> :
                            summary.trending.map((item, idx) => (
                                <DishItem key={idx} name={item.name} order={item.total_sold} image="🍲" />
                            ))
                        }
                    </div>
                </div>

                <div className="out-of-stock-section" style={{ flex: 1 }}>
                    <div className="section-header">
                        <h3>Out of Stock</h3>
                    </div>
                    <div className="dish-list">
                        {summary?.out_of_stock?.length === 0 ? <p>All items in stock</p> :
                            summary.out_of_stock.map((item, idx) => (
                                <DishItem key={idx} name={item.name} order="Out" image="❌" disabled />
                            ))
                        }
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ icon, label, value, trend, color, bgColor }) => (
    <div className="stat-card">
        <div className="stat-header">
            <div className="stat-icon-wrapper" style={{ color: color, backgroundColor: bgColor }}>
                {icon}
            </div>
            <span className="trend-badge" style={{ color: 'var(--primary-dark)' }}>{trend} <ArrowUp size={12} /></span>
        </div>
        <div className="stat-content">
            <h2>{value}</h2>
            <p>{label}</p>
        </div>
    </div>
);

const DishItem = ({ name, order, image, disabled }) => (
    <div className={`dish-item ${disabled ? 'disabled' : ''}`}>
        <div className="dish-img-bg">{image}</div>
        <div className="dish-info">
            <h4>{name}</h4>
            <p>{disabled ? 'Available : tomorrow' : `Order : ${order}`}</p>
        </div>
    </div>
);

export default Home;
