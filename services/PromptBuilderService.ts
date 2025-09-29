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

    /**
     * Builds a prompt for analyzing a custom player action.
     * @param gameState The current state of the game.
     * @param worldSettings The world settings.
     * @param appSettings The application settings.
     * @param customAction The custom action text from the player.
     * @returns The prompt string for action analysis.
     */
    async buildAnalysisPrompt(
        gameState: GameState,
        worldSettings: WorldSettings,
        appSettings: AppSettings,
        customAction: string
    ): Promise<string> {
        const coreRules = buildCoreAiRules(worldSettings, appSettings);
        
        const lightGameState = {
            ...gameState,
            character: { ...gameState.character, description: '', backstory: '' },
            history: [],
            knowledgeBase: buildContextualKnowledgeBase(gameState),
        };
        
        const context = {
            worldSettings,
            gameState: lightGameState,
            playerAction: customAction,
        };

        const prompt = `
**VAI TRÒ:** Bạn là một Người quản trò (Game Master) AI thông thái và có khả năng tiên tri.
**NHIÊM VỤ:** Phân tích một hành động tiềm năng của người chơi và dự đoán các kết quả có thể xảy ra.
---
**BỐI CẢNH HIỆN TẠI (JSON):**
\`\`\`json
${JSON.stringify(context, null, 2)}
\`\`\`
---
**MỆNH LỆNH PHÂN TÍCH:**
1.  **Phân tích hành động:** Dựa vào bối cảnh, hãy phân tích hành động \`${customAction}\`.
2.  **Dự đoán kết quả:**
    -   **Lợi ích (benefit):** Mô tả kết quả tích cực có khả năng xảy ra nhất.
    -   **Rủi ro (risk):** Mô tả kết quả tiêu cực có khả năng xảy ra nhất.
    -   **Cơ hội thành công (successChance):** Ước tính tỷ lệ thành công (0-100).
    -   **Thời gian tiêu tốn (timeCost):** Ước tính thời gian cần thiết (ví dụ: "Vài phút", "Nửa giờ").
    -   **Mức độ Lợi/Hại (benefitPotential/riskPotential):** Đánh giá mức độ ảnh hưởng của lợi ích và rủi ro trên thang điểm 1-100.
3.  **Định dạng:** Trả về một đối tượng JSON hợp lệ theo schema.
${coreRules}
`;
        return prompt;
    }
};
