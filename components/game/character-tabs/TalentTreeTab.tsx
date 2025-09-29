/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useMemo } from 'react';
import { useGameContext } from '../../contexts/GameContext';
import { NoInfoPlaceholder } from '../../ui/NoInfoPlaceholder';
import { InlineStoryRenderer } from '../StoryRenderer';
import type { GameCharacter, Skill, Talent, SkillMasteryLevel, VoLamCharacter } from '../../../types';

interface TalentTreeTabProps {
    character: GameCharacter;
    onEntityClick: (event: React.MouseEvent, id: string, type: string) => void;
    onEntityMouseEnter: (event: React.MouseEvent, id: string, type: string) => void;
    onEntityMouseLeave: () => void;
}

const MASTERY_LEVELS_ORDER: SkillMasteryLevel[] = ['Sơ Nhập', 'Tiểu Thành', 'Đại Thành', 'Viên Mãn', 'Đăng Phong Tạo Cực'];

const getMasteryProgress = (skill: Skill) => {
    const currentIndex = MASTERY_LEVELS_ORDER.indexOf(skill.masteryLevel);
    if (currentIndex === -1 || currentIndex === MASTERY_LEVELS_ORDER.length - 1) {
        return { requiredEp: Infinity, progress: 100 };
    }
    const requiredEp = 100 * (currentIndex + 1) * skill.level;
    const progress = Math.min(100, (skill.masteryXp / requiredEp) * 100);
    return { requiredEp, progress };
};

export const TalentTreeTab = ({ character, onEntityClick, onEntityMouseEnter, onEntityMouseLeave }: TalentTreeTabProps) => {
    const { dispatch, gameState, worldSettings } = useGameContext();
    const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
    const isVoLam = worldSettings.genre === 'Võ Lâm';
    const voLamChar = character as VoLamCharacter;
    const enlightenmentPoints = voLamChar.stats?.enlightenmentPoints ?? 0;

    useEffect(() => {
        if (!selectedSkill && character.skills && character.skills.length > 0) {
            setSelectedSkill(character.skills[0]);
        } else if (selectedSkill) {
            const updatedSkill = character.skills.find(s => s.id === selectedSkill.id);
            setSelectedSkill(updatedSkill || (character.skills.length > 0 ? character.skills[0] : null));
        }
    }, [character, selectedSkill]);
    
    const availableTalents = useMemo(() => {
        if (!selectedSkill || !character.learnedTalents) return [];
        return character.learnedTalents.filter(talent => talent.skillId === selectedSkill.id);
    }, [selectedSkill, character.learnedTalents]);

    const handleEquipTalent = (talentId: string) => {
        if (selectedSkill) {
            dispatch({ type: 'EQUIP_TALENT', payload: { characterId: character.id, skillId: selectedSkill.id, talentId } });
        }
    };

    const handleUnequipTalent = (talentId: string) => {
        if (selectedSkill) {
            dispatch({ type: 'UNEQUIP_TALENT', payload: { characterId: character.id, skillId: selectedSkill.id, talentId } });
        }
    };
    
    const handleBreakthrough = () => {
        if (selectedSkill) {
            dispatch({ type: 'BREAKTHROUGH_SKILL', payload: { characterId: character.id, skillId: selectedSkill.id } });
        }
    };
    
    if (!character.skills || character.skills.length === 0) {
        return <NoInfoPlaceholder text="Nhân vật chưa học được kỹ năng nào." />;
    }

    const { requiredEp, progress: masteryXpProgress } = selectedSkill ? getMasteryProgress(selectedSkill) : { requiredEp: 0, progress: 0 };
    const canBreakthrough = selectedSkill ? (selectedSkill.masteryXp >= requiredEp && enlightenmentPoints >= 1) : false;

    const skillsAtMaxMastery = useMemo(() => {
        return character.skills.filter(s => s.masteryLevel === 'Viên Mãn').length;
    }, [character.skills]);

    return (
        <div className="char-detail-section talent-tab-container">
            <div className="talent-skill-list-container">
                <ul className="talent-skill-list">
                    {character.skills.map(skill => (
                        <li key={skill.id} className="talent-skill-item">
                            <button 
                                className={selectedSkill?.id === skill.id ? 'active' : ''}
                                onClick={() => setSelectedSkill(skill)}
                            >
                               <span className="skill-item-name">{skill.name}</span>
                               <span className="skill-item-level">{skill.masteryLevel} (Cấp {skill.level})</span>
                            </button>
                        </li>
                    ))}
                </ul>
                {isVoLam && (
                    <div className="vo-lam-enhancements">
                        <div className="enlightenment-points">
                            <strong>Điểm Lĩnh Ngộ:</strong>
                            <span>{enlightenmentPoints}</span>
                        </div>
                        <button 
                            className="create-skill-button"
                            disabled={skillsAtMaxMastery < 2}
                            title={skillsAtMaxMastery < 2 ? "Cần ít nhất 2 kỹ năng đạt Viên Mãn" : "Dùng Điểm Lĩnh ngộ để Sáng tạo Võ học mới"}
                        >
                            Sáng Tạo Võ Học
                        </button>
                    </div>
                )}
            </div>

            <div className="talent-skill-detail">
                {selectedSkill ? (
                    <>
                        <header className="skill-detail-header">
                            <h5>{selectedSkill.name}</h5>
                            <InlineStoryRenderer 
                                text={selectedSkill.description}
                                gameState={gameState}
                                onEntityClick={onEntityClick}
                                onEntityMouseEnter={onEntityMouseEnter}
                                onEntityMouseLeave={onEntityMouseLeave}
                            />
                        </header>

                        <div className="xp-bar-container">
                            <div className="xp-bar-label">
                                <span>Kinh nghiệm (Cấp {selectedSkill.level})</span>
                                <span>{selectedSkill.xp} / {100 * selectedSkill.level}</span>
                            </div>
                            <div className="xp-bar-wrapper">
                                <div className="xp-bar" style={{ width: `${Math.min(100, (selectedSkill.xp / (100 * selectedSkill.level)) * 100)}%` }}></div>
                            </div>
                        </div>
                        
                        {isVoLam && (
                            <div className="xp-bar-container">
                                <div className="xp-bar-label">
                                    <span>Kinh nghiệm Thành thạo ({selectedSkill.masteryLevel})</span>
                                    <span>{selectedSkill.masteryXp} / {requiredEp === Infinity ? 'MAX' : requiredEp}</span>
                                </div>
                                <div className="xp-bar-wrapper">
                                    <div className="xp-bar ep-bar" style={{ width: `${masteryXpProgress}%` }}></div>
                                </div>
                                <button 
                                    className="breakthrough-button"
                                    onClick={handleBreakthrough}
                                    disabled={!canBreakthrough}
                                    title={enlightenmentPoints < 1 ? "Cần Điểm Lĩnh Ngộ để đột phá" : ""}
                                >
                                    Đột Phá (1 Điểm Lĩnh Ngộ)
                                </button>
                            </div>
                        )}
                        
                        <div className="talent-list-section">
                            <h6>Thiên Phú</h6>
                            <div className="talent-slots-grid">
                                {Array.from({ length: selectedSkill.talentSlots }).map((_, i) => (
                                    <div key={i} className={`talent-slot ${i < selectedSkill.unlockedTalents.length ? 'filled' : ''}`}>
                                        {i < selectedSkill.unlockedTalents.length ? '★' : ''}
                                    </div>
                                ))}
                            </div>
                        </div>


                        <div className="talent-list-section" style={{marginTop: '1.5rem'}}>
                            <h6>Thiên Phú Đã Trang Bị</h6>
                            {selectedSkill.unlockedTalents.length > 0 ? (
                                <ul className="talent-list">
                                    {selectedSkill.unlockedTalents.map(talent => (
                                        <li key={talent.id} className="talent-item">
                                            <div className="talent-info">
                                                <h5>{talent.name}</h5>
                                                <InlineStoryRenderer
                                                    text={talent.description}
                                                    gameState={gameState}
                                                    onEntityClick={onEntityClick}
                                                    onEntityMouseEnter={onEntityMouseEnter}
                                                    onEntityMouseLeave={onEntityMouseLeave}
                                                />
                                            </div>
                                            <button className="talent-action-button unequip" onClick={() => handleUnequipTalent(talent.id)}>Tháo</button>
                                        </li>
                                    ))}
                                </ul>
                            ) : <NoInfoPlaceholder text="Chưa có thiên phú nào được trang bị."/>}
                        </div>

                        <div className="talent-list-section" style={{marginTop: '1.5rem'}}>
                            <h6>Thiên Phú Khả Dụng</h6>
                             {availableTalents.length > 0 ? (
                                <ul className="talent-list">
                                    {availableTalents.map(talent => (
                                        <li key={talent.id} className="talent-item">
                                            <div className="talent-info">
                                                <h5>{talent.name}</h5>
                                                <InlineStoryRenderer
                                                    text={talent.description}
                                                    gameState={gameState}
                                                    onEntityClick={onEntityClick}
                                                    onEntityMouseEnter={onEntityMouseEnter}
                                                    onEntityMouseLeave={onEntityMouseLeave}
                                                />
                                            </div>
                                            <button 
                                                className="talent-action-button equip" 
                                                onClick={() => handleEquipTalent(talent.id)}
                                                disabled={selectedSkill.unlockedTalents.length >= selectedSkill.talentSlots}
                                            >
                                                Trang bị
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            ) : <NoInfoPlaceholder text="Không có thiên phú nào khả dụng cho kỹ năng này."/>}
                        </div>
                    </>
                ) : (
                    <NoInfoPlaceholder text="Chọn một kỹ năng để xem chi tiết." />
                )}
            </div>
        </div>
    );
};