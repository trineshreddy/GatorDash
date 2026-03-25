import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import './OrderSummary.css';

function OrderSummary({ onLogout, showToast }) {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [orderPlaced, setOrderPlaced] = useState(false);

    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem('cart') || '[]');
        if (saved.length === 0 && !orderPlaced) {
            navigate('/cart');
        }
        setCartItems(saved);
    }, [navigate, orderPlaced]);

    const parsePrice = (price) => {
        if (typeof price === 'number') return price;
        return parseFloat(String(price).replace('$', '')) || 0;
    };

    const getSubtotal = () => {
        return cartItems.reduce((sum, item) => {
            return sum + parsePrice(item.price) * (item.quantity || 1);
        }, 0);
    };

    const TAX_RATE = 0.07;
    const subtotal = getSubtotal();
    const tax = subtotal * TAX_RATE;
    const total = subtotal + tax;

    const handlePlaceOrder = () => {
        localStorage.removeItem('cart');
        window.dispatchEvent(new Event('cartUpdated'));
        setOrderPlaced(true);
        if (showToast) showToast('Order placed successfully!', 'success');
    };

    if (orderPlaced) {
        return (
            <div className="order-page">
                <Navbar onSignOut={onLogout} />
                <div className="order-container">
                    <div className="order-success">
                        <div className="success-icon">✅</div>
                        <h2>Order Confirmed!</h2>
                        <p>Thank you for your order. Your food is being prepared.</p>
                        <button className="back-home-btn" onClick={() => navigate('/foodstalls')}>
                            Back to Restaurants
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="order-page">
            <Navbar onSignOut={onLogout} />
            <div className="order-container">
                <div className="order-header">
                    <h2>Order Summary</h2>
                    <button className="back-btn" onClick={() => navigate('/cart')}>
                        ← Back to Cart
                    </button>
                </div>

                <div className="order-items">
                    <div className="order-items-header">
                        <span>Item</span>
                        <span>Qty</span>
                        <span>Price</span>
                    </div>
                    {cartItems.map((item) => (
                        <div className="order-item-row" key={item.id}>
                            <span className="order-item-name">{item.name}</span>
                            <span className="order-item-qty">×{item.quantity || 1}</span>
                            <span className="order-item-total">
                                ${(parsePrice(item.price) * (item.quantity || 1)).toFixed(2)}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="order-totals">
                    <div className="order-row">
                        <span>Subtotal</span>
                        <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="order-row">
                        <span>Tax (7%)</span>
                        <span>${tax.toFixed(2)}</span>
                    </div>
                    <div className="order-row order-grand-total">
                        <span>Total</span>
                        <span>${total.toFixed(2)}</span>
                    </div>
                </div>

                <button className="place-order-btn" onClick={handlePlaceOrder}>
                    Place Order
                </button>
            </div>
        </div>
    );
}

export default OrderSummary;
