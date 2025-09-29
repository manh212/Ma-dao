/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useEffect, useRef } from 'react';
import { useModalAccessibility } from '../../hooks/useModalAccessibility';
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
    const modalRef = useRef<HTMLDivElement>(null);
    useModalAccessibility(isOpen, modalRef);

    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);


    if (!isOpen) return null;

    const handleConfirm = () => {
        onConfirm();
        onClose();
    }

    const modalId = React.useId();

    return (
        <div className="modal-overlay confirmation-overlay" onClick={onClose}>
            <div 
                ref={modalRef}
                className="modal-content confirmation-modal-content" 
                onClick={e => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby={`${modalId}-title`}
            >
                <header className="modal-header">
                    <h3 id={`${modalId}-title`}>{title}</h3>
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