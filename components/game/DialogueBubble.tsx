/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';

interface DialogueBubbleProps {
    children: React.ReactNode;
    isPlayer: boolean;
    characterId?: string;
    avatarUrl?: string;
    speakerDisplayName?: string;
    onAvatarClick?: (characterId: string) => void;
}

const UnmemoizedDialogueBubble = ({ children, isPlayer, characterId, avatarUrl, speakerDisplayName, onAvatarClick }: DialogueBubbleProps) => {
    const characterInitial = speakerDisplayName ? speakerDisplayName.charAt(0).toUpperCase() : '?';

    return (
        <div className={`dialogue-container ${isPlayer ? 'player-container' : 'npc-container'}`}>
            <div className="dialogue-avatar" onClick={() => characterId && onAvatarClick?.(characterId)}>
                {avatarUrl ? (
                    <img src={avatarUrl} alt={speakerDisplayName || 'Avatar'} className="dialogue-avatar-img" />
                ) : (
                    <div className="dialogue-avatar-placeholder">
                        <span>{characterInitial}</span>
                    </div>
                )}
            </div>
            <div className={`dialogue-bubble ${isPlayer ? 'player' : 'npc'}`}>
                <div className="dialogue-text">
                    {!isPlayer && speakerDisplayName && (
                        <strong className="dialogue-speaker">{speakerDisplayName}: </strong>
                    )}
                    {children}
                </div>
            </div>
        </div>
    );
};


export const DialogueBubble = React.memo(UnmemoizedDialogueBubble);