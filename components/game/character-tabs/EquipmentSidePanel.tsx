/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useRef } from 'react';
import { ItemTooltip } from '../ItemTooltip';
import { CharacterStatsDisplay } from './CharacterStatsDisplay';
import { useGameContext } from '../../contexts/GameContext';
import { formatFantasyRank } from '../../../utils/game';
import type { GameCharacter, EquipmentSlot, Item } from '../../../types';

// Icons for empty slots
const HelmetIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a4 4 0 0 0-4 4v2.5c0 1.5-1 3.5-3 4.5v3h14v-3c-2-1-3-3-3-4.5V6a4 4 0 0 0-4-4Z"/><path d="M12 14v8"/><path d="M18 15.5c-3-1-6-1-9 0"/></svg>;
const ChestIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2c2.5 0 5 2.5 5 5v3l-5 4-5-4V7c0-2.5 2.5-5 5-5Z"/><path d="M20 12c-4 0-4 4-8 4s-4-4-8-4"/><path d="M4 12v4h16v-4"/></svg>;
const BootsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H8.5a1 1 0 0 0-1 1.2L9 6h6l1.5-2.8a1 1 0 0 0-1-1.2Z"/><path d="m10 6 2 8 2-8"/><path d="M12 14v8"/><path d="M6 22h12"/></svg>;
const WeaponIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 3.5c-1-1-2.5-1-3.5 0l-10 10c-1 1-1 2.5 0 3.5l10 10c1 1 2.5 1 3.5 0l10-10c1-1 1-2.5 0-3.5l-10-10Z"/><path d="m2 2 20 20"/><path d="M12 2l5 5"/><path d="M7 17l5 5"/></svg>;
const AccessoryIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a5 5 0 0 1 5 5v14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V7a5 5 0 0 1 5-5Z"/><path d="M12 7v14"/></svg>;


const BackIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5m7 7-7-7 7-7"/></svg>;

const ICONS: Record<EquipmentSlot, React.ReactNode> = {
    'Helmet': <HelmetIcon />,
    'Chest Armor': <ChestIcon />,
    'Boots': <BootsIcon />,
    'Weapon': <WeaponIcon />,
    'Accessory': <AccessoryIcon />,
};

interface EquipmentSidePanelProps {
    character: GameCharacter;
    isPlayerCharacter: boolean;
    onClose: () => void;
}

// FIX: Wrap component in React.memo to prevent potential TypeScript errors related to the `key` prop when used in a list.
const EquipmentSlotDisplay = React.memo(({ slot, item, onUnequip, isGlowing, onMouseEnter, onMouseLeave, icon }: {
    slot: EquipmentSlot;
    item?: Item;
    onUnequip: (slot: EquipmentSlot) => void;
    isGlowing: boolean;
    onMouseEnter: (e: React.MouseEvent, item: Item) => void;
    onMouseLeave: () => void;
    icon: React.ReactNode;
}) => (
    <div
        className={`equipment-slot slot-${slot.toLowerCase().replace(' ', '-')} ${isGlowing ? 'glowing' : ''}`}
        onClick={() => item && onUnequip(slot)}
        onKeyDown={(e) => { if (item && (e.key === 'Enter' || e.key === ' ')) onUnequip(slot); }}
        onMouseEnter={(e) => item && onMouseEnter(e, item)}
        onMouseLeave={onMouseLeave}
        role="button"
        tabIndex={0}
        aria-label={item ? `Tháo ${item.name} khỏi ô ${slot}` : `Ô trống: ${slot}`}
    >
        {item ? (
            <div className="equipped-item-display">
                <span className="equipped-item-name">{item.name}</span>
                <span className="equipped-item-type">{item.type}</span>
            </div>
        ) : (
            <div className="equipment-slot-icon">{icon}</div>
        )}
    </div>
));

export const EquipmentSidePanel = ({ character, isPlayerCharacter, onClose }: EquipmentSidePanelProps) => {
    const { worldSettings, dispatch, gameState } = useGameContext();
    const [tooltip, setTooltip] = useState<{ item: Item, top: number, left: number } | null>(null);
    const [lastChangedSlot, setLastChangedSlot] = useState<EquipmentSlot | null>(null);
    const prevEquipmentRef = useRef(character.equipment);
    
    const [isEditingName, setIsEditingName] = useState(false);
    const [editableName, setEditableName] = useState(character.displayName || character.name);
    const nameInputRef = useRef<HTMLInputElement>(null);

    const rank = isPlayerCharacter ? character.adventurerRank : character.threatLevel;

     useEffect(() => {
        if (isEditingName && nameInputRef.current) {
            nameInputRef.current.focus();
            nameInputRef.current.select();
        }
    }, [isEditingName]);

    const handleNameSave = () => {
        if (isEditingName && editableName.trim() !== '' && character) {
            const entityType = character.id === gameState.character.id ? 'PC' : 'NPC';
            dispatch({ type: 'RENAME_ENTITY', payload: { id: character.id, newName: editableName.trim(), entityType } });
        }
        setIsEditingName(false);
    };

    useEffect(() => {
        const currentEquipment = character.equipment || {};
        const prevEquipment = prevEquipmentRef.current || {};
        
        const findChangedSlot = (slots: EquipmentSlot[]): EquipmentSlot | null => {
            for (const slot of slots) {
                if (currentEquipment[slot]?.name !== prevEquipment[slot]?.name) return slot;
                if (prevEquipment[slot] && !currentEquipment[slot]) return slot;
            }
            return null;
        }

        const changedSlot = findChangedSlot(Object.keys(ICONS) as EquipmentSlot[]);

        if (changedSlot) {
            setLastChangedSlot(changedSlot);
            const timer = setTimeout(() => setLastChangedSlot(null), 500);
            return () => clearTimeout(timer);
        }
        
        prevEquipmentRef.current = currentEquipment;
    }, [character.equipment]);

    const handleMouseEnter = (e: React.MouseEvent, item: Item) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setTooltip({ item, top: rect.top, left: rect.right + 10 });
    };

    const handleMouseLeave = () => setTooltip(null);
    const handleUnequip = (slot: EquipmentSlot) => dispatch({ type: 'UNEQUIP_ITEM', payload: { characterId: character.id, slot } });

    return (
        <>
            <ItemTooltip tooltipData={tooltip} />
            <aside className="char-dossier-profile">
                <header className="dossier-header">
                    <button className="dossier-back-button" onClick={onClose}><BackIcon /> Quay lại</button>
                </header>
                
                <div className="dossier-identity">
                    {isEditingName ? (
                        <input ref={nameInputRef} type="text" className="entity-name-input" value={editableName} onChange={(e) => setEditableName(e.target.value)} onBlur={handleNameSave} onKeyDown={(e) => e.key === 'Enter' && handleNameSave()} />
                    ) : (
                        <h2 className="dossier-name">
                            <button onClick={() => setIsEditingName(true)} className="name-edit-button" aria-label={`Sửa tên ${character.displayName}`}>
                                {character.displayName}
                                <span className="dossier-edit-icon">✏️</span>
                            </button>
                        </h2>
                    )}
                    <p className="dossier-title">{character.title || character.species}</p>
                    {rank && <p className="dossier-rank">{formatFantasyRank(rank)}</p>}
                </div>

                <div className="equipment-doll">
                    {(Object.keys(ICONS) as EquipmentSlot[]).map(slot => (
                        <EquipmentSlotDisplay 
                            key={slot}
                            slot={slot}
                            item={character.equipment?.[slot]}
                            onUnequip={handleUnequip}
                            isGlowing={lastChangedSlot === slot}
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                            icon={ICONS[slot]}
                        />
                    ))}
                </div>

                <div className="dossier-core-stats">
                    {character.health && <div className="stat-bar health-bar"><div style={{width: `${(character.health.current / character.health.max) * 100}%`}}></div><span>HP: {character.health.current}/{character.health.max}</span></div>}
                    {!isPlayerCharacter && typeof character.relationship === 'number' && <div className="stat-bar relationship-bar"><div style={{width: `${(character.relationship + 100) / 2}%`}}></div><span>Thiện cảm: {character.relationship}</span></div>}
                    <CharacterStatsDisplay character={character} genre={worldSettings.genre} />
                </div>

            </aside>
        </>
    );
};