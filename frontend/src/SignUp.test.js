import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SignUp from './SignUp';

const defaultProps = {
    name: '', setName: jest.fn(),
    email: '', setEmail: jest.fn(),
    phone: '', setPhone: jest.fn(),
    password: '', setPassword: jest.fn(),
    confirmPassword: '', confirmSetPassword: jest.fn(),
    errors: {}, setErrors: jest.fn(),
    passwordFocused: false, setPasswordFocused: jest.fn(),
    showToast: jest.fn(),
};

const renderSignUp = (overrides = {}) => {
    return render(
        <BrowserRouter>
            <SignUp {...defaultProps} {...overrides} />
        </BrowserRouter>
    );
};

describe('SignUp Component', () => {
    beforeEach(() => {
        jest.restoreAllMocks();
    });

    test('renders sign up form', () => {
        renderSignUp();
        expect(screen.getByText('Create Account')).toBeInTheDocument();
        expect(screen.getByText('Join GatorDash today')).toBeInTheDocument();
    });

    test('renders all input fields', () => {
        renderSignUp();
        expect(screen.getByPlaceholderText('Enter your name')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Enter your phone number')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Set up your password')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Re-enter your password')).toBeInTheDocument();
    });

    test('renders sign up button', () => {
        renderSignUp();
        expect(screen.getByText('Sign Up')).toBeInTheDocument();
    });

    test('renders link to sign in page', () => {
        renderSignUp();
        expect(screen.getByText('Sign in here')).toBeInTheDocument();
    });

    test('displays name error when provided', () => {
        renderSignUp({ errors: { name: 'Name is required' } });
        expect(screen.getByText('Name is required')).toBeInTheDocument();
    });

    test('displays email error when provided', () => {
        renderSignUp({ errors: { email: 'Email is required' } });
        expect(screen.getByText('Email is required')).toBeInTheDocument();
    });

    test('displays phone error when provided', () => {
        renderSignUp({ errors: { phone: 'Phone number is required' } });
        expect(screen.getByText('Phone number is required')).toBeInTheDocument();
    });

    test('displays password error when provided', () => {
        renderSignUp({ errors: { password: 'Password must be at least 8 characters' } });
        expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument();
    });

    test('displays confirm password error when provided', () => {
        renderSignUp({ errors: { confirmPassword: 'Passwords do not match' } });
        expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });

    test('shows password strength meter when password is provided', () => {
        renderSignUp({ password: 'short' });
        expect(screen.getByText('Weak')).toBeInTheDocument();
    });

    test('shows Fair strength for medium password', () => {
        renderSignUp({ password: 'longenoughpassword' });
        expect(screen.getByText('Fair')).toBeInTheDocument();
    });

    test('shows Strong strength for strong password', () => {
        renderSignUp({ password: 'StrongPass1' });
        expect(screen.getByText('Strong')).toBeInTheDocument();
    });

    test('has password toggle buttons', () => {
        renderSignUp();
        const toggles = screen.getAllByLabelText('Show password');
        expect(toggles).toHaveLength(2);
    });

    test('disables submit button when there are errors', () => {
        renderSignUp({ errors: { name: 'Name is required' } });
        expect(screen.getByText('Sign Up')).toBeDisabled();
    });

    test('calls setName when name input changes', () => {
        const mockSetName = jest.fn();
        renderSignUp({ setName: mockSetName });
        fireEvent.change(screen.getByPlaceholderText('Enter your name'), {
            target: { value: 'John' },
        });
        expect(mockSetName).toHaveBeenCalledWith('John');
    });

    test('calls setEmail when email input changes', () => {
        const mockSetEmail = jest.fn();
        renderSignUp({ setEmail: mockSetEmail });
        fireEvent.change(screen.getByPlaceholderText('Enter your email'), {
            target: { value: 'test@ufl.edu' },
        });
        expect(mockSetEmail).toHaveBeenCalledWith('test@ufl.edu');
    });

    test('renders GatorDash logo', () => {
        renderSignUp();
        expect(screen.getByAltText('GatorDash')).toBeInTheDocument();
    });
});
