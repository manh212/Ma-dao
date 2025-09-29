/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import type { GameCharacter, Relationship } from '../../../../types';

interface SocialRelationshipCardProps {
    relationship: Relationship;
    targetNpc: GameCharacter;
    onClick: () => void;
}

const UnmemoizedSocialRelationshipCard = ({ relationship, targetNpc, onClick }: SocialRelationshipCardProps) => {
    return (
        <div className="relationship-card social-card" onClick={onClick}>
            <header className="relationship-card-header">
                <div className="relationship-card-avatar">
                    {targetNpc.avatarUrl ? (
                        <img src={targetNpc.avatarUrl} alt={targetNpc.displayName} />
                    ) : (
                        <span>{targetNpc.displayName.charAt(0)}</span>
                    )}
                </div>
                <div className="relationship-card-identity">
                    <h6 className="relationship-card-name">{targetNpc.displayName}</h6>
                    <span className="relationship-card-title">{relationship.type}</span>
                </div>
            </header>
            <p className="social-card-description">{relationship.description}</p>
            {relationship.flags && relationship.flags.length > 0 && (
                <div className="relationship-flags">
                    {relationship.flags.map(flag => (<span key={flag} className="relationship-flag-item">{flag}</span>))}
                </div>
            )}
        </div>
    );
};
// FIX: Wrap component in React.memo to prevent TypeScript errors related to the `key` prop when used in a list.
export const SocialRelationshipCard = React.memo(UnmemoizedSocialRelationshipCard);