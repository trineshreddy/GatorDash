import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { stalls, menus } from './data';
import Navbar from './Navbar';
import './Menu.css';

function Menu({ onLogout, showToast }) {
    const { stallId } = useParams();
    const navigate = useNavigate();
    const stall = stalls[stallId];
    const stallMenu = menus[stallId] || [];

    const addToCart = (item) => {
        const existing = JSON.parse(localStorage.getItem('cart') || '[]');
        const found = existing.find((i) => i.id === item.id);
        if (found) {
            found.quantity = (found.quantity || 1) + 1;
        } else {
            existing.push({ ...item, quantity: 1 });
        }
        localStorage.setItem('cart', JSON.stringify(existing));
        window.dispatchEvent(new Event('cartUpdated'));
        if (showToast) showToast(`${item.name} added to cart!`, 'success');
    };

    if (!stall) {
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
                    <h2>{stall.name} Menu</h2>
                    <button className="back-btn" onClick={() => navigate('/foodstalls')}>← Back to Stalls</button>
                </div>
                <div className="menu-grid">
                    {stallMenu.length === 0 ? (
                        <p style={{ color: 'white' }}>No items available for this restaurant.</p>
                    ) : (
                        stallMenu.map((item) => (
                            <div className="menu-item-card" key={item.id}>
                                <div className="item-info">
                                    <h3 className="item-name">{item.name}</h3>
                                    <p className="item-desc">{item.desc}</p>
                                    <span className="item-price">{item.price}</span>
                                </div>
                                <button
                                    className="add-to-cart-btn"
                                    onClick={() => addToCart(item)}
                                >
                                    Add to Cart
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

export default Menu;