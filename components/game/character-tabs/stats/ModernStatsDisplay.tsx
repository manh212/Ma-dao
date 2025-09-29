/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import type { GameCharacter, ModernCharacterStats } from '../../../../types';

// Icons for stats
const StressIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10c0-2.2-1.8-4-4-4"/><path d="M12 18a6 6 0 1 0 0-12"/></svg>;
const SocialEnergyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const HappinessIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" x2="9.01" y1="9" y2="9"/><line x1="15" x2="15.01" y1="9" y2="9"/></svg>;

interface ModernStatsDisplayProps {
    character: GameCharacter;
}

const StatBar = ({ label, value, max, color, Icon }: { label: string; value: number; max: number; color: string; Icon: React.ElementType }) => (
    <div className="modern-stat-bar-container">
        <div className="modern-stat-bar-label">
            <i><Icon/></i>
            <span>{label}</span>
        </div>
        <div className="stat-bar modern-bar">
            <div style={{ width: `${(value / max) * 100}%`, backgroundColor: color }}></div>
            <span>{value} / {max}</span>
        </div>
    </div>
);


export const ModernStatsDisplay = ({ character }: ModernStatsDisplayProps) => {
    const { stress = 0, socialEnergy = 100, happiness = 50 } = character.stats as ModernCharacterStats || {};

    const getStressColor = (val: number) => {
        if (val > 80) return 'var(--accent-danger)';
        if (val > 50) return 'var(--accent-warning)';
        return 'var(--accent-success)';
    };

    const getSocialEnergyColor = (val: number) => {
        if (val < 20) return 'var(--accent-danger)';
        if (val < 50) return 'var(--accent-warning)';
        return 'var(--accent-npc)';
    };

    const getHappinessColor = (val: number) => {
        if (val < 20) return 'var(--accent-danger)';
        if (val < 50) return 'var(--text-muted)';
        return 'var(--accent-pc)';
    };

    return (
        <div className="modern-stats-container">
            <StatBar label="Căng thẳng" value={stress} max={100} color={getStressColor(stress)} Icon={StressIcon} />
            <StatBar label="Năng lượng Xã hội" value={socialEnergy} max={100} color={getSocialEnergyColor(socialEnergy)} Icon={SocialEnergyIcon} />
            <StatBar label="Hạnh phúc" value={happiness} max={100} color={getHappinessColor(happiness)} Icon={HappinessIcon} />
        </div>
    );
};
