/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useLayoutEffect, useRef, useState } from 'react';
import { InlineStoryRenderer } from './StoryRenderer';
import { useGameContext } from '../contexts/GameContext';
import type { GameAction } from '../../types';

interface ActionTooltipProps {
    tooltipData: {
        action: GameAction;
        position: { top: number; left: number; right: number; bottom: number };
    } | null;
    onEntityClick: (event: React.MouseEvent, name: string, type: string) => void;
    onEntityMouseEnter: (event: React.MouseEvent, name: string, type: string) => void;
    onEntityMouseLeave: () => void;
}

export const ActionTooltip = ({ tooltipData, onEntityClick, onEntityMouseEnter, onEntityMouseLeave }: ActionTooltipProps) => {
    const { gameState } = useGameContext();
    const tooltipRef = useRef<HTMLDivElement>(null);
    const [style, setStyle] = useState<React.CSSProperties>({
        position: 'fixed',
        opacity: 0,
        pointerEvents: 'none',
        zIndex: 10002,
    });

    useLayoutEffect(() => {
        if (tooltipData && tooltipRef.current) {
            const { position } = tooltipData;
            const tooltipEl = tooltipRef.current;
            const viewportWidth = window.innerWidth;
            const margin = 10;

            // Get tooltip dimensions
            const tooltipRect = tooltipEl.getBoundingClientRect();

            // Default position: above the button
            let finalTop = position.top - tooltipRect.height - margin;
            let finalLeft = position.left + (position.right - position.left) / 2 - tooltipRect.width / 2;
            
            // If it overflows above, place it below
            if (finalTop < margin) {
                finalTop = position.bottom + margin;
            }

            // Adjust horizontal position if it overflows
            if (finalLeft < margin) {
                finalLeft = margin;
            } else if (finalLeft + tooltipRect.width + margin > viewportWidth) {
                finalLeft = viewportWidth - tooltipRect.width - margin;
            }


            setStyle({
                position: 'fixed',
                top: `${finalTop}px`,
                left: `${finalLeft}px`,
                zIndex: 10002,
                opacity: 1,
                pointerEvents: 'none', // Keep it non-interactive
            });

        } else {
            setStyle(prev => ({ ...prev, opacity: 0 }));
        }
    }, [tooltipData]);

    if (!tooltipData) return <div ref={tooltipRef} className="action-tooltip" style={style}></div>;

    const { action } = tooltipData;

    return (
        <div ref={tooltipRef} className="action-tooltip" style={style}>
            {action.benefit && (
                <div className="action-tooltip-section benefit">
                    <h6 className="action-tooltip-title">Lợi Ích Tiềm Năng</h6>
                    <p className="tooltip-description">
                        <InlineStoryRenderer
                            text={action.benefit}
                            gameState={gameState}
                            onEntityClick={onEntityClick}
                            onEntityMouseEnter={onEntityMouseEnter}
                            onEntityMouseLeave={onEntityMouseLeave}
                        />
                    </p>
                </div>
            )}
            {action.risk && (
                <div className="action-tooltip-section risk">
                    <h6 className="action-tooltip-title">Rủi Ro Tiềm Ẩn</h6>
                    <p className="tooltip-description">
                        <InlineStoryRenderer
                            text={action.risk}
                            gameState={gameState}
                            onEntityClick={onEntityClick}
                            onEntityMouseEnter={onEntityMouseEnter}
                            onEntityMouseLeave={onEntityMouseLeave}
                        />
                    </p>
                </div>
            )}
        </div>
    );
};
