import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import OrderHistory from './OrderHistory';

const renderOrderHistory = (props = {}) => {
    return render(
        <BrowserRouter>
            <OrderHistory onLogout={jest.fn()} {...props} />
        </BrowserRouter>
    );
};

describe('OrderHistory Component', () => {
    beforeEach(() => {
        localStorage.clear();
        jest.restoreAllMocks();
    });

    test('renders order history heading', async () => {
        global.fetch = jest.fn();
        await act(async () => {
            renderOrderHistory();
        });
        expect(screen.getByText('Order History')).toBeInTheDocument();
    });

    test('renders back to restaurants button', async () => {
        global.fetch = jest.fn();
        await act(async () => {
            renderOrderHistory();
        });
        expect(screen.getByText('← Back to Restaurants')).toBeInTheDocument();
    });

    test('shows loading spinner initially when user has ID', async () => {
        localStorage.setItem('user', JSON.stringify({ id: 1 }));
        global.fetch = jest.fn(() => new Promise(() => {}));
        await act(async () => {
            renderOrderHistory();
        });
        expect(screen.getByText('Loading your orders...')).toBeInTheDocument();
    });

    test('shows mock orders when no user ID', async () => {
        global.fetch = jest.fn();
        await act(async () => {
            renderOrderHistory();
        });
        expect(screen.getByText('GD-M1K2X-A1B2')).toBeInTheDocument();
        expect(screen.getByText('GD-N3P4Q-C3D4')).toBeInTheDocument();
        expect(screen.getByText('GD-R5S6T-E5F6')).toBeInTheDocument();
    });

    test('shows mock orders when API fails', async () => {
        localStorage.setItem('user', JSON.stringify({ id: 1 }));
        global.fetch = jest.fn(() => Promise.reject(new Error('Network error')));

        await act(async () => {
            renderOrderHistory();
        });

        await waitFor(() => {
            expect(screen.getByText('GD-M1K2X-A1B2')).toBeInTheDocument();
        });
    });

    test('displays status badges with correct text', async () => {
        global.fetch = jest.fn();
        await act(async () => {
            renderOrderHistory();
        });
        expect(screen.getByText('Delivered')).toBeInTheDocument();
        expect(screen.getByText('Preparing')).toBeInTheDocument();
        expect(screen.getByText('Cancelled')).toBeInTheDocument();
    });

    test('displays order totals', async () => {
        global.fetch = jest.fn();
        await act(async () => {
            renderOrderHistory();
        });
        expect(screen.getByText('$19.25')).toBeInTheDocument();
        expect(screen.getByText('$12.98')).toBeInTheDocument();
        expect(screen.getByText('$7.49')).toBeInTheDocument();
    });

    test('expands order card on click to show items', async () => {
        global.fetch = jest.fn();
        await act(async () => {
            renderOrderHistory();
        });

        // Click on first order to expand
        const firstOrder = screen.getByText('GD-M1K2X-A1B2');
        fireEvent.click(firstOrder.closest('.order-card-header'));

        await waitFor(() => {
            expect(screen.getByText('Iced Latte')).toBeInTheDocument();
            expect(screen.getByText('Classic Burger')).toBeInTheDocument();
        });
    });

    test('shows reorder button for delivered orders when expanded', async () => {
        global.fetch = jest.fn();
        await act(async () => {
            renderOrderHistory();
        });

        const deliveredOrder = screen.getByText('GD-M1K2X-A1B2');
        fireEvent.click(deliveredOrder.closest('.order-card-header'));

        await waitFor(() => {
            expect(screen.getByText('Order Again')).toBeInTheDocument();
        });
    });

    test('collapses expanded order on second click', async () => {
        global.fetch = jest.fn();
        await act(async () => {
            renderOrderHistory();
        });

        const header = screen.getByText('GD-M1K2X-A1B2').closest('.order-card-header');
        fireEvent.click(header); // expand
        expect(screen.getByText('Iced Latte')).toBeInTheDocument();

        fireEvent.click(header); // collapse
        expect(screen.queryByText('Iced Latte')).not.toBeInTheDocument();
    });

    test('shows item quantities in expanded view', async () => {
        global.fetch = jest.fn();
        await act(async () => {
            renderOrderHistory();
        });

        fireEvent.click(screen.getByText('GD-M1K2X-A1B2').closest('.order-card-header'));

        await waitFor(() => {
            expect(screen.getByText('×2')).toBeInTheDocument();
            expect(screen.getByText('×1')).toBeInTheDocument();
        });
    });

    test('fetches orders from backend API when user has ID', async () => {
        localStorage.setItem('user', JSON.stringify({ id: 5 }));
        const mockOrders = [
            { id: 10, order_number: 'GD-TEST', status: 'Delivered', created_at: new Date().toISOString(), total: 10.00, items: [] },
        ];
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ success: true, data: mockOrders }),
            })
        );

        await act(async () => {
            renderOrderHistory();
        });

        expect(global.fetch).toHaveBeenCalledWith('/api/orders/5');
        await waitFor(() => {
            expect(screen.getByText('GD-TEST')).toBeInTheDocument();
        });
    });
});
