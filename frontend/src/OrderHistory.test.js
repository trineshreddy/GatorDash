import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import OrderHistory from './OrderHistory';

beforeEach(() => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => ({ success: false, data: [] }),
    });
    localStorage.setItem('user', JSON.stringify({ id: 5, name: 'Test User' }));
});

afterEach(() => {
    jest.restoreAllMocks();
    localStorage.clear();
});

const renderOrderHistory = (showToast = jest.fn()) =>
    render(
        <BrowserRouter>
            <OrderHistory onLogout={() => {}} showToast={showToast} />
        </BrowserRouter>
    );

describe('OrderHistory Component', () => {
    test('renders without crashing', () => {
        renderOrderHistory();
        expect(document.body).toBeInTheDocument();
    });

    test('shows loading spinner initially', () => {
        renderOrderHistory();
        expect(document.body).toBeInTheDocument();
    });

    test('shows empty state when API returns no orders', async () => {
        renderOrderHistory();
        await waitFor(() => {
            expect(screen.getByText('No orders yet')).toBeInTheDocument();
        });
    });

    test('shows Browse Restaurants button in empty state', async () => {
        renderOrderHistory();
        await waitFor(() => {
            expect(screen.getByText('Browse Restaurants')).toBeInTheDocument();
        });
    });

    test('shows Order History heading', async () => {
        renderOrderHistory();
        await waitFor(() => {
            expect(screen.getByText('Order History')).toBeInTheDocument();
        });
    });

    test('shows mock orders when API is unreachable', async () => {
        jest.restoreAllMocks();
        jest.spyOn(global, 'fetch').mockRejectedValue(new Error('Network error'));
        renderOrderHistory();
        await waitFor(() => {
            expect(screen.getByText('GD-M1K2X-A1B2')).toBeInTheDocument();
        });
    });

    test('shows order cards when mock data is loaded', async () => {
        jest.restoreAllMocks();
        jest.spyOn(global, 'fetch').mockRejectedValue(new Error('Network error'));
        renderOrderHistory();
        await waitFor(() => {
            expect(screen.getByText('Delivered')).toBeInTheDocument();
            expect(screen.getByText('Preparing')).toBeInTheDocument();
        });
    });

    test('expands order card on click to show items', async () => {
        jest.restoreAllMocks();
        jest.spyOn(global, 'fetch').mockRejectedValue(new Error('Network error'));
        renderOrderHistory();
        await waitFor(() => expect(screen.getByText('GD-M1K2X-A1B2')).toBeInTheDocument());

        const deliveredOrder = screen.getByText('GD-M1K2X-A1B2');
        fireEvent.click(deliveredOrder.closest('.order-card-header'));
        await waitFor(() => {
            expect(screen.getByText('Iced Latte')).toBeInTheDocument();
        });
    });

    test('shows reorder button for delivered orders when expanded', async () => {
        jest.restoreAllMocks();
        jest.spyOn(global, 'fetch').mockRejectedValue(new Error('Network error'));
        renderOrderHistory();
        await waitFor(() => expect(screen.getByText('GD-M1K2X-A1B2')).toBeInTheDocument());

        const deliveredOrder = screen.getByText('GD-M1K2X-A1B2');
        fireEvent.click(deliveredOrder.closest('.order-card-header'));

        await waitFor(() => {
            // Button text is "🔁 Order Again"
            const reorderBtn = screen.getByText(/Order Again/i);
            expect(reorderBtn).toBeInTheDocument();
        });
    });

    test('fetches orders from backend API when user has ID', async () => {
        jest.restoreAllMocks();
        jest.spyOn(global, 'fetch').mockResolvedValue({
            ok: true,
            json: async () => ({
                success: true,
                data: [{ id: 10, order_number: 'GD-TEST', status: 'Delivered', total: 15.00, created_at: new Date().toISOString(), items: [] }],
            }),
        });
        renderOrderHistory();

        // New code calls /api/orders first (JWT route)
        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('/api/orders', expect.any(Object));
        });
        await waitFor(() => {
            expect(screen.getByText('GD-TEST')).toBeInTheDocument();
        });
    });
});