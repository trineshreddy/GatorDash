import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import './Cart.css';

function Cart({ onLogout, showToast }) {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);

    useEffect(() => {
        loadCart();
    }, []);

    const loadCart = () => {
        const saved = JSON.parse(localStorage.getItem('cart') || '[]');
        setCartItems(saved);
    };

    const updateQuantity = (id, delta) => {
        const updated = cartItems.map((item) => {
            if (item.id === id) {
                const newQty = (item.quantity || 1) + delta;
                return newQty > 0 ? { ...item, quantity: newQty } : null;
            }
            return item;
        }).filter(Boolean);
        setCartItems(updated);
        localStorage.setItem('cart', JSON.stringify(updated));
        window.dispatchEvent(new Event('cartUpdated'));
    };

    const removeItem = (id) => {
        const updated = cartItems.filter((item) => item.id !== id);
        setCartItems(updated);
        localStorage.setItem('cart', JSON.stringify(updated));
        window.dispatchEvent(new Event('cartUpdated'));
        if (showToast) showToast('Item removed from cart.', 'success');
    };

    const clearCart = () => {
        setCartItems([]);
        localStorage.removeItem('cart');
        window.dispatchEvent(new Event('cartUpdated'));
        if (showToast) showToast('Cart cleared.', 'success');
    };

    const parsePrice = (price) => {
        if (typeof price === 'number') return price;
        return parseFloat(String(price).replace('$', '')) || 0;
    };

    const getTotal = () => {
        return cartItems.reduce((sum, item) => {
            return sum + parsePrice(item.price) * (item.quantity || 1);
        }, 0).toFixed(2);
    };

    return (
        <div className="cart-page">
            <Navbar onSignOut={onLogout} />
            <div className="cart-container">
                <div className="cart-header">
                    <h2>Your Cart</h2>
                    <button className="back-btn" onClick={() => navigate('/foodstalls')}>
                        ← Back to Stalls
                    </button>
                </div>

                {cartItems.length === 0 ? (
                    <div className="cart-empty">
                        <p>Your cart is empty.</p>
                        <button className="browse-btn" onClick={() => navigate('/foodstalls')}>
                            Browse Restaurants
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="cart-items">
                            {cartItems.map((item) => (
                                <div className="cart-item-card" key={item.id}>
                                    <div className="cart-item-info">
                                        <h3 className="cart-item-name">{item.name}</h3>
                                        <p className="cart-item-desc">{item.desc}</p>
                                        <span className="cart-item-price">
                                            {typeof item.price === 'number' ? `$${item.price.toFixed(2)}` : item.price}
                                        </span>
                                    </div>
                                    <div className="cart-item-actions">
                                        <div className="qty-controls">
                                            <button className="qty-btn" onClick={() => updateQuantity(item.id, -1)}>−</button>
                                            <span className="qty-display">{item.quantity || 1}</span>
                                            <button className="qty-btn" onClick={() => updateQuantity(item.id, 1)}>+</button>
                                        </div>
                                        <button className="remove-btn" onClick={() => removeItem(item.id)}>Remove</button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="cart-summary">
                            <div className="cart-total">
                                <span>Total:</span>
                                <span className="total-amount">${getTotal()}</span>
                            </div>
                            <div className="cart-actions">
                                <button className="clear-cart-btn" onClick={clearCart}>Clear Cart</button>
                                <button className="checkout-btn" onClick={() => navigate('/order-summary')}>
                                    Proceed to Checkout
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default Cart;
