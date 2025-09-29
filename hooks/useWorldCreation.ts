/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { useState, useRef, useEffect, useCallback } from 'react';
import type React from 'react';
import { ApiKeyManager } from '../services/ApiKeyManager';
import { getApiErrorMessage } from '../utils/error';
import { generateUniqueId } from '../utils/id';
import { hydrateCharacterData, CHAR_DEFAULTS, hydrateWorldSettings, hydrateGameState } from '../utils/hydration';
import {
    buildPlanningPrompt,
    buildCharacterPrompt,
    buildSceneWritingPrompt,
    buildWorldEnrichmentPrompt
} from '../services/prompts/creationPrompts';
import {
    FANFIC_ANALYSIS_SCHEMA,
    TURN_PLAN_SCHEMA,
    INITIAL_CHARACTERS_SCHEMA,
    SCENE_WRITING_SCHEMA,
    WORLD_ENRICHMENT_SCHEMA,
    LORE_RULES_SCHEMA
} from '../constants/schemas/creation';
import { GEMINI_FLASH } from '../constants/aiConstants';
import type { WorldSettings, GameState, Character as CharType, Quest, AppSettings, CanonEvent } from '../types';

const DUMMY_APP_SETTINGS_FOR_CREATION: AppSettings = {
    storyLength: 'standard',
    aiProcessingMode: 'quality',
    theme: 'system',
    mobilePalette: 'default',
    fontFamily: '',
    fontSize: 0,
    lineHeight: 0,
    textWidth: 0,
    autoPinMemory: false,
    enableCheats: false,
    textColor: 'default',
    enablePerformanceEffects: true
};

export interface FanficAnalysisResult {
    title: string;
    worldSummary: string;
    mainCharacter: {
        name: string;
        species: string;
        gender: string;
        description: string;
    };
    canonTimeline: CanonEvent[];
    suggestedRoles: string[];
}

interface UseWorldCreationProps {
    formData: WorldSettings;
    setFormData: React.Dispatch<React.SetStateAction<WorldSettings>>;
    onCreateWorld: (gameState: GameState, worldSettings: WorldSettings) => void;
    addToast: (message: string, type?: 'info' | 'success' | 'error' | 'warning') => void;
    incrementApiRequestCount: () => void;
    addDebugPrompt: (content: string, purpose: string) => void;
}

export const useWorldCreation = ({
    formData,
    setFormData,
    onCreateWorld,
    addToast,
    incrementApiRequestCount,
    addDebugPrompt,
}: UseWorldCreationProps) => {
    const [isGeneratingContext, setIsGeneratingContext] = useState(false);
    const [isGeneratingChar, setIsGeneratingChar] = useState(false);
    const [isGeneratingLoreRules, setIsGeneratingLoreRules] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [creationMessage, setCreationMessage] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [creationProgress, setCreationProgress] = useState(0);
    const [creationTimeElapsed, setCreationTimeElapsed] = useState(0);
    const [estimatedTime, setEstimatedTime] = useState(45);
    const creationIntervalRef = useRef<number | null>(null);
    const creationSuccess = useRef(false);
    const isMounted = useRef(true);

    // Fanfic states
    const [isAnalyzingFanfic, setIsAnalyzingFanfic] = useState(false);
    const [fanficAnalysisResult, setFanficAnalysisResult] = useState<FanficAnalysisResult | null>(null);

    useEffect(() => {
        isMounted.current = true;
        return () => { isMounted.current = false; if (creationIntervalRef.current) clearInterval(creationIntervalRef.current); };
    }, []);

    const handleGenericAiError = useCallback((error: unknown, context: string) => {
        if (isMounted.current) {
            const userFriendlyError = getApiErrorMessage(error, context);
            setError(userFriendlyError);
            addToast(userFriendlyError, 'error');
        }
    }, [addToast]);
    
    const startProgressTimer = useCallback((estimatedDuration: number) => {
        if (creationIntervalRef.current) clearInterval(creationIntervalRef.current);
        setCreationProgress(0); setCreationTimeElapsed(0);
        const updateInterval = 100;
        const progressIncrement = 100 / (estimatedDuration * 1000 / updateInterval);
        creationIntervalRef.current = window.setInterval(() => {
            if (!isMounted.current) return;
            setCreationTimeElapsed(prev => prev + (updateInterval / 1000));
            setCreationProgress(prev => Math.min(prev + progressIncrement, 95));
        }, updateInterval);
    }, []);

    const stopProgressTimer = useCallback(() => {
        if (creationIntervalRef.current) { clearInterval(creationIntervalRef.current); creationIntervalRef.current = null; }
        setCreationProgress(100);
    }, []);

    const handleAnalyzeFanfic = useCallback(async (fanficContent: string) => {
        if (isAnalyzingFanfic) return;
        setIsAnalyzingFanfic(true);
        setError(null);
        setFanficAnalysisResult(null); // Clear previous results
    
        const prompt = `**VAI TRÒ:** Bạn là một AI phân tích văn học, chuyên gia tóm tắt và cấu trúc hóa các câu chuyện Đồng nhân (Fanfiction).
    **NHIỆM VỤ:** Đọc kỹ đoạn văn bản Đồng nhân được cung cấp và trích xuất các thông tin quan trọng theo schema JSON.
    ---
    **VĂN BẢN ĐỒNG NHÂN:**
    """
    ${fanficContent.substring(0, 30000)}
    """
    ---
    **MỆNH LỆNH PHÂN TÍCH:**
    1.  **Tiêu đề (title):** Đặt một tiêu đề hấp dẫn cho câu chuyện.
    2.  **Tóm tắt Thế giới (worldSummary):** Tóm tắt bối cảnh và tiền đề chính trong 2-3 câu.
    3.  **Nhân vật chính (mainCharacter):** Xác định và mô tả nhân vật chính trong nguyên tác.
    4.  **Dòng thời gian Nguyên tác (canonTimeline):** Xác định 5-7 sự kiện cốt lõi, quan trọng nhất của câu chuyện theo thứ tự thời gian.
    5.  **Gợi ý Vai trò (suggestedRoles):** Đề xuất 3 vai trò khởi đầu thú vị cho người chơi.
    ---
    **ĐỊNH DẠNG ĐẦU RA:** Trả về một đối tượng JSON hợp lệ theo schema được cung cấp.`;
    
        try {
            const response = await ApiKeyManager.generateContentWithRetry({ model: GEMINI_FLASH, contents: prompt, config: { responseMimeType: 'application/json', responseSchema: FANFIC_ANALYSIS_SCHEMA } }, addToast, incrementApiRequestCount, { logPrompt: addDebugPrompt, purpose: 'Phân tích Đồng nhân' });
            const result: FanficAnalysisResult = JSON.parse(response.text?.trim() || '{}');
            if (isMounted.current) {
                setFanficAnalysisResult(result);
                // Also update the main form data with extracted info
                setFormData(prev => ({
                    ...prev,
                    idea: result.title || prev.idea,
                    details: result.worldSummary || prev.details,
                    name: result.mainCharacter.name, // Suggest the canon character name
                    species: result.mainCharacter.species,
                    gender: result.mainCharacter.gender,
                    backstory: result.mainCharacter.description,
                    canonTimeline: result.canonTimeline, // Store the timeline
                    canonStory: fanficContent, // Store the full story
                }));
                addToast("Phân tích Đồng nhân thành công!", 'success');
            }
        } catch (err) {
            handleGenericAiError(err, "phân tích Đồng nhân");
        } finally {
            if (isMounted.current) setIsAnalyzingFanfic(false);
        }
    }, [isAnalyzingFanfic, addToast, incrementApiRequestCount, handleGenericAiError, setFormData, setFanficAnalysisResult, addDebugPrompt]);

    const handleSuggestContext = useCallback(async () => {
        if (isGeneratingContext) return;
        setIsGeneratingContext(true);
        setError(null);
    
        const prompt = `**VAI TRÒ:** Bạn là một người xây dựng thế giới (World Builder) AI.
    **NHIỆM VỤ:** Dựa trên ý tưởng cốt lõi, hãy viết một đoạn "Tổng Quan Về Thế Giới" (details) chi tiết và hấp dẫn (khoảng 3-4 đoạn văn).
    ---
    **THÔNG TIN CỐT LÕI:**
    - **Kiểu Thế Giới (Genre):** ${formData.genre}
    - **Bối Cảnh (Setting):** ${formData.setting}
    - **Ý Tưởng Khởi Đầu (Idea):** ${formData.idea}
    ---
    **YÊU CẦU:**
    1.  Mô tả về lịch sử, địa lý, các phe phái chính, và các quy luật đặc biệt (phép thuật, công nghệ) của thế giới.
    2.  Văn phong phải phù hợp với Kiểu Thế Giới đã chọn.
    3.  Nội dung phải sáng tạo và khơi gợi trí tưởng tượng.
    4.  KHÔNG trả về JSON, chỉ trả về một chuỗi văn bản thuần túy (plain text).`;
    
        try {
            const response = await ApiKeyManager.generateContentWithRetry({ model: GEMINI_FLASH, contents: prompt }, addToast, incrementApiRequestCount, { logPrompt: addDebugPrompt, purpose: 'Gợi ý Tổng quan Thế giới' });
            if (isMounted.current) {
                setFormData(prev => ({ ...prev, details: response.text?.trim() || '' }));
                addToast("Đã tạo tổng quan thế giới bằng AI!", 'success');
            }
        } catch (err) {
            handleGenericAiError(err, "gợi ý tổng quan thế giới");
        } finally {
            if (isMounted.current) setIsGeneratingContext(false);
        }
    }, [isGeneratingContext, formData.genre, formData.setting, formData.idea, setFormData, addToast, incrementApiRequestCount, handleGenericAiError, addDebugPrompt]);

    const handleSuggestCharacter = useCallback(async () => {
        // This function is not currently used by any UI element.
    }, []);

    const handleSuggestLoreRules = useCallback(async (ruleCount: number | null) => {
        if (isGeneratingLoreRules) return;
        setIsGeneratingLoreRules(true);
        setError(null);
    
        const prompt = `**VAI TRÒ:** Bạn là một người thiết kế luật chơi (Game Rule Designer) AI.
    **NHIỆM VỤ:** Dựa trên bối cảnh thế giới, hãy tạo ra ${ruleCount || 5} "Luật Lệ" (Lore Rules) thú vị và độc đáo.
    ---
    **BỐI CẢNH THẾ GIỚI:**
    - **Kiểu Thế Giới (Genre):** ${formData.genre}
    - **Bối Cảnh (Setting):** ${formData.setting}
    - **Ý Tưởng (Idea):** ${formData.idea}
    - **Tổng quan (Details):** ${formData.details}
    ---
    **YÊU CẦU:**
    1.  Các luật lệ phải sáng tạo, ảnh hưởng đến lối chơi hoặc câu chuyện.
    2.  Luật lệ có thể về hệ thống phép thuật, các quy tắc xã hội, các vật phẩm đặc biệt, hoặc các sự kiện lịch sử quan trọng.
    3.  KHÔNG tạo các luật lệ đã có sẵn trong các trò chơi phổ biến một cách nhàm chán.
    4.  Trả về một đối tượng JSON với một mảng chuỗi string trong trường "rules".`;
        
        try {
            const response = await ApiKeyManager.generateContentWithRetry({ model: GEMINI_FLASH, contents: prompt, config: { responseMimeType: "application/json", responseSchema: LORE_RULES_SCHEMA } }, addToast, incrementApiRequestCount, { logPrompt: addDebugPrompt, purpose: 'Gợi ý Luật lệ' });
            const result = JSON.parse(response.text?.trim() || '{}');
            if (isMounted.current && result.rules && Array.isArray(result.rules)) {
                const newRules = result.rules.map((text: string) => ({
                    id: generateUniqueId('lore'),
                    text,
                    isActive: true
                }));
                setFormData(prev => ({ ...prev, loreRules: [...prev.loreRules, ...newRules] }));
                addToast(`Đã tạo ${newRules.length} luật lệ mới bằng AI!`, 'success');
            }
        } catch (err) {
            handleGenericAiError(err, "gợi ý luật lệ");
        } finally {
            if (isMounted.current) setIsGeneratingLoreRules(false);
        }
    }, [isGeneratingLoreRules, formData.genre, formData.setting, formData.idea, formData.details, setFormData, addToast, incrementApiRequestCount, handleGenericAiError, addDebugPrompt]);

    const handleCreateWorld = useCallback(async (creationData: WorldSettings, selectedRole?: string | null) => {
        try {
            // This logic is now cleaner, calling the prompt builder functions
            let totalTokenCount = 0;

            // Stage 1: Planning
            setCreationMessage("AI đang lên kế hoạch... (1/4)");
            const planningPrompt = buildPlanningPrompt(creationData, DUMMY_APP_SETTINGS_FOR_CREATION);
            const planResponse = await ApiKeyManager.generateContentWithRetry({ model: GEMINI_FLASH, contents: planningPrompt, config: { responseMimeType: "application/json", responseSchema: TURN_PLAN_SCHEMA } }, addToast, incrementApiRequestCount, { logPrompt: addDebugPrompt, purpose: 'Tạo Thế giới - Lên kế hoạch' });
            totalTokenCount += planResponse.usageMetadata?.totalTokenCount || 0;
            if (!isMounted.current) return;
            const creationPlan = JSON.parse(planResponse.text?.trim() || '{}');
            setCreationProgress(p => Math.max(p, 25));

            // Stage 2: Character Creation
            setCreationMessage("AI đang tạo nhân vật... (2/4)");
            const charPrompt = buildCharacterPrompt(creationData, creationPlan, DUMMY_APP_SETTINGS_FOR_CREATION);
            const charResponse = await ApiKeyManager.generateContentWithRetry({ model: GEMINI_FLASH, contents: charPrompt, config: { responseMimeType: "application/json", responseSchema: INITIAL_CHARACTERS_SCHEMA } }, addToast, incrementApiRequestCount, { logPrompt: addDebugPrompt, purpose: 'Tạo Thế giới - Tạo Nhân vật' });
            totalTokenCount += charResponse.usageMetadata?.totalTokenCount || 0;
            if (!isMounted.current) return;
            const characters = JSON.parse(charResponse.text?.trim() || '{}');
            setCreationProgress(p => Math.max(p, 50));

            // Stage 3 & 4: Scene Writing and World Enrichment (Concurrent)
            setCreationMessage("AI đang viết truyện và làm giàu thế giới... (3/4)");
            const writingPrompt = buildSceneWritingPrompt(creationData, creationPlan, characters, DUMMY_APP_SETTINGS_FOR_CREATION);
            const enrichmentPrompt = buildWorldEnrichmentPrompt(creationData, creationPlan, characters, {}, DUMMY_APP_SETTINGS_FOR_CREATION); // Pass empty sceneData for now
            
            const [writeResponse, enrichmentResponse] = await Promise.all([
                ApiKeyManager.generateContentWithRetry({ model: GEMINI_FLASH, contents: writingPrompt, config: { responseMimeType: "application/json", responseSchema: SCENE_WRITING_SCHEMA } }, addToast, incrementApiRequestCount, { logPrompt: addDebugPrompt, purpose: 'Tạo Thế giới - Viết Cảnh' }),
                ApiKeyManager.generateContentWithRetry({ model: GEMINI_FLASH, contents: enrichmentPrompt, config: { responseMimeType: "application/json", responseSchema: WORLD_ENRICHMENT_SCHEMA } }, addToast, incrementApiRequestCount, { logPrompt: addDebugPrompt, purpose: 'Tạo Thế giới - Làm giàu Thế giới' })
            ]);
            
            totalTokenCount += (writeResponse.usageMetadata?.totalTokenCount || 0) + (enrichmentResponse.usageMetadata?.totalTokenCount || 0);
            const sceneData = JSON.parse(writeResponse.text?.trim() || '{}');
            const knowledgeData = JSON.parse(enrichmentResponse.text?.trim() || '{}');
            if (!isMounted.current) return;
            setCreationProgress(p => Math.max(p, 90));
            setCreationMessage("Đang hoàn tất... (4/4)");

            // Final Assembly (remains the same)
            const combinedPlayerData: Partial<CharType> = {
                ...(characters.playerCharacter || {}),
                ...creationData,
                name: creationData.name || characters.playerCharacter?.name || 'Nhân vật không tên',
            };
            combinedPlayerData.displayName = combinedPlayerData.name;
            const finalPlayerCharacter = hydrateCharacterData(combinedPlayerData, CHAR_DEFAULTS);
            const allNpcs = [...(characters.initialNpcs || []), ...(knowledgeData.npcs || [])];
            const uniqueNpcsRaw = allNpcs.reduce((acc: Partial<CharType>[], current) => { if (!acc.find(item => item.name === current.name)) { acc.push(current); } return acc; }, []);
            const uniqueNpcs = uniqueNpcsRaw.map(npc => hydrateCharacterData(npc, CHAR_DEFAULTS));
            const newGameState: GameState = hydrateGameState({ 
                title: sceneData.title || creationData.idea, 
                worldSummary: sceneData.worldSummary || creationData.details, 
                gameTime: sceneData.gameTime, 
                character: finalPlayerCharacter, 
                turns: [{ id: generateUniqueId('turn-initial'), story: sceneData.story, messages: (sceneData.messages || []).map((msg: any) => ({ id: generateUniqueId('msg-initial'), ...msg })), chosenAction: null, tokenCount: totalTokenCount }], 
                actions: (sceneData.actions || []).map((action: any) => ({ id: generateUniqueId('act-initial'), ...action })), 
                knowledgeBase: { pcs: [], npcs: uniqueNpcs, locations: knowledgeData.locations || [], factions: knowledgeData.factions || [], monsters: knowledgeData.monsters || [] }, 
                totalTokenCount: totalTokenCount, 
                quests: (sceneData.initialQuests || []), 
            }, creationData);

            onCreateWorld(newGameState, creationData);

        } catch (err) {
            throw err;
        }
    }, [onCreateWorld, addToast, incrementApiRequestCount, fanficAnalysisResult, addDebugPrompt]);

    const handleInitiateCreation = useCallback(async (selectedRole?: string | null) => {
        if (isCreating) return;
        setIsCreating(true); setError(null);
        
        const estTime = formData.genre === 'Đồng nhân' ? 45 : 35;
        setEstimatedTime(estTime); startProgressTimer(estTime);

        if (formData.genre === 'Đồng nhân' && !fanficAnalysisResult) {
             setError("Lỗi: Phải phân tích Đồng nhân trước khi tạo thế giới.");
             setIsCreating(false);
             if (creationIntervalRef.current) clearInterval(creationIntervalRef.current);
             setCreationProgress(0);
             return;
        }

        try {
            await handleCreateWorld(formData, selectedRole);
            creationSuccess.current = true;
        } catch (err) {
            stopProgressTimer();
            handleGenericAiError(err, "khởi tạo thế giới");
        } finally {
             if (isMounted.current) { stopProgressTimer(); setIsCreating(false); setCreationMessage(''); }
        }
    }, [isCreating, formData, fanficAnalysisResult, handleCreateWorld, handleGenericAiError, startProgressTimer, stopProgressTimer]);

    return {
        isGeneratingContext,
        isGeneratingChar,
        isGeneratingLoreRules,
        isCreating,
        creationMessage,
        error,
        setError,
        creationProgress,
        creationTimeElapsed,
        estimatedTime,
        creationSuccess,
        handleSuggestContext,
        handleSuggestCharacter,
        handleSuggestLoreRules,
        handleInitiateCreation,
        isAnalyzingFanfic,
        fanficAnalysisResult,
        setFanficAnalysisResult,
        handleAnalyzeFanfic,
    };
}