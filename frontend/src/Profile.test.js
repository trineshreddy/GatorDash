import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Profile from './Profile';

const renderProfile = (showToast = jest.fn()) => {
  return render(
    <BrowserRouter>
      <Profile onLogout={() => {}} showToast={showToast} />
    </BrowserRouter>
  );
};

describe('Profile Component', () => {
  beforeEach(() => {
    localStorage.setItem('user', JSON.stringify({
      name: 'Test User',
      email: 'test@example.com',
      phone: '1234567890',
    }));
  });

  afterEach(() => {
    localStorage.removeItem('user');
  });

  test('renders the profile page', () => {
    renderProfile();
    expect(screen.getByText('My Profile')).toBeInTheDocument();
  });

  test('displays user name from localStorage', () => {
    renderProfile();
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  test('displays user email from localStorage', () => {
    renderProfile();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  test('shows edit form when Edit Profile is clicked', () => {
    renderProfile();
    fireEvent.click(screen.getByText('Edit Profile'));
    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  test('cancels editing and restores original values', () => {
    renderProfile();
    fireEvent.click(screen.getByText('Edit Profile'));
    fireEvent.click(screen.getByText('Cancel'));
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });
});
