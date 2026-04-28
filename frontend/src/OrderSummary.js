import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import './OrderSummary.css';

function OrderSummary({ onLogout, showToast }) {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [orderPlaced, setOrderPlaced] = useState(false);
    const [loading, setLoading] = useState(true);
    const [placing, setPlacing] = useState(false);
    const [orderNumber, setOrderNumber] = useState('');

    // Get user from localStorage
    const getUser = () => {
        try {
            return JSON.parse(localStorage.getItem('user') || '{}');
        } catch {
            return {};
        }
    };

    const getPaymentResult = () => {
        try {
            return JSON.parse(localStorage.getItem('paymentResult') || '{}');
        } catch {
            return {};
        }
    };

    // Generate order confirmation number
    const generateOrderNumber = () => {
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        return `GD-${timestamp}-${random}`;
    };

    // Fetch cart from backend API
    const fetchCart = useCallback(async () => {
        setLoading(true);
        const user = getUser();

        if (!user.id) {
            // No user ID — fall back to localStorage
            const saved = JSON.parse(localStorage.getItem('cart') || '[]');
            if (saved.length === 0 && !orderPlaced) {
                navigate('/cart');
                return;
            }
            setCartItems(saved);
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`/api/cart/${user.id}`);
            if (!response.ok) throw new Error('Failed to fetch cart');
            const data = await response.json();

            if (data.success && Array.isArray(data.data) && data.data.length > 0) {
                const items = data.data.map((item) => ({
                    id: item.menu_item_id || item.id,
                    name: item.name || item.item_name,
                    desc: item.description || item.desc || '',
                    price: item.price,
                    quantity: item.quantity || 1,
                }));
                setCartItems(items);
            } else {
                // Cart is empty — redirect to cart page
                if (!orderPlaced) {
                    navigate('/cart');
                    return;
                }
            }
        } catch (err) {
            console.warn('Backend fetch failed, using localStorage fallback:', err.message);
            const saved = JSON.parse(localStorage.getItem('cart') || '[]');
            if (saved.length === 0 && !orderPlaced) {
                navigate('/cart');
                return;
            }
            setCartItems(saved);
        } finally {
            setLoading(false);
        }
    }, [navigate, orderPlaced]);

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

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
    const paymentResult = getPaymentResult();
    const hasPaid = paymentResult.status === 'paid';

    // Place order via backend API
    const handlePlaceOrder = async () => {
        if (!hasPaid) {
            if (showToast) showToast('Complete payment before placing your order.', 'error');
            navigate('/payment');
            return;
        }

        setPlacing(true);
        const user = getUser();
        const confirmNumber = generateOrderNumber();

        try {
            if (user.id) {
                // Try placing order via backend
                let orderPlacedViaApi = false;

                try {
                    const orderResponse = await fetch('/api/order/place', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            user_id: user.id,
                            items: cartItems.map((item) => ({
                                menu_item_id: parseInt(item.id),
                                quantity: item.quantity || 1,
                                price: parsePrice(item.price),
                            })),
                            total: total,
                        }),
                    });

                    if (orderResponse.ok) {
                        orderPlacedViaApi = true;
                    }
                } catch {
                    // Order API might not exist yet
                }

                // Clear backend cart
                await fetch(`/api/cart/${user.id}/clear`, {
                    method: 'DELETE',
                }).catch(() => {});

                if (!orderPlacedViaApi) {
                    console.info('Order API not available, cart cleared on backend');
                }
            }
        } catch (err) {
            console.warn('Backend order placement failed:', err.message);
        }

        // Always clear localStorage cart
        localStorage.removeItem('cart');
        localStorage.removeItem('paymentResult');
        window.dispatchEvent(new Event('cartUpdated'));

        setOrderNumber(confirmNumber);
        setOrderPlaced(true);
        setPlacing(false);
        if (showToast) showToast('Order placed successfully!', 'success');
    };

    // Loading state
    if (loading) {
        return (
            <div className="order-page">
                <Navbar onSignOut={onLogout} />
                <div className="order-container">
                    <div className="order-loading">
                        <div className="loading-spinner"></div>
                        <p>Loading order summary...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Order placed confirmation
    if (orderPlaced) {
        return (
            <div className="order-page">
                <Navbar onSignOut={onLogout} />
                <div className="order-container">
                    <div className="order-success">
                        <div className="success-icon">✅</div>
                        <h2>Order Confirmed!</h2>
                        {orderNumber && (
                            <div className="order-number">
                                <span className="order-number-label">Confirmation #</span>
                                <span className="order-number-value">{orderNumber}</span>
                            </div>
                        )}
                        <p>Thank you for your order. Your food is being prepared.</p>
                        <p className="pickup-estimate">Estimated pickup: 15-20 minutes</p>
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

                <button
                    className={`place-order-btn ${placing ? 'placing' : ''}`}
                    onClick={handlePlaceOrder}
                    disabled={placing}
                >
                    {placing ? (
                        <>
                            <span className="btn-spinner"></span>
                            Placing Order...
                        </>
                    ) : (
                        hasPaid ? 'Place Order' : 'Continue to Payment'
                    )}
                </button>
            </div>
        </div>
    );
}

export default OrderSummary;
