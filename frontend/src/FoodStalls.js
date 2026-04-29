import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { getAuthHeaders } from './Navbar';
import './FoodStalls.css';
import { stalls as fallbackStalls } from './data';

const CATEGORIES = ['All', 'Open Now', 'Coffee', 'Asian', 'Italian', 'Street Food'];

function SkeletonCard() {
    return (
        <div className="stall-card skeleton-card">
            <div className="skeleton-color-bar" />
            <div className="stall-content">
                <div className="stall-info">
                    <div className="skeleton-line skeleton-title" />
                    <div className="skeleton-line skeleton-desc" />
                </div>
            </div>
        </div>
    );
}

function FoodStalls({ onLogout }) {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [stalls, setStalls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [activeCategory, setActiveCategory] = useState('All');

    const fetchStalls = async () => {
        setLoading(true);
        setError(false);
        try {
            const response = await fetch('/api/foodstalls', {
                headers: getAuthHeaders(),
            });

            if (response.status === 401) {
                // Session expired — clear and redirect
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                navigate('/signin');
                return;
            }

            if (!response.ok) throw new Error('API error');
            const data = await response.json();
            if (data.success && data.data) {
                setStalls(data.data);
            } else {
                throw new Error('Bad response');
            }
        } catch (err) {
            // Fall back to hardcoded data
            setStalls(fallbackStalls);
            setError(false);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStalls();
    }, []);

    const filtered = stalls.filter((stall) => {
        const searchLower = search.toLowerCase();
        const matchesSearch =
            stall.name.toLowerCase().includes(searchLower) ||
            (stall.desc || stall.cuisine || '').toLowerCase().includes(searchLower);

        const cuisine = (stall.desc || stall.cuisine || '').toLowerCase();
        const matchesCategory =
            activeCategory === 'All' ||
            (activeCategory === 'Open Now' && stall.status === 'Open Now') ||
            (activeCategory === 'Coffee' && (cuisine.includes('coffee') || cuisine.includes('pastry') || cuisine.includes('cafe'))) ||
            (activeCategory === 'Asian' && (cuisine.includes('chinese') || cuisine.includes('asian') || cuisine.includes('kung') || cuisine.includes('sushi'))) ||
            (activeCategory === 'Italian' && (cuisine.includes('italian') || cuisine.includes('pizza'))) ||
            (activeCategory === 'Street Food' && (cuisine.includes('street') || cuisine.includes('taco') || cuisine.includes('burger')));

        return matchesSearch && matchesCategory;
    });

    return (
        <div className="foodstalls-page">
            <Navbar onSignOut={onLogout} />
            <h2 className="stalls-heading">Explore Restaurants around you</h2>

            {/* Search Bar */}
            <div className="search-bar-container">
                <input
                    className="search-bar"
                    type="text"
                    placeholder="Search restaurants or cuisine..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Category Filter Tabs */}
            <div className="category-tabs">
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat}
                        className={`category-tab ${activeCategory === cat ? 'active' : ''}`}
                        onClick={() => setActiveCategory(cat)}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Error State */}
            {error && (
                <div className="error-state">
                    <p>⚠️ Could not load restaurants.</p>
                    <button className="retry-btn" onClick={fetchStalls}>Retry</button>
                </div>
            )}

            {/* Skeleton Loading */}
            {loading && (
                <div className="stalls-grid">
                    {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
                </div>
            )}

            {/* No Results */}
            {!loading && !error && filtered.length === 0 && (
                <div className="no-results-state">
                    <div className="no-results-icon">🍽️</div>
                    <p className="no-results-title">No restaurants found</p>
                    <p className="no-results-sub">Try a different search or category</p>
                </div>
            )}

            {/* Stall Grid */}
            {!loading && !error && filtered.length > 0 && (
                <div className="stalls-grid">
                    {filtered.map((stall, index) => {
                        const status = stall.status || (stall.is_active ? 'Open Now' : 'Closed');
                        return (
                            <div
                                className="stall-card"
                                key={stall.id || index}
                                style={{ animationDelay: `${index * 0.1}s` }}
                                onClick={() => navigate(`/menu/${stall.id !== undefined ? stall.id : stalls.indexOf(stall)}`)}
                            >
                                <div
                                    className="stall-color-bar"
                                    style={{ background: stall.color || '#FA4616' }}
                                />
                                <div className="stall-content">
                                    {stall.image_url && (
                                        <div className="stall-image-wrapper">
                                            <img className="stall-image" src={stall.image_url} alt={stall.name} />
                                        </div>
                                    )}
                                    <div className="stall-info">
                                        <div className="stall-header-row">
                                            <p className="stall-name">{stall.name}</p>
                                            <span className={`status-badge ${status === 'Open Now' ? 'open' : status === 'Closed' ? 'closed' : 'closing'}`}>
                                                {status === 'Open Now' && <span className="pulse-dot" />}
                                                {status}
                                            </span>
                                        </div>
                                        <p className="stall-desc">{stall.desc || stall.description || stall.cuisine}</p>
                                    </div>
                                    <div className="stall-arrow">➜</div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default FoodStalls;