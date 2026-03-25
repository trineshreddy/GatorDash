import React from 'react';
import { render, screen } from '@testing-library/react';
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
  test('renders without crashing', () => {
    renderMenu();
    expect(document.body).toBeInTheDocument();
  });

  test('displays Add to Cart button', () => {
    renderMenu();
    const buttons = screen.getAllByText(/add to cart/i);
    expect(buttons.length).toBeGreaterThan(0);
  });

  test('renders menu for stall 0', () => {
    renderMenu('0');
    expect(document.body).toBeInTheDocument();
  });
});
