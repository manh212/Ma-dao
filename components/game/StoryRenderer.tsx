

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useMemo } from 'react';
import { DialogueBubble } from './DialogueBubble';
import { findCharacterByName } from '../../utils/entityUtils';
import type { GameState, WorldSettings, GameCharacter, KnowledgeEntity } from '../../types';

interface StoryRendererProps {
    text: string | null | undefined;
    gameState: GameState;
    onEntityClick: (event: React.MouseEvent, id: string, type: string) => void;
    worldSettings: WorldSettings;
    onAvatarClick?: (characterId: string) => void;
    onEntityMouseEnter: (event: React.MouseEvent, id: string, type: string) => void;
    onEntityMouseLeave: () => void;
}

const UnmemoizedInlineStoryRenderer = ({ text, gameState, onEntityClick, onEntityMouseEnter, onEntityMouseLeave }: Omit<StoryRendererProps, 'onAvatarClick' | 'worldSettings'>) => {
    const renderedElements = useMemo(() => {
        if (!text) return null;

        // 1. Create a map of all entities for quick lookup by their unique `name`
        const allEntitiesByName = new Map<string, (GameCharacter | KnowledgeEntity) & { entityType: string }>();
        
        const addEntityToMap = (entity: GameCharacter | KnowledgeEntity | null | undefined, type: string) => {
            if (entity && entity.name) {
                allEntitiesByName.set(entity.name, { ...entity, entityType: type });
            }
        };

        addEntityToMap(gameState.character, 'PC');
        (gameState.knowledgeBase?.npcs || []).forEach(e => addEntityToMap(e, 'NPC'));
        (gameState.knowledgeBase?.locations || []).forEach(e => addEntityToMap(e, 'LOC'));
        (gameState.knowledgeBase?.factions || []).forEach(e => addEntityToMap(e, 'FACTION'));
        (gameState.knowledgeBase?.monsters || []).forEach(e => addEntityToMap(e, 'MONSTER'));

        // 2. Define a function to render simple text segments, handling line breaks
        const renderTextSegment = (segment: string, keyPrefix: string) => {
            if (!segment) return null;
            return segment.split(/<br\s*\/?>/gi).map((part, index, array) => (
                <React.Fragment key={`${keyPrefix}-${index}`}>
                    {part}
                    {index < array.length - 1 && <br />}
                </React.Fragment>
            ));
        };

        // 3. Process the text using a regex that strictly finds [TYPE:Name] tags
        const regex = /\[([A-Z_]+):([^\]]+)\]/g;
        const elements: React.ReactNode[] = [];
        let lastIndex = 0;
        const matches = [...text.matchAll(regex)];

        if (matches.length === 0) {
            return renderTextSegment(text, 'full-text');
        }

        matches.forEach((match, index) => {
            // Add the text segment before this match
            if (match.index > lastIndex) {
                elements.push(renderTextSegment(text.substring(lastIndex, match.index), `text-${index}`));
            }

            const type = match[1];
            const name = match[2];
            const entity = allEntitiesByName.get(name);

            if (entity) {
                // If a matching entity is found, render an interactive span
                const nameToDisplay = entity.displayName || entity.name;
                const title = (entity as GameCharacter).title ? `${(entity as GameCharacter).title} ` : '';
                elements.push(
                    <React.Fragment key={`entity-frag-${index}`}>
                        {title}
                        <span 
                            className={`entity entity-${type.toLowerCase()}`} 
                            onClick={(e) => onEntityClick(e, entity.id, type)} 
                            onMouseEnter={(e) => onEntityMouseEnter(e, entity.id, type)} 
                            onMouseLeave={onEntityMouseLeave} 
                            role="button" 
                            tabIndex={0}
                        >
                            {nameToDisplay}
                        </span>
                    </React.Fragment>
                );
            } else {
                // If no entity matches, gracefully render just the name part as plain text.
                // This prevents showing raw tags like `[LOC:Some Place]` to the user.
                elements.push(renderTextSegment(name, `unhandled-${index}`));
            }

            lastIndex = match.index + match[0].length;
        });

        // Add any remaining text after the last match
        if (lastIndex < text.length) {
            elements.push(renderTextSegment(text.substring(lastIndex), 'text-last'));
        }

        return <>{elements}</>;
    }, [text, gameState.character, gameState.knowledgeBase, onEntityClick, onEntityMouseEnter, onEntityMouseLeave]);

    return renderedElements;
};
export const InlineStoryRenderer = React.memo(UnmemoizedInlineStoryRenderer);


const UnmemoizedStoryRenderer = ({ text, gameState, onEntityClick, worldSettings, onAvatarClick, onEntityMouseEnter, onEntityMouseLeave }: StoryRendererProps) => {
    const elements = useMemo(() => {
        const renderedElements: React.ReactNode[] = [];
        if (!text) return renderedElements;

        const preprocessedText = (text || '').replace(/(DIALOGUE:)/g, '\n$1');
        const lines = preprocessedText.split('\n');
        const DIALOGUE_PARSER_REGEX = /^DIALOGUE:\s*(?:([^:]+):\s*)?(.*)$/i;

        lines.forEach((line, lineIndex) => {
            if (!line.trim()) return;

            const dialogueMatch = line.match(DIALOGUE_PARSER_REGEX);
            const uniqueKey = `line-${lineIndex}`;

            if (dialogueMatch) {
                const speakerName = dialogueMatch[1]?.trim();
                const fullContent = dialogueMatch[2]?.trim() || '';
                if (!fullContent) return;

                let dialogueContent = fullContent;
                let narrationContent = '';
                const firstQuoteIndex = fullContent.indexOf('"');
                const lastQuoteIndex = fullContent.lastIndexOf('"');

                if (firstQuoteIndex !== -1 && lastQuoteIndex > firstQuoteIndex) {
                    dialogueContent = fullContent.substring(firstQuoteIndex, lastQuoteIndex + 1).trim();
                    narrationContent = fullContent.substring(lastQuoteIndex + 1).trim();
                }

                if (speakerName) {
                    const speakerLower = speakerName.toLowerCase();
                    if (speakerLower === 'hệ thống' || speakerLower === 'system') {
                        renderedElements.push(
                            <p key={`${uniqueKey}-sys`} className="system-narration">
                                <InlineStoryRenderer text={fullContent} gameState={gameState} onEntityClick={onEntityClick} onEntityMouseEnter={onEntityMouseEnter} onEntityMouseLeave={onEntityMouseLeave} />
                            </p>
                        );
                    } else {
                        const isPlayer = speakerName === gameState.character?.name || speakerName === gameState.character?.displayName;
                        const speakerChar = findCharacterByName(gameState, speakerName);
                        const finalSpeakerName = speakerChar?.displayName || speakerName;
                        
                        if (dialogueContent) {
                            renderedElements.push(
                                <DialogueBubble 
                                    key={`${uniqueKey}-bubble`} 
                                    isPlayer={isPlayer} 
                                    characterId={speakerChar?.id}
                                    avatarUrl={speakerChar?.avatarUrl}
                                    speakerDisplayName={finalSpeakerName}
                                    onAvatarClick={onAvatarClick}
                                >
                                    <InlineStoryRenderer text={dialogueContent} gameState={gameState} onEntityClick={onEntityClick} onEntityMouseEnter={onEntityMouseEnter} onEntityMouseLeave={onEntityMouseLeave} />
                                </DialogueBubble>
                            );
                        }
                        if (narrationContent) {
                            renderedElements.push(
                                <p key={`${uniqueKey}-narration`}>
                                    <InlineStoryRenderer text={narrationContent} gameState={gameState} onEntityClick={onEntityClick} onEntityMouseEnter={onEntityMouseEnter} onEntityMouseLeave={onEntityMouseLeave} />
                                </p>
                            );
                        }
                    }
                } else {
                    renderedElements.push(
                        <p key={uniqueKey}>
                            <InlineStoryRenderer text={fullContent} gameState={gameState} onEntityClick={onEntityClick} onEntityMouseEnter={onEntityMouseEnter} onEntityMouseLeave={onEntityMouseLeave} />
                        </p>
                    );
                }
            } else {
                const inlineSpeakerRegex = /^([\w\s\.\p{L}]+):/u;
                const inlineSpeakerMatch = line.trim().match(inlineSpeakerRegex);
                let speakerChar: GameCharacter | null = null;

                if (inlineSpeakerMatch) {
                    const potentialSpeaker = inlineSpeakerMatch[1].trim();
                    speakerChar = findCharacterByName(gameState, potentialSpeaker);
                }

                if (speakerChar) {
                    const isPlayer = speakerChar.id === gameState.character?.id;
                    const pClass = isPlayer ? 'dialogue-text-player' : 'dialogue-text-npc';
                    const renderedContent: React.ReactNode[] = [];
                    const finalSpeakerName = speakerChar.displayName || speakerChar.name;
                    renderedContent.push(<strong key={`${uniqueKey}-speaker`} className="dialogue-speaker">{finalSpeakerName}: </strong>);
                    const restOfLine = line.replace(inlineSpeakerMatch![0], '').trim();
                    renderedContent.push(
                        <InlineStoryRenderer key={`${uniqueKey}-content`} text={restOfLine} gameState={gameState} onEntityClick={onEntityClick} onEntityMouseEnter={onEntityMouseEnter} onEntityMouseLeave={onEntityMouseLeave} />
                    );
                    renderedElements.push(<p key={uniqueKey} className={pClass}>{renderedContent}</p>);
                } else {
                     renderedElements.push(
                        <p key={uniqueKey}>
                            <InlineStoryRenderer text={line} gameState={gameState} onEntityClick={onEntityClick} onEntityMouseEnter={onEntityMouseEnter} onEntityMouseLeave={onEntityMouseLeave} />
                        </p>
                    );
                }
            }
        });
        return renderedElements;
    }, [text, gameState, onEntityClick, worldSettings, onAvatarClick, onEntityMouseEnter, onEntityMouseLeave]);

    return <>{elements}</>;
};
export const StoryRenderer = React.memo(UnmemoizedStoryRenderer);
