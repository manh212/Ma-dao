/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import './ConfirmationModal.css';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: React.ReactNode;
    confirmText?: string;
    cancelText?: string;
}

export const ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Xác nhận',
    cancelText = 'Hủy'
}: ConfirmationModalProps) => {
    if (!isOpen) return null;

    const handleConfirm = () => {
        onConfirm();
        onClose();
    }

    return (
        <div className="modal-overlay confirmation-overlay" onClick={onClose}>
            <div className="modal-content confirmation-modal-content" onClick={e => e.stopPropagation()}>
                <header className="modal-header">
                    <h3>{title}</h3>
                    <button onClick={onClose} className="modal-close-button" aria-label="Đóng">X</button>
                </header>
                <div className="modal-body">
                    <p className="confirmation-message">{message}</p>
                </div>
                <footer className="confirmation-footer">
                    <button className="confirmation-button btn-secondary" onClick={onClose}>
                        {cancelText}
                    </button>
                    <button className="confirmation-button btn-danger" onClick={handleConfirm}>
                        {confirmText}
                    </button>
                </footer>
            </div>
        </div>
    );
};