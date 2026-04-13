import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Menu from './Menu';

beforeEach(() => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => ({
            success: true,
            data: [
                { id: '101', name: 'Iced Latte', description: 'Chilled espresso with milk', price: 4.50 },
                { id: '102', name: 'Almond Croissant', description: 'Flaky pastry', price: 3.75 },
            ],
        }),
    });
    localStorage.setItem('user', JSON.stringify({ id: 1, name: 'Test User' }));
});

afterEach(() => {
    jest.restoreAllMocks();
    localStorage.clear();
});

const renderMenu = (stallId = '0') =>
    render(
        <MemoryRouter initialEntries={[`/menu/${stallId}`]}>
            <Routes>
                <Route path="/menu/:stallId" element={<Menu onLogout={() => {}} showToast={jest.fn()} />} />
            </Routes>
        </MemoryRouter>
    );

describe('Menu Component', () => {
    test('renders loading spinner while fetching menu from API', () => {
        renderMenu();
        expect(document.querySelector('.spinner')).toBeInTheDocument();
    });

    test('renders menu items from API response', async () => {
        renderMenu();
        await waitFor(() => {
            expect(screen.getByText('Iced Latte')).toBeInTheDocument();
            expect(screen.getByText('Almond Croissant')).toBeInTheDocument();
        });
    });

    test('quantity selector increments correctly', async () => {
        renderMenu();
        await waitFor(() => expect(screen.getByText('Iced Latte')).toBeInTheDocument());
        const plusBtns = screen.getAllByText('+');
        fireEvent.click(plusBtns[0]);
        const displays = screen.getAllByText('1');
        expect(displays.length).toBeGreaterThan(0);
    });

    test('quantity selector decrements correctly', async () => {
        renderMenu();
        await waitFor(() => expect(screen.getByText('Iced Latte')).toBeInTheDocument());
        const plusBtns = screen.getAllByText('+');
        fireEvent.click(plusBtns[0]);
        const minusBtns = screen.getAllByText('−');
        fireEvent.click(minusBtns[0]);
        const displays = screen.getAllByText('0');
        expect(displays.length).toBeGreaterThan(0);
    });

    test('"Add to Cart" button appears only when quantity > 0', async () => {
        renderMenu();
        await waitFor(() => expect(screen.getByText('Iced Latte')).toBeInTheDocument());
        expect(screen.queryByText('Add to Cart')).not.toBeInTheDocument();
        const plusBtns = screen.getAllByText('+');
        fireEvent.click(plusBtns[0]);
        expect(screen.getByText('Add to Cart')).toBeInTheDocument();
    });

    test('"Add to Cart" calls POST /api/cart/add with correct payload', async () => {
        renderMenu();
        await waitFor(() => expect(screen.getByText('Iced Latte')).toBeInTheDocument());
        const plusBtns = screen.getAllByText('+');
        fireEvent.click(plusBtns[0]);
        fireEvent.click(screen.getByText('Add to Cart'));
        await waitFor(() => {
            const calls = global.fetch.mock.calls;
            const cartCall = calls.find(c => c[0] === '/api/cart/add');
            expect(cartCall).toBeTruthy();
            const body = JSON.parse(cartCall[1].body);
            expect(body.menu_item_id).toBe('101');
            expect(body.quantity).toBe(1);
        });
    });

    test('falls back to hardcoded data when API fails', async () => {
        jest.restoreAllMocks();
        jest.spyOn(global, 'fetch').mockRejectedValue(new Error('Network error'));
        renderMenu('0');
        await waitFor(() => {
            expect(screen.getByText('Iced Latte')).toBeInTheDocument();
        });
    });

    test('renders without crashing for unknown stall', async () => {
        jest.restoreAllMocks();
        jest.spyOn(global, 'fetch').mockRejectedValue(new Error('Network error'));
        renderMenu('999');
        await waitFor(() => expect(document.body).toBeInTheDocument());
    });
});