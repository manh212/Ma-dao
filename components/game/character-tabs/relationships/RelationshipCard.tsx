/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { useGameContext } from '../../../contexts/GameContext';
import { getRelationshipInfo } from '../../../../utils/game';
import type { GameCharacter, Relationship } from '../../../../types';

// SVG Icons for stats
const HeartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>;
const ShieldIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>;
const HandshakeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M1 14.5l2.5-2.5.71.71-2.5 2.5V18h3v-2H2.21l2.5-2.5.71.71-2.5 2.5V19h4v-2H3.21l2.5-2.5.71.71-2.5 2.5V20h5v-2H4.21l2.5-2.5.71.71-2.5 2.5V21h6v-2H5.21l2.5-2.5.71.71-2.5 2.5V22h8v-2h-1.29l.29-.29c1.09-1.09 1.09-2.85 0-3.94l-2.06-2.06a2.79 2.79 0 00-3.94 0l-.29.29V14H1v.5zm11.29-9.29a2.79 2.79 0 00-3.94 0l-2.06 2.06c-1.09 1.09-1.09 2.85 0 3.94l.29.29H13v-1.5l-2.5 2.5-.71-.71 2.5-2.5H9v-3h2v2.5l2.5-2.5-.71-.71 2.5-2.5H12v-4h2v3.5l2.5-2.5-.71-.71 2.5-2.5H15v-5h2v4.5l2.5-2.5-.71-.71 2.5-2.5H18V1h2V2.5l2.5-2.5.71.71L20.71 5H23v2h-3.5l-2.5 2.5.71.71L20.21 7H21v2h-2.5l-2.5 2.5.71.71L19.21 9H20v2h-1.5l-2.5 2.5.71.71L18.21 11H19v2h-1.06l-.29.29a2.79 2.79 0 000 3.94l2.06 2.06a2.79 2.79 0 003.94 0L24 19l-1.41-1.41-11.3-11.3z"/></svg>;
const SkullIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>;
const StarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>;


interface AffinityBarProps {
    label: string;
    value: number;
    max?: number;
    min?: number;
    color?: string;
    icon: React.ReactNode;
}

const AffinityBar = ({ label, value, max = 100, min = 0, color, icon }: AffinityBarProps) => {
    const percentage = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
    return (
        <div className="affinity-bar-item" title={`${label}: ${value}`}>
            <div className="affinity-bar-label">
                <i>{icon}</i>
                <span>{label}</span>
            </div>
            <div className="affinity-bar-wrapper">
                <div className="affinity-bar" style={{ width: `${percentage}%`, backgroundColor: color }}></div>
            </div>
            <span className="affinity-bar-value">{value}</span>
        </div>
    );
};


interface RelationshipCardProps {
    npc: GameCharacter;
    playerRelationship?: Relationship;
    onClick: () => void;
}

export const RelationshipCard = ({ npc, playerRelationship, onClick }: RelationshipCardProps) => {
    const { relationship, respect = 0, trust = 0, fear = 0 } = npc;
    const { closeness = 0, influence = 0 } = playerRelationship || {};
    const relInfo = getRelationshipInfo(relationship);

    const { worldSettings } = useGameContext();
    const isModern = ['Đô Thị Hiện Đại', 'Quản lý Nhóm nhạc', 'Đô Thị Hiện Đại 100% bình thường'].includes(worldSettings.genre);

    return (
        <div className="relationship-card" onClick={onClick}>
            <header className="relationship-card-header">
                <div className="relationship-card-avatar">
                    {npc.avatarUrl ? (
                        <img src={npc.avatarUrl} alt={npc.displayName} />
                    ) : (
                        <span>{npc.displayName.charAt(0)}</span>
                    )}
                </div>
                <div className="relationship-card-identity">
                    <h6 className="relationship-card-name">{npc.displayName}</h6>
                    <span className="relationship-card-title">{npc.title || npc.species}</span>
                </div>
                <span className="relationship-card-status" style={{ backgroundColor: relInfo.color }}>
                    {relInfo.text}
                </span>
            </header>
            <div className={`affinity-bars-container ${isModern ? 'modern-grid' : ''}`}>
                <AffinityBar label="Thiện cảm" value={relInfo.score} min={-100} color={relInfo.color} icon={<HeartIcon />} />
                <AffinityBar label="Tôn trọng" value={respect} icon={<ShieldIcon />} />
                <AffinityBar label="Tin tưởng" value={trust} icon={<HandshakeIcon />} />
                <AffinityBar label="Sợ hãi" value={fear} icon={<SkullIcon />} />
                {isModern && (
                    <>
                        <AffinityBar label="Độ Thân Thiết" value={closeness} color="var(--accent-pink)" icon={<UsersIcon />} />
                        <AffinityBar label="Tầm Ảnh Hưởng" value={influence} color="var(--accent-warning)" icon={<StarIcon />} />
                    </>
                )}
            </div>
        </div>
    );
};
