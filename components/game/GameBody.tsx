/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useMemo } from 'react';
import { TurnRenderer } from './TurnRenderer';
import { InlineStoryRenderer } from './StoryRenderer';
import { useGameContext } from '../contexts/GameContext';
import type { Turn } from '../../types';

interface GameBodyProps {
    turns: Turn[];
    worldSummary?: string;
    onEntityClick: (event: React.MouseEvent, name: string, type: string) => void;
    onEntityMouseEnter: (event: React.MouseEvent, name: string, type: string) => void;
    onEntityMouseLeave: () => void;
    onAvatarClick: (characterName: string) => void;
    visibleTurnsCount: number;
    onShowMoreTurns: () => void;
}

export const GameBody = React.forwardRef<HTMLDivElement, GameBodyProps>(({
    turns,
    worldSummary,
    onEntityClick,
    onEntityMouseEnter,
    onEntityMouseLeave,
    onAvatarClick,
    visibleTurnsCount,
    onShowMoreTurns,
}, ref) => {
    const { gameState } = useGameContext();

    const visibleTurns = useMemo(() => {
        return turns.slice(Math.max(0, turns.length - visibleTurnsCount));
    }, [turns, visibleTurnsCount]);

    const renderedTurns = useMemo(() => visibleTurns.map(turn => (
        <TurnRenderer 
            key={turn.id}
            turn={turn}
            onEntityClick={onEntityClick}
            onEntityMouseEnter={onEntityMouseEnter}
            onEntityMouseLeave={onEntityMouseLeave}
            onAvatarClick={onAvatarClick}
        />
    )), [visibleTurns, onEntityClick, onEntityMouseEnter, onEntityMouseLeave, onAvatarClick]);

    const showIntroElements = turns.length === 1 && turns[0].chosenAction === null;

    return (
        <main className="game-body" ref={ref} aria-live="polite" aria-atomic="false">
            {showIntroElements && worldSummary && (
                <div className="world-summary-container">
                    <h3>Bối Cảnh Thế Giới</h3>
                    <p>
                        <InlineStoryRenderer 
                            text={worldSummary} 
                            gameState={gameState} 
                            onEntityClick={onEntityClick} 
                            onEntityMouseEnter={onEntityMouseEnter}
                            onEntityMouseLeave={onEntityMouseLeave}
                        />
                    </p>
                </div>
            )}
            
            {visibleTurnsCount < turns.length && (
                <div className="load-more-container">
                    <button onClick={onShowMoreTurns} className="load-more-button">
                        Xem thêm lượt cũ
                    </button>
                </div>
            )}

            {renderedTurns}
        </main>
    );
});