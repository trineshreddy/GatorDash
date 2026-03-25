import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import './FoodStalls.css';

import { stalls } from './data';

function FoodStalls({ onLogout }) {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');

    const filtered = stalls.filter((stall) =>
        stall.name.toLowerCase().includes(search.toLowerCase()) ||
        stall.desc.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="foodstalls-page">
            <Navbar onSignOut={onLogout} />
            <h2 className="stalls-heading">Explore Restaurants around you</h2>
            <div className="search-bar-container">
                <input
                    className="search-bar"
                    type="text"
                    placeholder="Search restaurants or cuisine..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
            {filtered.length === 0 && (
                <p className="no-results">No restaurants match your search.</p>
            )}
            <div className="stalls-grid">
                {filtered.map((stall, index) => (
                    <div
                        className="stall-card"
                        key={index}
                        style={{ animationDelay: `${index * 0.1}s` }}
                        onClick={() => navigate(`/menu/${stalls.indexOf(stall)}`)}
                    >
                        <div
                            className="stall-color-bar"
                            style={{ background: stall.color }}
                        />
                        <div className="stall-content">
                            <div className="stall-info">
                                <div className="stall-header-row">
                                    <p className="stall-name">{stall.name}</p>
                                    <span className={`status-badge ${stall.status === 'Open Now' ? 'open' : stall.status === 'Closed' ? 'closed' : 'closing'}`}>
                                        {stall.status}
                                    </span>
                                </div>
                                <p className="stall-desc">{stall.desc}</p>
                            </div>
                            <div className="stall-arrow">➜</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default FoodStalls;
