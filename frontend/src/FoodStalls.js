import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import './FoodStalls.css';

import { stalls } from './data';

function FoodStalls({ onLogout }) {
    const navigate = useNavigate();

    return (
        <div className="foodstalls-page">
            <Navbar onSignOut={onLogout} />
            <h2 className="stalls-heading">Explore Restaurants around you</h2>
            <div className="stalls-grid">
                {stalls.map((stall, index) => (
                    <div
                        className="stall-card"
                        key={index}
                        style={{ animationDelay: `${index * 0.1}s` }}
                        onClick={() => navigate(`/menu/${index}`)}
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
