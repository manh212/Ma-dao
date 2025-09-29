/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { useGameContext } from '../../contexts/GameContext';
import { NoInfoPlaceholder } from '../../ui/NoInfoPlaceholder';
import { getCurrencyName } from '../../../utils/game';
import type { GameCharacter, Item, ItemType } from '../../../types';
import { ALL_EQUIPPABLE_ITEM_TYPES } from '../../../types';

interface InventoryTabProps {
    character: GameCharacter;
}

const isEquippable = (itemType: ItemType): boolean => {
    // Use the constant from types.ts for a single source of truth.
    // We cast the constant array to the broader type to satisfy TypeScript's includes() check.
    return (ALL_EQUIPPABLE_ITEM_TYPES as ReadonlyArray<ItemType>).includes(itemType);
};

export const InventoryTab = ({ character }: InventoryTabProps) => {
    const { worldSettings, dispatch } = useGameContext();
    const currencyName = getCurrencyName(worldSettings.genre);

    const handleEquip = (item: Item) => {
        dispatch({ type: 'EQUIP_ITEM', payload: { characterId: character.id, item } });
    };

    return (
        <div className="inventory-info">
            <div className="char-detail-section">
                <div className="inventory-money">
                    <span>{currencyName}:</span>
                    <strong>{character.money?.toLocaleString('vi-VN') || 0}</strong>
                </div>
            </div>
            <div className="char-detail-section">
                <h4 className="inventory-items-title">Vật phẩm</h4>
                 {(character.inventory && character.inventory.length > 0) ? (
                    <ul className="inventory-item-list">
                        {character.inventory.map(item => (
                            <li key={item.name} title={item.description}>
                                <div className="item-header">
                                    <span className="item-name">{item.name}</span>
                                    <div className="item-controls">
                                        {isEquippable(item.type) && (
                                            <button className="item-equip-button" onClick={() => handleEquip(item)}>Trang bị</button>
                                        )}
                                        <span className="item-quantity">x{item.quantity}</span>
                                    </div>
                                </div>
                                <p className="item-description">{item.description}</p>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <NoInfoPlaceholder text="Túi đồ trống."/>
                )}
            </div>
        </div>
    );
};