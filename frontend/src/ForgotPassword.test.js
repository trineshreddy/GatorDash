import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ForgotPassword from './ForgotPassword';

const renderForgotPassword = (props = {}) => {
    return render(
        <BrowserRouter>
            <ForgotPassword showToast={jest.fn()} {...props} />
        </BrowserRouter>
    );
};

describe('ForgotPassword Component', () => {
    beforeEach(() => {
        jest.restoreAllMocks();
    });

    test('renders forgot password form', () => {
        renderForgotPassword();
        expect(screen.getByText('Forgot Password?')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Enter your registered email')).toBeInTheDocument();
    });

    test('renders send reset link button', () => {
        renderForgotPassword();
        expect(screen.getByText('Send Reset Link')).toBeInTheDocument();
    });

    test('renders link back to sign in', () => {
        renderForgotPassword();
        expect(screen.getByText('Sign in here')).toBeInTheDocument();
    });

    test('shows error for empty email on submit', async () => {
        renderForgotPassword();
        fireEvent.click(screen.getByText('Send Reset Link'));
        expect(screen.getByText('Email is required')).toBeInTheDocument();
    });

    test('shows error for invalid email format', async () => {
        renderForgotPassword();
        fireEvent.change(screen.getByPlaceholderText('Enter your registered email'), {
            target: { value: 'notanemail' },
        });
        fireEvent.click(screen.getByText('Send Reset Link'));
        expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
    });

    test('clears error when user types in email field', async () => {
        renderForgotPassword();
        fireEvent.click(screen.getByText('Send Reset Link'));
        expect(screen.getByText('Email is required')).toBeInTheDocument();

        fireEvent.change(screen.getByPlaceholderText('Enter your registered email'), {
            target: { value: 't' },
        });
        expect(screen.queryByText('Email is required')).not.toBeInTheDocument();
    });

    test('shows success state after submitting valid email (mock mode)', async () => {
        global.fetch = jest.fn(() => Promise.reject(new Error('Network error')));
        renderForgotPassword();

        fireEvent.change(screen.getByPlaceholderText('Enter your registered email'), {
            target: { value: 'test@ufl.edu' },
        });

        await act(async () => {
            fireEvent.click(screen.getByText('Send Reset Link'));
        });

        await waitFor(() => {
            expect(screen.getByText('Check Your Email')).toBeInTheDocument();
            expect(screen.getByText(/test@ufl.edu/)).toBeInTheDocument();
            expect(screen.getByText('The link will expire in 15 minutes.')).toBeInTheDocument();
        });
    });

    test('shows success state after API returns success', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ success: true }),
            })
        );
        renderForgotPassword();

        fireEvent.change(screen.getByPlaceholderText('Enter your registered email'), {
            target: { value: 'test@ufl.edu' },
        });

        await act(async () => {
            fireEvent.click(screen.getByText('Send Reset Link'));
        });

        await waitFor(() => {
            expect(screen.getByText('Check Your Email')).toBeInTheDocument();
        });
    });

    test('shows error when API returns failure', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: false,
                json: () => Promise.resolve({ success: false, message: 'User not found' }),
            })
        );
        renderForgotPassword();

        fireEvent.change(screen.getByPlaceholderText('Enter your registered email'), {
            target: { value: 'unknown@ufl.edu' },
        });

        await act(async () => {
            fireEvent.click(screen.getByText('Send Reset Link'));
        });

        await waitFor(() => {
            expect(screen.getByText('User not found')).toBeInTheDocument();
        });
    });

    test('calls showToast on successful submission', async () => {
        const mockToast = jest.fn();
        global.fetch = jest.fn(() => Promise.reject(new Error('Network error')));
        renderForgotPassword({ showToast: mockToast });

        fireEvent.change(screen.getByPlaceholderText('Enter your registered email'), {
            target: { value: 'test@ufl.edu' },
        });

        await act(async () => {
            fireEvent.click(screen.getByText('Send Reset Link'));
        });

        await waitFor(() => {
            expect(mockToast).toHaveBeenCalled();
        });
    });

    test('try another email button resets form', async () => {
        global.fetch = jest.fn(() => Promise.reject(new Error('Network error')));
        renderForgotPassword();

        fireEvent.change(screen.getByPlaceholderText('Enter your registered email'), {
            target: { value: 'test@ufl.edu' },
        });

        await act(async () => {
            fireEvent.click(screen.getByText('Send Reset Link'));
        });

        await waitFor(() => {
            expect(screen.getByText('Check Your Email')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('Try Another Email'));
        expect(screen.getByText('Forgot Password?')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Enter your registered email')).toBeInTheDocument();
    });

    test('renders subtitle text', () => {
        renderForgotPassword();
        expect(screen.getByText(/Enter your email and we'll send you a link/)).toBeInTheDocument();
    });
});
