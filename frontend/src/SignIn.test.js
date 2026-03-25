import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
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

    test('calls onSignIn with email and password on submit', () => {
        const mockSignIn = jest.fn();
        renderSignIn({ onSignIn: mockSignIn });

        fireEvent.change(screen.getByPlaceholderText('Enter your email'), {
            target: { value: 'user@example.com' },
        });
        fireEvent.change(screen.getByPlaceholderText('Enter your password'), {
            target: { value: 'Password123' },
        });
        fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

        expect(mockSignIn).toHaveBeenCalledWith('user@example.com', 'Password123');
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
