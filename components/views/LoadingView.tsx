/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useMemo } from 'react';
import './LoadingView.css';
import type { SaveFile } from '../../types';

interface LoadingViewProps {
    saveData?: SaveFile | null;
}

export const LoadingView = ({ saveData }: LoadingViewProps) => {
    const dreamText = useMemo(() => {
        if (!saveData || !saveData.gameState || !saveData.gameState.turns || saveData.gameState.turns.length === 0) {
            return "Ký ức mờ ảo hiện về...";
        }
        const lastTurn = saveData.gameState.turns[saveData.gameState.turns.length - 1];
        return lastTurn.summary || "Một giấc mơ không rõ ràng thoáng qua tâm trí bạn...";
    }, [saveData]);
    
    return (
        <div className="loading-view-container">
            <div className="loading-content">
                <p className="loading-text">"{dreamText}"</p>
                <h2 className="loading-view-title">Đang hồi tưởng lại ký ức...</h2>
            </div>
        </div>
    );
};