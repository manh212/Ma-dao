/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import './CombatHUD.css';
import type { GameCharacter, Monster } from '../../types';

interface CombatHUDProps {
    entity: GameCharacter | Monster;
    isPlayer: boolean;
}

export const CombatHUD = ({ entity, isPlayer }: CombatHUDProps) => {
    const health = entity.health;
    const linhLuc = 'linhLuc' in entity && entity.linhLuc ? entity.linhLuc : null;
    const title = 'species' in entity ? (entity.title || entity.species) : entity.tags?.[0];

    return (
        <div className={`combatant-card ${isPlayer ? 'player' : 'enemy'}`}>
            <div className="combatant-avatar-large">
                {'avatarUrl' in entity && entity.avatarUrl ? (
                    <img src={entity.avatarUrl} alt={entity.displayName} />
                ) : (
                    <span>{(entity.displayName || entity.name).charAt(0)}</span>
                )}
            </div>
            <div className="combatant-info-large">
                <div className="combatant-nameplate">
                    <h3 className="combatant-name-large">{entity.displayName || entity.name}</h3>
                    {title && <span className="combatant-title-large">{title}</span>}
                </div>

                <div className="combat-resource-bars">
                    {health && (
                        <div className="combatant-health-info">
                            <div className="combatant-health-bar-wrapper-large">
                                <div className="combatant-health-bar-large" style={{ width: `${(health.current / health.max) * 100}%` }}>
                                    <div className="health-bar-shine"></div>
                                </div>
                            </div>
                            <span className="combatant-health-text-large">{health.current} / {health.max}</span>
                        </div>
                    )}
                     {linhLuc && (
                        <div className="combatant-health-info">
                            <div className="combatant-health-bar-wrapper-large mana-bar">
                                <div className="combatant-health-bar-large" style={{ width: `${(linhLuc.current / linhLuc.max) * 100}%` }}>
                                </div>
                            </div>
                            <span className="combatant-health-text-large">{linhLuc.current} / {linhLuc.max}</span>
                        </div>
                    )}
                </div>
                
                <div className="combatant-statuses-large">
                    {/* Placeholder for status effects */}
                </div>
            </div>
        </div>
    );
};