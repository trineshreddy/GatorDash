import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import gatorLogo from './assets/gator-logo.png';
import './Navbar.css';

function Navbar({ onSignOut }) {
    const navigate = useNavigate();
    const [cartCount, setCartCount] = useState(0);

    useEffect(() => {
        const updateCart = () => {
            const cart = JSON.parse(localStorage.getItem('cart') || '[]');
            const total = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
            setCartCount(total);
        };
        updateCart();
        window.addEventListener('storage', updateCart);
        window.addEventListener('cartUpdated', updateCart);
        return () => {
            window.removeEventListener('storage', updateCart);
            window.removeEventListener('cartUpdated', updateCart);
        };
    }, []);

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <img src={gatorLogo} alt="GatorDash" className="brand-logo" />
                <span className="brand-gator">Gator</span>
                <span className="brand-dash">Dash</span>
            </div>
            <div className="navbar-actions">
                <button className="nav-icon-btn" onClick={() => navigate('/profile')}>
                    Profile
                </button>
                <button className="nav-icon-btn cart-btn" onClick={() => navigate('/cart')}>
                    Cart
                    {cartCount > 0 && (
                        <span className="cart-badge">{cartCount}</span>
                    )}
                </button>
                <button className="signout-btn" onClick={onSignOut}>
                    Sign Out
                </button>
            </div>
        </nav>
    );
}

export default Navbar;