import React, { useState, useEffect } from 'react';
import './Report.css';
import { FileText, ShoppingBag, ArrowUp, DollarSign, TrendingUp, Printer } from 'lucide-react';
import { apiFetch } from '../../config';

const Report = () => {
    const [summaryData, setSummaryData] = useState({
        revenue: 0,
        orders: 0,
        omzet_today: 0,
        orders_today: 0,
        total_products: 0,
        trend: []
    });
    const [itemSalesData, setItemSalesData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [salesRes, itemsRes] = await Promise.all([
                apiFetch('/reports/sales'),
                apiFetch('/reports/items')
            ]);

            const salesData = await salesRes.json();
            const itemsData = await itemsRes.json();

            setSummaryData(salesData);
            setItemSalesData(Array.isArray(itemsData) ? itemsData : []);
        } catch (err) {
            console.error("Error fetching report data:", err);
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="report-container">
            <main className="report-content">
                <div className="report-header">
                    <h2>Laporan Penjualan</h2>
                    <div className="header-actions">
                        <button className="action-btn" onClick={handlePrint} style={{ background: '#333', color: 'white' }}>
                            <Printer size={14} /> Cetak Laporan
                        </button>
                        <button className="action-btn" onClick={fetchData}>
                            <ArrowUp size={14} style={{ transform: 'rotate(180deg)' }} /> Refresh
                        </button>
                    </div>
                </div>

                {/* Section 1: Sales Summary Stats */}
                <div className="report-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                    <div className="report-stat-card">
                        <div className="report-stat-info">
                            <h3>Total Pendapatan Hari ini</h3>
                            <h1>Rp {Number(summaryData.omzet_today || 0).toLocaleString()}</h1>
                            <span style={{ color: 'var(--primary-brand)', fontSize: '13px', fontWeight: '600' }}>
                                Today
                            </span>
                        </div>
                        <div className="stat-icon" style={{ background: 'var(--bg-primary-light)', color: 'var(--primary-brand)' }}>
                            <DollarSign size={24} />
                        </div>
                    </div>

                    <div className="report-stat-card">
                        <div className="report-stat-info">
                            <h3>Transaksi Hari Ini</h3>
                            <h1>{summaryData.orders_today || 0}</h1>
                            <span style={{ color: 'var(--primary-brand)', fontSize: '13px', fontWeight: '600' }}>
                                Today
                            </span>
                        </div>
                        <div className="stat-icon" style={{ background: 'var(--bg-primary-light)', color: 'var(--primary-brand)' }}>
                            <ShoppingBag size={24} />
                        </div>
                    </div>

                    <div className="report-stat-card">
                        <div className="report-stat-info">
                            <h3>Total Transaksi (All Time)</h3>
                            <h1>{Number(summaryData.orders || 0).toLocaleString()}</h1>
                            <span style={{ color: 'var(--primary-brand)', fontSize: '13px', fontWeight: '600' }}>
                                Cumulative
                            </span>
                        </div>
                        <div className="stat-icon" style={{ background: 'var(--bg-primary-light)', color: 'var(--primary-brand)' }}>
                            <ShoppingBag size={24} />
                        </div>
                    </div>

                    <div className="report-stat-card">
                        <div className="report-stat-info">
                            <h3>Total Produk Terjual</h3>
                            <h1>{Number(summaryData.total_items_sold || 0).toLocaleString()}</h1>
                            <span style={{ color: 'var(--primary-brand)', fontSize: '13px', fontWeight: '600' }}>
                                All Time
                            </span>
                        </div>
                        <div className="stat-icon" style={{ background: 'var(--bg-primary-light)', color: 'var(--primary-brand)' }}>
                            <ShoppingBag size={24} />
                        </div>
                    </div>

                    <div className="report-stat-card">
                        <div className="report-stat-info">
                            <h3>Total Pendapatan (All Time)</h3>
                            <h1>Rp {Number(summaryData.revenue || 0).toLocaleString()}</h1>
                            <span style={{ color: 'var(--primary-brand)', fontSize: '13px', fontWeight: '600' }}>
                                Cumulative
                            </span>
                        </div>
                        <div className="stat-icon" style={{ background: 'var(--bg-primary-light)', color: 'var(--primary-brand)' }}>
                            <DollarSign size={24} />
                        </div>
                    </div>

                    <div className="report-stat-card">
                        <div className="report-stat-info">
                            <h3>Total Barang</h3>
                            <h1>{summaryData.total_products || 0}</h1>
                            <span style={{ color: 'var(--primary-brand)', fontSize: '13px', fontWeight: '600' }}>
                                Inventory
                            </span>
                        </div>
                        <div className="stat-icon" style={{ background: 'var(--bg-primary-light)', color: 'var(--primary-brand)' }}>
                            <FileText size={24} />
                        </div>
                    </div>
                </div>

                {/* Section 2: Item Sales Ranking */}
                <div className="report-section">
                    <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                        <TrendingUp size={20} color="var(--primary-brand)" />
                        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>Ranking Penjualan Barang</h3>
                    </div>

                    <div className="item-sales-container">
                        <table className="report-table">
                            <thead>
                                <tr>
                                    <th>Rank</th>
                                    <th>Nama Barang</th>
                                    <th>Qty Terjual</th>
                                    <th>Total Pendapatan</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="4">Memuat data ranking...</td></tr>
                                ) : itemSalesData.length === 0 ? (
                                    <tr><td colSpan="4">Belum ada data penjualan barang</td></tr>
                                ) : (
                                    itemSalesData.map((item, index) => (
                                        <tr key={index}>
                                            <td style={{ fontWeight: 'bold', color: index < 3 ? 'var(--primary-brand)' : '#888' }}>
                                                #{index + 1}
                                            </td>
                                            <td style={{ fontWeight: '600' }}>{item.product_name}</td>
                                            <td>{item.total_qty}</td>
                                            <td style={{ color: 'var(--primary-brand)', fontWeight: '700' }}>
                                                Rp {Number(item.total_sales).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Section 3: Sales Trend */}
                <div className="sales-chart-container">
                    <div className="chart-title">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <TrendingUp size={18} color="var(--primary-brand)" />
                            <span>Trend Penjualan (30 Hari Terakhir)</span>
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px', fontWeight: '400' }}>
                            Dihitung berdasarkan total pendapatan harian (Rp)
                        </div>
                    </div>

                    {loading ? (
                        <div className="skeleton skeleton-box" style={{ flex: 1 }}></div>
                    ) : summaryData.trend && summaryData.trend.length > 0 ? (
                        <AreaChart data={summaryData.trend} />
                    ) : (
                        <div className="empty-chart">Belum ada data tren yang tersedia</div>
                    )}
                </div>
            </main>
        </div>
    );
};

const AreaChart = ({ data }) => {
    // Config
    const width = 1000;
    const height = 350;
    const padding = 40;

    if (!data || data.length === 0) return null;

    const maxVal = Math.max(...data.map(d => Number(d.total))) || 1000;
    const minVal = 0;

    // Scale points
    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * (width - padding * 2) + padding;
        // If maxVal is 0, all points are at the bottom
        const y = maxVal === 0
            ? height - padding
            : height - ((Number(d.total) - minVal) / (maxVal - minVal)) * (height - padding * 4) - padding * 2;
        return { x, y, label: d.date, value: d.total };
    });

    const pathData = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
    const areaData = `${pathData} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

    return (
        <div className="chart-wrapper">
            <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="trend-svg">
                <defs>
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--primary-brand)" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="var(--primary-brand)" stopOpacity="0" />
                    </linearGradient>
                </defs>

                {/* Grid Lines (Optional but helpful for depth) */}
                <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="var(--border-light)" strokeWidth="1" />

                {/* Area */}
                <path d={areaData} fill="url(#areaGradient)" />

                {/* Line */}
                <path d={pathData} fill="none" stroke="var(--primary-brand)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />

                {/* Dots & Labels */}
                {points.map((p, i) => (
                    <g key={i}>
                        {/* Dot - Only show significant dots or every 5 days on 30-day view to keep it clean */}
                        {(i % 5 === 0 || i === points.length - 1 || Number(p.value) > 0) && (
                            <circle cx={p.x} cy={p.y} r="5" fill="var(--bg-surface)" stroke="var(--primary-brand)" strokeWidth="3" />
                        )}

                        {/* Date Label (Bottom) - Only show every 5 days or first/last to avoid overlap */}
                        {(i % 5 === 0 || i === points.length - 1) && (
                            <text x={p.x} y={height - 2} textAnchor="middle" fontSize="11" fill="var(--text-secondary)" fontWeight="500">
                                {new Date(p.label).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                            </text>
                        )}

                        {/* Value Tooltip (Top) */}
                        {Number(p.value) > 0 && (i % 2 === 0 || i === points.length - 1) && (
                            <g>
                                <rect
                                    x={p.x - (p.value > 1000000 ? 30 : 25)}
                                    y={p.y - 35}
                                    width={p.value > 1000000 ? 60 : 50}
                                    height="22"
                                    rx="6"
                                    fill="var(--primary-brand)"
                                />
                                <text x={p.x} y={p.y - 19} textAnchor="middle" fontSize="11" fontWeight="700" fill="white">
                                    {Number(p.value) >= 1000000
                                        ? (Number(p.value) / 1000000).toFixed(1) + 'M'
                                        : Number(p.value) >= 1000
                                            ? (Number(p.value) / 1000).toFixed(0) + 'k'
                                            : p.value}
                                </text>
                                <path d={`M ${p.x - 5} ${p.y - 13} L ${p.x} ${p.y - 8} L ${p.x + 5} ${p.y - 13}`} fill="var(--primary-brand)" />
                            </g>
                        )}
                    </g>
                ))}
            </svg>
        </div>
    );
};

export default Report;
