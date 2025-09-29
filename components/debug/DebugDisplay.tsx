/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { useDebugContext } from '../contexts/DebugContext';
import './Debug.css';

interface DebugDisplayProps {
    onOpen: () => void;
}

export const DebugDisplay = ({ onOpen }: DebugDisplayProps) => {
    const { prompts } = useDebugContext();

    if (prompts.length === 0) {
        return null;
    }

    const lastPrompt = prompts[prompts.length - 1];

    return (
        <div className="debug-display-container" aria-live="polite">
            <span className="debug-last-action">
                API Gần đây: <strong>{lastPrompt.purpose}</strong>
            </span>
            <button className="debug-open-button" onClick={onOpen}>
                Xem Lịch sử Gỡ lỗi ({prompts.length})
            </button>
        </div>
    );
};
