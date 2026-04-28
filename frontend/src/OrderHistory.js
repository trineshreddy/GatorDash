import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { getAuthHeaders } from './Navbar';
import './OrderHistory.css';

const MOCK_ORDERS = [
    {
        id: 1,
        order_number: 'GD-M1K2X-A1B2',
        status: 'Delivered',
        created_at: new Date(Date.now() - 86400000).toISOString(),
        total: 19.25,
        items: [
            { name: 'Iced Latte', quantity: 2, price: 4.50 },
            { name: 'Classic Burger', quantity: 1, price: 8.99 },
        ],
    },
    {
        id: 2,
        order_number: 'GD-N3P4Q-C3D4',
        status: 'Preparing',
        created_at: new Date(Date.now() - 3600000).toISOString(),
        total: 12.98,
        items: [
            { name: 'Margherita Pizza', quantity: 1, price: 9.99 },
            { name: 'Espresso', quantity: 1, price: 2.99 },
        ],
    },
    {
        id: 3,
        order_number: 'GD-R5S6T-E5F6',
        status: 'Cancelled',
        created_at: new Date(Date.now() - 172800000).toISOString(),
        total: 7.49,
        items: [
            { name: 'Caesar Salad', quantity: 1, price: 7.49 },
        ],
    },
];

function OrderHistory({ onLogout, showToast }) {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [reordering, setReordering] = useState(null);

    const getUser = () => {
        try { return JSON.parse(localStorage.getItem('user') || '{}'); }
        catch { return {}; }
    };

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        setError(null);
        const user = getUser();

        try {
            // Try GET /api/orders first (JWT-protected route)
            const res = await fetch('/api/orders', {
                headers: getAuthHeaders(),
            });

            if (res.status === 401) {
                // Session expired — clear and redirect
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                navigate('/signin');
                return;
            }

            if (res.ok) {
                const data = await res.json();
                if (data.success && Array.isArray(data.data) && data.data.length > 0) {
                    setOrders(data.data);
                    setLoading(false);
                    return;
                }
            }

            // Fallback: try user-scoped endpoint
            if (user.id) {
                const res2 = await fetch(`/api/orders/${user.id}`, {
                    headers: getAuthHeaders(),
                });
                if (res2.ok) {
                    const data2 = await res2.json();
                    if (data2.success && Array.isArray(data2.data) && data2.data.length > 0) {
                        setOrders(data2.data);
                        setLoading(false);
                        return;
                    }
                }
            }

            // API worked but returned empty — show empty state (not mock)
            setOrders([]);
        } catch (err) {
            console.warn('Orders API not available, using mock data:', err.message);
            // Only use mock data when backend is completely unreachable
            setOrders(MOCK_ORDERS);
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    // Auto-refresh every 30 seconds for live status updates
    useEffect(() => {
        const interval = setInterval(fetchOrders, 30000);
        return () => clearInterval(interval);
    }, [fetchOrders]);

    const handleReorder = async (order) => {
        if (!order.items || order.items.length === 0) return;
        setReordering(order.id);

        const user = getUser();

        try {
            // Try backend reorder endpoint first
            const res = await fetch(`/api/orders/${order.id}/reorder`, {
                method: 'POST',
                headers: getAuthHeaders(),
            });

            if (res.ok) {
                const data = await res.json();
                if (data.success) {
                    window.dispatchEvent(new Event('cartUpdated'));
                    if (showToast) showToast('Items added to cart!', 'success');
                    navigate('/cart');
                    return;
                }
            }
        } catch (err) {
            // Fall through to local cart
        }

        // Fallback: add items to localStorage cart manually
        const existing = JSON.parse(localStorage.getItem('cart') || '[]');
        order.items.forEach((item) => {
            const found = existing.find(c => c.name === item.name);
            if (found) {
                found.quantity = (found.quantity || 1) + item.quantity;
            } else {
                existing.push({
                    id: `reorder_${Date.now()}_${item.name}`,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                });
            }
        });
        localStorage.setItem('cart', JSON.stringify(existing));
        window.dispatchEvent(new Event('cartUpdated'));
        if (showToast) showToast('Items added to cart!', 'success');
        navigate('/cart');
        setReordering(null);
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
            hour: 'numeric', minute: '2-digit',
        });
    };

    const getStatusClass = (status) => {
        switch (status?.toLowerCase()) {
            case 'delivered': return 'status-delivered';
            case 'preparing': return 'status-preparing';
            case 'cancelled': return 'status-cancelled';
            case 'ready':     return 'status-ready';
            case 'placed':    return 'status-placed';
            default:          return 'status-pending';
        }
    };

    const toggleExpand = (orderId) => {
        setExpandedOrder(expandedOrder === orderId ? null : orderId);
    };

    if (loading) {
        return (
            <div className="history-page">
                <Navbar onSignOut={onLogout} />
                <div className="history-container">
                    <div className="history-loading">
                        <div className="loading-spinner"></div>
                        <p>Loading your orders...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="history-page">
                <Navbar onSignOut={onLogout} />
                <div className="history-container">
                    <div className="history-error">
                        <div className="error-icon">⚠️</div>
                        <h3>Something went wrong</h3>
                        <p>{error}</p>
                        <button className="retry-btn" onClick={fetchOrders}>Try Again</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="history-page">
            <Navbar onSignOut={onLogout} />
            <div className="history-container">
                <div className="history-header">
                    <h2>Order History</h2>
                    <button className="back-btn" onClick={() => navigate('/foodstalls')}>
                        ← Back to Restaurants
                    </button>
                </div>

                {orders.length === 0 ? (
                    <div className="history-empty">
                        <div className="empty-icon">📋</div>
                        <p className="empty-title">No orders yet</p>
                        <p className="empty-sub">
                            Your order history will appear here once you place an order.
                        </p>
                        <button className="browse-btn" onClick={() => navigate('/foodstalls')}>
                            Browse Restaurants
                        </button>
                    </div>
                ) : (
                    <div className="orders-list">
                        {orders.map((order) => (
                            <div
                                className={`order-card ${expandedOrder === order.id ? 'expanded' : ''}`}
                                key={order.id}
                            >
                                <div
                                    className="order-card-header"
                                    onClick={() => toggleExpand(order.id)}
                                >
                                    <div className="order-card-left">
                                        <span className="order-num">
                                            {order.order_number || `#${order.id}`}
                                        </span>
                                        <span className="order-date">
                                            {formatDate(order.created_at)}
                                        </span>
                                    </div>
                                    <div className="order-card-right">
                                        <span className={`order-status ${getStatusClass(order.status)}`}>
                                            {order.status}
                                        </span>
                                        <span className="order-total">
                                            ${(order.total || 0).toFixed(2)}
                                        </span>
                                        <span className="expand-icon">
                                            {expandedOrder === order.id ? '▲' : '▼'}
                                        </span>
                                    </div>
                                </div>

                                {expandedOrder === order.id && order.items && (
                                    <div className="order-card-details">
                                        <div className="order-items-list">
                                            {order.items.map((item, idx) => (
                                                <div className="order-detail-row" key={idx}>
                                                    <span className="detail-name">{item.name}</span>
                                                    <span className="detail-qty">×{item.quantity}</span>
                                                    <span className="detail-price">
                                                        ${(item.price * item.quantity).toFixed(2)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Order Again — shown for Delivered, Placed, Ready */}
                                        {['delivered', 'placed', 'ready'].includes(
                                            order.status?.toLowerCase()
                                        ) && (
                                            <button
                                                className="reorder-btn"
                                                onClick={() => handleReorder(order)}
                                                disabled={reordering === order.id}
                                            >
                                                {reordering === order.id
                                                    ? 'Adding to cart...'
                                                    : '🔁 Order Again'}
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default OrderHistory;