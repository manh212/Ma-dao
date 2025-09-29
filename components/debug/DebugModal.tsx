/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useRef, useEffect } from 'react';
import { useModalAccessibility } from '../../hooks/useModalAccessibility';
import { useDebugContext } from '../contexts/DebugContext';
import './Debug.css';

interface DebugModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const DebugModal = ({ isOpen, onClose }: DebugModalProps) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const { prompts, clearDebugPrompts } = useDebugContext();
    useModalAccessibility(isOpen, modalRef);

    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    const handleCopy = (content: string) => {
        navigator.clipboard.writeText(content).then(() => {
            // Maybe show a small "Copied!" message later
        }, (err) => {
            console.error('Could not copy text: ', err);
        });
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                ref={modalRef}
                className="modal-content debug-modal-content"
                onClick={e => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="debug-modal-title"
            >
                <header className="modal-header">
                    <h3 id="debug-modal-title">Lịch sử Lời nhắc API</h3>
                    <div className="debug-modal-actions">
                        <button className="debug-action-button clear" onClick={clearDebugPrompts}>Xóa Lịch sử</button>
                        <button onClick={onClose} className="modal-close-button" aria-label="Đóng">×</button>
                    </div>
                </header>
                <div className="modal-body debug-modal-body">
                    {prompts.length > 0 ? (
                        <ul className="debug-prompt-list">
                            {[...prompts].reverse().map(prompt => (
                                <li key={prompt.id} className="debug-prompt-item">
                                    <details>
                                        <summary className="debug-prompt-summary">
                                            <div className="summary-info">
                                                <span className="prompt-purpose">{prompt.purpose}</span>
                                                <span className="prompt-timestamp">{new Date(prompt.timestamp).toLocaleTimeString()}</span>
                                            </div>
                                            <button className="debug-action-button copy" onClick={(e) => { e.preventDefault(); handleCopy(prompt.content); }}>Sao chép</button>
                                        </summary>
                                        <div className="debug-prompt-content">
                                            <pre><code>{prompt.content}</code></pre>
                                        </div>
                                    </details>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="no-prompts-message">Chưa có lời nhắc nào được gửi đi.</p>
                    )}
                </div>
            </div>
        </div>
    );
};
