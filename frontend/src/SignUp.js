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
    return (
        <div className="signup-page">
            <form className="sign-up-form" onSubmit={(e) => e.preventDefault()}>
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
                        onChange={(e) => setName(e.target.value)}
                        autoFocus
                    />
                </div>

                <div className="signup-inp">
                    <label>Email</label>
                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                <div className="signup-inp">
                    <label>Phone Number</label>
                    <input
                        type="tel"
                        placeholder="Enter your phone number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                    />
                </div>

                <div className="signup-inp">
                    <label>Password</label>
                    <input
                        type="password"
                        placeholder="Set up your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onFocus={() => setPasswordFocused(true)}
                        onBlur={() => setPasswordFocused(false)}
                    />
                </div>

                <div className="signup-inp">
                    <label>Confirm Password</label>
                    <input
                        type="password"
                        placeholder="Re-enter your password"
                        value={confirmPassword}
                        onChange={(e) => confirmSetPassword(e.target.value)}
                    />
                </div>

                <button className="signup-btn" type="submit">Sign Up</button>

                <p className="signup-links">
                    Already have an account? <Link to="/signin">Sign in here</Link>
                </p>
            </form>
        </div>
    );
}

export default SignUp;
