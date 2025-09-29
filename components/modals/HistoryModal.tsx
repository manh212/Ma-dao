/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useEffect } from 'react';
import { InlineStoryRenderer } from '../game/StoryRenderer';
import { useGameContext } from '../contexts/GameContext';
import type { Turn } from '../../types';
import './HistoryModal.css';

interface HistoryModalProps {
    turns: Turn[];
    onRevert: (index: number) => void;
    onClose: () => void;
    onEntityClick: (event: React.MouseEvent, name: string, type: string) => void;
    onEntityMouseEnter: (event: React.MouseEvent, name: string, type: string) => void;
    onEntityMouseLeave: () => void;
}

export const HistoryModal = ({ turns, onRevert, onClose, onEntityClick, onEntityMouseEnter, onEntityMouseLeave }: HistoryModalProps) => {
    const { gameState } = useGameContext();
    const recentTurns = turns.slice(Math.max(0, turns.length - 20)).reverse();
    const latestTurnIndex = turns.length - 1;

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose]);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div 
                className="modal-content history-modal-content" 
                onClick={e => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="history-modal-title"
            >
                <header className="modal-header">
                    <h3 id="history-modal-title">Lịch Sử Lượt Chơi</h3>
                    <button onClick={onClose} className="modal-close-button" aria-label="Đóng">X</button>
                </header>
                <div className="modal-body">
                    {recentTurns.length === 0 ? (
                        <p className="no-history-message">Không có lịch sử để hiển thị.</p>
                    ) : (
                        <ul className="history-list">
                            {recentTurns.map((turn, index) => {
                                const originalIndex = latestTurnIndex - index;
                                const summaryText = turn.summary || turn.chosenAction || "Bắt đầu cuộc hành trình";
                                const isCurrentTurn = originalIndex === latestTurnIndex;

                                return (
                                    <li key={turn.id} className={`history-item ${isCurrentTurn ? 'current-turn' : ''}`}>
                                        <div className="history-info">
                                            <span className="history-turn-number">Lượt {originalIndex + 1}</span>
                                            <div className="history-summary">
                                                <InlineStoryRenderer 
                                                    text={summaryText}
                                                    gameState={gameState}
                                                    onEntityClick={onEntityClick}
                                                    onEntityMouseEnter={onEntityMouseEnter}
                                                    onEntityMouseLeave={onEntityMouseLeave}
                                                />
                                            </div>
                                        </div>
                                        <button 
                                            className="history-revert-button"
                                            onClick={() => onRevert(originalIndex)}
                                            disabled={isCurrentTurn}
                                            title={isCurrentTurn ? "Đây là lượt chơi hiện tại của bạn." : `Quay lại lượt ${originalIndex + 1}`}
                                        >
                                            {isCurrentTurn ? 'Lượt Hiện Tại' : 'Quay Lại'}
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};