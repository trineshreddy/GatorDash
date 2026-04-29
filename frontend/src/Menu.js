import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { stalls as fallbackStalls, menus as fallbackMenus } from './data';
import Navbar from './Navbar';
import { getAuthHeaders } from './Navbar';
import './Menu.css';

function Menu({ onLogout, showToast }) {
    const { stallId } = useParams();
    const navigate = useNavigate();

    const [stall, setStall] = useState(null);
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [quantities, setQuantities] = useState({});

    useEffect(() => {
        const fetchMenu = async () => {
            setLoading(true);
            try {
                const response = await fetch(`/api/foodstalls/${stallId}/menu`, {
                    headers: getAuthHeaders(),
                });

                if (response.status === 401) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    navigate('/signin');
                    return;
                }

                if (!response.ok) throw new Error('API error');
                const data = await response.json();

                if (data.success && data.data) {
                    setMenuItems(data.data);
                    // Also fetch stall info
                    const stallRes = await fetch('/api/foodstalls', {
                        headers: getAuthHeaders(),
                    });
                    const stallData = await stallRes.json();
                    if (stallData.success) {
                        const found = stallData.data.find(s => String(s.id) === String(stallId));
                        setStall(found || fallbackStalls[stallId]);
                    }
                } else {
                    throw new Error('Bad response');
                }
            } catch (err) {
                // Fall back to hardcoded data
                setStall(fallbackStalls[stallId]);
                setMenuItems(fallbackMenus[stallId] || []);
            } finally {
                setLoading(false);
            }
        };
        fetchMenu();
    }, [stallId, navigate]);

    const increment = (itemId) => {
        setQuantities(prev => ({ ...prev, [itemId]: (prev[itemId] || 0) + 1 }));
    };

    const decrement = (itemId) => {
        setQuantities(prev => ({ ...prev, [itemId]: Math.max(0, (prev[itemId] || 0) - 1) }));
    };

    const addToCart = async (item) => {
        const qty = quantities[item.id] || 0;
        if (qty === 0) return;

        const user = JSON.parse(localStorage.getItem('user') || '{}');

        // Update localStorage immediately for instant badge update
        const existing = JSON.parse(localStorage.getItem('cart') || '[]');
        const found = existing.find((i) => i.id === item.id);
        if (found) {
            found.quantity = (found.quantity || 0) + qty;
        } else {
            existing.push({ ...item, quantity: qty });
        }
        localStorage.setItem('cart', JSON.stringify(existing));
        window.dispatchEvent(new Event('cartUpdated'));

        // Call backend API with JWT headers
        try {
            const response = await fetch('/api/cart/add', {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    user_id: user.id,
                    menu_item_id: item.id,
                    quantity: qty,
                }),
            });

            if (response.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                navigate('/signin');
                return;
            }
        } catch (err) {
            // localStorage already updated so app still works
        }

        if (showToast) showToast(`${item.name} added to cart!`, 'success');
        setQuantities(prev => ({ ...prev, [item.id]: 0 }));
    };

    const getPriceNumber = (price) => {
        if (typeof price === 'number') return price;
        return parseFloat(String(price).replace('$', '')) || 0;
    };

    if (!loading && !stall) {
        return (
            <div className="menu-page">
                <Navbar onSignOut={onLogout} />
                <div className="menu-container" style={{ textAlign: 'center', marginTop: '100px', color: 'white' }}>
                    <h2>Restaurant not found</h2>
                    <button className="back-btn" onClick={() => navigate('/foodstalls')} style={{ marginTop: '20px' }}>
                        ← Back to Stalls
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="menu-page">
            <Navbar onSignOut={onLogout} />
            <div className="menu-container">
                <div className="menu-header">
                    <h2>{stall ? `${stall.name} Menu` : 'Menu'}</h2>
                    <button className="back-btn" onClick={() => navigate('/foodstalls')}>
                        ← Back to Stalls
                    </button>
                </div>

                {loading && (
                    <div className="menu-loading">
                        <div className="spinner" />
                        <p>Loading menu...</p>
                    </div>
                )}

                {!loading && (
                    <div className="menu-grid">
                        {menuItems.length === 0 ? (
                            <p style={{ color: 'white' }}>No items available for this restaurant.</p>
                        ) : (
                            menuItems.map((item) => {
                                const qty = quantities[item.id] || 0;
                                const priceNum = getPriceNumber(item.price);
                                return (
                                    <div className="menu-item-card" key={item.id}>
                                        <div className="item-info">
                                            <h3 className="item-name">{item.name}</h3>
                                            <p className="item-desc">{item.desc || item.description}</p>
                                            <div className="item-price-row">
                                                <span className="item-price">
                                                    {typeof item.price === 'string'
                                                        ? item.price
                                                        : `$${priceNum.toFixed(2)}`}
                                                </span>
                                                {qty > 0 && (
                                                    <span className="item-subtotal">
                                                        Total: ${(priceNum * qty).toFixed(2)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="item-controls">
                                            <div className="quantity-selector">
                                                <button
                                                    className="qty-btn"
                                                    onClick={() => decrement(item.id)}
                                                    disabled={qty === 0}
                                                >−</button>
                                                <span className="qty-display">{qty}</span>
                                                <button
                                                    className="qty-btn"
                                                    onClick={() => increment(item.id)}
                                                >+</button>
                                            </div>
                                            {qty > 0 && (
                                                <button
                                                    className="add-to-cart-btn"
                                                    onClick={() => addToCart(item)}
                                                >
                                                    Add to Cart
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Menu;