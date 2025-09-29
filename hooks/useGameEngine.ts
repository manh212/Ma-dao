/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { useState, useCallback, useRef, useEffect } from 'react';
import { useSettings } from '../components/contexts/SettingsContext';
import { useGameContext } from '../components/contexts/GameContext';
import { useToasts } from '../components/contexts/ToastContext';
import { ApiKeyManager } from '../services/ApiKeyManager';
import { PromptBuilderService } from '../services/PromptBuilderService';
import { GameStateUpdaterService } from '../services/GameStateUpdaterService';
import { CombatService } from '../services/CombatService';
import { getApiErrorMessage } from '../utils/error';
import { stripEntityTags } from '../utils/text';
import { getTurnSchemaForGenre } from '../constants/schemas';
import { AI_THOUGHT_PROCESS_MESSAGES } from '../constants/loadingConstants';
import { GEMINI_FLASH } from '../constants/aiConstants';
import type { GameState, GameAction, Monster, Character, WorldSettings, Recipe } from '../types';

interface UseGameEngineProps {
    incrementApiRequestCount: () => void;
    onTurnComplete: (newGameState: GameState, newWorldSettings: WorldSettings, turnResult: any) => void;
}

type PredictedResult = { finalGameState: GameState; predictedActionId: string | null; };

export const useGameEngine = ({ incrementApiRequestCount, onTurnComplete }: UseGameEngineProps) => {
    const { settings } = useSettings();
    const { gameState, worldSettings, dispatch } = useGameContext();
    const { addToast } = useToasts();

    const [isAITurnProcessing, setIsAITurnProcessing] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [turnCreationProgress, setTurnCreationProgress] = useState(0);
    const [turnCreationTimeElapsed, setTurnCreationTimeElapsed] = useState(0);
    const turnCreationIntervalRef = useRef<number | null>(null);
    const loadingMessageIntervalRef = useRef<number | null>(null);
    const isMounted = useRef(true);
    const [lastAction, setLastAction] = useState<Partial<GameAction> | null>(null);
    const [isLastActionCustom, setIsLastActionCustom] = useState(false);
    
    // Predictive Inference System State
    const [predictiveActionId, setPredictiveActionId] = useState<string | null>(null);
    const [predictedTurnResult, setPredictedTurnResult] = useState<PredictedResult | null>(null);
    const [isPredicting, setIsPredicting] = useState(false);
    
    // Client-side Combat State
    const lastCombatOutcome = useRef<'win' | 'loss' | 'fled' | null>(null);
    const prevIsInCombat = useRef(gameState?.isInCombat);


    const isProcessing = isAITurnProcessing;

    const stopLoadingMessageCycle = useCallback(() => {
        if (loadingMessageIntervalRef.current) {
            clearInterval(loadingMessageIntervalRef.current);
            loadingMessageIntervalRef.current = null;
        }
    }, []);

    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
            if (turnCreationIntervalRef.current) clearInterval(turnCreationIntervalRef.current);
            stopLoadingMessageCycle();
        };
    }, [stopLoadingMessageCycle]);

    const startTurnProgressTimer = (estimatedDuration: number) => {
        if (turnCreationIntervalRef.current) clearInterval(turnCreationIntervalRef.current);
        setTurnCreationProgress(0);
        setTurnCreationTimeElapsed(0);
        const updateInterval = 100;
        const progressIncrement = 100 / (estimatedDuration * 1000 / updateInterval);
        turnCreationIntervalRef.current = window.setInterval(() => {
            if (!isMounted.current) return;
            setTurnCreationTimeElapsed(prev => prev + (updateInterval / 1000));
            setTurnCreationProgress(prev => Math.min(prev + progressIncrement, 95));
        }, updateInterval);
    };

    const stopTurnProgressTimer = () => {
        if (turnCreationIntervalRef.current) {
            clearInterval(turnCreationIntervalRef.current);
            turnCreationIntervalRef.current = null;
        }
        setTurnCreationProgress(100);
    };

    const startLoadingMessageCycle = useCallback((stage: 'processing') => {
        stopLoadingMessageCycle();

        const genre = worldSettings?.genre || 'default';
        const messageSet = AI_THOUGHT_PROCESS_MESSAGES[stage]?.[genre] || AI_THOUGHT_PROCESS_MESSAGES[stage]?.default || [];

        if (messageSet.length > 0) {
            setLoadingMessage(messageSet[0]);
            let currentIndex = 0;
            loadingMessageIntervalRef.current = window.setInterval(() => {
                currentIndex = (currentIndex + 1) % messageSet.length;
                if (isMounted.current) {
                    setLoadingMessage(messageSet[currentIndex]);
                }
            }, 2000);
        } else {
            setLoadingMessage('AI đang xử lý...');
        }
    }, [worldSettings, stopLoadingMessageCycle]);

    const _processAITurn = useCallback(async (action: Partial<GameAction>, isCustom = false, specialContext?: any) => {
        if (isAITurnProcessing) return;

        setLastAction(action);
        setIsLastActionCustom(isCustom);
        setIsAITurnProcessing(true);
        setError(null);
        
        let estimatedDuration = 10;
        if (settings.aiProcessingMode === 'quality') estimatedDuration = 15;
        if (settings.aiProcessingMode === 'max_quality') estimatedDuration = 22;
        if (gameState.isIntercourseScene) estimatedDuration = 8;


        startTurnProgressTimer(estimatedDuration);
        
        try {
            const cleanActionDescription = stripEntityTags(action.description || '');
            const stateBeforeAction = JSON.parse(JSON.stringify(gameState));
            
            const turnProcessingPrompt = await PromptBuilderService.buildTurnPrompt(
                stateBeforeAction, worldSettings, settings, cleanActionDescription, addToast, specialContext
            );
            
            startLoadingMessageCycle('processing');
            const response = await ApiKeyManager.generateContentWithRetry({
                model: GEMINI_FLASH, contents: turnProcessingPrompt, config: { responseMimeType: "application/json", responseSchema: getTurnSchemaForGenre(worldSettings.genre) }
            }, addToast, incrementApiRequestCount);
            
            const totalTokensForTurn = response.usageMetadata?.totalTokenCount || 0;
            const turnResult = JSON.parse(response.text?.trim() || '{}');
            
            const { finalGameState, finalWorldSettings } = GameStateUpdaterService.applyTurnDeltas(
                stateBeforeAction, 
                worldSettings,
                turnResult, 
                action.description, 
                totalTokensForTurn, 
                settings.autoPinMemory
            );
            
            if (!isMounted.current) return;
            onTurnComplete(finalGameState, finalWorldSettings, turnResult);
            addToast('Diễn biến đã được cập nhật.', 'success');
            
        } catch (error) {
            const userFriendlyError = getApiErrorMessage(error, "xử lý lượt chơi");
            if (isMounted.current) setError(userFriendlyError);
        } finally {
            if (isMounted.current) {
                stopTurnProgressTimer();
                stopLoadingMessageCycle();
                setIsAITurnProcessing(false);
                setLoadingMessage('');
            }
        }
    }, [isAITurnProcessing, settings, gameState, worldSettings, onTurnComplete, addToast, incrementApiRequestCount, startLoadingMessageCycle, stopLoadingMessageCycle]);
    
    // Effect to handle AI narration AFTER combat ends
    useEffect(() => {
        const combatJustEnded = prevIsInCombat.current && !gameState?.isInCombat;
        prevIsInCombat.current = gameState?.isInCombat;

        if (combatJustEnded && lastCombatOutcome.current) {
            const outcomeText = {
                win: `Bạn đã giành chiến thắng.`,
                loss: `Bạn đã bị đánh bại.`,
                fled: `Bạn đã bỏ chạy thành công.`
            }[lastCombatOutcome.current] || 'Trận chiến đã kết thúc.';
            
            const specialContext = {
                type: 'combat_end_summary',
                details: `Mệnh lệnh tường thuật: ${outcomeText} Hãy mô tả hậu quả của trận chiến và những gì xảy ra tiếp theo.`
            };
            
            _processAITurn(
                { description: "Trận chiến kết thúc." }, 
                true,
                specialContext
            );
            lastCombatOutcome.current = null; // Reset for next combat
        }
    }, [gameState?.isInCombat, _processAITurn]);
    
    
    const processCombatTurn = useCallback((action: Partial<GameAction>) => {
        if (!gameState || !gameState.isInCombat) return;

        const player = gameState.character;
        const opponentId = gameState.combatants?.find(id => id !== player.id);
        if (!opponentId) {
            addToast("Lỗi: Không tìm thấy đối thủ trong combatants list.", 'error');
            return;
        }

        const opponent = gameState.knowledgeBase.npcs.find(n => n.id === opponentId) || gameState.knowledgeBase.monsters.find(m => m.id === opponentId);
        if (!opponent) {
            addToast(`Lỗi: Không tìm thấy đối thủ với ID: ${opponentId}.`, 'error');
            return;
        }
        
        const result = CombatService.processTurn(action as GameAction, player, opponent);
        
        if (result.combatShouldEnd) {
            lastCombatOutcome.current = result.outcome as 'win' | 'loss' | 'fled';
        }

        dispatch({
            type: 'PROCESS_COMBAT_ACTION',
            payload: result
        });

    }, [gameState, dispatch, addToast]);

    const submitAction = useCallback((action: Partial<GameAction>, isCustom = false) => {
        if (isProcessing) return;

        if (gameState?.isInCombat) {
            processCombatTurn(action);
        } else {
            _processAITurn(action, isCustom);
        }

    }, [isProcessing, gameState?.isInCombat, processCombatTurn, _processAITurn]);


    const retryLastAction = useCallback(() => {
        if (lastAction) {
            addToast("Đang thử lại hành động trước đó...", 'info');
            submitAction(lastAction, isLastActionCustom);
        } else {
            addToast("Không có hành động nào gần đây để thử lại.", "warning");
        }
    }, [lastAction, isLastActionCustom, submitAction, addToast]);

    return {
        submitAction,
        retryLastAction,
        isProcessing,
        loadingMessage,
        turnCreationProgress,
        turnCreationTimeElapsed,
        error,
        setError,
        lastAction,
        predictiveActionId,
        isPredicting,
        predictedTurnResult,
    };
};