/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useRef, useEffect } from 'react';
import { StoryRenderer } from '../game/StoryRenderer';
import { useGameContext } from '../contexts/GameContext';
import { getRelationshipInfo } from '../../utils/game';
import { KNOWLEDGE_BASE_CATEGORIES, KB_CATEGORY_ORDER } from '../../constants/gameConstants';
import type { GameCharacter, KnowledgeEntity } from '../../types';
import './KnowledgeBaseModal.css';

interface KnowledgeBaseModalProps {
    onClose: () => void;
    onEntityClick: (event: React.MouseEvent, id: string, type: string) => void;
    onEntityMouseEnter: (event: React.MouseEvent, id: string, type: string) => void;
    onEntityMouseLeave: () => void;
    onNpcSelect: (npcId: string) => void;
    onRenameEntity: (id: string, newName: string, entityType: string, oldName: string) => void;
    onUpdateWorldSummary: (newSummary: string) => void;
    addToast: (message: string, type?: 'info' | 'success' | 'error' | 'warning') => void;
}

export const KnowledgeBaseModal = ({ onClose, onEntityClick, onEntityMouseEnter, onEntityMouseLeave, onNpcSelect, onRenameEntity, onUpdateWorldSummary, addToast }: KnowledgeBaseModalProps) => {
    const { gameState, worldSettings } = useGameContext();
    const [activeTab, setActiveTab] = useState<keyof typeof KNOWLEDGE_BASE_CATEGORIES>('npcs');
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [editingItemId, setEditingItemId] = useState<string | null>(null);
    const [editableName, setEditableName] = useState('');
    const [editableSummary, setEditableSummary] = useState(gameState.worldSummary || '');
    const editInputRef = useRef<HTMLInputElement>(null);
    const { knowledgeBase } = gameState;

    useEffect(() => {
        if (editingItemId && editInputRef.current) {
            editInputRef.current.focus();
            editInputRef.current.select();
        }
    }, [editingItemId]);
    
    useEffect(() => {
        setEditableSummary(gameState.worldSummary || '');
    }, [gameState.worldSummary]);
    
    const handleToggle = (id: string) => {
        if (editingItemId === id) return;
        setExpandedId(prev => (prev === id ? null : id));
    };

    const handleEditClick = (e: React.MouseEvent, item: GameCharacter | KnowledgeEntity) => {
        e.stopPropagation();
        setEditingItemId(item.id);
        setEditableName((item as GameCharacter).displayName);
        setExpandedId(null); // Collapse item when editing name
    };

    const handleNameSave = (item: GameCharacter | KnowledgeEntity, entityType: string) => {
        if (editingItemId && editableName.trim() !== '') {
            onRenameEntity(item.id, editableName, entityType, (item as GameCharacter).displayName);
        }
        setEditingItemId(null);
        setEditableName('');
    };

    const handleSaveSummary = () => {
        onUpdateWorldSummary(editableSummary);
        addToast('Bối cảnh thế giới đã được cập nhật.', 'success');
    };

    const renderGenericItem = (item: KnowledgeEntity, type: string) => {
        const isEditing = editingItemId === item.id;
        return (
            <li key={item.id} className={`kb-item ${expandedId === item.id ? 'expanded' : ''}`}>
                <header className="kb-item-header" onClick={() => handleToggle(item.id)}>
                    <div className="kb-item-name">
                        {isEditing ? (
                            <input
                                ref={editInputRef}
                                type="text"
                                className="entity-name-input"
                                value={editableName}
                                onChange={(e) => setEditableName(e.target.value)}
                                onBlur={() => handleNameSave(item, type)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleNameSave(item, type);
                                    if (e.key === 'Escape') setEditingItemId(null);
                                }}
                                onClick={e => e.stopPropagation()}
                            />
                        ) : (
                            <>
                                <span>{item.displayName}</span>
                                <div className="kb-item-actions">
                                    <button className="edit-name-button" title="Đổi tên" onClick={(e) => handleEditClick(e, item)}>✏️</button>
                                </div>
                            </>
                        )}
                    </div>
                    <span className="section-chevron-icon">
                        {expandedId === item.id ? '▲' : '▼'}
                    </span>
                </header>
                <div className="kb-item-content">
                    <StoryRenderer 
                        text={item.description} 
                        gameState={gameState}
                        onEntityClick={onEntityClick}
                        worldSettings={worldSettings}
                        onEntityMouseEnter={onEntityMouseEnter}
                        onEntityMouseLeave={onEntityMouseLeave}
                    />
                </div>
            </li>
        );
    };

    const renderNpcItem = (npc: GameCharacter) => {
        const relInfo = getRelationshipInfo(npc.relationship);
        return (
            <div key={npc.id} className={`npc-card ${npc.deathState?.isDead ? 'deceased' : ''}`} onClick={() => onNpcSelect(npc.id)}>
                <div className="npc-card-avatar">
                    {npc.avatarUrl ? (
                        <img src={npc.avatarUrl} alt={npc.displayName} />
                    ) : (
                        <span>{npc.displayName.charAt(0)}</span>
                    )}
                </div>
                <div className="npc-card-info">
                    <header className="npc-card-header">
                        <h4 className="npc-card-name">{npc.displayName}</h4>
                        {npc.deathState?.isDead ? (
                            <span className="npc-card-status deceased">Đã mất</span>
                        ) : (
                             npc.mood && <span className="npc-card-status">{npc.mood.current}</span>
                         )}
                    </header>
                    {!npc.deathState?.isDead && relInfo && (
                        <div className="npc-card-relationship">
                            <div className="relationship-bar-wrapper">
                                <div className="relationship-bar" style={{ width: `${((npc.relationship || 0) + 100) / 2}%`, backgroundColor: relInfo.color }}></div>
                            </div>
                            <span className="relationship-level" style={{ color: relInfo.color }}>{relInfo.text}</span>
                        </div>
                    )}
                </div>
            </div>
        );
    };
    
    const renderContent = () => {
        if (activeTab === 'world_summary') {
            return (
                <div className="world-summary-editor">
                    <textarea
                        className="world-summary-editor-textarea"
                        value={editableSummary}
                        onChange={(e) => setEditableSummary(e.target.value)}
                        rows={20}
                        placeholder="Mô tả bối cảnh, lịch sử, và các chi tiết quan trọng về thế giới của bạn tại đây..."
                    />
                    <button className="lore-button save-apply world-summary-save-button" onClick={handleSaveSummary}>Lưu Bối Cảnh</button>
                </div>
            );
        }

        const allItemsInTab = (knowledgeBase as any)[activeTab as any] || [];
        const isNpcTab = activeTab === 'npcs';

        const filteredItems = allItemsInTab.filter((item: GameCharacter | KnowledgeEntity) => {
            const nameToSearch = (item as GameCharacter).displayName || item.name;
            const normalizedSearch = searchTerm.toLowerCase();
            return nameToSearch.toLowerCase().includes(normalizedSearch) ||
                   (item.description && item.description.toLowerCase().includes(normalizedSearch));
        });

        if (filteredItems.length === 0) {
            return <p className="kb-no-data">Không có tri thức nào thuộc mục này.</p>;
        }

        if (isNpcTab) {
            const aliveNpcs = filteredItems.filter((npc: any) => !npc.deathState?.isDead);
            const deadNpcs = filteredItems.filter((npc: any) => npc.deathState?.isDead);

            return (
                 <>
                    {aliveNpcs.length > 0 && (
                        <>
                            <h5 className="saves-section-title">Còn Sống</h5>
                            <div className="npc-grid">
                                {aliveNpcs.map((item: GameCharacter) => renderNpcItem(item))}
                            </div>
                        </>
                    )}
                    {deadNpcs.length > 0 && (
                         <>
                            <h5 className="saves-section-title">Đã Mất</h5>
                            <div className="npc-grid">
                                {deadNpcs.map((item: GameCharacter) => renderNpcItem(item))}
                            </div>
                         </>
                    )}
                </>
            );

        } else {
             const typeMap: Record<string, string> = {
                locations: 'LOC',
                factions: 'FACTION',
                monsters: 'MONSTER',
                pcs: 'PC'
            };
            const entityType = typeMap[activeTab];
            return <ul className="kb-list">{filteredItems.map((item: KnowledgeEntity) => renderGenericItem(item, entityType))}</ul>;
        }
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content kb-modal-content" onClick={e => e.stopPropagation()}>
                <header className="modal-header">
                    <h3>Tri Thức Thế Giới</h3>
                    <button onClick={onClose} className="modal-close-button" aria-label="Đóng bảng Tri thức">X</button>
                </header>
                <div className="modal-body">
                    <nav className="kb-tabs">
                        {KB_CATEGORY_ORDER.map(key => {
                           const cat = KNOWLEDGE_BASE_CATEGORIES[key];
                           return (
                               <button 
                                    key={key} 
                                    className={`kb-tab-button ${activeTab === key ? 'active' : ''}`}
                                    onClick={() => { setActiveTab(key); setSearchTerm(''); setExpandedId(null); }}
                                > 
                                    <span>{cat.label}</span>
                                </button>
                           );
                        })}
                    </nav>
                    <div className="kb-content">
                        {activeTab !== 'world_summary' && (
                            <div className="kb-search-wrapper">
                                <input 
                                    type="text" 
                                    className="kb-search-input"
                                    placeholder={`Tìm kiếm trong ${KNOWLEDGE_BASE_CATEGORIES[activeTab]?.label || ''}...`} 
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                            </div>
                        )}
                        <div className="kb-list-container">
                           {renderContent()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};