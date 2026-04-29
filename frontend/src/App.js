import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import SignUp from './SignUp';
import SignIn from './SignIn';
import FoodStalls from './FoodStalls';
import Menu from './Menu';
import Cart from './Cart';
import OrderSummary from './OrderSummary';
import NotFound from './NotFound';
import Toast from './Toast';
import Profile from './Profile';
import ForgotPassword from './ForgotPassword';
import ResetPassword from './ResetPassword';
import OrderHistory from './OrderHistory';
import Payment from './Payment';
import './App.css';

const dummyUser = { email: 'user@example.com', password: 'Password123' };
const AUTH_TOKEN_KEY = 'authToken';

const hasStoredSession = () => {
  return Boolean(localStorage.getItem(AUTH_TOKEN_KEY) || localStorage.getItem('user'));
};

const getSignInUser = (data) => {
  return data?.user || data?.data?.user || data?.data || null;
};

const getSignInToken = (data) => {
  return data?.token || data?.data?.token || '';
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(hasStoredSession);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, confirmSetPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [passwordFocused, setPasswordFocused] = useState(false);

  const [toast, setToast] = useState({ message: '', type: 'success', visible: false });

  const showToast = (message, type) => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast((prev) => ({ ...prev, visible: false })), 3000);
  };

  useEffect(() => {
    const handleSessionExpired = () => {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem('user');
      localStorage.removeItem('cart');
      localStorage.removeItem('paymentResult');
      setIsLoggedIn(false);
      showToast('Session expired. Please sign in again.', 'error');
    };

    window.addEventListener('auth:expired', handleSessionExpired);
    return () => window.removeEventListener('auth:expired', handleSessionExpired);
  }, []);

  const handleSignIn = async (emailInput, passwordInput) => {
    try {
      const response = await fetch('/api/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput, password: passwordInput }),
      });
      const data = await response.json();

      if (response.ok && data.success) {
        const user = getSignInUser(data);
        const token = getSignInToken(data);

        if (token) {
          localStorage.setItem(AUTH_TOKEN_KEY, token);
        }

        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
        }

        setIsLoggedIn(true);
        showToast('Welcome to GatorDash!', 'success');
      } else {
        showToast(data.message || 'Invalid credentials.', 'error');
      }
    } catch (err) {
      if (emailInput === dummyUser.email && passwordInput === dummyUser.password) {
        localStorage.setItem('user', JSON.stringify({ name: 'Test User', email: emailInput }));
        localStorage.removeItem(AUTH_TOKEN_KEY);
        setIsLoggedIn(true);
        showToast('Welcome to GatorDash!', 'success');
      } else {
        showToast('Invalid credentials. Please try again.', 'error');
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem('user');
    localStorage.removeItem('cart');
    setIsLoggedIn(false);
    showToast('Signed out successfully.', 'success');
  };

  return (
    <BrowserRouter>
      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onClose={() => setToast((prev) => ({ ...prev, visible: false }))}
      />
      <Routes>
        <Route path="/" element={<Navigate to="/signin" />} />
        <Route
          path="/signin"
          element={
            isLoggedIn
              ? <Navigate to="/foodstalls" />
              : <div className="page-transition"><SignIn onSignIn={handleSignIn} /></div>
          }
        />
        <Route
          path="/signup"
          element={
            <div className="page-transition">
              <SignUp
                name={name} setName={setName}
                email={email} setEmail={setEmail}
                phone={phone} setPhone={setPhone}
                password={password} setPassword={setPassword}
                confirmPassword={confirmPassword} confirmSetPassword={confirmSetPassword}
                errors={errors} setErrors={setErrors}
                passwordFocused={passwordFocused} setPasswordFocused={setPasswordFocused}
                showToast={showToast}
              />
            </div>
          }
        />
        <Route
          path="/foodstalls"
          element={
            isLoggedIn
              ? <div className="page-transition"><FoodStalls onLogout={handleLogout} /></div>
              : <Navigate to="/signin" />
          }
        />
        <Route
          path="/menu/:stallId"
          element={
            isLoggedIn
              ? <div className="page-transition"><Menu onLogout={handleLogout} showToast={showToast} /></div>
              : <Navigate to="/signin" />
          }
        />
        <Route
          path="/cart"
          element={
            isLoggedIn
              ? <div className="page-transition"><Cart onLogout={handleLogout} showToast={showToast} /></div>
              : <Navigate to="/signin" />
          }
        />
        <Route
          path="/order-summary"
          element={
            isLoggedIn
              ? <div className="page-transition"><OrderSummary onLogout={handleLogout} showToast={showToast} /></div>
              : <Navigate to="/signin" />
          }
        />
        <Route
          path="/payment"
          element={
            isLoggedIn
              ? <div className="page-transition"><Payment onLogout={handleLogout} showToast={showToast} /></div>
              : <Navigate to="/signin" />
          }
        />
        <Route
          path="/profile"
          element={
            isLoggedIn
              ? <div className="page-transition"><Profile onLogout={handleLogout} showToast={showToast} /></div>
              : <Navigate to="/signin" />
          }
        />
        <Route
          path="/forgot-password"
          element={<div className="page-transition"><ForgotPassword showToast={showToast} /></div>}
        />
        <Route
          path="/reset-password"
          element={<div className="page-transition"><ResetPassword showToast={showToast} /></div>}
        />
        <Route
          path="/order-history"
          element={
            isLoggedIn
              ? <div className="page-transition"><OrderHistory onLogout={handleLogout} /></div>
              : <Navigate to="/signin" />
          }
        />
        <Route path="*" element={<div className="page-transition"><NotFound /></div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
