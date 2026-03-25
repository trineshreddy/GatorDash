import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Cart from './Cart';

// Mock localStorage
const mockCart = [
    { id: '101', name: 'Iced Latte', desc: 'Chilled espresso', price: '$4.50', quantity: 2 },
    { id: '201', name: 'Classic Burger', desc: 'Beef patty', price: '$8.99', quantity: 1 },
];

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
    });

    test('shows empty cart message when no items', () => {
        renderCart();
        expect(screen.getByText('Your cart is empty.')).toBeInTheDocument();
    });

    test('shows browse restaurants button when cart is empty', () => {
        renderCart();
        expect(screen.getByText('Browse Restaurants')).toBeInTheDocument();
    });

    test('displays cart items from localStorage', () => {
        localStorage.setItem('cart', JSON.stringify(mockCart));
        renderCart();
        expect(screen.getByText('Iced Latte')).toBeInTheDocument();
        expect(screen.getByText('Classic Burger')).toBeInTheDocument();
    });

    test('displays correct total', () => {
        localStorage.setItem('cart', JSON.stringify(mockCart));
        renderCart();
        // 4.50 * 2 + 8.99 * 1 = 17.99
        expect(screen.getByText('$17.99')).toBeInTheDocument();
    });

    test('removes item when remove button is clicked', () => {
        localStorage.setItem('cart', JSON.stringify(mockCart));
        renderCart();
        const removeButtons = screen.getAllByText('Remove');
        fireEvent.click(removeButtons[0]);
        expect(screen.queryByText('Iced Latte')).not.toBeInTheDocument();
    });

    test('clears all items when clear cart is clicked', () => {
        localStorage.setItem('cart', JSON.stringify(mockCart));
        renderCart();
        fireEvent.click(screen.getByText('Clear Cart'));
        expect(screen.getByText('Your cart is empty.')).toBeInTheDocument();
    });

    test('displays quantity controls for each item', () => {
        localStorage.setItem('cart', JSON.stringify([mockCart[0]]));
        renderCart();
        expect(screen.getByText('2')).toBeInTheDocument(); // quantity display
        expect(screen.getByText('−')).toBeInTheDocument(); // decrease button
        expect(screen.getByText('+')).toBeInTheDocument(); // increase button
    });
});
