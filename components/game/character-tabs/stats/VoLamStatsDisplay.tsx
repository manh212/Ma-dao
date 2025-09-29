/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import type { GameCharacter, VoLamCharacterStats } from '../../../../types';

// Vo Lam Stat Icons
const DanhVongIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15.5 16.5 12 22l-3.5-5.5"/><path d="M12 2v9.5"/><circle cx="12" cy="7.5" r="5.5"/></svg>;
const LucTayIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 12.5a4.5 4.5 0 0 1-4.5 4.5v0a4.5 4.5 0 0 1-4.5-4.5v-8a4.5 4.5 0 0 1 4.5-4.5v0a4.5 4.5 0 0 1 4.5 4.5Z"/><path d="M14 17V5"/><path d="M10 17V5"/></svg>;
const ThanPhapIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12a10 10 0 1 0-20 0"/><path d="M15 6-2 12l17 6-17-6"/></svg>;
const TheChatIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="1"/><path d="M9 20s-1-4.5 3-6 3 6 3 6"/><path d="M6 8V7a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v1"/><path d="M12 11h.01"/></svg>;

const STAT_LABELS = {
    lucTay: 'Lực Tay',
    thanPhap: 'Thân Pháp',
    theChat: 'Thể Chất',
    danhVong: 'Danh Vọng',
};

interface VoLamStatsDisplayProps {
    character: GameCharacter;
}

export const VoLamStatsDisplay = ({ character }: VoLamStatsDisplayProps) => {
    const stats = character.stats as VoLamCharacterStats | undefined;
    if (!stats) return <div className="char-stats-grid"><p>Chưa có chỉ số.</p></div>;

    const { noiLuc } = character;
    const { danhVong, lucTay, thanPhap, theChat } = stats;

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
            {noiLuc && <div className="stat-bar noi-luc-bar"><div style={{width: `${(noiLuc.current / noiLuc.max) * 100}%`}}></div><span>Nội Lực: {noiLuc.current}/{noiLuc.max}</span></div>}
            <div className="tutien-core-stats-grid">
                {renderStatItem(STAT_LABELS.danhVong, danhVong, DanhVongIcon)}
                {renderStatItem(STAT_LABELS.lucTay, lucTay, LucTayIcon)}
                {renderStatItem(STAT_LABELS.thanPhap, thanPhap, ThanPhapIcon)}
                {renderStatItem(STAT_LABELS.theChat, theChat, TheChatIcon)}
            </div>
        </div>
    );
};