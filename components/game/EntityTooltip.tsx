/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useRef, useLayoutEffect, useState } from 'react';
import { StoryRenderer } from './StoryRenderer';
import { useGameContext } from '../contexts/GameContext';
import { ENTITY_TYPE_LABELS } from '../../constants/gameConstants';
import { getRelationshipInfo } from '../../utils/game';
import type { EntityTooltipData } from '../../types';
import './EntityTooltip.css';

const HeartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>;
const ShieldIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>;
const HandshakeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M1 14.5l2.5-2.5.71.71-2.5 2.5V18h3v-2H2.21l2.5-2.5.71.71-2.5 2.5V19h4v-2H3.21l2.5-2.5.71.71-2.5 2.5V20h5v-2H4.21l2.5-2.5.71.71-2.5 2.5V21h6v-2H5.21l2.5-2.5.71.71-2.5 2.5V22h8v-2h-1.29l.29-.29c1.09-1.09 1.09-2.85 0-3.94l-2.06-2.06a2.79 2.79 0 00-3.94 0l-.29.29V14H1v.5zm11.29-9.29a2.79 2.79 0 00-3.94 0l-2.06 2.06c-1.09 1.09-1.09 2.85 0 3.94l.29.29H13v-1.5l-2.5 2.5-.71-.71 2.5-2.5H9v-3h2v2.5l2.5-2.5-.71-.71 2.5-2.5H12v-4h2v3.5l2.5-2.5-.71-.71 2.5-2.5H15v-5h2v4.5l2.5-2.5-.71-.71 2.5-2.5H18V1h2V2.5l2.5-2.5.71.71L20.71 5H23v2h-3.5l-2.5 2.5.71.71L20.21 7H21v2h-2.5l-2.5 2.5.71.71L19.21 9H20v2h-1.5l-2.5 2.5.71.71L18.21 11H19v2h-1.06l-.29.29a2.79 2.79 0 000 3.94l2.06 2.06a2.79 2.79 0 003.94 0L24 19l-1.41-1.41-11.3-11.3z"/></svg>;
const SkullIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/></svg>;


interface EntityTooltipProps {
    data: EntityTooltipData | null;
    id: string;
    onClose: () => void;
    onEntityClick: (event: React.MouseEvent, id: string, type: string) => void;
    onEntityMouseEnter: (event: React.MouseEvent, id: string, type: string) => void;
    onEntityMouseLeave: () => void;
}

export const EntityTooltip = ({ data, id, onClose, onEntityClick, onEntityMouseEnter, onEntityMouseLeave }: EntityTooltipProps) => {
    const { gameState, worldSettings } = useGameContext();
    const tooltipRef = useRef<HTMLDivElement>(null);
    const [adjustedPosition, setAdjustedPosition] = useState<EntityTooltipData['position'] | null>(null);

    useLayoutEffect(() => {
        if (data && tooltipRef.current) {
            const { position } = data; // Now viewport-relative
            const tooltipEl = tooltipRef.current;
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            const margin = 8;

            // The tooltip is rendered invisibly at data.position, so we can measure it.
            const tooltipRect = tooltipEl.getBoundingClientRect();

            let finalLeft = position.left;
            let finalTop = position.top;
            
            // Adjust horizontal position
            if (finalLeft + tooltipRect.width + margin > viewportWidth) {
                finalLeft = viewportWidth - tooltipRect.width - margin;
            }
            if (finalLeft < margin) {
                finalLeft = margin;
            }

            // Adjust vertical position
            if (finalTop + tooltipRect.height + margin > viewportHeight) {
                // If it overflows below, move it up so its bottom edge aligns with the viewport bottom.
                finalTop = viewportHeight - tooltipRect.height - margin;
            }
             if (finalTop < margin) {
                // If it overflows above, move it down.
                finalTop = margin;
            }

            setAdjustedPosition({ top: finalTop, left: finalLeft });

        } else {
            setAdjustedPosition(null);
        }
    }, [data]);


    if (!data) return <div ref={tooltipRef} id={id} className="entity-tooltip" style={{ visibility: 'hidden', position: 'fixed' }} role="tooltip"></div>;

    const { name, type, description, displayName, avatarUrl, age, ageDescription, gender, relationship, respect, trust, fear } = data;
    
    const label = ENTITY_TYPE_LABELS[type as keyof typeof ENTITY_TYPE_LABELS] || type;
    const isNpcTooltip = type === 'NPC';

    // On first render, position it at the desired spot but hidden.
    // On subsequent renders (after effect runs), use the adjusted position and make it visible.
    const tooltipStyle: React.CSSProperties = {
        top: `${adjustedPosition?.top ?? data.position.top}px`,
        left: `${adjustedPosition?.left ?? data.position.left}px`,
        visibility: adjustedPosition ? 'visible' : 'hidden',
        opacity: adjustedPosition ? 1 : 0,
    };
    
    if (isNpcTooltip) {
        const relInfo = typeof relationship === 'number' ? getRelationshipInfo(relationship) : null;
        return (
            <div 
                ref={tooltipRef}
                id={id}
                role="tooltip"
                className="entity-tooltip npc-tooltip" 
                style={tooltipStyle}
                onClick={e => e.stopPropagation()}
            >
                <div className="npc-tooltip-avatar">
                    {avatarUrl ? (
                        <img src={avatarUrl} alt={displayName || name} />
                    ) : (
                        <div className="npc-tooltip-avatar-placeholder">
                            <span>{(displayName || name).charAt(0)}</span>
                        </div>
                    )}
                </div>
                <div className="npc-tooltip-content">
                    <div className="npc-tooltip-header">
                        <div className="npc-tooltip-title">
                            <h4 className="tooltip-name">{displayName}</h4>
                        </div>
                    </div>

                    <div className="npc-tooltip-stats">
                        <div className="npc-tooltip-stat"><strong>Tuổi:</strong> <span>{age?.toString() || ageDescription || 'Không rõ'}</span></div>
                        <div className="npc-tooltip-stat"><strong>Giới tính:</strong> <span>{gender || 'Không rõ'}</span></div>
                    </div>

                    {relInfo && (
                        <div className="npc-tooltip-relationship">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', width: '100%' }}>
                                <span className="relationship-text" style={{ color: relInfo.color }}>{relInfo.text}</span>
                                <span>{relInfo.score} / 100</span>
                            </div>
                            <div className="relationship-bar-wrapper">
                                <div className="relationship-bar" style={{ width: `${(relInfo.score + 100) / 2}%`, backgroundColor: relInfo.color }}></div>
                            </div>
                        </div>
                    )}
                    
                    <div className="npc-tooltip-affinities">
                        <div className="affinity-stat" title={`Tôn trọng: ${respect || 0}`}><i><ShieldIcon/></i> <span>{respect || 0}</span></div>
                        <div className="affinity-stat" title={`Tin tưởng: ${trust || 0}`}><i><HandshakeIcon/></i> <span>{trust || 0}</span></div>
                        <div className="affinity-stat" title={`Sợ hãi: ${fear || 0}`}><i><SkullIcon/></i> <span>{fear || 0}</span></div>
                    </div>
                </div>
            </div>
        );
    }
    
     return (
        <div 
            ref={tooltipRef}
            id={id}
            role="tooltip"
            className="entity-tooltip item-tooltip" 
            style={tooltipStyle}
            onClick={e => e.stopPropagation()}
        >
            <div className="item-tooltip-header">
                <span className={`entity-label entity-label-${type.toLowerCase()}`}>{label}</span>
                <h4 className="tooltip-name">{displayName || name}</h4>
            </div>
            <p className="tooltip-description">
                <StoryRenderer 
                    text={description} 
                    gameState={gameState}
                    onEntityClick={onEntityClick}
                    worldSettings={worldSettings}
                    onEntityMouseEnter={onEntityMouseEnter}
                    onEntityMouseLeave={onEntityMouseLeave}
                />
            </p>
        </div>
    );
};