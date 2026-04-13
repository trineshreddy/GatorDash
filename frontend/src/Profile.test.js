import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Profile from './Profile';

beforeEach(() => {
    localStorage.setItem('user', JSON.stringify({
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        phone: '1234567890',
    }));
    jest.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => ({
            success: true,
            data: { id: 1, name: 'Test User', email: 'test@example.com', phone: '1234567890' },
        }),
    });
});

afterEach(() => {
    localStorage.clear();
    jest.restoreAllMocks();
});

const renderProfile = (showToast = jest.fn()) =>
    render(
        <BrowserRouter>
            <Profile onLogout={() => {}} showToast={showToast} />
        </BrowserRouter>
    );

describe('Profile Component', () => {
    test('renders profile data from API', async () => {
        renderProfile();
        await waitFor(() => {
            expect(screen.getByText('Test User')).toBeInTheDocument();
            expect(screen.getByText('test@example.com')).toBeInTheDocument();
        });
    });

    test('shows loading state while fetching', () => {
        renderProfile();
        expect(document.querySelector('.spinner')).toBeInTheDocument();
    });

    test('edit mode shows input fields with current values', async () => {
        renderProfile();
        await waitFor(() => expect(screen.getByText('Edit Profile')).toBeInTheDocument());
        fireEvent.click(screen.getByText('Edit Profile'));
        const inputs = screen.getAllByRole('textbox');
        expect(inputs.length).toBeGreaterThan(0);
        expect(screen.getByText('Save')).toBeInTheDocument();
        expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    test('shows validation error for invalid email', async () => {
        renderProfile();
        await waitFor(() => expect(screen.getByText('Edit Profile')).toBeInTheDocument());
        fireEvent.click(screen.getByText('Edit Profile'));
        const inputs = screen.getAllByRole('textbox');
        // Email is the second input (name, email, phone)
        fireEvent.change(inputs[1], { target: { value: 'invalidemail' } });
        fireEvent.click(screen.getByText('Save'));
        await waitFor(() => {
            expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
        });
    });

    test('shows validation error for invalid phone', async () => {
        renderProfile();
        await waitFor(() => expect(screen.getByText('Edit Profile')).toBeInTheDocument());
        fireEvent.click(screen.getByText('Edit Profile'));
        const inputs = screen.getAllByRole('textbox');
        fireEvent.change(inputs[2], { target: { value: '123' } });
        fireEvent.click(screen.getByText('Save'));
        await waitFor(() => {
            expect(screen.getByText(/10 digits/i)).toBeInTheDocument();
        });
    });

    test('cancels editing and restores original values', async () => {
        renderProfile();
        await waitFor(() => expect(screen.getByText('Edit Profile')).toBeInTheDocument());
        fireEvent.click(screen.getByText('Edit Profile'));
        fireEvent.click(screen.getByText('Cancel'));
        expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    test('Change Password section renders when toggled', async () => {
        renderProfile();
        await waitFor(() => expect(screen.getByText(/change password/i)).toBeInTheDocument());
        fireEvent.click(screen.getByText(/change password/i));
        expect(screen.getByPlaceholderText(/current password/i)).toBeInTheDocument();
        const newPassInputs = screen.getAllByPlaceholderText(/new password/i);
        expect(newPassInputs.length).toBeGreaterThan(0);
        expect(screen.getByPlaceholderText(/confirm new password/i)).toBeInTheDocument();
    });

    test('save calls PUT /api/user/:id with updated data', async () => {
        renderProfile();
        await waitFor(() => expect(screen.getByText('Edit Profile')).toBeInTheDocument());
        fireEvent.click(screen.getByText('Edit Profile'));
        const inputs = screen.getAllByRole('textbox');
        fireEvent.change(inputs[0], { target: { value: 'New Name' } });
        fireEvent.click(screen.getByText('Save'));
        await waitFor(() => {
            const calls = global.fetch.mock.calls;
            const putCall = calls.find(c => c[0] === '/api/user/1' && c[1]?.method === 'PUT');
            expect(putCall).toBeTruthy();
        });
    });
});