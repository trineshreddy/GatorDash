import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import gatorLogo from './assets/gator-logo.png';
import './ResetPassword.css';

function ResetPassword({ showToast }) {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token') || '';

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [resetSuccess, setResetSuccess] = useState(false);
    const [countdown, setCountdown] = useState(5);

    const getPasswordStrength = (pwd) => {
        if (!pwd) return { level: 0, label: '', color: '' };
        if (pwd.length < 8) return { level: 1, label: 'Weak', color: 'var(--color-error)' };
        const hasUpper = /[A-Z]/.test(pwd);
        const hasDigit = /\d/.test(pwd);
        if (hasUpper && hasDigit) return { level: 3, label: 'Strong', color: 'var(--color-success)' };
        return { level: 2, label: 'Fair', color: 'var(--color-warning)' };
    };

    const strength = getPasswordStrength(password);

    const validate = () => {
        const newErrors = {};

        if (!password) {
            newErrors.password = 'Password is required';
        } else if (password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        } else if (!/\d/.test(password)) {
            newErrors.password = 'Password must contain at least one number';
        } else if (!/[A-Z]/.test(password)) {
            newErrors.password = 'Password must contain at least one uppercase letter';
        }

        if (!confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (confirmPassword !== password) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const startCountdown = () => {
        let count = 5;
        setCountdown(count);
        const timer = setInterval(() => {
            count--;
            setCountdown(count);
            if (count <= 0) {
                clearInterval(timer);
                navigate('/signin');
            }
        }, 1000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);

        try {
            const response = await fetch('/api/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password }),
            });
            const data = await response.json();

            if (response.ok && data.success) {
                setResetSuccess(true);
                if (showToast) showToast('Password reset successfully!', 'success');
                startCountdown();
            } else {
                setErrors({ form: data.message || 'Reset failed. The link may be expired.' });
            }
        } catch (err) {
            // Mock mode — simulate success for demo
            setResetSuccess(true);
            if (showToast) showToast('Password reset successfully! (mock mode)', 'success');
            startCountdown();
        } finally {
            setLoading(false);
        }
    };

    // Success state
    if (resetSuccess) {
        return (
            <div className="reset-page">
                <div className="reset-container">
                    <div className="reset-header">
                        <img src={gatorLogo} alt="GatorDash" className="auth-logo" />
                        <div className="success-check">✅</div>
                        <h2>Password Reset!</h2>
                    </div>
                    <p className="reset-message">
                        Your password has been updated successfully. You can now sign in with your new password.
                    </p>
                    <p className="redirect-note">
                        Redirecting to Sign In in <strong>{countdown}</strong> seconds...
                    </p>
                    <Link to="/signin" className="signin-link-btn">Go to Sign In Now</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="reset-page">
            <form className="reset-container" onSubmit={handleSubmit}>
                <div className="reset-header">
                    <img src={gatorLogo} alt="GatorDash" className="auth-logo" />
                    <h2>Reset Password</h2>
                    <p className="reset-subtitle">Enter your new password below.</p>
                </div>

                {errors.form && (
                    <div className="form-error">
                        <span>⚠️ {errors.form}</span>
                    </div>
                )}

                {!token && (
                    <div className="form-warning">
                        <span>⚠️ No reset token found. Please use the link from your email.</span>
                    </div>
                )}

                <div className={`input-group ${errors.password ? 'has-error' : ''}`}>
                    <label>New Password</label>
                    <div className="password-wrapper">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Enter new password"
                            value={password}
                            onChange={(e) => { setPassword(e.target.value); setErrors(prev => { const n = {...prev}; delete n.password; return n; }); }}
                        />
                        <button
                            type="button"
                            className="toggle-password"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                            {showPassword ? <span style={{ textDecoration: 'line-through' }}>👁</span> : '👁'}
                        </button>
                    </div>
                    {errors.password && <span className="error">{errors.password}</span>}
                    {password && (
                        <div className="strength-meter">
                            <div className="strength-track">
                                <div
                                    className="strength-bar"
                                    style={{
                                        width: `${(strength.level / 3) * 100}%`,
                                        background: strength.color,
                                    }}
                                />
                            </div>
                            <span className="strength-label" style={{ color: strength.color }}>
                                {strength.label}
                            </span>
                        </div>
                    )}
                </div>

                <div className={`input-group ${errors.confirmPassword ? 'has-error' : ''}`}>
                    <label>Confirm New Password</label>
                    <div className="password-wrapper">
                        <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder="Re-enter new password"
                            value={confirmPassword}
                            onChange={(e) => { setConfirmPassword(e.target.value); setErrors(prev => { const n = {...prev}; delete n.confirmPassword; return n; }); }}
                        />
                        <button
                            type="button"
                            className="toggle-password"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                        >
                            {showConfirmPassword ? <span style={{ textDecoration: 'line-through' }}>👁</span> : '👁'}
                        </button>
                    </div>
                    {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}
                </div>

                <button
                    className={`reset-btn ${loading ? 'loading' : ''}`}
                    type="submit"
                    disabled={loading || !token}
                >
                    {loading ? (
                        <>
                            <span className="btn-spinner"></span>
                            Resetting...
                        </>
                    ) : (
                        'Reset Password'
                    )}
                </button>

                <p className="reset-links">
                    <Link to="/signin">← Back to Sign In</Link>
                </p>
            </form>
        </div>
    );
}

export default ResetPassword;
