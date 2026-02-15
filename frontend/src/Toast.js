import React from 'react';
import './Toast.css';

function Toast({ message, type, visible, onClose }) {
    if (!visible) return null;

    return (
        <div className="toast-container">
            <div className={`toast ${type}`}>
                <span className="toast-message">{message}</span>
                <button className="toast-close" onClick={onClose}>&times;</button>
            </div>
        </div>
    );
}

export default Toast;
