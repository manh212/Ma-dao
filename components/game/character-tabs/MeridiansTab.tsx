/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import { useGameContext } from '../../contexts/GameContext';
import { NoInfoPlaceholder } from '../../ui/NoInfoPlaceholder';
import { DEFAULT_MERIDIANS_MAP } from '../../../constants/meridians';
import type { GameCharacter, VoLamCharacter, Acupoint } from '../../../types';

interface AcupointDetailProps {
    acupoint: Acupoint;
    character: VoLamCharacter;
    onUnlock: (acupointId: string) => void;
}

const STAT_TRANSLATIONS: Record<string, string> = {
    theChat: 'Thể Chất',
    constitution: 'Thể Chất',
    noiLuc: 'Nội Lực Tối đa',
    maxNoiLuc: 'Nội Lực Tối đa',
    canCot: 'Căn Cốt',
    defense: 'Phòng Ngự',
    lucTay: 'Lực Tay',
    strength: 'Sức Mạnh',
    danhVong: 'Danh Vọng',
    thanPhap: 'Thân Pháp',
    dexterity: 'Nhanh Nhẹn'
};


const AcupointDetail = ({ acupoint, character, onUnlock }: AcupointDetailProps) => {
    const isUnlocked = character.meridians?.[acupoint.id] ?? false;
    const canUnlock = (character.qiPoints ?? 0) >= acupoint.cost && !isUnlocked;

    return (
        <div className="acupoint-detail-view">
            <h5 className="acupoint-detail-name">{acupoint.name}</h5>
            <p className="acupoint-detail-desc">{acupoint.description}</p>
            <div className="acupoint-detail-rewards">
                <h6>Phần Thưởng</h6>
                <ul>
                    {acupoint.effects.map(effect => (
                        <li key={effect.stat}>+ {effect.value} {STAT_TRANSLATIONS[effect.stat] || effect.stat}</li>
                    ))}
                </ul>
                <p><strong>Chi phí:</strong> {acupoint.cost} Chân khí</p>
            </div>
            <button 
                className="unlock-acupoint-button"
                onClick={() => onUnlock(acupoint.id)}
                disabled={!canUnlock}
            >
                {isUnlocked ? 'Đã Đả Thông' : 'Đả Thông'}
            </button>
        </div>
    );
};

interface MeridiansTabProps {
    character: GameCharacter;
}

export const MeridiansTab = ({ character }: MeridiansTabProps) => {
    const { dispatch } = useGameContext();
    const voLamChar = character as VoLamCharacter;
    const [selectedAcupoint, setSelectedAcupoint] = useState<Acupoint | null>(null);

    const handleUnlockAcupoint = (acupointId: string) => {
        dispatch({ type: 'UNLOCK_ACUPOINT', payload: { characterId: character.id, acupointId } });
    };

    return (
        <div className="char-detail-section meridians-container">
            <div className="meridian-map-container">
                {DEFAULT_MERIDIANS_MAP.map(meridian => (
                    <div key={meridian.id} className="meridian-group">
                        <h5 className="meridian-group-title">{meridian.name}</h5>
                        <div className="acupoint-grid">
                            {meridian.acupoints.map(acupoint => {
                                const isUnlocked = voLamChar.meridians?.[acupoint.id] ?? false;
                                return (
                                    <div 
                                        key={acupoint.id} 
                                        className={`acupoint-node ${isUnlocked ? 'unlocked' : ''} ${selectedAcupoint?.id === acupoint.id ? 'selected' : ''}`}
                                        onClick={() => setSelectedAcupoint(acupoint)}
                                    >
                                        {acupoint.name}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
            <div className="acupoint-info-panel">
                <div className="qi-points-display">
                    <span className="qi-points-label">Chân Khí</span>
                    <p className="qi-points-value">{(voLamChar.qiPoints ?? 0).toLocaleString()}</p>
                </div>
                {selectedAcupoint ? (
                    <AcupointDetail 
                        acupoint={selectedAcupoint} 
                        character={voLamChar}
                        onUnlock={handleUnlockAcupoint}
                    />
                ) : (
                    <NoInfoPlaceholder text="Chọn một huyệt vị để xem chi tiết." />
                )}
            </div>
        </div>
    );
};