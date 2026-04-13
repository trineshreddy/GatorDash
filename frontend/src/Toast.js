import React, { useEffect, useState } from 'react';
import './Toast.css';

function Toast({ message, type = 'success', visible, onClose, duration = 3000 }) {
    const [progress, setProgress] = useState(100);

    useEffect(() => {
        if (!visible) {
            setProgress(100);
            return;
        }

        // Animate progress bar
        const startTime = Date.now();
        const interval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
            setProgress(remaining);
            if (remaining <= 0) {
                clearInterval(interval);
            }
        }, 50);

        return () => clearInterval(interval);
    }, [visible, duration]);

    if (!visible) return null;

    const icons = {
        success: '✓',
        error: '✕',
        info: 'ℹ',
        warning: '⚠',
    };

    return (
        <div className="toast-container" role="alert" aria-live="polite">
            <div className={`toast ${type}`}>
                <span className="toast-icon">{icons[type] || icons.info}</span>
                <span className="toast-message">{message}</span>
                <button className="toast-close" onClick={onClose} aria-label="Close notification">
                    &times;
                </button>
                <div className="toast-progress">
                    <div
                        className="toast-progress-bar"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
        </div>
    );
}

export default Toast;
