import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Navbar from './Navbar';

const renderNavbar = () => {
  return render(
    <BrowserRouter>
      <Navbar onSignOut={() => {}} />
    </BrowserRouter>
  );
};

describe('Navbar Component', () => {
  test('renders without crashing', () => {
    renderNavbar();
    expect(document.body).toBeInTheDocument();
  });

  test('displays cart badge when items are in localStorage', () => {
    localStorage.setItem('cart', JSON.stringify([
      { id: 1, name: 'Burger', price: 5.99 },
      { id: 2, name: 'Fries', price: 2.99 },
    ]));
    renderNavbar();
    const badge = screen.queryByText('2');
    expect(badge).toBeInTheDocument();
    localStorage.removeItem('cart');
  });

  test('shows no badge when cart is empty', () => {
    localStorage.removeItem('cart');
    renderNavbar();
    const badge = screen.queryByText('0');
    expect(badge).not.toBeInTheDocument();
  });
});
