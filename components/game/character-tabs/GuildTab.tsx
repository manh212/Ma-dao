
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useMemo, useCallback, useState } from 'react';
import { useGameContext } from '../../contexts/GameContext';
import { GUILD_BUILDING_UPGRADES } from '../../../constants/guildConstants';
import type { VoLamCharacter, DiplomaticRelation, Guild } from '../../../types';

interface GuildTabProps {
    character: VoLamCharacter;
}

const buildingLabels: Record<keyof Guild['buildings'], string> = {
    mainHall: 'Chính Điện',
    trainingGrounds: 'Võ Trường',
    treasury: 'Ngân Khố',
};

export const GuildTab = React.memo(({ character }: GuildTabProps) => {
    const { gameState, dispatch } = useGameContext();
    const [newGuildName, setNewGuildName] = useState('');
    const [newDiplomacyTarget, setNewDiplomacyTarget] = useState('');

    const guild = useMemo(() => {
        if (!character.guildId || !gameState.guilds) return null;
        return gameState.guilds[character.guildId];
    }, [character.guildId, gameState.guilds]);

    const handleCreateGuild = useCallback(() => {
        if (newGuildName.trim()) {
            dispatch({ type: 'CREATE_GUILD', payload: { ownerId: character.id, guildName: newGuildName.trim() } });
            setNewGuildName('');
        }
    }, [dispatch, character.id, newGuildName]);
    
    const allNpcsById = useMemo(() =>
        new Map(gameState.knowledgeBase.npcs.map(npc => [npc.id, npc])),
        [gameState.knowledgeBase.npcs]
    );

    const establishedRelations = useMemo(() => {
        if (!guild?.diplomacy) return [];
        return (guild.diplomacy as DiplomaticRelation[])
            .map(rel => ({
                relation: rel,
                faction: gameState.knowledgeBase.factions.find(f => f.id === rel.factionId)
            }))
            .filter(item => item.faction);
    }, [guild?.diplomacy, gameState.knowledgeBase.factions]);

    const availableFactions = useMemo(() => {
        const diplomaticFactionIds = new Set((guild?.diplomacy || []).map(r => r.factionId));
        return gameState.knowledgeBase.factions.filter(f => !diplomaticFactionIds.has(f.id));
    }, [guild?.diplomacy, gameState.knowledgeBase.factions]);

    const buildingKeys = useMemo(() => {
        if (!guild?.buildings) return [];
        return Object.keys(guild.buildings) as (keyof Guild['buildings'])[];
    }, [guild]);

    const handleUpgradeBuilding = useCallback((building: keyof Guild['buildings']) => {
        if (guild) {
            dispatch({ type: 'UPGRADE_BUILDING', payload: { guildId: guild.id, building } });
        }
    }, [dispatch, guild]);
    
    const handleSetDiplomacy = useCallback((targetFactionId: string, status: DiplomaticRelation['status']) => {
        if (guild) {
            dispatch({ type: 'SET_DIPLOMACY', payload: { guildId: guild.id, targetFactionId, status } });
        }
    }, [dispatch, guild]);

    const handleAddNewDiplomacy = useCallback(() => {
        if (guild && newDiplomacyTarget) {
            handleSetDiplomacy(newDiplomacyTarget, 'Neutral');
            setNewDiplomacyTarget('');
        }
    }, [guild, newDiplomacyTarget, handleSetDiplomacy]);

    // UI for creating a new guild
    if (!guild) {
        return (
            <div className="char-detail-section guild-creation-container">
                <h5>Thành Lập Bang Hội</h5>
                <p>Bạn chưa gia nhập hoặc thành lập bang hội nào. Hãy tạo nên thế lực của riêng mình trên giang hồ!</p>
                <div className="form-field">
                    <label htmlFor="guild-name">Tên Bang Hội</label>
                    <input
                        type="text"
                        id="guild-name"
                        value={newGuildName}
                        onChange={(e) => setNewGuildName(e.target.value)}
                        placeholder="Ví dụ: Thiên Hạ Đệ Nhất Bang"
                    />
                </div>
                <button
                    className="wc-button button-create-world"
                    style={{width: '100%', marginTop: '1rem'}}
                    onClick={handleCreateGuild}
                    disabled={!newGuildName.trim()}
                >
                    Thành Lập
                </button>
            </div>
        );
    }

    // UI for managing an existing guild
    return (
        <div className="char-detail-section guild-tab-container">
            <div className="guild-section" style={{ gridColumn: '1 / -1' }}>
                <h5>Quản Lý Công Trình</h5>
                 <div className="guild-building-grid">
                    {buildingKeys.map((key) => {
                        const currentLevel = guild.buildings[key].level;
                        const currentInfo = GUILD_BUILDING_UPGRADES[key]?.find(u => u.level === currentLevel);
                        const nextLevelInfo = GUILD_BUILDING_UPGRADES[key]?.find(u => u.level === currentLevel + 1);
                        const canAfford = nextLevelInfo && guild.resources.gold >= nextLevelInfo.cost.gold && guild.resources.wood >= nextLevelInfo.cost.wood && guild.resources.ore >= nextLevelInfo.cost.ore;

                        return (
                            <div key={key} className="guild-building-card">
                                <header className="building-card-header">
                                    <h6 className="building-card-title">{buildingLabels[key]}</h6>
                                    <span className="building-card-level">Cấp {currentLevel}</span>
                                </header>
                                <p className="building-card-description">{currentInfo?.description}</p>
                                <div className="building-upgrade-info">
                                    {nextLevelInfo ? (
                                        <>
                                            <div><strong>Cấp tiếp theo:</strong> {nextLevelInfo.description}</div>
                                            <div className="building-upgrade-cost">
                                                <span>Vàng: {nextLevelInfo.cost.gold}</span>
                                                <span>Gỗ: {nextLevelInfo.cost.wood}</span>
                                                <span>Sắt: {nextLevelInfo.cost.ore}</span>
                                            </div>
                                        </>
                                    ) : (
                                        <div>Đã đạt cấp tối đa.</div>
                                    )}
                                </div>
                                <button className="wc-button building-upgrade-button" onClick={() => handleUpgradeBuilding(key)} disabled={!nextLevelInfo || !canAfford}>
                                    Nâng Cấp
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="guild-section">
                <h5>Thành Viên ({guild.members.length} / {guild.maxMembers})</h5>
                 <ul className="member-list">
                    {guild.members.map(memberId => {
                        const member = allNpcsById.get(memberId) || (memberId === character.id ? character : null);
                        if (!member) return <li key={memberId}>Thành viên không xác định</li>;
                        return (
                            <li key={memberId} className="member-item">
                                <span>{member.displayName}</span>
                                <span>{memberId === guild.ownerId ? 'Bang Chủ' : 'Thành Viên'}</span>
                            </li>
                        );
                    })}
                </ul>
            </div>

            <div className="guild-section">
                <h5>Ngoại Giao</h5>
                <h6>Quan hệ đã thiết lập</h6>
                {establishedRelations.length > 0 ? (
                    <ul className="diplomacy-list">
                        {establishedRelations.map(({ relation, faction }) => (
                            <li key={faction!.id} className="diplomacy-item">
                                <span>{faction!.displayName}</span>
                                <select 
                                    className="diplomacy-status-select" 
                                    value={relation.status}
                                    onChange={(e) => handleSetDiplomacy(faction!.id, e.target.value as DiplomaticRelation['status'])}
                                >
                                    <option value="Neutral">Trung Lập</option>
                                    <option value="Ally">Đồng Minh</option>
                                    <option value="War">Chiến Tranh</option>
                                </select>
                            </li>
                        ))}
                    </ul>
                ) : <p>Chưa thiết lập quan hệ ngoại giao nào.</p>}

                <h6 style={{ marginTop: '1.5rem' }}>Thiết lập quan hệ mới</h6>
                {availableFactions.length > 0 ? (
                    <div className="new-diplomacy-controls">
                         <div className="select-wrapper">
                            <select
                                value={newDiplomacyTarget}
                                onChange={(e) => setNewDiplomacyTarget(e.target.value)}
                            >
                                <option value="" disabled>Chọn một phe phái...</option>
                                {availableFactions.map(faction => (
                                    <option key={faction.id} value={faction.id}>{faction.displayName}</option>
                                ))}
                            </select>
                        </div>
                        <button className="wc-button" onClick={handleAddNewDiplomacy} disabled={!newDiplomacyTarget}>Thêm</button>
                    </div>
                ) : <p>Đã thiết lập quan hệ với tất cả phe phái.</p>}
            </div>
        </div>
    );
});
