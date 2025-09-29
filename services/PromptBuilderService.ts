/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { buildCoreAiRules } from '../constants/aiConstants';
import { findRelevantMemories } from './MemoryService';
import { buildDefaultTurnPrompt, buildTuTienTurnPrompt, buildVoLamTurnPrompt, buildFanficTurnPrompt, buildModernTurnPrompt } from './genrePrompts';
import type { GameState, WorldSettings, AppSettings, Character, KnowledgeEntity } from '../types';

// Creates a "light" version of the Knowledge Base, stripping long text fields to save tokens.
const buildContextualKnowledgeBase = (gameState: GameState) => {
    const stripLongTextFields = (entity: any) => {
        const { description, backstory, keyMemories, ...rest } = entity;
        return rest;
    };

    return {
        pcs: gameState.knowledgeBase.pcs.map(stripLongTextFields),
        npcs: gameState.knowledgeBase.npcs.map(stripLongTextFields),
        locations: gameState.knowledgeBase.locations.map(stripLongTextFields),
        factions: gameState.knowledgeBase.factions.map(stripLongTextFields),
        monsters: gameState.knowledgeBase.monsters.map(stripLongTextFields),
    };
};

export const PromptBuilderService = {
    /**
     * Builds the main prompt for processing a game turn by dispatching to the correct genre-specific builder.
     * @param gameState The current state of the game.
     * @param worldSettings The world settings.
     * @param appSettings The application settings.
     * @param chosenAction The action chosen by the player.
     * @param addToast Function to display toast messages.
     * @param specialContext Optional context for special turn types like combat results.
     * @returns The complete prompt string to be sent to the AI.
     */
    async buildTurnPrompt(
        gameState: GameState,
        worldSettings: WorldSettings,
        appSettings: AppSettings,
        chosenAction: string,
        addToast: (message: string, type?: 'info' | 'success' | 'error' | 'warning') => void,
        specialContext?: { type: 'combat_result' | 'combat_end_summary', details: string }
    ): Promise<string> {
        
        // Find relevant long-term memories
        const relevantMemories = await findRelevantMemories(chosenAction, gameState.saveId || '', gameState);
        
        // Create a "light" version of the game state for the AI, removing long text fields.
        const lightGameState = {
            ...gameState,
            character: { ...gameState.character, description: '', backstory: '' }, // Also strip from PC
            history: [], // Strip history from the prompt
            knowledgeBase: buildContextualKnowledgeBase(gameState),
        };
        
        const context = {
            worldSettings: { ...worldSettings, details: '', idea: '', backstory: '', canonStory: '' }, // Strip long text from settings too
            gameState: lightGameState,
            playerAction: chosenAction,
            longTermMemoryContext: relevantMemories.length > 0
                ? `Sau đây là một số ký ức dài hạn có liên quan đến tình huống hiện tại:\n${relevantMemories.map(m => `- ${m.content}`).join('\n')}`
                : "Không có ký ức dài hạn nào đặc biệt liên quan đến tình huống này.",
        };

        // Dispatch to the correct prompt builder based on genre
        switch (worldSettings.genre) {
            case 'Tu Tiên':
                return buildTuTienTurnPrompt(context, gameState, worldSettings, appSettings, specialContext);
            case 'Võ Lâm':
                return buildVoLamTurnPrompt(context, gameState, worldSettings, appSettings, specialContext);
            case 'Đồng nhân':
                return buildFanficTurnPrompt(context, gameState, worldSettings, appSettings, specialContext);
            case 'Đô Thị Hiện Đại':
            case 'Quản lý Nhóm nhạc':
            case 'Đô Thị Hiện Đại 100% bình thường':
                return buildModernTurnPrompt(context, gameState, worldSettings, appSettings, specialContext);
            default:
                return buildDefaultTurnPrompt(context, gameState, worldSettings, appSettings, specialContext);
        }
    },
};