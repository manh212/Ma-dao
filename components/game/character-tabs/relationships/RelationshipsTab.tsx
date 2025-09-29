/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { useGameContext } from '../../../contexts/GameContext';
import { getRelationshipInfo } from '../../../../utils/game';
import { NoInfoPlaceholder } from '../../../ui/NoInfoPlaceholder';
import { RelationshipCard } from './RelationshipCard';
import { SocialRelationshipCard } from './SocialRelationshipCard';
import type { GameCharacter, Relationship } from '../../../../types';

interface RelationshipsTabProps {
    character: GameCharacter;
    isPlayerCharacter: boolean;
    onNpcSelect: (npcId: string) => void;
}

export const RelationshipsTab = ({ character, isPlayerCharacter, onNpcSelect }: RelationshipsTabProps) => {
    const { gameState } = useGameContext();
    // FIX: Add explicit generic types to the Map constructor to ensure correct type inference.
    const allNpcsById = new Map<string, GameCharacter>((gameState.knowledgeBase.npcs || []).map(npc => [npc.id, npc]));

    const favors = (character.relationships || [])
        .filter(r => r.sentimentDetails?.type === 'Favor')
        .map(r => ({ ...r, npc: allNpcsById.get(r.targetId) }))
        // FIX: Add a type guard to the filter to ensure TypeScript correctly infers `npc` as `GameCharacter` and not `GameCharacter | undefined`.
        .filter((r): r is typeof r & { npc: GameCharacter } => !!r.npc);

    const grudges = (character.relationships || [])
        .filter(r => r.sentimentDetails?.type === 'Grudge')
        .map(r => ({ ...r, npc: allNpcsById.get(r.targetId) }))
        // FIX: Add a type guard to the filter to ensure TypeScript correctly infers `npc` as `GameCharacter` and not `GameCharacter | undefined`.
        .filter((r): r is typeof r & { npc: GameCharacter } => !!r.npc);

    if (isPlayerCharacter) {
        const allNpcs = gameState.knowledgeBase?.npcs?.filter(npc => !npc.deathState?.isDead) || [];

        const playerRelationshipsMap = React.useMemo(() => 
            new Map((character.relationships || []).map(r => [r.targetId, r])), 
            [character.relationships]
        );

        if (allNpcs.length === 0 && favors.length === 0 && grudges.length === 0) {
            return <NoInfoPlaceholder text="Bạn chưa gặp gỡ ai." />;
        }
        
        const groupedNpcs: Record<string, GameCharacter[]> = {
            'Yêu Mến': [], 'Thân Thiện': [], 'Trung Lập': [], 'Thù Địch': [], 'Căm Ghét': [],
        };
        
        allNpcs.forEach(npc => {
            const relInfo = getRelationshipInfo(npc.relationship);
            if (groupedNpcs[relInfo.text]) {
                groupedNpcs[relInfo.text].push(npc);
            }
        });

        Object.values(groupedNpcs).forEach(group => {
            group.sort((a,b) => (b.relationship ?? 0) - (a.relationship ?? 0));
        });

        const relationshipOrder = ['Yêu Mến', 'Thân Thiện', 'Trung Lập', 'Thù Địch', 'Căm Ghét'];

        return (
            <div className="char-detail-section">
                {(favors.length > 0 || grudges.length > 0) && (
                    <div className="relationships-category">
                        <h4 className="relationships-category-title">Sổ Ân Oán</h4>
                        <div className="ledger-container">
                            {favors.length > 0 && (
                                <div className="ledger-section favor">
                                    <h5>Ân Tình</h5>
                                    {favors.map(rel => (
                                        <div key={rel.targetId} className="ledger-card" onClick={() => onNpcSelect(rel.npc.id)}>
                                            <span className="ledger-card-target">{rel.npc.displayName}</span>
                                            <p className="ledger-card-reason">{rel.sentimentDetails?.reason}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                             {grudges.length > 0 && (
                                <div className="ledger-section grudge">
                                    <h5>Thù Oán</h5>
                                    {grudges.map(rel => (
                                        <div key={rel.targetId} className="ledger-card" onClick={() => onNpcSelect(rel.npc.id)}>
                                            <span className="ledger-card-target">{rel.npc.displayName}</span>
                                            <p className="ledger-card-reason">{rel.sentimentDetails?.reason}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
                <h4>Tổng Quan Mối Quan Hệ</h4>
                {relationshipOrder.map(groupName => (
                    groupedNpcs[groupName].length > 0 && (
                        <div key={groupName} className="relationships-category">
                            <h5 className="relationships-category-title">{groupName} ({groupedNpcs[groupName].length})</h5>
                            <div className="relationships-grid">
                                {groupedNpcs[groupName].map(npc => {
                                    const playerRelationship = playerRelationshipsMap.get(npc.id);
                                    return (
                                        <RelationshipCard 
                                            key={npc.id} 
                                            npc={npc} 
                                            playerRelationship={playerRelationship} 
                                            onClick={() => onNpcSelect(npc.id)} 
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    )
                ))}
            </div>
        );
    }

    // NPC's Social Relationships View
    const playerCharacterId = gameState.character.id;
    const socialRelationships = (character.relationships || []).filter(r => r.targetId !== playerCharacterId && !r.sentimentDetails);

    if (socialRelationships.length === 0 && favors.length === 0 && grudges.length === 0) {
        return <NoInfoPlaceholder text="Không có mối quan hệ xã hội nào với các NPC khác được biết." />;
    }
    
    return (
        <div className="char-detail-section">
            {(favors.length > 0 || grudges.length > 0) && (
                <div className="relationships-category">
                    <h4 className="relationships-category-title">Sổ Ân Oán</h4>
                    <div className="ledger-container">
                        {favors.map(rel => (
                            <div key={rel.targetId} className="ledger-card favor" onClick={() => onNpcSelect(rel.npc.id)}>
                                <span className="ledger-card-target">{rel.npc.displayName}</span>
                                <p className="ledger-card-reason">{rel.sentimentDetails?.reason}</p>
                            </div>
                        ))}
                        {grudges.map(rel => (
                            <div key={rel.targetId} className="ledger-card grudge" onClick={() => onNpcSelect(rel.npc.id)}>
                                <span className="ledger-card-target">{rel.npc.displayName}</span>
                                <p className="ledger-card-reason">{rel.sentimentDetails?.reason}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {socialRelationships.length > 0 && (
                <div className="relationships-category">
                    <h4 className="relationships-category-title">Mối Quan Hệ Xã Hội</h4>
                     <div className="relationships-grid">
                        {socialRelationships.map((rel, index) => {
                            const relatedChar = allNpcsById.get(rel.targetId);
                            if (!relatedChar) return null;

                            return (
                               <SocialRelationshipCard 
                                    key={`${rel.targetId}-${index}`}
                                    relationship={rel}
                                    targetNpc={relatedChar}
                                    onClick={() => onNpcSelect(relatedChar.id)}
                               />
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};