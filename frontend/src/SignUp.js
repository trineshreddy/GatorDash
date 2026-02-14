import React from 'react';
import { Link } from 'react-router-dom';
import './SignUp.css';

function SignUp({
    name, setName,
    email, setEmail,
    phone, setPhone,
    password, setPassword,
    confirmPassword, confirmSetPassword,
    errors, setErrors,
    passwordFocused, setPasswordFocused
}) {

    const handleChange = (field, setter) => (e) => {
        setter(e.target.value);
        if (errors[field]) {
            const newErrors = { ...errors };
            delete newErrors[field];
            setErrors(newErrors);
        }
    };

    const getPasswordStrength = (pwd) => {
        if (!pwd) return { level: 0, label: '', color: '' };
        if (pwd.length < 8) return { level: 1, label: 'Weak', color: 'var(--color-error)' };
        const hasUpper = /[A-Z]/.test(pwd);
        const hasDigit = /\d/.test(pwd);
        if (hasUpper && hasDigit) return { level: 3, label: 'Strong', color: 'var(--color-success)' };
        return { level: 2, label: 'Fair', color: 'var(--color-warning)' };
    };

    const strength = getPasswordStrength(password);

    const validateForm = (e) => {
        e.preventDefault();
        const newErrors = {};

        // Name validation
        if (!name.trim()) {
            newErrors.name = 'Name is required';
        }

        // Phone validation
        if (!phone.trim()) {
            newErrors.phone = 'Phone number is required';
        } else if (!/^\d{10}$/.test(phone)) {
            newErrors.phone = 'Enter a valid 10-digit phone number';
        }

        // Email validation
        if (!email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^\S+@\S+\.\S+$/.test(email)) {
            newErrors.email = 'Enter a valid email';
        }

        // Password validation
        if (!password) {
            newErrors.password = 'Password is required';
        } else if (password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        } else if (!/\d/.test(password)) {
            newErrors.password = 'Password must contain at least one number';
        } else if (!/[A-Z]/.test(password)) {
            newErrors.password = 'Password must contain at least one uppercase letter';
        }

        // Confirm Password validation
        if (!confirmPassword) {
            newErrors.confirmPassword = 'confirmation of password required';
        } else if (confirmPassword !== password) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            console.log('Form submitted successfully:', { name, email, phone, password });
        }
    };

    return (
        <div className="signup-page">
            <form className="sign-up-form" onSubmit={validateForm}>
                <div className="signup-header">
                    <h2>Create Account</h2>
                    <p className="signup-subtitle">Join GatorDash today</p>
                </div>

                <div className="signup-inp">
                    <label>Name</label>
                    <input
                        type="text"
                        placeholder="Enter your name"
                        value={name}
                        onChange={handleChange('name', setName)}
                        autoFocus
                    />
                    {errors.name && <span className="error">{errors.name}</span>}
                </div>

                <div className="signup-inp">
                    <label>Email</label>
                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={handleChange('email', setEmail)}
                    />
                    {errors.email && <span className="error">{errors.email}</span>}
                </div>

                <div className="signup-inp">
                    <label>Phone Number</label>
                    <input
                        type="tel"
                        placeholder="Enter your phone number"
                        value={phone}
                        onChange={handleChange('phone', setPhone)}
                    />
                    {errors.phone && <span className="error">{errors.phone}</span>}
                </div>

                <div className="signup-inp">
                    <label>Password</label>
                    <input
                        type="password"
                        placeholder="Set up your password"
                        value={password}
                        onChange={handleChange('password', setPassword)}
                        onFocus={() => setPasswordFocused(true)}
                        onBlur={() => setPasswordFocused(false)}
                    />
                    {errors.password && <span className="error">{errors.password}</span>}
                    {password && (
                        <div className="strength-meter">
                            <div className="strength-track">
                                <div
                                    className="strength-bar"
                                    style={{
                                        width: `${(strength.level / 3) * 100}%`,
                                        background: strength.color
                                    }}
                                />
                            </div>
                            <span className="strength-label" style={{ color: strength.color }}>
                                {strength.label}
                            </span>
                        </div>
                    )}
                </div>

                <div className="signup-inp">
                    <label>Confirm Password</label>
                    <input
                        type="password"
                        placeholder="Re-enter your password"
                        value={confirmPassword}
                        onChange={handleChange('confirmPassword', confirmSetPassword)}
                    />
                    {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}
                </div>

                <button
                    className="signup-btn"
                    type="submit"
                    disabled={Object.keys(errors).length > 0}
                >
                    Sign Up
                </button>

                <p className="signup-links">
                    Already have an account? <Link to="/signin">Sign in here</Link>
                </p>
            </form>
        </div>
    );
}

export default SignUp;
