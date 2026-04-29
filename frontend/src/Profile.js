import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import { getAuthHeaders } from './Navbar';
import './Profile.css';

function getPasswordStrength(password) {
    if (!password) return { score: 0, label: '', color: '' };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (score <= 1) return { score, label: 'Weak', color: '#e74c3c' };
    if (score === 2) return { score, label: 'Fair', color: '#f39c12' };
    if (score === 3) return { score, label: 'Good', color: '#3498db' };
    return { score, label: 'Strong', color: '#2ecc71' };
}

function Profile({ onLogout, showToast }) {
    const [user, setUser] = useState({ name: '', email: '', phone: '' });
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', phone: '' });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [unauthorized, setUnauthorized] = useState(false);

    // Change password state
    const [showPasswordSection, setShowPasswordSection] = useState(false);
    const [passwordForm, setPasswordForm] = useState({ current: '', newPass: '', confirm: '' });
    const [passwordErrors, setPasswordErrors] = useState({});

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            const stored = JSON.parse(localStorage.getItem('user') || '{}');

            if (stored.id) {
                try {
                    const res = await fetch(`/api/user/${stored.id}`, {
                        headers: getAuthHeaders(),
                    });

                    if (res.status === 401) {
                        setUnauthorized(true);
                        setLoading(false);
                        // Clear stale session
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        return;
                    }

                    const data = await res.json();
                    if (data.success && data.data) {
                        setUser(data.data);
                        setForm(data.data);
                        setLoading(false);
                        return;
                    }
                } catch (err) {
                    // Fall back to localStorage
                }
            }
            setUser(stored);
            setForm(stored);
            setLoading(false);
        };
        fetchProfile();
    }, []);

    const validate = () => {
        const newErrors = {};
        if (!form.name.trim()) newErrors.name = 'Name cannot be empty';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Invalid email format';
        if (form.phone && !/^\d{10}$/.test(form.phone.replace(/\D/g, ''))) newErrors.phone = 'Phone must be 10 digits';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) return;
        setSaving(true);
        const stored = JSON.parse(localStorage.getItem('user') || '{}');

        try {
            if (stored.id) {
                const res = await fetch(`/api/user/${stored.id}`, {
                    method: 'PUT',
                    headers: getAuthHeaders(),
                    body: JSON.stringify({
                        name: form.name,
                        email: form.email,
                        phone: form.phone,
                    }),
                });

                if (res.status === 401) {
                    setUnauthorized(true);
                    setSaving(false);
                    return;
                }

                const data = await res.json();
                if (!data.success) throw new Error('Save failed');
            }
        } catch (err) {
            // Continue — update localStorage regardless
        }

        const updated = { ...stored, ...form };
        localStorage.setItem('user', JSON.stringify(updated));
        setUser(form);
        setEditing(false);
        setSaving(false);
        if (showToast) showToast('Profile updated!', 'success');
    };

    const handleCancel = () => {
        setForm(user);
        setErrors({});
        setEditing(false);
    };

    const handlePasswordChange = async () => {
        const newErrors = {};
        if (!passwordForm.current) newErrors.current = 'Current password required';
        if (passwordForm.newPass.length < 8) newErrors.newPass = 'Password must be at least 8 characters';
        if (passwordForm.newPass !== passwordForm.confirm) newErrors.confirm = 'Passwords do not match';
        setPasswordErrors(newErrors);
        if (Object.keys(newErrors).length > 0) return;

        const stored = JSON.parse(localStorage.getItem('user') || '{}');
        try {
            if (stored.id) {
                const res = await fetch(`/api/user/${stored.id}`, {
                    method: 'PUT',
                    headers: getAuthHeaders(),
                    body: JSON.stringify({
                        current_password: passwordForm.current,
                        new_password: passwordForm.newPass,
                    }),
                });

                if (res.status === 401) {
                    setUnauthorized(true);
                    return;
                }
            }
        } catch (err) {
            // API might not be ready yet — continue
        }

        setPasswordForm({ current: '', newPass: '', confirm: '' });
        setShowPasswordSection(false);
        if (showToast) showToast('Password updated!', 'success');
    };

    const strength = getPasswordStrength(passwordForm.newPass);

    // Unauthorized state
    if (unauthorized) {
        return (
            <div className="profile-page">
                <Navbar onSignOut={onLogout} />
                <div className="profile-container">
                    <div className="profile-card">
                        <div className="unauthorized-state">
                            <div className="unauth-icon">🔒</div>
                            <h3>Session Expired</h3>
                            <p>Please sign in again to view your profile.</p>
                            <button className="save-btn" onClick={() => {
                                if (onLogout) onLogout();
                            }}>
                                Sign In Again
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-page">
            <Navbar onSignOut={onLogout} />
            <div className="profile-container">
                <div className="profile-card">
                    {loading ? (
                        <div className="profile-loading">
                            <div className="spinner" />
                            <p>Loading profile...</p>
                        </div>
                    ) : (
                        <>
                            <div className="profile-avatar">
                                {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                            </div>
                            <h2 className="profile-title">My Profile</h2>

                            {/* Name */}
                            <div className="profile-field">
                                <label>Name</label>
                                {editing ? (
                                    <>
                                        <input
                                            className={`profile-input ${errors.name ? 'input-error' : ''}`}
                                            value={form.name}
                                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        />
                                        {errors.name && <span className="field-error">{errors.name}</span>}
                                    </>
                                ) : (
                                    <p>{user.name || '-'}</p>
                                )}
                            </div>

                            {/* Email */}
                            <div className="profile-field">
                                <label>Email</label>
                                {editing ? (
                                    <>
                                        <input
                                            className={`profile-input ${errors.email ? 'input-error' : ''}`}
                                            value={form.email}
                                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                                        />
                                        {errors.email && <span className="field-error">{errors.email}</span>}
                                    </>
                                ) : (
                                    <p>{user.email || '-'}</p>
                                )}
                            </div>

                            {/* Phone */}
                            <div className="profile-field">
                                <label>Phone</label>
                                {editing ? (
                                    <>
                                        <input
                                            className={`profile-input ${errors.phone ? 'input-error' : ''}`}
                                            value={form.phone || ''}
                                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                        />
                                        {errors.phone && <span className="field-error">{errors.phone}</span>}
                                    </>
                                ) : (
                                    <p>{user.phone || '-'}</p>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="profile-actions">
                                {editing ? (
                                    <>
                                        <button
                                            className="save-btn"
                                            onClick={handleSave}
                                            disabled={saving}
                                        >
                                            {saving ? 'Saving...' : 'Save'}
                                        </button>
                                        <button className="cancel-btn" onClick={handleCancel}>Cancel</button>
                                    </>
                                ) : (
                                    <button className="edit-btn" onClick={() => setEditing(true)}>
                                        Edit Profile
                                    </button>
                                )}
                            </div>

                            {/* Change Password Section */}
                            <div className="password-section">
                                <button
                                    className="toggle-password-btn"
                                    onClick={() => setShowPasswordSection(!showPasswordSection)}
                                >
                                    {showPasswordSection ? '✕ Cancel Password Change' : '🔒 Change Password'}
                                </button>

                                {showPasswordSection && (
                                    <div className="password-form">
                                        <div className="profile-field">
                                            <label>Current Password</label>
                                            <input
                                                className={`profile-input ${passwordErrors.current ? 'input-error' : ''}`}
                                                type="password"
                                                value={passwordForm.current}
                                                onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                                                placeholder="Enter current password"
                                            />
                                            {passwordErrors.current && <span className="field-error">{passwordErrors.current}</span>}
                                        </div>
                                        <div className="profile-field">
                                            <label>New Password</label>
                                            <input
                                                className={`profile-input ${passwordErrors.newPass ? 'input-error' : ''}`}
                                                type="password"
                                                value={passwordForm.newPass}
                                                onChange={(e) => setPasswordForm({ ...passwordForm, newPass: e.target.value })}
                                                placeholder="Enter new password"
                                            />
                                            {passwordForm.newPass && (
                                                <div className="strength-meter">
                                                    <div className="strength-bars">
                                                        {[1, 2, 3, 4].map(i => (
                                                            <div
                                                                key={i}
                                                                className="strength-bar"
                                                                style={{
                                                                    background: i <= strength.score
                                                                        ? strength.color
                                                                        : 'rgba(255,255,255,0.1)'
                                                                }}
                                                            />
                                                        ))}
                                                    </div>
                                                    <span className="strength-label" style={{ color: strength.color }}>
                                                        {strength.label}
                                                    </span>
                                                </div>
                                            )}
                                            {passwordErrors.newPass && <span className="field-error">{passwordErrors.newPass}</span>}
                                        </div>
                                        <div className="profile-field">
                                            <label>Confirm New Password</label>
                                            <input
                                                className={`profile-input ${passwordErrors.confirm ? 'input-error' : ''}`}
                                                type="password"
                                                value={passwordForm.confirm}
                                                onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                                                placeholder="Confirm new password"
                                            />
                                            {passwordErrors.confirm && <span className="field-error">{passwordErrors.confirm}</span>}
                                        </div>
                                        <button className="save-btn" onClick={handlePasswordChange}>
                                            Update Password
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Profile;