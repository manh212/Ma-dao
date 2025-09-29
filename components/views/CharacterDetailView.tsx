/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import './CharacterDetailView.css';
import { EquipmentSidePanel } from '../game/character-tabs/EquipmentSidePanel';
import { InfoTab } from '../game/character-tabs/InfoTab';
import { RelationshipsTab } from '../game/character-tabs/RelationshipsTab';
import { InventoryTab } from '../game/character-tabs/InventoryTab';
import { QuestsTab } from '../game/character-tabs/QuestsTab';
import { TalentTreeTab } from '../game/character-tabs/TalentTreeTab';
import { SectTab } from '../game/character-tabs/SectTab';
import { CraftingTab } from '../game/character-tabs/CraftingTab';
import { MeridiansTab } from '../game/character-tabs/MeridiansTab';
import { GuildTab } from '../game/character-tabs/GuildTab';
import { TimelineTab } from '../game/character-tabs/TimelineTab';
import { SectStoreModal } from '../modals/SectStoreModal';
import { useGameContext } from '../contexts/GameContext';
import type { GameCharacter, VoLamCharacter } from '../../types';

interface CharacterDetailViewProps {
    character: GameCharacter | null;
    onClose: () => void;
    isPlayerCharacter: boolean;
    onEntityClick: (event: React.MouseEvent, id: string, type: string) => void;
    onEntityMouseEnter: (event: React.MouseEvent, id: string, type: string) => void;
    onEntityMouseLeave: () => void;
    onNpcSelect: (npcId: string) => void;
    onRenameEntity: (id: string, newName: string, entityType: string, oldName: string) => void;
    onUpdateCharacterData: (characterId: string, updates: Partial<GameCharacter>) => void;
    addToast: (message: string, type?: 'info' | 'success' | 'error' | 'warning') => void;
}

const BASE_TABS = ['Thông Tin', 'Mối Quan Hệ', 'Nhiệm Vụ', 'Kỹ Năng', 'Túi Đồ'];

export const CharacterDetailView = ({
    character,
    onClose,
    isPlayerCharacter,
    onEntityClick,
    onEntityMouseEnter,
    onEntityMouseLeave,
    onNpcSelect,
    onRenameEntity,
    onUpdateCharacterData,
    addToast
}: CharacterDetailViewProps) => {
    const { worldSettings, gameState } = useGameContext();
    const [activeTab, setActiveTab] = useState(BASE_TABS[0]);
    const [isSectStoreOpen, setIsSectStoreOpen] = useState(false);

    if (!character) return null;

    const voLamChar = character as VoLamCharacter;

    const getTabsForGenre = () => {
        let tabs = [...BASE_TABS];
        if (worldSettings.genre === 'Võ Lâm') {
            // Player should always see the Guild tab to create or manage it.
            if (isPlayerCharacter) {
                tabs.splice(2, 0, 'Bang Hội');
            }
            // A character (player or NPC) should see their Sect tab if they belong to one.
            // When a player creates a guild, their sectId is removed, so this tab will disappear naturally.
            if (voLamChar.sectId) {
                 tabs.splice(2, 0, 'Môn Phái');
            }
            if (isPlayerCharacter) {
                tabs.push('Chế Tạo');
                tabs.push('Kinh Mạch');
            }
        }
        if (worldSettings.genre === 'Đồng nhân') {
            tabs.splice(1, 0, 'Dòng Thời Gian');
        }
        if (!isPlayerCharacter) {
            tabs = tabs.filter(tab => tab !== 'Nhiệm Vụ' && tab !== 'Chế Tạo' && tab !== 'Kinh Mạch' && tab !== 'Bang Hội');
        }
        return tabs;
    };
    
    const availableTabs = getTabsForGenre();
    
    const renderTabContent = () => {
        switch (activeTab) {
            case 'Thông Tin':
                return <InfoTab 
                    character={character} 
                    isPlayerCharacter={isPlayerCharacter}
                    onEntityClick={onEntityClick}
                    onEntityMouseEnter={onEntityMouseEnter}
                    onEntityMouseLeave={onEntityMouseLeave}
                    onNpcSelect={onNpcSelect}
                    onUpdateCharacterData={onUpdateCharacterData}
                    addToast={addToast}
                />;
            case 'Dòng Thời Gian':
                return <TimelineTab />;
            case 'Mối Quan Hệ':
                return <RelationshipsTab 
                    character={character}
                    isPlayerCharacter={isPlayerCharacter}
                    onNpcSelect={onNpcSelect}
                />;
             case 'Môn Phái':
                return <SectTab 
                    character={character} 
                    onOpenStore={() => setIsSectStoreOpen(true)}
                    onNavigateToTab={setActiveTab}
                />;
            case 'Bang Hội':
                if (!isPlayerCharacter) return null;
                return <GuildTab character={voLamChar} />;
            case 'Nhiệm Vụ':
                if (!isPlayerCharacter) return null;
                return <QuestsTab 
                     onEntityClick={onEntityClick}
                     onEntityMouseEnter={onEntityMouseEnter}
                     onEntityMouseLeave={onEntityMouseLeave}
                />;
            case 'Kỹ Năng':
                return <TalentTreeTab
                    character={character}
                    onEntityClick={onEntityClick}
                    onEntityMouseEnter={onEntityMouseEnter}
                    onEntityMouseLeave={onEntityMouseLeave}
                />;
            case 'Túi Đồ':
                return <InventoryTab character={character} />;
            case 'Chế Tạo':
                if (!isPlayerCharacter) return null;
                return <CraftingTab character={character} />;
            case 'Kinh Mạch':
                if (!isPlayerCharacter) return null;
                return <MeridiansTab character={character} />;
            default:
                return null;
        }
    };

    return (
        <>
            {isSectStoreOpen && <SectStoreModal character={character} onClose={() => setIsSectStoreOpen(false)} />}
            <div className="modal-overlay char-dossier-overlay" onClick={onClose}>
                <div 
                    className="char-dossier-container" 
                    onClick={e => e.stopPropagation()}
                    data-dao-path={character.daoPath?.toLowerCase()}
                >
                    <EquipmentSidePanel 
                        character={character}
                        isPlayerCharacter={isPlayerCharacter}
                        onClose={onClose}
                    />
                    <main className="char-dossier-main">
                        <nav className="dossier-tabs">
                            {availableTabs.map(tab => (
                                <button 
                                    key={tab}
                                    className={`dossier-tab-button ${activeTab === tab ? 'active' : ''}`}
                                    onClick={() => setActiveTab(tab)}
                                >
                                    {tab}
                                </button>
                            ))}
                        </nav>
                        <div className="dossier-tabs-dropdown">
                            <div className="select-wrapper">
                                <select value={activeTab} onChange={(e) => setActiveTab(e.target.value)}>
                                    {availableTabs.map(tab => (
                                        <option key={tab} value={tab}>{tab}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="dossier-tab-content">
                            {renderTabContent()}
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
};
