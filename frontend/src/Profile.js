import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import './Profile.css';

function Profile({ onLogout, showToast }) {
    const [user, setUser] = useState({ name: '', email: '', phone: '' });
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', phone: '' });

    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem('user') || '{}');
        setUser(stored);
        setForm(stored);
    }, []);

    const handleEdit = () => { setEditing(true); };
    const handleCancel = () => { setForm(user); setEditing(false); };

    const handleSave = () => {
        localStorage.setItem('user', JSON.stringify(form));
        setUser(form);
        setEditing(false);
        if (showToast) showToast('Profile updated!', 'success');
    };

    return (
        <div className="profile-page">
            <Navbar onSignOut={onLogout} />
            <div className="profile-container">
                <div className="profile-card">
                    <div className="profile-avatar">
                        {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                    </div>
                    <h2 className="profile-title">My Profile</h2>
                    <div className="profile-field">
                        <label>Name</label>
                        {editing ? (
                            <input className="profile-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                        ) : (
                            <p>{user.name || '-'}</p>
                        )}
                    </div>
                    <div className="profile-field">
                        <label>Email</label>
                        {editing ? (
                            <input className="profile-input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                        ) : (
                            <p>{user.email || '-'}</p>
                        )}
                    </div>
                    <div className="profile-field">
                        <label>Phone</label>
                        {editing ? (
                            <input className="profile-input" value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                        ) : (
                            <p>{user.phone || '-'}</p>
                        )}
                    </div>
                    <div className="profile-actions">
                        {editing ? (
                            <>
                                <button className="save-btn" onClick={handleSave}>Save</button>
                                <button className="cancel-btn" onClick={handleCancel}>Cancel</button>
                            </>
                        ) : (
                            <button className="edit-btn" onClick={handleEdit}>Edit Profile</button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Profile;
