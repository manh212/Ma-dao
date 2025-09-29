/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { StoryRenderer, InlineStoryRenderer } from './StoryRenderer';
import { useGameContext } from '../contexts/GameContext';
import type { Turn } from '../../types';

interface TurnRendererProps {
    turn: Turn;
    onEntityClick: (event: React.MouseEvent, name: string, type: string) => void;
    onEntityMouseEnter: (event: React.MouseEvent, name: string, type: string) => void;
    onEntityMouseLeave: () => void;
    onAvatarClick: (characterName: string) => void;
}

const WorldEvent = ({ event }: { event: NonNullable<Turn['worldEvent']> }) => (
    <div className="world-event-container">
        <div className="world-event-scroll">
            <h3 className="world-event-title">{event.title}</h3>
            <p className="world-event-description">{event.description}</p>
        </div>
    </div>
);


export const TurnRenderer = React.memo(({ turn, onEntityClick, onEntityMouseEnter, onEntityMouseLeave, onAvatarClick }: TurnRendererProps) => {
    const { gameState, worldSettings } = useGameContext();

    const normalMessages = turn.messages?.filter(msg => msg.type !== 'reality_ripple') || [];
    const rippleMessages = turn.messages?.filter(msg => msg.type === 'reality_ripple') || [];

    return (
        <div className="turn-container">
            {turn.worldEvent && <WorldEvent event={turn.worldEvent} />}
            {turn.chosenAction && ( 
                <div className="chosen-action-wrapper">
                    <p className="chosen-action">
                        <InlineStoryRenderer text={turn.chosenAction} gameState={gameState} onEntityClick={onEntityClick} onEntityMouseEnter={onEntityMouseEnter} onEntityMouseLeave={onEntityMouseLeave} />
                    </p>
                </div> 
            )}
            <div className="story-content">
                <StoryRenderer text={turn.story} gameState={gameState} onEntityClick={onEntityClick} worldSettings={worldSettings} onAvatarClick={onAvatarClick} onEntityMouseEnter={onEntityMouseEnter} onEntityMouseLeave={onEntityMouseLeave} />
            </div>

            {rippleMessages.length > 0 && rippleMessages.map(msg => (
                <div key={msg.id} className="reality-ripple-message">
                    <InlineStoryRenderer text={msg.text} gameState={gameState} onEntityClick={onEntityClick} onEntityMouseEnter={onEntityMouseEnter} onEntityMouseLeave={onEntityMouseLeave} />
                </div>
            ))}

            {normalMessages.length > 0 && (
                <div className="turn-messages">
                    <ul>
                        {normalMessages.map(msg => 
                            <li key={msg.id}>
                                <InlineStoryRenderer text={msg.text} gameState={gameState} onEntityClick={onEntityClick} onEntityMouseEnter={onEntityMouseEnter} onEntityMouseLeave={onEntityMouseLeave} />
                            </li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
});