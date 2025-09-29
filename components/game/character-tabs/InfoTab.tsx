/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { StoryRenderer } from '../StoryRenderer';
import { useGameContext } from '../../contexts/GameContext';
import { NoInfoPlaceholder } from '../../ui/NoInfoPlaceholder';
import type { GameCharacter } from '../../../types';

interface InfoTabProps {
    character: GameCharacter;
    isPlayerCharacter: boolean;
    onEntityClick: (event: React.MouseEvent, name: string, type: string) => void;
    onEntityMouseEnter: (event: React.MouseEvent, name: string, type: string) => void;
    onEntityMouseLeave: () => void;
    onNpcSelect: (npcName: string) => void;
    onUpdateCharacterData: (characterName: string, updates: Partial<GameCharacter>) => void;
    addToast: (message: string, type?: 'info' | 'success' | 'error' | 'warning') => void;
}

const InfoSection = ({ title, children, hasData, className = '' }: { title: string, children: React.ReactNode, hasData: boolean, className?: string }) => {
    if (!hasData) return null;
    return (
        <div className={`char-detail-section info-subsection ${className}`}>
            <h4>{title}</h4>
            {children}
        </div>
    );
};

export const InfoTab = ({ character, isPlayerCharacter, onEntityClick, onEntityMouseEnter, onEntityMouseLeave }: InfoTabProps) => {
    const { gameState, worldSettings } = useGameContext();
    const { personality, description, backstory, deathState, traits, ideals, bonds, reputation, scars, characterArc, lifeEvents, job, assets } = character;

    const hasCareerInfo = !!job;
    const hasAssets = assets && assets.length > 0;

    return (
        <div className="info-tab-content">
            {deathState?.isDead && (
                <div className="char-detail-section" style={{ backgroundColor: 'var(--accent-danger)', color: 'white', textAlign: 'center', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                    <h4 style={{ color: 'white', border: 'none', margin: 0, fontSize: '1.2rem' }}>ĐÃ MẤT</h4>
                    <p style={{ margin: '0.5rem 0 0', fontStyle: 'italic' }}>
                        Nguyên nhân: {deathState.reason}
                    </p>
                </div>
            )}
            
            <InfoSection title="Mô Tả" hasData={!!description}>
                <StoryRenderer text={description} gameState={gameState} onEntityClick={onEntityClick} worldSettings={worldSettings} onEntityMouseEnter={onEntityMouseEnter} onEntityMouseLeave={onEntityMouseLeave} />
            </InfoSection>

             <InfoSection title="Tổng Quan Tính Cách" hasData={!!personality}>
                <p className="personality-summary">{personality}</p>
            </InfoSection>
            
            <InfoSection title="Sự Nghiệp & Tài Sản" hasData={hasCareerInfo || hasAssets}>
                {hasCareerInfo && (
                    <div className="career-info">
                        <span className="career-label">Công việc:</span>
                        <span className="career-value">{job.name} - {job.rank}</span>
                    </div>
                )}
                {hasAssets && (
                    <div className="assets-info">
                         <h5 className="assets-title">Tài sản sở hữu</h5>
                         <ul className="char-detail-list simple-list">
                            {assets.map(asset => (
                                <li key={asset.id}><strong>{asset.name}</strong> ({asset.type}): {asset.description}</li>
                            ))}
                         </ul>
                    </div>
                )}
            </InfoSection>

            <InfoSection title="Tính Cách & Điểm Yếu" hasData={!!(traits && traits.length > 0)}>
                <div className="traits-list">
                    {traits?.map(trait => (
                        <div key={trait.id || trait.name} className={`trait-item ${trait.type.toLowerCase()}`}>
                            <strong>{trait.name}</strong>
                            <span>{trait.description}</span>
                        </div>
                    ))}
                </div>
            </InfoSection>

            <InfoSection title="Động Lực Nội Tâm" hasData={!!((ideals && ideals.length > 0) || (bonds && bonds.length > 0))}>
                {ideals && ideals.length > 0 && (
                    <>
                        <h5>Lý Tưởng</h5>
                        <ul className="char-detail-list simple-list">
                            {ideals.map((ideal, i) => <li key={i}>{ideal}</li>)}
                        </ul>
                    </>
                )}
                {bonds && bonds.length > 0 && (
                     <>
                        <h5>Ràng Buộc</h5>
                        <ul className="char-detail-list simple-list">
                            {bonds.map((bond, i) => <li key={i}>{bond}</li>)}
                        </ul>
                    </>
                )}
            </InfoSection>

            <InfoSection title="Danh Vọng" hasData={!!(reputation && reputation.length > 0)}>
                <ul className="char-detail-list reputation-list">
                    {reputation?.map(rep => (
                        <li key={rep.factionId} className="reputation-item">
                           <div className="reputation-info">
                               <span className="faction-name">{rep.factionName}</span>
                               <span className="rep-title">{rep.title}</span>
                           </div>
                           <span className={`rep-score ${rep.score > 0 ? 'positive' : rep.score < 0 ? 'negative' : ''}`}>{rep.score}</span>
                        </li>
                    ))}
                </ul>
            </InfoSection>

            <InfoSection title="Cung Bậc Phát Triển" hasData={!!characterArc}>
                {characterArc && (
                    <div className="character-arc-display">
                        <h5 className="arc-name">{characterArc.name} <span className="arc-stage">(Giai đoạn {characterArc.stage})</span></h5>
                        <p className="arc-description">{characterArc.description}</p>
                    </div>
                )}
            </InfoSection>

            <InfoSection title="Di chứng & Vết sẹo" hasData={!!(scars && scars.length > 0)}>
                <ul className="char-detail-list simple-list">
                    {scars?.map(scar => (
                        <li key={scar.id || scar.sourceTurnId}>{scar.description}</li>
                    ))}
                </ul>
            </InfoSection>

            <InfoSection title="Tiểu Sử" hasData={!!backstory || !!(lifeEvents && lifeEvents.length > 0)}>
                {backstory && <StoryRenderer text={backstory} gameState={gameState} onEntityClick={onEntityClick} worldSettings={worldSettings} onEntityMouseEnter={onEntityMouseEnter} onEntityMouseLeave={onEntityMouseLeave} />}
                {lifeEvents && lifeEvents.length > 0 && (
                    <div className="life-events-section">
                        <h5>Sự Kiện Trong Đời</h5>
                        <ul className="char-detail-list simple-list">
                            {lifeEvents.map(event => (
                                <li key={event.turnId}>
                                    <StoryRenderer text={event.description} gameState={gameState} onEntityClick={onEntityClick} worldSettings={worldSettings} onEntityMouseEnter={onEntityMouseEnter} onEntityMouseLeave={onEntityMouseLeave} />
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </InfoSection>
        </div>
    );
};
