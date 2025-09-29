/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import './SectStoreModal.css';
import { useGameContext } from '../contexts/GameContext';
import { NoInfoPlaceholder } from '../ui/NoInfoPlaceholder';
import type { GameCharacter, SectStoreListing, VoLamCharacter } from '../../types';

interface SectStoreModalProps {
    character: GameCharacter;
    onClose: () => void;
}

export const SectStoreModal = ({ character, onClose }: SectStoreModalProps) => {
    const { gameState, dispatch } = useGameContext();
    const voLamChar = character as VoLamCharacter;

    const storeListings = gameState.sectStores?.[voLamChar.sectId || ''] || [];
    const contributionPoints = voLamChar.contributionPoints?.current || 0;

    const handlePurchase = (listing: SectStoreListing) => {
        if (contributionPoints >= listing.cost) {
            dispatch({ type: 'PURCHASE_SECT_ITEM', payload: { characterId: character.id, listing } });
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content sect-store-modal" onClick={e => e.stopPropagation()}>
                <header className="modal-header">
                    <h3>Tàng Kinh Các - {voLamChar.sectName}</h3>
                    <button onClick={onClose} className="modal-close-button" aria-label="Đóng">×</button>
                </header>
                <div className="sect-store-user-info">
                    <span>Điểm Cống Hiến: </span>
                    <span className="contribution-points-value">{contributionPoints.toLocaleString()}</span>
                </div>
                <div className="modal-body">
                    {storeListings.length === 0 ? (
                        <NoInfoPlaceholder text="Tàng Kinh Các hiện chưa có vật phẩm nào." />
                    ) : (
                        <ul className="sect-store-list">
                            {storeListings.map((listing, index) => {
                                const canAfford = contributionPoints >= listing.cost;
                                return (
                                    <li key={`${listing.name}-${index}`} className="sect-store-item">
                                        <div className="sect-store-item-info">
                                            <div className="item-info-header">
                                                <span className="item-info-name">{listing.name}</span>
                                                <span className={`item-info-type type-${listing.listingType.toLowerCase()}`}>
                                                    {listing.listingType === 'ITEM' ? 'Vật Phẩm' : 'Công Pháp'}
                                                </span>
                                            </div>
                                            <p className="item-info-desc">{listing.description}</p>
                                        </div>
                                        <div className="sect-store-item-action">
                                            <span className="item-info-cost">{listing.cost.toLocaleString()} cống hiến</span>
                                            <button 
                                                className="item-purchase-button"
                                                onClick={() => handlePurchase(listing)}
                                                disabled={!canAfford}
                                            >
                                                Mua
                                            </button>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};