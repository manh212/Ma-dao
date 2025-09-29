/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useMemo, useRef, useEffect, useState } from 'react';
import './CombatView.css';
import { useGameContext } from '../contexts/GameContext';
import { CombatService } from '../../services/CombatService';
import { CombatHUD } from './CombatHUD';
import type { GameCharacter, Monster, GameAction, Skill } from '../../types';

interface SkillSelectionPanelProps {
    skills: Skill[];
    character: GameCharacter;
    onSkillSelect: (skill: Skill) => void;
    onClose: () => void;
}

const SkillSelectionPanel = ({ skills, character, onSkillSelect, onClose }: SkillSelectionPanelProps) => {
    const activeSkills = skills.filter(s => s.type === 'Active');

    return (
        <div className="skill-panel-overlay" onClick={onClose}>
            <div className="skill-panel" onClick={e => e.stopPropagation()}>
                <header className="skill-panel-header">
                    <h4>Chọn Kỹ Năng</h4>
                    <button onClick={onClose} className="skill-panel-close">×</button>
                </header>
                <ul className="skill-list-combat">
                    {activeSkills.map(skill => {
                        const canAfford = ('linhLuc' in character && character.linhLuc) ? character.linhLuc.current >= skill.manaCost : true;
                        return (
                            <li key={skill.id}>
                                <button
                                    className="skill-button-combat"
                                    onClick={() => onSkillSelect(skill)}
                                    disabled={!canAfford}
                                >
                                    <div className="skill-button-info">
                                        <span className="skill-button-name">{skill.name}</span>
                                        <p className="skill-button-desc">{skill.description}</p>
                                    </div>
                                    <span className="skill-button-cost">{skill.manaCost} LL</span>
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
};


interface CombatViewProps {
    onSubmitAction: (action: Partial<GameAction>) => void;
    onEntityClick: (event: React.MouseEvent, id: string, type: string) => void;
    onEntityMouseEnter: (event: React.MouseEvent, id: string, type: string) => void;
    onEntityMouseLeave: () => void;
}

export const CombatView = ({ onSubmitAction }: CombatViewProps) => {
    const { gameState } = useGameContext();
    const { character, combatants: combatantIds, knowledgeBase, combatLog } = gameState;
    const logContainerRef = useRef<HTMLDivElement>(null);
    const [showSkillSelection, setShowSkillSelection] = useState(false);
    
    useEffect(() => {
        if (logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }, [combatLog]);

    const opponent = useMemo(() => {
        if (!combatantIds || combatantIds.length < 2) return null;
        const opponentId = combatantIds.find(id => id !== character.id);
        if (!opponentId) return null;
        return knowledgeBase.npcs.find(n => n.id === opponentId) || knowledgeBase.monsters.find(m => m.id === opponentId) || null;
    }, [combatantIds, character, knowledgeBase]);

    const { defenseChance, fleeChance } = useMemo(() => {
        if (!opponent) return { defenseChance: 50, fleeChance: 30 };
        return {
            defenseChance: CombatService.calculateDefenseChance(character, opponent),
            fleeChance: CombatService.calculateFleeChance(character, opponent),
        };
    }, [character, opponent]);

    if (!opponent) {
        return (
            <div className="combat-view-container">
                <p>Đang chờ đối thủ...</p>
            </div>
        );
    }
    
    const getButtonClass = (chance: number) => {
        if (chance > 70) return 'chance-high';
        if (chance > 40) return 'chance-medium';
        return 'chance-low';
    };

    const handleSkillSelect = (skill: Skill) => {
        setShowSkillSelection(false);
        onSubmitAction({
            description: `Sử dụng kỹ năng: ${skill.name}`,
            skillId: skill.id,
        });
    };

    const hasSkills = character.skills.some(s => s.type === 'Active');

    return (
        <div className="combat-view-container">
            <div className="player-area">
                <CombatHUD entity={character} isPlayer />
            </div>

            <div className="combat-log-area">
                <div className="combat-turn-counter">Lượt Tác chiến: {gameState.combatTurnNumber || 1}</div>
                <div className="combat-log-content" ref={logContainerRef}>
                   {(combatLog || []).map((line, index) => (
                       <p key={index} className="combat-log-line">{line}</p>
                   ))}
                </div>
            </div>

            <div className="opponent-area">
                <CombatHUD entity={opponent} isPlayer={false} />
            </div>

            {showSkillSelection && (
                <SkillSelectionPanel
                    skills={character.skills}
                    character={character}
                    onSkillSelect={handleSkillSelect}
                    onClose={() => setShowSkillSelection(false)}
                />
            )}

            <div className="combat-action-panel">
                <button className="combat-action-button attack" onClick={() => onSubmitAction({ description: `Tấn công` })}>
                    Tấn công
                </button>
                 <button className="combat-action-button skill" onClick={() => setShowSkillSelection(true)} disabled={!hasSkills}>
                    Kỹ năng
                </button>
                <button className={`combat-action-button defend`} onClick={() => onSubmitAction({ description: `Phòng thủ` })}>
                    Phòng thủ
                    <span className={`chance-indicator ${getButtonClass(defenseChance)}`}>{defenseChance}%</span>
                </button>
                <button className={`combat-action-button flee`} onClick={() => onSubmitAction({ description: `Bỏ chạy` })}>
                    Bỏ chạy
                    <span className={`chance-indicator ${getButtonClass(fleeChance)}`}>{fleeChance}%</span>
                </button>
            </div>
        </div>
    );
};