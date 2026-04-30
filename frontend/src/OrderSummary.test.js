import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import OrderSummary from './OrderSummary';

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

// Mock cart data
const mockCartItems = [
    { id: '101', name: 'Iced Latte', desc: 'Chilled espresso', price: 4.50, quantity: 2 },
    { id: '201', name: 'Classic Burger', desc: 'Beef patty', price: 8.99, quantity: 1 },
];

const mockUser = { id: 1, name: 'Test User', email: 'test@ufl.edu' };

const renderOrderSummary = (props = {}) => {
    return render(
        <BrowserRouter>
            <OrderSummary onLogout={jest.fn()} showToast={jest.fn()} {...props} />
        </BrowserRouter>
    );
};

describe('OrderSummary Component', () => {
    beforeEach(() => {
        localStorage.clear();
        mockNavigate.mockClear();
        jest.restoreAllMocks();
    });

    const setPaidPaymentResult = () => {
        localStorage.setItem('paymentResult', JSON.stringify({
            status: 'paid',
            transactionId: 'txn_123',
        }));
    };

    // ─── Redirect Tests ────────

    test('redirects to cart if cart is empty and no user ID', async () => {
        global.fetch = jest.fn();
        await act(async () => {
            renderOrderSummary();
        });
        expect(mockNavigate).toHaveBeenCalledWith('/cart');
    });

    // ─── localStorage Fallback Tests ────────

    test('displays order items from localStorage when no user ID', async () => {
        localStorage.setItem('cart', JSON.stringify(mockCartItems));
        global.fetch = jest.fn();
        await act(async () => {
            renderOrderSummary();
        });
        expect(screen.getByText('Iced Latte')).toBeInTheDocument();
        expect(screen.getByText('Classic Burger')).toBeInTheDocument();
    });

    test('displays correct subtotal, tax, and total', async () => {
        localStorage.setItem('cart', JSON.stringify(mockCartItems));
        global.fetch = jest.fn();
        await act(async () => {
            renderOrderSummary();
        });
        // Subtotal: 4.50*2 + 8.99*1 = 17.99
        const subtotalEl = document.querySelectorAll('.order-row span');
        expect(screen.getByText('$17.99')).toBeInTheDocument();
        // Tax: 17.99 * 0.07 = 1.26
        expect(screen.getByText('$1.26')).toBeInTheDocument();
        // Total: 17.99 + 1.26 = 19.25
        expect(screen.getByText('$19.25')).toBeInTheDocument();
    });

    test('displays item quantities', async () => {
        localStorage.setItem('cart', JSON.stringify(mockCartItems));
        global.fetch = jest.fn();
        await act(async () => {
            renderOrderSummary();
        });
        expect(screen.getByText('×2')).toBeInTheDocument();
        expect(screen.getByText('×1')).toBeInTheDocument();
    });

    test('renders Continue to Payment button before payment is complete', async () => {
        localStorage.setItem('cart', JSON.stringify(mockCartItems));
        global.fetch = jest.fn();
        await act(async () => {
            renderOrderSummary();
        });
        expect(screen.getByText('Continue to Payment')).toBeInTheDocument();
    });

    test('routes to payment before allowing order placement', async () => {
        localStorage.setItem('cart', JSON.stringify(mockCartItems));
        const mockShowToast = jest.fn();
        global.fetch = jest.fn();
        await act(async () => {
            renderOrderSummary({ showToast: mockShowToast });
        });

        fireEvent.click(screen.getByText('Continue to Payment'));

        expect(mockShowToast).toHaveBeenCalledWith('Complete payment before placing your order.', 'error');
        expect(mockNavigate).toHaveBeenCalledWith('/payment');
    });

    test('renders back to cart button', async () => {
        localStorage.setItem('cart', JSON.stringify(mockCartItems));
        global.fetch = jest.fn();
        await act(async () => {
            renderOrderSummary();
        });
        expect(screen.getByText('← Back to Cart')).toBeInTheDocument();
    });

    // ─── Backend API Tests ────────

    test('shows loading spinner while fetching from API', async () => {
        localStorage.setItem('user', JSON.stringify(mockUser));
        global.fetch = jest.fn(() => new Promise(() => {}));
        await act(async () => {
            renderOrderSummary();
        });
        expect(screen.getByText('Loading order summary...')).toBeInTheDocument();
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
            renderOrderSummary();
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

    test('shows order confirmation with number after placing order', async () => {
        localStorage.setItem('cart', JSON.stringify(mockCartItems));
        setPaidPaymentResult();
        const mockShowToast = jest.fn();
        global.fetch = jest.fn(() =>
            Promise.resolve({ ok: true, json: () => Promise.resolve({ success: true }) })
        );

        await act(async () => {
            renderOrderSummary({ showToast: mockShowToast });
        });

        await act(async () => {
            fireEvent.click(screen.getByText('Place Order'));
        });

        await waitFor(() => {
            expect(screen.getByText('Order Confirmed!')).toBeInTheDocument();
            expect(screen.getByText('Confirmation #')).toBeInTheDocument();
            expect(screen.getByText(/GD-/)).toBeInTheDocument();
            expect(screen.getByText('Estimated pickup: 15-20 minutes')).toBeInTheDocument();
            expect(mockShowToast).toHaveBeenCalledWith('Order placed successfully!', 'success');
        });
    });

    test('clears localStorage cart after placing order', async () => {
        localStorage.setItem('cart', JSON.stringify(mockCartItems));
        setPaidPaymentResult();
        global.fetch = jest.fn(() =>
            Promise.resolve({ ok: true, json: () => Promise.resolve({ success: true }) })
        );

        await act(async () => {
            renderOrderSummary();
        });

        await act(async () => {
            fireEvent.click(screen.getByText('Place Order'));
        });

        await waitFor(() => {
            expect(localStorage.getItem('cart')).toBeNull();
            expect(localStorage.getItem('paymentResult')).toBeNull();
        });
    });

    test('shows back to restaurants button after order is placed', async () => {
        localStorage.setItem('cart', JSON.stringify(mockCartItems));
        setPaidPaymentResult();
        global.fetch = jest.fn(() =>
            Promise.resolve({ ok: true, json: () => Promise.resolve({ success: true }) })
        );

        await act(async () => {
            renderOrderSummary();
        });

        await act(async () => {
            fireEvent.click(screen.getByText('Place Order'));
        });

        await waitFor(() => {
            expect(screen.getByText('Back to Restaurants')).toBeInTheDocument();
        });
    });

    test('renders Order Summary heading', async () => {
        localStorage.setItem('cart', JSON.stringify(mockCartItems));
        global.fetch = jest.fn();
        await act(async () => {
            renderOrderSummary();
        });
        expect(screen.getByText('Order Summary')).toBeInTheDocument();
    });

    test('shows tax rate label', async () => {
        localStorage.setItem('cart', JSON.stringify(mockCartItems));
        global.fetch = jest.fn();
        await act(async () => {
            renderOrderSummary();
        });
        expect(screen.getByText('Tax (7%)')).toBeInTheDocument();
    });
});
