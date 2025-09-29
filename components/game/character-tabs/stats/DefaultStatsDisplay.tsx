/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import type { GameCharacter, CharacterStats } from '../../../../types';

interface DefaultStatsDisplayProps {
    character: GameCharacter;
    genre: string;
}

const STAT_LABELS: Record<string, string> = {
    strength: 'Sức Mạnh',
    dexterity: 'Nhanh Nhẹn',
    constitution: 'Thể Chất',
    intelligence: 'Trí Tuệ',
    wisdom: 'Thông Tuệ',
    charisma: 'Sức Hút',
    power: 'Năng Lượng',
    speed: 'Tốc Độ',
    durability: 'Sức Bền',
    fightingSkills: 'Kỹ Năng Chiến Đấu',
    attack: 'Công Kích',
    defense: 'Phòng Ngự',
};

const STAT_ORDER_BY_GENRE: Record<string, (keyof CharacterStats)[]> = {
    'Marvel': ['power', 'strength', 'speed', 'durability', 'fightingSkills'],
    'Dị Giới Fantasy': ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma', 'attack', 'defense'],
    default: ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma', 'attack', 'defense'],
};

export const DefaultStatsDisplay = ({ character, genre }: DefaultStatsDisplayProps) => {
    const { stats } = character;
    if (!stats || Object.keys(stats).length === 0) {
        return <div className="char-stats-grid"><p>Chưa có chỉ số.</p></div>;
    }

    const statOrder = STAT_ORDER_BY_GENRE[genre] || STAT_ORDER_BY_GENRE.default;
    
    const orderedStats = [
        ...statOrder.filter(key => (stats as any)[key] !== undefined && (stats as any)[key] !== null),
        ...Object.keys(stats).filter(key => !statOrder.includes(key as any) && (stats as any)[key] !== undefined && (stats as any)[key] !== null)
    ];

    return (
        <div className="char-stats-grid">
            {orderedStats.map(statKey => {
                const value = (stats as any)[statKey];
                if (value === undefined || value === null) return null;
                return (
                    <div key={statKey} className="stat-item">
                        <span className="stat-label">{STAT_LABELS[statKey] || statKey}</span>
                        <span className="stat-value">{value}</span>
                    </div>
                );
            })}
        </div>
    );
};