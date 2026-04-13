import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import gatorLogo from './assets/gator-logo.png';
import './Navbar.css';

function Navbar({ onSignOut }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [cartCount, setCartCount] = useState(0);
    const [menuOpen, setMenuOpen] = useState(false);

    const fetchCartCount = async () => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.id) {
            try {
                const res = await fetch(`/api/cart/${user.id}`);
                const data = await res.json();
                if (data.success && data.data) {
                    const total = data.data.reduce((sum, item) => sum + (item.quantity || 1), 0);
                    setCartCount(total);
                    return;
                }
            } catch (err) {
                // Fall back to localStorage
            }
        }
        // localStorage fallback
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const total = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        setCartCount(total);
    };

    useEffect(() => {
        fetchCartCount();
        window.addEventListener('storage', fetchCartCount);
        window.addEventListener('cartUpdated', fetchCartCount);
        return () => {
            window.removeEventListener('storage', fetchCartCount);
            window.removeEventListener('cartUpdated', fetchCartCount);
        };
    }, []);

    const handleSignOut = async () => {
        try {
            await fetch('/api/logout', { method: 'POST' });
        } catch (err) {
            // API may not exist yet, continue anyway
        }
        localStorage.removeItem('user');
        localStorage.removeItem('cart');
        if (onSignOut) onSignOut();
        navigate('/signin');
    };

    const isActive = (path) => location.pathname === path;

    const navLinks = [
        { label: 'Restaurants', path: '/foodstalls' },
        { label: 'Order History', path: '/order-history' },
        { label: 'Profile', path: '/profile' },
    ];

    return (
        <nav className="navbar">
            <div className="navbar-brand" onClick={() => navigate('/foodstalls')} style={{ cursor: 'pointer' }}>
                <img src={gatorLogo} alt="GatorDash" className="brand-logo" />
                <span className="brand-gator">Gator</span>
                <span className="brand-dash">Dash</span>
            </div>

            {/* Desktop Nav */}
            <div className="navbar-actions desktop-nav">
                {navLinks.map(link => (
                    <button
                        key={link.path}
                        className={`nav-icon-btn ${isActive(link.path) ? 'active-route' : ''}`}
                        onClick={() => navigate(link.path)}
                    >
                        {link.label}
                    </button>
                ))}
                <button
                    className={`nav-icon-btn cart-btn ${isActive('/cart') ? 'active-route' : ''}`}
                    onClick={() => navigate('/cart')}
                >
                    Cart
                    {cartCount > 0 && (
                        <span className="cart-badge">{cartCount}</span>
                    )}
                </button>
                <button className="signout-btn" onClick={handleSignOut}>
                    Sign Out
                </button>
            </div>

            {/* Hamburger Button (mobile) */}
            <button
                className="hamburger-btn"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Toggle menu"
            >
                <span className={`ham-line ${menuOpen ? 'open' : ''}`} />
                <span className={`ham-line ${menuOpen ? 'open' : ''}`} />
                <span className={`ham-line ${menuOpen ? 'open' : ''}`} />
            </button>

            {/* Mobile Dropdown Menu */}
            {menuOpen && (
                <div className="mobile-menu">
                    {navLinks.map(link => (
                        <button
                            key={link.path}
                            className={`mobile-nav-btn ${isActive(link.path) ? 'active-route' : ''}`}
                            onClick={() => { navigate(link.path); setMenuOpen(false); }}
                        >
                            {link.label}
                        </button>
                    ))}
                    <button
                        className={`mobile-nav-btn ${isActive('/cart') ? 'active-route' : ''}`}
                        onClick={() => { navigate('/cart'); setMenuOpen(false); }}
                    >
                        Cart {cartCount > 0 && `(${cartCount})`}
                    </button>
                    <button className="mobile-nav-btn signout-mobile" onClick={handleSignOut}>
                        Sign Out
                    </button>
                </div>
            )}
        </nav>
    );
}

export default Navbar;