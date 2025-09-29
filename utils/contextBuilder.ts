/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { GameState, Character, KnowledgeEntity, Quest } from '../types';
import { parseActionForEntities } from './text';

const formatEntityForContext = (entity: Character | KnowledgeEntity): string => {
    const parts: string[] = [];
    
    parts.push(`- ID: ${entity.id}`);
    parts.push(`  Tên: ${entity.displayName || entity.name}`);
    
    // Use a type guard to check if the entity is a Character.
    if ('skills' in entity) {
        // TypeScript now knows 'entity' is of type 'Character' inside this block
        if (entity.title) parts.push(`  Chức danh: ${entity.title}`);

        // No cast needed, entity is of type Character
        if (entity.relationship) parts.push(`  Thiện cảm: ${entity.relationship}`);
        if (entity.respect) parts.push(`  Tôn trọng: ${entity.respect}`);
        if (entity.trust) parts.push(`  Tin tưởng: ${entity.trust}`);
        if (entity.fear) parts.push(`  Sợ hãi: ${entity.fear}`);
        if (entity.mood) parts.push(`  Tâm trạng: ${entity.mood.current}`);
    }

    if (entity.tags && entity.tags.length > 0) parts.push(`  Tags: ${entity.tags.join(', ')}`);
    if (entity.keywords && entity.keywords.length > 0) parts.push(`  Keywords: ${entity.keywords.join(', ')}`);

    return parts.join('\n');
};

/**
 * Builds a concise, keyword-driven text context for the AI prompt.
 * This function analyzes the player's action, identifies relevant entities,
 * and extracts only the most critical information to guide the AI.
 *
 * @param gameState The current state of the game.
 * @param actionText The action chosen by the player.
 * @returns A formatted string containing the essential context for the current turn.
 */
export const buildKeywordContext = (gameState: GameState, actionText: string): string => {
    const contextLines: string[] = [];

    // 1. Identify all entities mentioned in the action
    const relevantEntityIds = parseActionForEntities(actionText, gameState);
    
    const allEntities = new Map<string, Character | KnowledgeEntity>();
    allEntities.set(gameState.character.id, gameState.character);
    gameState.knowledgeBase.npcs.forEach(e => allEntities.set(e.id, e));
    gameState.knowledgeBase.locations.forEach(e => allEntities.set(e.id, e));
    gameState.knowledgeBase.factions.forEach(e => allEntities.set(e.id, e));
    gameState.knowledgeBase.monsters.forEach(e => allEntities.set(e.id, e));

    // 2. Add Player Character context
    contextLines.push("## NHÂN VẬT CHÍNH (PC)");
    contextLines.push(formatEntityForContext(gameState.character));

    // 3. Add context for relevant entities
    if (relevantEntityIds.size > 0) {
        contextLines.push("\n## CÁC THỰC THỂ LIÊN QUAN");
        relevantEntityIds.forEach(id => {
            const entity = allEntities.get(id);
            if (entity && entity.id !== gameState.character.id) { // Don't repeat PC
                contextLines.push(formatEntityForContext(entity));
            }
        });
    }

    // 4. Add context for ongoing quests
    const ongoingQuests = gameState.quests.filter(q => q.status === 'Ongoing');
    if (ongoingQuests.length > 0) {
        contextLines.push("\n## NHIỆM VỤ ĐANG THỰC HIỆN");
        ongoingQuests.forEach(quest => {
            contextLines.push(`- ${quest.title}: ${quest.objectives.find(o => !o.completed)?.description || 'Nhiệm vụ đã hoàn thành.'}`);
        });
    }

    // 5. Add world summary
    if (gameState.worldSummary) {
        contextLines.push("\n## TÓM TẮT BỐI CẢNH THẾ GIỚI");
        contextLines.push(gameState.worldSummary);
    }

    return contextLines.join('\n');
};