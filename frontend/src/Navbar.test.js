import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Navbar from './Navbar';

beforeEach(() => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => ({
            success: true,
            data: [
                { id: 1, menu_item_id: 101, quantity: 2 },
                { id: 2, menu_item_id: 102, quantity: 1 },
            ],
        }),
    });
    localStorage.setItem('user', JSON.stringify({ id: 1, name: 'Test User' }));
});

afterEach(() => {
    jest.restoreAllMocks();
    localStorage.clear();
});

const renderNavbar = (path = '/foodstalls') =>
    render(
        <MemoryRouter initialEntries={[path]}>
            <Navbar onSignOut={jest.fn()} />
        </MemoryRouter>
    );

describe('Navbar Component', () => {
    test('renders without crashing', () => {
        renderNavbar();
        expect(document.body).toBeInTheDocument();
    });

    test('renders cart badge with count from API', async () => {
        renderNavbar();
        await waitFor(() => {
            const badge = screen.queryByText('3'); // 2+1
            expect(badge).toBeInTheDocument();
        });
    });

    test('"Order History" link is present', () => {
        renderNavbar();
        expect(screen.getByText('Order History')).toBeInTheDocument();
    });

    test('Sign Out clears localStorage', async () => {
        localStorage.setItem('cart', JSON.stringify([{ id: 1 }]));
        renderNavbar();
        fireEvent.click(screen.getByText('Sign Out'));
        await waitFor(() => {
            expect(localStorage.getItem('user')).toBeNull();
            expect(localStorage.getItem('cart')).toBeNull();
        });
    });

    test('active route highlighting works for current page', () => {
        renderNavbar('/profile');
        const profileBtn = screen.getByText('Profile');
        expect(profileBtn.classList.contains('active-route')).toBe(true);
    });

    test('shows no badge when cart is empty', async () => {
        jest.restoreAllMocks();
        jest.spyOn(global, 'fetch').mockResolvedValue({
            ok: true,
            json: async () => ({ success: true, data: [] }),
        });
        localStorage.removeItem('cart');
        renderNavbar();
        await waitFor(() => {
            expect(screen.queryByText('0')).not.toBeInTheDocument();
        });
    });
});