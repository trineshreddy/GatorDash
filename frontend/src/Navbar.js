import React from 'react';
import gatorLogo from './assets/gator-logo.png';
import './Navbar.css';

function Navbar({ onSignOut }) {
    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <img src={gatorLogo} alt="GatorDash" className="brand-logo" />
                <span className="brand-gator">Gator</span>
                <span className="brand-dash">Dash</span>
            </div>
            <button className="signout-btn" onClick={onSignOut}>
                Sign Out
            </button>
        </nav>
    );
}

export default Navbar;
