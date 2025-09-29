/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import * as db from './db';
import { generateUniqueId } from '../utils/id';
import { stripEntityTags } from '../utils/text';
import { KEYWORD_EXTRACTION_SCHEMA } from '../constants/schemas';
import type { GameState, WorldSettings, MemoryChunk, Turn, Character } from '../types';
import type { GenerateContentResponse } from '@google/genai';

type GenerateContentFn = (params: any, addToast: any, incrementRequestCount: any) => Promise<GenerateContentResponse>;
type AddToastFn = (message: string, type?: 'info' | 'success' | 'error' | 'warning') => void;

const MEMORY_CHUNK_INTERVAL = 15;

/**
 * Creates and stores a new long-term memory chunk if the turn interval is met.
 * This runs in the background and does not block the UI.
 */
export const createAndStoreMemoryChunk = async (
    gameState: GameState,
    worldSettings: WorldSettings,
    generateContent: GenerateContentFn,
    addToast: AddToastFn,
    incrementRequestCount: () => void
): Promise<void> => {
    if (!gameState.saveId || gameState.turns.length === 0 || gameState.turns.length % MEMORY_CHUNK_INTERVAL !== 0) {
        return;
    }

    const turnEnd = gameState.turns.length;
    const turnStart = turnEnd - MEMORY_CHUNK_INTERVAL;
    const turnsToSummarize = gameState.turns.slice(turnStart, turnEnd);

    const contentToSummarize = turnsToSummarize
        .map((turn: Turn) => `Hành động: ${turn.chosenAction || 'Bắt đầu'}\nDiễn biến: ${stripEntityTags(turn.story)}`)
        .join('\n---\n');
    
    const prompt = `
        **VAI TRÒ:** Bạn là một người ghi chép thông thái.
        **NHIỆM VỤ:** Đọc đoạn trích từ lịch sử game và tạo ra một bản tóm tắt súc tích cùng với các từ khóa chính.
        **LỊCH SỬ GAME:**
        """
        ${contentToSummarize}
        """
        ---
        **YÊU CẦU:**
        1.  **Tóm tắt (summary):** Viết một đoạn văn ngắn gọn tóm tắt các sự kiện, quyết định và thay đổi quan trọng nhất đã xảy ra.
        2.  **Từ khóa (keywords):** Liệt kê 5-10 từ hoặc cụm từ khóa quan trọng nhất từ bản tóm tắt (tên nhân vật, địa điểm, vật phẩm, sự kiện chính). Chuyển tất cả từ khóa thành chữ thường.
        3.  **NGÔN NGỮ:** Toàn bộ văn bản trong \`summary\` và các \`keywords\` BẮT BUỘC phải là tiếng Việt.
        4.  **Định dạng:** Trả về một đối tượng JSON.
    `;

    try {
        const response = await generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: "application/json", responseSchema: KEYWORD_EXTRACTION_SCHEMA }
        }, addToast, incrementRequestCount);

        const { summary, keywords } = JSON.parse(response.text?.trim() || '{}');
        if (!summary || !Array.isArray(keywords) || keywords.length === 0) {
            console.warn('AI failed to provide a valid summary or keywords for memory chunk.');
            return;
        }

        const newChunk: MemoryChunk = {
            id: `memchunk-${gameState.saveId}-${turnEnd}`,
            saveId: gameState.saveId,
            turnStart: turnStart + 1,
            turnEnd,
            content: summary,
            keywords: keywords.map((kw: string) => kw.toLowerCase()),
        };

        await db.addMemoryChunk(newChunk);
        console.log(`Successfully created and stored memory chunk for turns ${newChunk.turnStart}-${newChunk.turnEnd}.`);

    } catch (error) {
        console.error('Failed to create and store memory chunk:', error);
        // Do not bother the user with a toast for a background failure.
    }
};

export const STOP_WORDS = new Set(['và', 'là', 'của', 'ở', 'tại', 'cho', 'với', 'một', 'các', 'những', 'để', 'từ', 'trong', 'ra', 'vào', 'khi', 'thì', 'mà', 'bị', 'được', 'có', 'không', 'anh', 'em', 'cô', 'chú', 'bác', 'tôi', 'bạn', 'họ', 'chúng', 'ta', 'ấy', 'kia', 'nọ']);

export const extractKeywordsFromText = (text: string): string[] => {
    if (!text) return [];
    return text
        .toLowerCase()
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
        .split(/\s+/)
        .filter(word => word.length > 2 && !STOP_WORDS.has(word));
};


/**
 * Finds the most relevant long-term memory chunks based on a query string by extracting keywords locally.
 */
export const findRelevantMemories = async (
    query: string,
    saveId: string,
    gameState: GameState
): Promise<MemoryChunk[]> => {
    if (!query.trim() || !saveId) return [];

    try {
        const memoryCount = await db.countMemoryChunksForSave(saveId);
        if (memoryCount === 0) {
            return [];
        }

        const keywords = new Set<string>();

        // 1. Extract general keywords from the action query itself
        extractKeywordsFromText(stripEntityTags(query)).forEach(kw => keywords.add(kw));

        // 2. Add all known entities mentioned in the query
        const queryLower = query.toLowerCase();
        const allEntities = [
            gameState.character,
            ...(gameState.knowledgeBase?.npcs || []),
            ...(gameState.knowledgeBase?.locations || []),
            ...(gameState.knowledgeBase?.factions || []),
            ...(gameState.knowledgeBase?.monsters || [])
        ];

        allEntities.forEach(entity => {
            if (!entity) return;
            if (entity.name && queryLower.includes(entity.name.toLowerCase())) {
                keywords.add(entity.name.toLowerCase());
            }
            const char = entity as Character;
            if (char.displayName && queryLower.includes(char.displayName.toLowerCase())) {
                keywords.add(char.displayName.toLowerCase());
            }
        });

        const keywordArray = Array.from(keywords);
        if (keywordArray.length === 0) return [];

        const retrievedChunks = await db.getMemoryChunksByKeywords(saveId, keywordArray);
        
        // Rank by number of matching keywords
        const rankedChunks = retrievedChunks.map(chunk => {
            const matchCount = chunk.keywords.filter(kw => keywordArray.includes(kw)).length;
            return { ...chunk, score: matchCount };
        }).sort((a, b) => b.score - a.score);

        return rankedChunks.slice(0, 3); // Return top 3 most relevant memories
        
    } catch (error) {
        console.error('Failed to find relevant memories:', error);
        // Errors are handled upstream in useGameEngine
        return [];
    }
};

/**
 * Deletes all memory chunks associated with a specific save file.
 */
export const deleteMemoriesForSave = async (saveId: string): Promise<void> => {
    try {
        await db.deleteMemoryChunksForSave(saveId);
    } catch (error) {
        console.error(`Failed to delete memories for save ${saveId}:`, error);
        // This is a background task, so we don't need to show a toast.
    }
};