import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Menu from './Menu';

const renderMenu = (stallId = '0') => {
  return render(
    <MemoryRouter initialEntries={[`/menu/${stallId}`]}>
      <Routes>
        <Route path="/menu/:stallId" element={<Menu onLogout={() => {}} showToast={jest.fn()} />} />
      </Routes>
    </MemoryRouter>
  );
};

describe('Menu Component', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    global.fetch = jest.fn(() => Promise.reject(new Error('API not available')));
  });

  test('renders without crashing', async () => {
    renderMenu();
    await waitFor(() => {
      expect(document.body).toBeInTheDocument();
    });
  });

  test('shows loading state initially', () => {
    renderMenu();
    expect(screen.getByText('Loading menu...')).toBeInTheDocument();
  });

  test('renders menu for stall 0 with fallback data', async () => {
    renderMenu('0');
    await waitFor(() => {
      expect(screen.getByText(/Menu/)).toBeInTheDocument();
    });
  });
});
