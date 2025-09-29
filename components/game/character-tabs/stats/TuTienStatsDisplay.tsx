/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import type { GameCharacter, TuTienCharacterStats } from '../../../../types';

// Tu Tiên Stat Icons
const TuViIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21a9 9 0 1 0-9-9"/><path d="M12 21a9 9 0 1 1 9-9"/><path d="M12 21a9 9 0 0 0-9-9"/><path d="M12 21a9 9 0 0 1 9-9"/><path d="M12 3a9 9 0 0 0 9 9"/><path d="M12 3a9 9 0 0 1-9 9"/></svg>;
const ThanThucIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/><path d="M2 8.5C4.5 5.5 8 4 12 4s7.5 1.5 10 4.5"/><path d="M22 15.5c-2.5 3-6 4.5-10 4.5s-7.5-1.5-10-4.5"/></svg>;
const TheChatIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="1"/><path d="M9 20s-1-4.5 3-6 3 6 3 6"/><path d="M6 8V7a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v1"/><path d="M12 11h.01"/></svg>;

const STAT_LABELS = {
    canhGioi: 'Cảnh Giới',
    tuVi: 'Tu Vi',
    thanThuc: 'Thần Thức',
    theChat: 'Thân Thể',
};

interface TuTienStatsDisplayProps {
    character: GameCharacter;
}

export const TuTienStatsDisplay = ({ character }: TuTienStatsDisplayProps) => {
    const stats = character.stats as TuTienCharacterStats | undefined;
    if (!stats) return <div className="char-stats-grid"><p>Chưa có chỉ số.</p></div>;

    const { canhGioi, tuVi, thanThuc, theChat } = stats;

    const renderStatItem = (label: string, value: number | undefined, Icon: React.ElementType) => {
        if (value === undefined) return null;
        return (
            <div className="tutien-stat-item">
                <i className="tutien-stat-icon"><Icon /></i>
                <div className="tutien-stat-info">
                    <span className="tutien-stat-label">{label}</span>
                    <span className="tutien-stat-value">{value.toLocaleString('vi-VN')}</span>
                </div>
            </div>
        );
    };
    
    return (
        <div className="tutien-stats-container">
            {character.linhLuc && <div className="stat-bar noi-luc-bar"><div style={{width: `${(character.linhLuc.current / character.linhLuc.max) * 100}%`}}></div><span>Linh Lực: {character.linhLuc.current}/{character.linhLuc.max}</span></div>}
            {canhGioi && (
                <div className="tutien-realm-display">
                    <div className="tutien-realm-label">{STAT_LABELS.canhGioi}</div>
                    <div className="tutien-realm-value">{canhGioi}</div>
                </div>
            )}
            <div className="tutien-core-stats-grid">
                {renderStatItem(STAT_LABELS.tuVi, tuVi, TuViIcon)}
                {renderStatItem(STAT_LABELS.thanThuc, thanThuc, ThanThucIcon)}
                {renderStatItem(STAT_LABELS.theChat, theChat, TheChatIcon)}
            </div>
        </div>
    );
};