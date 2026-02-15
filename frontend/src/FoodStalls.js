import React from 'react';
import Navbar from './Navbar';
import './FoodStalls.css';

import starbucks from './assets/starbucks.png';
import burger352 from './assets/Burger352.jpeg';
import panda from './assets/panda.png';
import subway from './assets/subway.jpeg';
import halal from './assets/halal.png';
import babasPizza from "./assets/baba's pizza.jpeg";

const stalls = [
    { name: 'Starbucks', image: starbucks, color: '#0D7377', desc: 'Coffee & Pastries' },
    { name: 'Burger 352', image: burger352, color: '#FFA500', desc: 'Burgers & Fries' },
    { name: 'Panda Express', image: panda, color: '#FF0000', desc: 'Chinese Cuisine' },
    { name: 'Subway', image: subway, color: '#5F8D4E', desc: 'Subs & Salads' },
    { name: 'Halal Shack', image: halal, color: '#FEFFDE', desc: 'Halal Street Food' },
    { name: "Baba's Pizza", image: babasPizza, color: '#FFD4D4', desc: 'Pizza & Italian' },
];

function FoodStalls({ onLogout }) {
    return (
        <div className="foodstalls-page">
            <Navbar onSignOut={onLogout} />
            <h2 className="stalls-heading">Explore Food Stalls</h2>
            <div className="stalls-grid">
                {stalls.map((stall, index) => (
                    <div
                        className="stall-card"
                        key={index}
                        style={{ animationDelay: `${index * 0.1}s` }}
                    >
                        <div
                            className="stall-color-bar"
                            style={{ background: stall.color }}
                        />
                        <div className="stall-img-wrapper">
                            <img src={stall.image} alt={stall.name} />
                            <div className="stall-overlay">
                                <span>View Menu</span>
                            </div>
                        </div>
                        <div className="stall-info">
                            <p className="stall-name">{stall.name}</p>
                            <p className="stall-desc">{stall.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default FoodStalls;
