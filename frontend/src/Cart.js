import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import './Cart.css';

function Cart({ onLogout, showToast }) {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Get user_id from localStorage
    const getUser = () => {
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            return user;
        } catch {
            return {};
        }
    };

    // Sync cart to localStorage so Navbar badge stays updated instantly
    const syncToLocalStorage = (items) => {
        localStorage.setItem('cart', JSON.stringify(items));
        window.dispatchEvent(new Event('cartUpdated'));
    };

    // Fetch cart from backend API
    const fetchCart = useCallback(async () => {
        setLoading(true);
        setError(null);
        const user = getUser();

        if (!user.id) {
            // No user ID — fall back to localStorage
            const saved = JSON.parse(localStorage.getItem('cart') || '[]');
            setCartItems(saved);
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`/api/cart/${user.id}`);
            if (!response.ok) throw new Error('Failed to fetch cart');
            const data = await response.json();

            if (data.success && Array.isArray(data.data)) {
                const items = data.data.map((item) => ({
                    id: item.menu_item_id || item.id,
                    name: item.name || item.item_name,
                    desc: item.description || item.desc || '',
                    price: item.price,
                    quantity: item.quantity || 1,
                    cart_id: item.cart_id || item.ID,
                }));
                setCartItems(items);
                syncToLocalStorage(items);
            } else {
                // API returned empty or unexpected format
                setCartItems([]);
                syncToLocalStorage([]);
            }
        } catch (err) {
            console.warn('Backend cart fetch failed, using localStorage fallback:', err.message);
            // Fall back to localStorage
            const saved = JSON.parse(localStorage.getItem('cart') || '[]');
            setCartItems(saved);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    // Update item quantity via backend API
    const updateQuantity = async (itemId, delta) => {
        const item = cartItems.find((i) => i.id === itemId);
        if (!item) return;

        const newQty = (item.quantity || 1) + delta;
        const user = getUser();

        if (newQty <= 0) {
            // Remove item if quantity drops to 0
            removeItem(itemId);
            return;
        }

        // Optimistic update
        const updated = cartItems.map((i) =>
            i.id === itemId ? { ...i, quantity: newQty } : i
        );
        setCartItems(updated);
        syncToLocalStorage(updated);

        if (user.id) {
            try {
                // Try PUT update first
                let response = await fetch(`/api/cart/${user.id}/item/${itemId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ quantity: newQty }),
                });

                if (!response.ok) {
                    // If PUT doesn't exist, try re-adding with POST
                    response = await fetch('/api/cart/add', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            user_id: user.id,
                            menu_item_id: parseInt(itemId),
                            quantity: newQty,
                        }),
                    });
                }

                if (!response.ok) {
                    console.warn('Failed to update cart on backend');
                }
            } catch (err) {
                console.warn('Backend update failed, localStorage updated:', err.message);
            }
        }
    };

    // Remove a single item via backend API
    const removeItem = async (itemId) => {
        const updated = cartItems.filter((i) => i.id !== itemId);
        setCartItems(updated);
        syncToLocalStorage(updated);
        if (showToast) showToast('Item removed from cart.', 'success');

        const user = getUser();
        if (user.id) {
            try {
                const response = await fetch(`/api/cart/${user.id}/item/${itemId}`, {
                    method: 'DELETE',
                });
                if (!response.ok) {
                    console.warn('Failed to remove item from backend cart');
                }
            } catch (err) {
                console.warn('Backend delete failed:', err.message);
            }
        }
    };

    // Clear all items via backend API
    const clearCart = async () => {
        setCartItems([]);
        localStorage.removeItem('cart');
        window.dispatchEvent(new Event('cartUpdated'));
        if (showToast) showToast('Cart cleared.', 'success');

        const user = getUser();
        if (user.id) {
            try {
                const response = await fetch(`/api/cart/${user.id}/clear`, {
                    method: 'DELETE',
                });
                if (!response.ok) {
                    console.warn('Failed to clear backend cart');
                }
            } catch (err) {
                console.warn('Backend clear failed:', err.message);
            }
        }
    };

    const parsePrice = (price) => {
        if (typeof price === 'number') return price;
        return parseFloat(String(price).replace('$', '')) || 0;
    };

    const getTotal = () => {
        return cartItems
            .reduce((sum, item) => {
                return sum + parsePrice(item.price) * (item.quantity || 1);
            }, 0)
            .toFixed(2);
    };

    // Loading state
    if (loading) {
        return (
            <div className="cart-page">
                <Navbar onSignOut={onLogout} />
                <div className="cart-container">
                    <div className="cart-loading">
                        <div className="loading-spinner"></div>
                        <p>Loading your cart...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="cart-page">
                <Navbar onSignOut={onLogout} />
                <div className="cart-container">
                    <div className="cart-error">
                        <div className="error-icon">⚠️</div>
                        <h3>Something went wrong</h3>
                        <p>{error}</p>
                        <button className="retry-btn" onClick={fetchCart}>
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

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
                        <div className="empty-cart-icon">🛒</div>
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
                                            {typeof item.price === 'number'
                                                ? `$${item.price.toFixed(2)}`
                                                : item.price}
                                        </span>
                                    </div>
                                    <div className="cart-item-actions">
                                        <div className="qty-controls">
                                            <button
                                                className="qty-btn"
                                                onClick={() => updateQuantity(item.id, -1)}
                                            >
                                                −
                                            </button>
                                            <span className="qty-display">{item.quantity || 1}</span>
                                            <button
                                                className="qty-btn"
                                                onClick={() => updateQuantity(item.id, 1)}
                                            >
                                                +
                                            </button>
                                        </div>
                                        <span className="item-line-total">
                                            ${(parsePrice(item.price) * (item.quantity || 1)).toFixed(2)}
                                        </span>
                                        <button className="remove-btn" onClick={() => removeItem(item.id)}>
                                            Remove
                                        </button>
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
                                <button className="clear-cart-btn" onClick={clearCart}>
                                    Clear Cart
                                </button>
                                <button
                                    className="checkout-btn"
                                    onClick={() => navigate('/order-summary')}
                                >
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
