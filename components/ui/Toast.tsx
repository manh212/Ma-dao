/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from 'react';
import type { ToastData } from '../../types';
import './Toast.css';

interface ToastProps extends ToastData {
    onClose: () => void;
}

const UnmemoizedToast = ({ message, type, onClose }: ToastProps) => {
    const [isFadingOut, setIsFadingOut] = useState(false);

    useEffect(() => {
        const showTimer = setTimeout(() => {
            setIsFadingOut(true);
        }, 1600); // 1.6 seconds

        const removeTimer = setTimeout(() => {
            onClose();
        }, 1600 + 400); // Add animation time

        return () => {
            clearTimeout(showTimer);
            clearTimeout(removeTimer);
        };
    }, [onClose]);

    return (
        <div className={`toast ${type} ${isFadingOut ? 'fade-out' : ''}`}>
            {message}
        </div>
    );
};

// FIX: Wrap component in React.memo to address key prop error
export const Toast = React.memo(UnmemoizedToast);


interface ToastContainerProps {
    toasts: ToastData[];
    onRemove: (id: string) => void;
}

export const ToastContainer = ({ toasts, onRemove }: ToastContainerProps) => (
    <div className="toast-container">
        {toasts.map((toast) => (
            <Toast key={toast.id} {...toast} onClose={() => onRemove(toast.id)} />
        ))}
    </div>
);