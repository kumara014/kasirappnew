import React, { useState } from 'react';
import './OrderList.css';

const MOCK_ORDERS = [
    { id: '#907653', table: 'T1', items: 7, time: '20:30pm', price: '40.49', status: 'Dine-in', active: true },
    { id: '#907654', table: 'T2', items: 4, time: '20:35pm', price: '45.08', status: 'Dine-in', active: false },
    { id: '#907655', table: 'T3', items: 2, time: '20:40pm', price: '35.08', status: 'Dine-in', active: false },
    { id: '#907656', table: 'T4', items: 6, time: '20:45pm', price: '55.08', status: 'Dine-in', active: false },
];

const OrderList = ({ selectedId, onSelectOrder }) => {
    const [activeTab, setActiveTab] = useState('process');

    return (
        <div className="order-list-container">
            <div className="order-tabs">
                <button
                    className={`tab-btn ${activeTab === 'process' ? 'active' : ''}`}
                    onClick={() => setActiveTab('process')}
                >
                    On - process
                </button>
                <button
                    className={`tab-btn ${activeTab === 'completed' ? 'active' : ''}`}
                    onClick={() => setActiveTab('completed')}
                >
                    Completed
                </button>
            </div>

            <div className="orders-scroll-area">
                {MOCK_ORDERS.map((order) => (
                    <div
                        key={order.id}
                        className={`order-card ${selectedId === order.id ? 'selected' : ''}`}
                        onClick={() => onSelectOrder(order.id)}
                    >
                        <div className="card-header">
                            <span className="order-id">Orders : <strong>{order.id}</strong></span>
                            <span className="order-time">{order.time}</span>
                        </div>

                        <div className="card-details">
                            <div className="detail-row">
                                <span className="detail-label">Table : {order.table}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Qty : {order.items}</span>
                            </div>
                        </div>

                        <div className="card-footer">
                            <span className="price">${order.price}</span>
                            <span className="status-badge">{order.status}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OrderList;
