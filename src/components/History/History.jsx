import React, { useState } from 'react';
import './History.css';
import { Search, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { apiFetch } from '../../config';

const History = () => {
    const { ordersData, loadingOrders, refreshOrders } = useData();
    const [selectedOrder, setSelectedOrder] = useState(null); // For Receipt Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);

    // Calendar State
    const [currentDate, setCurrentDate] = useState(new Date()); // For viewing month
    const [selectedDate, setSelectedDate] = useState(null); // For filtering

    React.useEffect(() => {
        refreshOrders(true);
    }, [refreshOrders]);

    const orders = ordersData;

    // Filter Logic
    const filteredOrders = selectedDate
        ? orders.filter(order => {
            const orderDate = new Date(order.tanggal_transaksi || order.date);
            // Compare YYYY-MM-DD
            return orderDate.getDate() === selectedDate.getDate() &&
                orderDate.getMonth() === selectedDate.getMonth() &&
                orderDate.getFullYear() === selectedDate.getFullYear();
        })
        : orders;

    // Calendar Helpers
    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay(); // 0 = Sun

        // Adjust for Mon start (1) if needed. Let's stick to standard Sun=0 for now as header is usually Sun-Sat or Mon-Sun.
        // The current header is: Mo, Tu, We, Th, Fr, Sa, Su. 
        // This means Monday is index 0 visually.
        // default JS getDay: Sun=0, Mon=1...
        // We need Mon=0...Sun=6
        const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;

        const days = [];
        // Empty slots
        for (let i = 0; i < adjustedFirstDay; i++) days.push(null);
        // Days
        for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));

        return days;
    };

    const handlePrevMonth = (e) => {
        e.stopPropagation(); // Prevent closing if bubbling
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = (e) => {
        e.stopPropagation();
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const handleDateClick = (date) => {
        if (!date) return;
        // Toggle selection
        if (selectedDate && date.getTime() === selectedDate.getTime()) {
            setSelectedDate(null);
        } else {
            setSelectedDate(date);
        }
        setIsCalendarOpen(false); // Close calendar after select
    };

    const handleViewReceipt = (orderId) => {
        const cleanId = String(orderId).replace('#', '');
        apiFetch(`/transaksi/${cleanId}`)
            .then(res => res.json())
            .then(data => {
                if (data && data.details) {
                    setSelectedOrder(data);
                    setIsModalOpen(true);
                } else {
                    alert("Data struk tidak ditemukan atau belum lengkap.");
                }
            })
            .catch(err => {
                console.error("Receipt error:", err);
                alert("Gagal memuat struk: " + err.message);
            });
    };

    const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    const currentMonthName = monthNames[currentDate.getMonth()];
    const currentYear = currentDate.getFullYear();
    const calendarDays = getDaysInMonth(currentDate);

    return (
        <div className="history-container">
            <div className="history-content">
                <div className="history-header">
                    <div className="history-search-bar">
                        <Search size={18} color="#888" />
                        <input type="text" placeholder="Search Order Id" />
                    </div>

                    {/* Date Filter Button & Popup */}
                    <div style={{ position: 'relative' }}>
                        <button className="date-filter-btn" onClick={() => setIsCalendarOpen(!isCalendarOpen)}>
                            <CalendarIcon size={16} />
                            <span>
                                {selectedDate
                                    ? `${selectedDate.getDate()} ${monthNames[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`
                                    : `${currentMonthName} ${currentYear}`
                                }
                            </span>
                        </button>

                        {isCalendarOpen && (
                            <div className="calendar-popup">
                                <div className="calendar-header">
                                    <ChevronLeft size={16} style={{ cursor: 'pointer' }} onClick={handlePrevMonth} />
                                    <h4 style={{ margin: 0 }}>{currentMonthName} {currentYear}</h4>
                                    <ChevronRight size={16} style={{ cursor: 'pointer' }} onClick={handleNextMonth} />
                                </div>
                                <div className="calendar-grid">
                                    {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(d => (
                                        <div key={d} className="calendar-day-label">{d}</div>
                                    ))}

                                    {calendarDays.map((date, i) => {
                                        if (!date) return <div key={i} className="calendar-day empty"></div>;

                                        const isSelected = selectedDate &&
                                            date.getDate() === selectedDate.getDate() &&
                                            date.getMonth() === selectedDate.getMonth() &&
                                            date.getFullYear() === selectedDate.getFullYear();

                                        const isToday = new Date().toDateString() === date.toDateString();

                                        return (
                                            <div
                                                key={i}
                                                className={`calendar-day ${isSelected ? 'active' : ''} ${isToday && !isSelected ? 'today' : ''}`}
                                                onClick={() => handleDateClick(date)}
                                                style={isToday && !isSelected ? { border: '1px solid var(--primary-brand)', color: 'var(--primary-brand)' } : {}}
                                            >
                                                {date.getDate()}
                                            </div>
                                        );
                                    })}
                                </div>
                                <div style={{ textAlign: 'center', marginTop: 15 }}>
                                    <button
                                        style={{ background: 'none', border: 'none', color: '#888', fontSize: 12, cursor: 'pointer', textDecoration: 'underline' }}
                                        onClick={() => { setSelectedDate(null); setIsCalendarOpen(false); }}
                                    >
                                        Clear Filter
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="history-table-container">
                    <table className="history-table">
                        <thead>
                            <tr>
                                <th>Order Id</th>
                                <th>Date</th>
                                <th>Total</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.length === 0 ? <tr><td colSpan="4">No history found</td></tr> :
                                filteredOrders.map((row, index) => (
                                    <tr key={index}>
                                        <td style={{ fontWeight: 'bold' }}>{row.id_transaksi}</td>
                                        <td>{row.tanggal_transaksi ? new Date(row.tanggal_transaksi).toLocaleString('id-ID') : 'No Date'}</td>
                                        <td style={{ color: '#28C76F', fontWeight: 'bold' }}>
                                            Rp {Number(row.total_harga).toLocaleString()}
                                        </td>
                                        <td>
                                            <button className="view-receipt-btn" onClick={() => handleViewReceipt(row.id_transaksi)}>
                                                Lihat Struk
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Receipt Modal */}
            {isModalOpen && selectedOrder && (
                <div className="modal-overlay">
                    <div className="modal-content" id="printable-receipt" style={{ width: 380, fontFamily: 'Courier New', padding: '20px' }}>
                        <div style={{ textAlign: 'center', marginBottom: 15 }}>
                            <h4 style={{ margin: 0, fontSize: 18 }}>Smart Kasir</h4>
                            <p style={{ fontSize: 12, color: '#666' }}>Receipt Copy</p>
                        </div>
                        <div style={{ borderBottom: '1px dashed #ccc', marginBottom: 10 }}></div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 5 }}>
                            <span>No: #{selectedOrder.id_transaksi}</span>
                            <span>{new Date(selectedOrder.tanggal_transaksi || selectedOrder.date).toLocaleString('id-ID')}</span>
                        </div>

                        <div style={{ borderBottom: '1px dashed #ccc', marginBottom: 10 }}></div>

                        <div style={{ marginBottom: 15 }}>
                            {selectedOrder.details && selectedOrder.details.map((item, idx) => (
                                <div key={idx} style={{ marginBottom: 10 }}>
                                    <div style={{ fontSize: 14, fontWeight: 'bold' }}>{item.barang?.nama_barang}</div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#333', marginTop: 2 }}>
                                        <span>{item.qty} x {Number(item.harga).toLocaleString()}</span>
                                        <span>Rp {(item.qty * item.harga).toLocaleString()}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div style={{ borderTop: '1px dashed #ccc', paddingTop: 10 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                                <span>Subtotal</span>
                                <span>Rp {(Number(selectedOrder.total_harga) + Number(selectedOrder.diskon || 0)).toLocaleString()}</span>
                            </div>

                            {selectedOrder.diskon > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4, color: '#FF4D4F' }}>
                                    <span>Diskon</span>
                                    <span>- Rp {Number(selectedOrder.diskon).toLocaleString()}</span>
                                </div>
                            )}

                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: 16, marginTop: 5, borderTop: '1px solid #eee', paddingTop: 5 }}>
                                <span>TOTAL</span>
                                <span>Rp {Number(selectedOrder.total_harga).toLocaleString()}</span>
                            </div>
                        </div>

                        <div style={{ borderTop: '1px dashed #ccc', marginTop: 10, paddingTop: 10, fontSize: 13 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                <span>Metode Bayar</span>
                                <span style={{ textTransform: 'uppercase' }}>{selectedOrder.metode_pembayaran || 'Cash'}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                <span>Bayar</span>
                                <span>Rp {Number(selectedOrder.uang_bayar).toLocaleString()}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                                <span>Kembalian</span>
                                <span>Rp {Number(selectedOrder.kembalian).toLocaleString()}</span>
                            </div>
                        </div>

                        <div style={{ borderTop: '1px dashed #ccc', marginTop: 15, paddingTop: 10, textAlign: 'center', fontSize: 12, color: '#888' }}>
                            <p style={{ margin: 0 }}>Terima kasih atas kunjungan Anda</p>
                            <p style={{ margin: '4px 0 0 0' }}>Barang yang sudah dibeli tidak dapat ditukar</p>
                        </div>

                        <div className="modal-actions" style={{ marginTop: 20, display: 'flex', gap: 10, border: 'none', background: 'none', padding: 0 }}>
                            <button
                                style={{ flex: 1, padding: 12, border: 'none', background: '#333', color: '#fff', borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                                onClick={() => window.print()}
                            >
                                🖨️ Cetak
                            </button>
                            <button
                                style={{ flex: 1, padding: 12, border: '1px solid #ddd', background: '#fff', color: '#333', borderRadius: 10, cursor: 'pointer' }}
                                onClick={() => setIsModalOpen(false)}
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default History;
