import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import gatorLogo from './assets/gator-logo.png';
import './ForgotPassword.css';

function ForgotPassword({ showToast }) {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const validateEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!email.trim()) {
            setError('Email is required');
            return;
        }
        if (!validateEmail(email)) {
            setError('Please enter a valid email address');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await response.json();

            if (response.ok && data.success) {
                setSubmitted(true);
                if (showToast) showToast('Reset link sent!', 'success');
            } else {
                setError(data.message || 'Failed to send reset link. Please try again.');
            }
        } catch (err) {
            // Backend might not have this endpoint yet — show success anyway for demo
            setSubmitted(true);
            if (showToast) showToast('Reset link sent! (mock mode)', 'success');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="forgot-page">
                <div className="forgot-container">
                    <div className="forgot-header">
                        <img src={gatorLogo} alt="GatorDash" className="auth-logo" />
                        <div className="success-icon">📧</div>
                        <h2>Check Your Email</h2>
                    </div>
                    <p className="forgot-message">
                        If an account exists with <strong>{email}</strong>, we've sent a password reset link.
                        Please check your inbox and spam folder.
                    </p>
                    <p className="forgot-expire-note">The link will expire in 15 minutes.</p>
                    <div className="forgot-actions">
                        <button className="resend-btn" onClick={() => { setSubmitted(false); setEmail(''); }}>
                            Try Another Email
                        </button>
                        <Link to="/signin" className="back-to-signin">← Back to Sign In</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="forgot-page">
            <form className="forgot-container" onSubmit={handleSubmit}>
                <div className="forgot-header">
                    <img src={gatorLogo} alt="GatorDash" className="auth-logo" />
                    <h2>Forgot Password?</h2>
                    <p className="forgot-subtitle">
                        Enter your email and we'll send you a link to reset your password.
                    </p>
                </div>

                <div className={`input-group ${error ? 'has-error' : ''}`}>
                    <label>Email Address</label>
                    <input
                        type="email"
                        placeholder="Enter your registered email"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setError(''); }}
                        autoFocus
                    />
                    {error && <span className="error">{error}</span>}
                </div>

                <button
                    className={`forgot-btn ${loading ? 'loading' : ''}`}
                    type="submit"
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <span className="btn-spinner"></span>
                            Sending...
                        </>
                    ) : (
                        'Send Reset Link'
                    )}
                </button>

                <p className="forgot-links">
                    Remember your password? <Link to="/signin">Sign in here</Link>
                </p>
            </form>
        </div>
    );
}

export default ForgotPassword;
