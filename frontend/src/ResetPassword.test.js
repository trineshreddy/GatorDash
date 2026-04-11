import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ResetPassword from './ResetPassword';

const renderResetPassword = (props = {}, route = '/reset-password?token=abc123') => {
    return render(
        <MemoryRouter initialEntries={[route]}>
            <ResetPassword showToast={jest.fn()} {...props} />
        </MemoryRouter>
    );
};

describe('ResetPassword Component', () => {
    beforeEach(() => {
        jest.restoreAllMocks();
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    test('renders reset password form', () => {
        renderResetPassword();
        const heading = document.querySelector('.reset-header h2');
        expect(heading).toBeInTheDocument();
        expect(heading.textContent).toBe('Reset Password');
        expect(screen.getByPlaceholderText('Enter new password')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Re-enter new password')).toBeInTheDocument();
    });

    test('renders reset password button', () => {
        renderResetPassword();
        expect(screen.getByRole('button', { name: /reset password/i })).toBeInTheDocument();
    });

    test('renders back to sign in link', () => {
        renderResetPassword();
        expect(screen.getByText('← Back to Sign In')).toBeInTheDocument();
    });

    test('shows warning when no token in URL', () => {
        renderResetPassword({}, '/reset-password');
        expect(screen.getByText(/No reset token found/)).toBeInTheDocument();
    });

    test('shows error for empty password', () => {
        renderResetPassword();
        fireEvent.click(screen.getByRole('button', { name: /reset password/i }));
        expect(screen.getByText('Password is required')).toBeInTheDocument();
    });

    test('shows error for short password', () => {
        renderResetPassword();
        fireEvent.change(screen.getByPlaceholderText('Enter new password'), {
            target: { value: 'abc' },
        });
        fireEvent.click(screen.getByRole('button', { name: /reset password/i }));
        expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument();
    });

    test('shows error for password without number', () => {
        renderResetPassword();
        fireEvent.change(screen.getByPlaceholderText('Enter new password'), {
            target: { value: 'Abcdefgh' },
        });
        fireEvent.click(screen.getByRole('button', { name: /reset password/i }));
        expect(screen.getByText('Password must contain at least one number')).toBeInTheDocument();
    });

    test('shows error for password without uppercase', () => {
        renderResetPassword();
        fireEvent.change(screen.getByPlaceholderText('Enter new password'), {
            target: { value: 'abcdefg1' },
        });
        fireEvent.click(screen.getByRole('button', { name: /reset password/i }));
        expect(screen.getByText('Password must contain at least one uppercase letter')).toBeInTheDocument();
    });

    test('shows error when passwords do not match', () => {
        renderResetPassword();
        fireEvent.change(screen.getByPlaceholderText('Enter new password'), {
            target: { value: 'Password1' },
        });
        fireEvent.change(screen.getByPlaceholderText('Re-enter new password'), {
            target: { value: 'Password2' },
        });
        fireEvent.click(screen.getByRole('button', { name: /reset password/i }));
        expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });

    test('shows error for empty confirm password', () => {
        renderResetPassword();
        fireEvent.change(screen.getByPlaceholderText('Enter new password'), {
            target: { value: 'Password1' },
        });
        fireEvent.click(screen.getByRole('button', { name: /reset password/i }));
        expect(screen.getByText('Please confirm your password')).toBeInTheDocument();
    });

    test('shows password strength indicator - Weak', () => {
        renderResetPassword();
        fireEvent.change(screen.getByPlaceholderText('Enter new password'), {
            target: { value: 'short' },
        });
        expect(screen.getByText('Weak')).toBeInTheDocument();
    });

    test('shows password strength indicator - Fair', () => {
        renderResetPassword();
        fireEvent.change(screen.getByPlaceholderText('Enter new password'), {
            target: { value: 'longenoughpassword' },
        });
        expect(screen.getByText('Fair')).toBeInTheDocument();
    });

    test('shows password strength indicator - Strong', () => {
        renderResetPassword();
        fireEvent.change(screen.getByPlaceholderText('Enter new password'), {
            target: { value: 'StrongPass1' },
        });
        expect(screen.getByText('Strong')).toBeInTheDocument();
    });

    test('shows success state after mock reset', async () => {
        global.fetch = jest.fn(() => Promise.reject(new Error('Network error')));
        renderResetPassword();

        fireEvent.change(screen.getByPlaceholderText('Enter new password'), {
            target: { value: 'NewPass123' },
        });
        fireEvent.change(screen.getByPlaceholderText('Re-enter new password'), {
            target: { value: 'NewPass123' },
        });

        await act(async () => {
            fireEvent.click(screen.getByRole('button', { name: /reset password/i }));
        });

        await waitFor(() => {
            expect(screen.getByText('Password Reset!')).toBeInTheDocument();
            expect(screen.getByText('Go to Sign In Now')).toBeInTheDocument();
        });
    });

    test('calls showToast on successful reset', async () => {
        const mockToast = jest.fn();
        global.fetch = jest.fn(() => Promise.reject(new Error('Network error')));
        renderResetPassword({ showToast: mockToast });

        fireEvent.change(screen.getByPlaceholderText('Enter new password'), {
            target: { value: 'NewPass123' },
        });
        fireEvent.change(screen.getByPlaceholderText('Re-enter new password'), {
            target: { value: 'NewPass123' },
        });

        await act(async () => {
            fireEvent.click(screen.getByRole('button', { name: /reset password/i }));
        });

        await waitFor(() => {
            expect(mockToast).toHaveBeenCalled();
        });
    });

    test('renders subtitle text', () => {
        renderResetPassword();
        expect(screen.getByText('Enter your new password below.')).toBeInTheDocument();
    });
});
