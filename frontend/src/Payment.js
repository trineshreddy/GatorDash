import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import './Payment.css';

const initialForm = {
    cardholderName: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
    billingZip: '',
};

function Payment({ onLogout, showToast }) {
    const navigate = useNavigate();
    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);
    const [paymentComplete, setPaymentComplete] = useState(false);

    const getToken = () => localStorage.getItem('authToken') || '';

    const digitsOnly = (value) => value.replace(/\D/g, '');

    const formatCardNumber = (value) => {
        return digitsOnly(value).slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
    };

    const formatExpiry = (value) => {
        const digits = digitsOnly(value).slice(0, 4);
        if (digits.length <= 2) return digits;
        return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    };

    const validate = () => {
        const nextErrors = {};
        const cardDigits = digitsOnly(form.cardNumber);
        const cvvDigits = digitsOnly(form.cvv);
        const zipDigits = digitsOnly(form.billingZip);

        if (!form.cardholderName.trim()) {
            nextErrors.cardholderName = 'Cardholder name is required.';
        }

        if (cardDigits.length !== 16) {
            nextErrors.cardNumber = 'Enter a valid 16-digit card number.';
        }

        if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(form.expiry)) {
            nextErrors.expiry = 'Use MM/YY format.';
        }

        if (cvvDigits.length < 3 || cvvDigits.length > 4) {
            nextErrors.cvv = 'Enter a valid CVV.';
        }

        if (zipDigits.length !== 5) {
            nextErrors.billingZip = 'Enter a 5-digit ZIP code.';
        }

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleChange = (field, value) => {
        const formatters = {
            cardNumber: formatCardNumber,
            expiry: formatExpiry,
            cvv: (input) => digitsOnly(input).slice(0, 4),
            billingZip: (input) => digitsOnly(input).slice(0, 5),
        };

        setForm((prev) => ({
            ...prev,
            [field]: formatters[field] ? formatters[field](value) : value,
        }));

        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: '' }));
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!validate()) {
            if (showToast) showToast('Please fix payment form errors.', 'error');
            return;
        }

        setProcessing(true);

        try {
            const token = getToken();
            const response = await fetch('/api/payment/process', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    cardholder_name: form.cardholderName.trim(),
                    card_number: digitsOnly(form.cardNumber),
                    expiry: form.expiry,
                    cvv: form.cvv,
                    billing_zip: form.billingZip,
                }),
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok || data.success === false) {
                throw new Error(data.message || 'Payment could not be processed.');
            }

            localStorage.setItem('paymentResult', JSON.stringify({
                status: 'paid',
                transactionId: data.transaction_id || data.data?.transaction_id || `MOCK-${Date.now()}`,
                paidAt: new Date().toISOString(),
            }));

            setPaymentComplete(true);
            if (showToast) showToast('Payment processed successfully.', 'success');
        } catch (err) {
            setErrors({ form: err.message || 'Payment could not be processed.' });
            if (showToast) showToast(err.message || 'Payment could not be processed.', 'error');
        } finally {
            setProcessing(false);
        }
    };

    if (paymentComplete) {
        return (
            <div className="payment-page">
                <Navbar onSignOut={onLogout} />
                <main className="payment-container">
                    <section className="payment-success">
                        <div className="payment-success-icon">✓</div>
                        <h2>Payment Approved</h2>
                        <p>Your payment was processed. Review and place your order to finish checkout.</p>
                        <button className="payment-primary-btn" onClick={() => navigate('/order-summary')}>
                            Continue to Order
                        </button>
                    </section>
                </main>
            </div>
        );
    }

    return (
        <div className="payment-page">
            <Navbar onSignOut={onLogout} />
            <main className="payment-container">
                <div className="payment-header">
                    <h2>Payment</h2>
                    <button className="payment-back-btn" onClick={() => navigate('/order-summary')}>
                        ← Back to Summary
                    </button>
                </div>

                <form className="payment-form" onSubmit={handleSubmit} noValidate>
                    {errors.form && <div className="payment-form-error">{errors.form}</div>}

                    <label className="payment-field">
                        <span>Cardholder Name</span>
                        <input
                            type="text"
                            value={form.cardholderName}
                            onChange={(e) => handleChange('cardholderName', e.target.value)}
                            placeholder="Name on card"
                            aria-invalid={Boolean(errors.cardholderName)}
                        />
                        {errors.cardholderName && <small>{errors.cardholderName}</small>}
                    </label>

                    <label className="payment-field">
                        <span>Card Number</span>
                        <input
                            type="text"
                            inputMode="numeric"
                            value={form.cardNumber}
                            onChange={(e) => handleChange('cardNumber', e.target.value)}
                            placeholder="1234 5678 9012 3456"
                            aria-invalid={Boolean(errors.cardNumber)}
                        />
                        {errors.cardNumber && <small>{errors.cardNumber}</small>}
                    </label>

                    <div className="payment-grid">
                        <label className="payment-field">
                            <span>Expiry</span>
                            <input
                                type="text"
                                inputMode="numeric"
                                value={form.expiry}
                                onChange={(e) => handleChange('expiry', e.target.value)}
                                placeholder="MM/YY"
                                aria-invalid={Boolean(errors.expiry)}
                            />
                            {errors.expiry && <small>{errors.expiry}</small>}
                        </label>

                        <label className="payment-field">
                            <span>CVV</span>
                            <input
                                type="password"
                                inputMode="numeric"
                                value={form.cvv}
                                onChange={(e) => handleChange('cvv', e.target.value)}
                                placeholder="123"
                                aria-invalid={Boolean(errors.cvv)}
                            />
                            {errors.cvv && <small>{errors.cvv}</small>}
                        </label>
                    </div>

                    <label className="payment-field">
                        <span>Billing ZIP</span>
                        <input
                            type="text"
                            inputMode="numeric"
                            value={form.billingZip}
                            onChange={(e) => handleChange('billingZip', e.target.value)}
                            placeholder="32611"
                            aria-invalid={Boolean(errors.billingZip)}
                        />
                        {errors.billingZip && <small>{errors.billingZip}</small>}
                    </label>

                    <button className="payment-primary-btn" type="submit" disabled={processing}>
                        {processing ? (
                            <>
                                <span className="payment-btn-spinner"></span>
                                Processing...
                            </>
                        ) : (
                            'Process Payment'
                        )}
                    </button>
                </form>
            </main>
        </div>
    );
}

export default Payment;
