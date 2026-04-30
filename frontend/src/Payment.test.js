import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Payment from './Payment';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

const renderPayment = (props = {}) => {
    return render(
        <BrowserRouter>
            <Payment onLogout={jest.fn()} showToast={jest.fn()} {...props} />
        </BrowserRouter>
    );
};

const fillValidPaymentForm = () => {
    fireEvent.change(screen.getByPlaceholderText('Name on card'), {
        target: { value: 'Albert Gator' },
    });
    fireEvent.change(screen.getByPlaceholderText('1234 5678 9012 3456'), {
        target: { value: '4242424242424242' },
    });
    fireEvent.change(screen.getByPlaceholderText('MM/YY'), {
        target: { value: '1228' },
    });
    fireEvent.change(screen.getByPlaceholderText('123'), {
        target: { value: '123' },
    });
    fireEvent.change(screen.getByPlaceholderText('32611'), {
        target: { value: '32611' },
    });
};

describe('Payment Component', () => {
    beforeEach(() => {
        localStorage.clear();
        mockNavigate.mockClear();
        global.fetch = jest.fn();
    });

    test('renders payment form fields', () => {
        renderPayment();

        expect(screen.getByText('Payment')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Name on card')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('1234 5678 9012 3456')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('MM/YY')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('123')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('32611')).toBeInTheDocument();
    });

    test('shows validation errors for empty form submit', async () => {
        const showToast = jest.fn();
        renderPayment({ showToast });

        fireEvent.click(screen.getByRole('button', { name: /process payment/i }));

        expect(await screen.findByText('Cardholder name is required.')).toBeInTheDocument();
        expect(screen.getByText('Enter a valid 16-digit card number.')).toBeInTheDocument();
        expect(screen.getByText('Use MM/YY format.')).toBeInTheDocument();
        expect(screen.getByText('Enter a valid CVV.')).toBeInTheDocument();
        expect(screen.getByText('Enter a 5-digit ZIP code.')).toBeInTheDocument();
        expect(showToast).toHaveBeenCalledWith('Please fix payment form errors.', 'error');
        expect(global.fetch).not.toHaveBeenCalled();
    });

    test('formats card number and expiry while typing', () => {
        renderPayment();

        const cardInput = screen.getByPlaceholderText('1234 5678 9012 3456');
        const expiryInput = screen.getByPlaceholderText('MM/YY');

        fireEvent.change(cardInput, { target: { value: '4242424242424242' } });
        fireEvent.change(expiryInput, { target: { value: '1228' } });

        expect(cardInput).toHaveValue('4242 4242 4242 4242');
        expect(expiryInput).toHaveValue('12/28');
    });

    test('processes payment with Authorization header when token exists', async () => {
        localStorage.setItem('authToken', 'jwt-token-123');
        const showToast = jest.fn();
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ success: true, transaction_id: 'txn_123' }),
            })
        );

        renderPayment({ showToast });
        fillValidPaymentForm();

        fireEvent.click(screen.getByRole('button', { name: /process payment/i }));

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('/api/payment/process', expect.objectContaining({
                method: 'POST',
                headers: expect.objectContaining({
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer jwt-token-123',
                }),
            }));
        });

        expect(JSON.parse(localStorage.getItem('paymentResult'))).toEqual(expect.objectContaining({
            status: 'paid',
            transactionId: 'txn_123',
        }));
        expect(showToast).toHaveBeenCalledWith('Payment processed successfully.', 'success');
        expect(await screen.findByText('Payment Approved')).toBeInTheDocument();
    });

    test('shows backend payment failure message', async () => {
        const showToast = jest.fn();
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: false,
                json: () => Promise.resolve({ success: false, message: 'Card declined' }),
            })
        );

        renderPayment({ showToast });
        fillValidPaymentForm();

        fireEvent.click(screen.getByRole('button', { name: /process payment/i }));

        expect(await screen.findByText('Card declined')).toBeInTheDocument();
        expect(showToast).toHaveBeenCalledWith('Card declined', 'error');
    });

    test('dispatches session expired event on unauthorized payment response', async () => {
        const expiredListener = jest.fn();
        window.addEventListener('auth:expired', expiredListener);
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: false,
                status: 401,
                json: () => Promise.resolve({ success: false }),
            })
        );

        renderPayment();
        fillValidPaymentForm();

        fireEvent.click(screen.getByRole('button', { name: /process payment/i }));

        await waitFor(() => {
            expect(expiredListener).toHaveBeenCalled();
            expect(mockNavigate).toHaveBeenCalledWith('/signin');
        });

        window.removeEventListener('auth:expired', expiredListener);
    });

    test('back button returns to order summary', () => {
        renderPayment();

        fireEvent.click(screen.getByText('← Back to Summary'));

        expect(mockNavigate).toHaveBeenCalledWith('/order-summary');
    });

    test('successful payment continue button returns to order summary', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ success: true }),
            })
        );

        renderPayment();
        fillValidPaymentForm();
        fireEvent.click(screen.getByRole('button', { name: /process payment/i }));

        await screen.findByText('Payment Approved');
        fireEvent.click(screen.getByRole('button', { name: /continue to order/i }));

        expect(mockNavigate).toHaveBeenCalledWith('/order-summary');
    });
});
