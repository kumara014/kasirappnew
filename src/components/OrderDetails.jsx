import React from 'react';
import { Banknote, CreditCard, Wallet } from 'lucide-react';
import './OrderDetails.css';

const MOCK_ITEMS = [
    { name: 'Orange Juice', note: 'Note : Less Ice', price: 2.87, qty: 4, total: 11.48, image: '🍹' },
    { name: 'American Favorite', note: 'Crust : Stuffed Crust Sosis\nExtras : Extra Mozzarella', price: 4.87, qty: 1, total: 4.87, image: '🍕' },
    { name: 'Super Supreme', note: 'Crust : Stuffed Crust Cheese', price: 5.75, qty: 1, total: 5.75, image: '🍕' },
    { name: 'Favorite Cheese', note: 'Crust : Stuffed Crust Sosis', price: 6.57, qty: 1, total: 6.57, image: '🍕' },
];

const OrderDetails = ({ orderId }) => {
    return (
        <div className="order-details-container">
            <div className="details-header">
                <div className="header-left">
                    <span className="label">Orders ID</span>
                    <h2 className="header-id">{orderId}</h2>
                </div>
                <div className="header-right">
                    <span className="label">Table</span>
                    <h2 className="header-table">T1</h2>
                </div>
            </div>

            <div className="items-list">
                {MOCK_ITEMS.map((item, index) => (
                    <div key={index} className="order-item">
                        <div className="item-image">{item.image}</div>
                        <div className="item-info">
                            <h4 className="item-name">{item.name}</h4>
                            <p className="item-note">{item.note}</p>
                            <div className="item-pricing">
                                <span className="unit-price">${item.price}</span>
                                <span className="qty">x {item.qty}</span>
                            </div>
                        </div>
                        <div className="item-total">
                            ${item.total}
                        </div>
                    </div>
                ))}
            </div>

            <div className="payment-section">
                <div className="summary-row">
                    <span>Items(7)</span>
                    <span>$28.67</span>
                </div>
                <div className="summary-row">
                    <span>Tax (10%)</span>
                    <span>$2.86</span>
                </div>

                <div className="total-row">
                    <span>Total</span>
                    <span>$31.53</span>
                </div>

                <h4 className="payment-title">Payment Methods</h4>
                <div className="payment-methods">
                    <button className="method-btn">
                        <Banknote size={18} />
                        <span>Cash</span>
                    </button>
                    <button className="method-btn active">
                        <CreditCard size={18} />
                        <span>Debit Card</span>
                    </button>
                    <button className="method-btn">
                        <Wallet size={18} />
                        <span>E-Wallet</span>
                    </button>
                </div>

                <button className="pay-button">
                    Pay Bills
                </button>
            </div>
        </div>
    );
};

export default OrderDetails;
