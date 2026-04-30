import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SignIn from './SignIn';

const renderSignIn = (props = {}) => {
    return render(
        <BrowserRouter>
            <SignIn onSignIn={jest.fn()} {...props} />
        </BrowserRouter>
    );
};

describe('SignIn Component', () => {
    test('renders sign in form with email and password fields', () => {
        renderSignIn();
        expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument();
    });

    test('renders sign in button', () => {
        renderSignIn();
        expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    test('renders link to sign up page', () => {
        renderSignIn();
        expect(screen.getByText(/sign up here/i)).toBeInTheDocument();
    });

    test('calls onSignIn with email and password on submit', async () => {
        const mockSignIn = jest.fn().mockResolvedValue();
        renderSignIn({ onSignIn: mockSignIn });

        fireEvent.change(screen.getByPlaceholderText('Enter your email'), {
            target: { value: 'user@example.com' },
        });
        fireEvent.change(screen.getByPlaceholderText('Enter your password'), {
            target: { value: 'Password123' },
        });
        fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

        await waitFor(() => {
            expect(mockSignIn).toHaveBeenCalledWith('user@example.com', 'Password123');
        });
    });

    test('disables submit button while sign in request is running', async () => {
        let resolveSignIn;
        const mockSignIn = jest.fn(() => new Promise((resolve) => {
            resolveSignIn = resolve;
        }));

        renderSignIn({ onSignIn: mockSignIn });

        fireEvent.change(screen.getByPlaceholderText('Enter your email'), {
            target: { value: 'user@example.com' },
        });
        fireEvent.change(screen.getByPlaceholderText('Enter your password'), {
            target: { value: 'Password123' },
        });
        fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

        expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled();

        resolveSignIn();

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /sign in/i })).not.toBeDisabled();
        });
    });

    test('password visibility toggle works', () => {
        renderSignIn();
        const passwordInput = screen.getByPlaceholderText('Enter your password');
        expect(passwordInput).toHaveAttribute('type', 'password');

        const toggleBtn = screen.getByLabelText('Show password');
        fireEvent.click(toggleBtn);
        expect(passwordInput).toHaveAttribute('type', 'text');
    });
});
