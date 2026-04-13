import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import Toast from './Toast';

describe('Toast Component', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    test('renders nothing when not visible', () => {
        const { container } = render(
            <Toast message="Test" type="success" visible={false} onClose={jest.fn()} />
        );
        expect(container.firstChild).toBeNull();
    });

    test('renders toast message when visible', () => {
        render(<Toast message="Order placed!" type="success" visible={true} onClose={jest.fn()} />);
        expect(screen.getByText('Order placed!')).toBeInTheDocument();
    });

    test('renders success icon for success type', () => {
        render(<Toast message="Done" type="success" visible={true} onClose={jest.fn()} />);
        expect(screen.getByText('✓')).toBeInTheDocument();
    });

    test('renders error icon for error type', () => {
        render(<Toast message="Failed" type="error" visible={true} onClose={jest.fn()} />);
        expect(screen.getByText('✕')).toBeInTheDocument();
    });

    test('renders info icon for info type', () => {
        render(<Toast message="Info" type="info" visible={true} onClose={jest.fn()} />);
        expect(screen.getByText('ℹ')).toBeInTheDocument();
    });

    test('renders warning icon for warning type', () => {
        render(<Toast message="Warning" type="warning" visible={true} onClose={jest.fn()} />);
        expect(screen.getByText('⚠')).toBeInTheDocument();
    });

    test('applies correct CSS class for type', () => {
        render(<Toast message="Error msg" type="error" visible={true} onClose={jest.fn()} />);
        const toast = document.querySelector('.toast');
        expect(toast.classList.contains('error')).toBe(true);
    });

    test('calls onClose when close button is clicked', () => {
        const mockClose = jest.fn();
        render(<Toast message="Close me" type="success" visible={true} onClose={mockClose} />);
        fireEvent.click(screen.getByLabelText('Close notification'));
        expect(mockClose).toHaveBeenCalledTimes(1);
    });

    test('has aria role alert for accessibility', () => {
        render(<Toast message="Alert" type="success" visible={true} onClose={jest.fn()} />);
        expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    test('renders progress bar', () => {
        render(<Toast message="Progress" type="success" visible={true} onClose={jest.fn()} />);
        const progressBar = document.querySelector('.toast-progress-bar');
        expect(progressBar).toBeInTheDocument();
    });

    test('progress bar starts at 100% width', () => {
        render(<Toast message="Progress" type="success" visible={true} onClose={jest.fn()} />);
        const progressBar = document.querySelector('.toast-progress-bar');
        expect(progressBar.style.width).toBe('100%');
    });
});
