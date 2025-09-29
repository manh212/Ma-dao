/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import type { GameState, GameCharacter, KnowledgeEntity } from '../types';

/**
 * Finds an entity (NPC, Location, Faction, Monster) by its ID and type string.
 * @param gameState The current game state.
 * @param entityId The ID of the entity to find.
 * @param entityType The type string (e.g., 'NPC', 'LOC').
 * @returns The found entity or undefined.
 */
export const findEntityByIdAndType = (
    gameState: GameState,
    entityId: string,
    entityType: string
): GameCharacter | KnowledgeEntity | undefined => {
    if (entityType === 'NPC') {
        return gameState.knowledgeBase.npcs.find(npc => npc.id === entityId);
    }
    const typeMap: { [key: string]: keyof GameState['knowledgeBase'] } = {
        'LOC': 'locations', 'FACTION': 'factions', 'MONSTER': 'monsters'
    };
    const entityKey = typeMap[entityType];
    if (!entityKey) return undefined;

    // The `as any[]` cast is a safe way to handle the dynamic key access here.
    return (gameState.knowledgeBase[entityKey] as any[])?.find((e: any) => e.id === entityId);
};

/**
 * Finds a character (PC or NPC) by their unique name or display name.
 * @param gameState The current game state.
 * @param name The name to search for.
 * @returns The found character or null.
 */
export const findCharacterByName = (gameState: GameState, name: string): GameCharacter | null => {
    if (gameState.character.name === name || gameState.character.displayName === name) {
        return gameState.character;
    }
    return gameState.knowledgeBase.npcs.find(n => n.name === name || n.displayName === name) || null;
};
