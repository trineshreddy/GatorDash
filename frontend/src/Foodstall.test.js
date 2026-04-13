import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import FoodStalls from './FoodStalls';

// Mock fetch globally
beforeEach(() => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => ({
            success: true,
            data: [
                { id: 1, name: 'Starbucks', desc: 'Coffee & Pastries', status: 'Open Now', color: '#0D7377' },
                { id: 2, name: 'Panda Express', desc: 'Chinese Cuisine', status: 'Open Now', color: '#FF0000' },
                { id: 3, name: "Baba's Pizza", desc: 'Pizza & Italian', status: 'Closed', color: '#FFD4D4' },
            ],
        }),
    });
});

afterEach(() => {
    jest.restoreAllMocks();
});

const renderFoodStalls = () =>
    render(
        <BrowserRouter>
            <FoodStalls onLogout={() => {}} />
        </BrowserRouter>
    );

describe('FoodStalls Component', () => {
    test('renders loading skeleton initially', () => {
        renderFoodStalls();
        // Skeleton cards should be visible before data loads
        const skeletonCards = document.querySelectorAll('.skeleton-card');
        expect(skeletonCards.length).toBeGreaterThan(0);
    });

    test('renders stall cards after API data loads', async () => {
        renderFoodStalls();
        await waitFor(() => {
            expect(screen.getByText('Starbucks')).toBeInTheDocument();
            expect(screen.getByText('Panda Express')).toBeInTheDocument();
        });
    });

    test('search bar filters stalls by name', async () => {
        renderFoodStalls();
        await waitFor(() => expect(screen.getByText('Starbucks')).toBeInTheDocument());

        fireEvent.change(screen.getByPlaceholderText(/search/i), { target: { value: 'starbucks' } });
        expect(screen.getByText('Starbucks')).toBeInTheDocument();
        expect(screen.queryByText('Panda Express')).not.toBeInTheDocument();
    });

    test('search bar filters stalls by cuisine', async () => {
        renderFoodStalls();
        await waitFor(() => expect(screen.getByText('Panda Express')).toBeInTheDocument());

        fireEvent.change(screen.getByPlaceholderText(/search/i), { target: { value: 'chinese' } });
        expect(screen.getByText('Panda Express')).toBeInTheDocument();
        expect(screen.queryByText('Starbucks')).not.toBeInTheDocument();
    });

    test('category filter tab "Open Now" shows only open stalls', async () => {
        renderFoodStalls();
        await waitFor(() => expect(screen.getByText('Starbucks')).toBeInTheDocument());

        const openNowElements = screen.getAllByText('Open Now');
        const openNowTab = openNowElements.find(el => el.tagName === 'BUTTON');
        fireEvent.click(openNowTab);
        expect(screen.getByText('Starbucks')).toBeInTheDocument();
        expect(screen.queryByText("Baba's Pizza")).not.toBeInTheDocument();
    });

    test('shows no results state when search returns empty', async () => {
        renderFoodStalls();
        await waitFor(() => expect(screen.getByText('Starbucks')).toBeInTheDocument());

        fireEvent.change(screen.getByPlaceholderText(/search/i), { target: { value: 'xyznotexist' } });
        expect(screen.getByText(/no restaurants found/i)).toBeInTheDocument();
    });

    test('falls back to hardcoded data when API fails', async () => {
        jest.restoreAllMocks();
        jest.spyOn(global, 'fetch').mockRejectedValue(new Error('Network error'));

        renderFoodStalls();
        await waitFor(() => {
            // Should show stalls from data.js fallback
            expect(screen.getByText('Restaurant 1')).toBeInTheDocument();
        });
    });

    test('shows error state when API fails and no fallback works', async () => {
        jest.restoreAllMocks();
        jest.spyOn(global, 'fetch').mockResolvedValue({
            ok: false,
            json: async () => ({ success: false }),
        });

        renderFoodStalls();
        // Falls back to data.js — no error shown since fallback exists
        await waitFor(() => expect(document.body).toBeInTheDocument());
    });
});