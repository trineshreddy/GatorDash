import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Cart from './Cart';

// Mock cart data (backend format)
const mockCartItems = [
    { id: '101', name: 'Iced Latte', desc: 'Chilled espresso', price: 4.50, quantity: 2 },
    { id: '201', name: 'Classic Burger', desc: 'Beef patty', price: 8.99, quantity: 1 },
];

// Mock user
const mockUser = { id: 1, name: 'Test User', email: 'test@ufl.edu' };

const renderCart = (props = {}) => {
    return render(
        <BrowserRouter>
            <Cart onLogout={jest.fn()} showToast={jest.fn()} {...props} />
        </BrowserRouter>
    );
};

describe('Cart Component', () => {
    beforeEach(() => {
        localStorage.clear();
        jest.restoreAllMocks();
    });

    // ─── localStorage Fallback Tests (existing behavior) ────────

    test('shows empty cart message when no items and no user', async () => {
        // No user → falls back to localStorage which is empty
        global.fetch = jest.fn();
        await act(async () => {
            renderCart();
        });
        expect(screen.getByText('Your cart is empty.')).toBeInTheDocument();
    });

    test('shows browse restaurants button when cart is empty', async () => {
        global.fetch = jest.fn();
        await act(async () => {
            renderCart();
        });
        expect(screen.getByText('Browse Restaurants')).toBeInTheDocument();
    });

    test('displays cart items from localStorage when no user ID', async () => {
        localStorage.setItem('cart', JSON.stringify(mockCartItems));
        global.fetch = jest.fn();
        await act(async () => {
            renderCart();
        });
        expect(screen.getByText('Iced Latte')).toBeInTheDocument();
        expect(screen.getByText('Classic Burger')).toBeInTheDocument();
    });

    test('displays correct total from localStorage items', async () => {
        localStorage.setItem('cart', JSON.stringify(mockCartItems));
        global.fetch = jest.fn();
        await act(async () => {
            renderCart();
        });
        // 4.50 * 2 + 8.99 * 1 = 17.99
        expect(screen.getByText('$17.99')).toBeInTheDocument();
    });

    test('removes item when remove button is clicked', async () => {
        localStorage.setItem('cart', JSON.stringify(mockCartItems));
        global.fetch = jest.fn();
        await act(async () => {
            renderCart();
        });
        const removeButtons = screen.getAllByText('Remove');
        await act(async () => {
            fireEvent.click(removeButtons[0]);
        });
        expect(screen.queryByText('Iced Latte')).not.toBeInTheDocument();
    });

    test('clears all items when clear cart is clicked', async () => {
        localStorage.setItem('cart', JSON.stringify(mockCartItems));
        global.fetch = jest.fn();
        await act(async () => {
            renderCart();
        });
        await act(async () => {
            fireEvent.click(screen.getByText('Clear Cart'));
        });
        expect(screen.getByText('Your cart is empty.')).toBeInTheDocument();
    });

    test('displays quantity controls for each item', async () => {
        localStorage.setItem('cart', JSON.stringify([mockCartItems[0]]));
        global.fetch = jest.fn();
        await act(async () => {
            renderCart();
        });
        const qtyDisplay = document.querySelector('.qty-display');
        expect(qtyDisplay).toBeInTheDocument();
        expect(qtyDisplay.textContent).toBe('2'); // quantity display
        expect(screen.getByText('−')).toBeInTheDocument(); // decrease button
        expect(screen.getByText('+')).toBeInTheDocument(); // increase button
    });

    // ─── Backend API Integration Tests ────────

    test('shows loading spinner while fetching cart from API', async () => {
        localStorage.setItem('user', JSON.stringify(mockUser));
        // Never resolve the fetch to keep loading state
        global.fetch = jest.fn(() => new Promise(() => {}));
        await act(async () => {
            renderCart();
        });
        expect(screen.getByText('Loading your cart...')).toBeInTheDocument();
    });

    test('fetches cart from backend API when user has ID', async () => {
        localStorage.setItem('user', JSON.stringify(mockUser));
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ success: true, data: mockCartItems }),
            })
        );

        await act(async () => {
            renderCart();
        });

        expect(global.fetch).toHaveBeenCalledWith(
            '/api/cart/1',
            expect.objectContaining({
                headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
            })
        );
        await waitFor(() => {
            expect(screen.getByText('Iced Latte')).toBeInTheDocument();
        });
    });

    test('falls back to localStorage when API fails', async () => {
        localStorage.setItem('user', JSON.stringify(mockUser));
        localStorage.setItem('cart', JSON.stringify(mockCartItems));
        global.fetch = jest.fn(() => Promise.reject(new Error('Network error')));

        await act(async () => {
            renderCart();
        });

        await waitFor(() => {
            expect(screen.getByText('Iced Latte')).toBeInTheDocument();
            expect(screen.getByText('Classic Burger')).toBeInTheDocument();
        });
    });

    test('calls DELETE API when removing item with user ID', async () => {
        localStorage.setItem('user', JSON.stringify(mockUser));
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ success: true, data: mockCartItems }),
            })
        );

        await act(async () => {
            renderCart();
        });

        await waitFor(() => {
            expect(screen.getByText('Iced Latte')).toBeInTheDocument();
        });

        await act(async () => {
            const removeButtons = screen.getAllByText('Remove');
            fireEvent.click(removeButtons[0]);
        });

        expect(global.fetch).toHaveBeenCalledWith(
            '/api/cart/1/item/101',
            expect.objectContaining({ method: 'DELETE' })
        );
    });

    test('calls clear API when clearing cart with user ID', async () => {
        localStorage.setItem('user', JSON.stringify(mockUser));
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ success: true, data: mockCartItems }),
            })
        );

        await act(async () => {
            renderCart();
        });

        await waitFor(() => {
            expect(screen.getByText('Iced Latte')).toBeInTheDocument();
        });

        await act(async () => {
            fireEvent.click(screen.getByText('Clear Cart'));
        });

        expect(global.fetch).toHaveBeenCalledWith(
            '/api/cart/1/clear',
            expect.objectContaining({ method: 'DELETE' })
        );
    });

    test('displays per-item line total', async () => {
        localStorage.setItem('cart', JSON.stringify(mockCartItems));
        global.fetch = jest.fn();
        await act(async () => {
            renderCart();
        });
        const lineTotals = document.querySelectorAll('.item-line-total');
        expect(lineTotals).toHaveLength(2);
        // Iced Latte: $4.50 * 2 = $9.00
        expect(lineTotals[0].textContent).toContain('9.00');
        // Classic Burger: $8.99 * 1 = $8.99
        expect(lineTotals[1].textContent).toContain('8.99');
    });

    test('displays empty cart icon when cart is empty', async () => {
        global.fetch = jest.fn();
        await act(async () => {
            renderCart();
        });
        expect(screen.getByText('🛒')).toBeInTheDocument();
    });
});
