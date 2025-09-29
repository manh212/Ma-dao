/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import './GameView.css';
import { SettingsModal } from '../modals/SettingsModal';
import { LoreModal } from '../modals/LoreModal';
import { MemoryModal } from '../modals/MemoryModal';
import { KnowledgeBaseModal } from '../modals/KnowledgeBaseModal';
import { HistoryModal } from '../modals/HistoryModal';
import { GalleryModal } from '../modals/GalleryModal';
import { AvatarEditModal } from '../modals/AvatarEditModal';
import { EntityTooltip } from '../game/EntityTooltip';
import { GameHeader } from '../game/GameHeader';
import { GameBody } from '../game/GameBody';
import { GameFooter } from '../game/GameFooter';
import { GameMenuSidebar } from '../game/GameMenuSidebar';
import { CombatView } from '../game/CombatView';
import { CombatTransitionOverlay } from '../game/CombatTransitionOverlay';
import { CharacterDetailView } from './CharacterDetailView';
import { useGameEngine } from '../../hooks/useGameEngine';
import { useGameContext } from '../contexts/GameContext';
import { useToasts } from '../contexts/ToastContext';
import * as db from '../../services/db';
import { downloadSaveFile } from '../../utils/fileUtils';
import { sanitizeTextForClassName } from '../../utils/text';
import { findEntityByIdAndType } from '../../utils/entityUtils';
import type { GameState, WorldSettings, GameCharacter, GameAction, EntityTooltipData, LoreRule, KnowledgeEntity, SaveFile, Recipe } from '../../types';

interface GameViewProps {
    onNavigateToMenu: () => void;
    onSaveGame: (gameState: GameState, worldSettings: WorldSettings) => void;
    incrementApiRequestCount: () => void;
    apiRequestCount: number;
}

export const GameView = ({ onNavigateToMenu, onSaveGame, incrementApiRequestCount, apiRequestCount }: GameViewProps) => {
    const { addToast } = useToasts();
    const { gameState, worldSettings, dispatch } = useGameContext();
    
    const [customAction, setCustomAction] = useState('');
    const [activeModal, setActiveModal] = useState<string | null>(null);
    const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null);
    const [activeTooltip, setActiveTooltip] = useState<{ data: EntityTooltipData, pinned: boolean } | null>(null);
    const [characterToEditAvatar, setCharacterToEditAvatar] = useState<GameCharacter | null>(null);
    const [visibleTurnsCount, setVisibleTurnsCount] = useState(20);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [areActionsVisible, setAreActionsVisible] = useState(true);
    const [showCombatTransition, setShowCombatTransition] = useState(false);
    const [isFocusMode, setIsFocusMode] = useState(false);
    
    const gameBodyRef = useRef<HTMLDivElement>(null);
    const prevIsInCombat = useRef(gameState?.isInCombat);


    useEffect(() => {
        if (gameState?.isInCombat && !prevIsInCombat.current) {
            setShowCombatTransition(true);
            const timer = setTimeout(() => setShowCombatTransition(false), 1200); // Duration of the crack animation
            return () => clearTimeout(timer);
        }
        prevIsInCombat.current = gameState?.isInCombat;
    }, [gameState?.isInCombat]);

    const handleTurnCompletion = useCallback((newGameState: GameState, newWorldSettings: WorldSettings, turnResult: any) => {
        dispatch({ type: 'LOAD_GAME', payload: { gameState: newGameState, worldSettings: newWorldSettings } });
        onSaveGame(newGameState, newWorldSettings);
        setAreActionsVisible(false);
        
        // Handle side-effects from turn result, like showing toasts for new recipes
        if (turnResult?.newRecipes && Array.isArray(turnResult.newRecipes)) {
            turnResult.newRecipes.forEach((recipe: Recipe) => {
                if (recipe.name) {
                    addToast(`Bạn đã học được công thức mới: ${recipe.name}!`, 'success');
                }
            });
        }

    }, [dispatch, onSaveGame, addToast]);

    const {
        submitAction,
        analyzeAction,
        retryLastAction,
        isProcessing,
        isAnalyzing,
        loadingMessage,
        actionAnalysis,
        setActionAnalysis,
        turnCreationProgress,
        turnCreationTimeElapsed,
        error,
        setError,
        lastAction,
        predictiveActionId,
        isPredicting,
        predictedTurnResult,
    } = useGameEngine({
        incrementApiRequestCount,
        onTurnComplete: handleTurnCompletion,
    });
    
    const scrollToBottom = useCallback((behavior: 'smooth' | 'auto' = 'smooth') => {
        gameBodyRef.current?.scrollTo({
            top: gameBodyRef.current.scrollHeight,
            behavior: behavior,
        });
    }, []);

    useEffect(() => {
        const handleGlobalClick = () => setActiveTooltip(null);
        document.addEventListener('click', handleGlobalClick);
        return () => document.removeEventListener('click', handleGlobalClick);
    }, []);

    useEffect(() => {
        setError(null);
        setActiveTooltip(null);
    }, [gameState.saveId, setError]);

    useEffect(() => {
        scrollToBottom('smooth');
    }, [gameState.turns, scrollToBottom]);

    const handleAction = useCallback((action: Partial<GameAction>, isCustom = false) => {
        submitAction(action, isCustom);
        if (isCustom) {
            setCustomAction('');
        }
    }, [submitAction]);

    const handleAnalyzeAction = useCallback(async () => {
        await analyzeAction(customAction);
    }, [analyzeAction, customAction]);
    
    const handleEntityClick = useCallback((event: React.MouseEvent, entityId: string, entityType: string) => {
        event.stopPropagation();
    
        if (entityType === 'PC' || entityType === 'NPC') {
            setSelectedCharacterId(entityId);
            setActiveModal('character');
            return;
        }
    
        const rect = (event.target as HTMLElement).getBoundingClientRect();
        const entityData = findEntityByIdAndType(gameState, entityId, entityType);
        
        const tooltipData = {
            id: entityId,
            name: (entityData as any)?.name || 'Unknown',
            type: entityType,
            description: entityData?.description || 'Thông tin chưa được khám phá.',
            displayName: (entityData && 'displayName' in entityData) ? (entityData as GameCharacter).displayName : undefined,
            position: { top: rect.bottom + 5, left: rect.left, }
        };

        if (activeTooltip?.data?.id === entityId && activeTooltip?.pinned) {
            setActiveTooltip(null);
        } else {
            setActiveTooltip({ data: tooltipData, pinned: true });
        }
    }, [gameState, activeTooltip]);
    
    const handleEntityMouseEnter = useCallback((event: React.MouseEvent, entityId: string, entityType: string) => {
        if (activeTooltip?.pinned) return;
        if (entityType === 'PC') return;
    
        const rect = (event.target as HTMLElement).getBoundingClientRect();
        const position = { top: rect.bottom + 5, left: rect.left, };

        let tooltipData: EntityTooltipData | null = null;
        
        const entityData = findEntityByIdAndType(gameState, entityId, entityType);
        if (!entityData) return;

        if (entityType === 'NPC') {
            const npcData = entityData as GameCharacter;
            tooltipData = {
                id: entityId,
                name: npcData.name,
                type: entityType,
                description: npcData.description || 'Thông tin chưa được khám phá.',
                displayName: npcData.displayName,
                position,
                avatarUrl: npcData.avatarUrl,
                age: npcData.age,
                ageDescription: npcData.ageDescription,
                gender: npcData.gender,
                relationship: npcData.relationship,
                respect: npcData.respect,
                trust: npcData.trust,
                fear: npcData.fear,
            };
        } else {
            tooltipData = {
                id: entityId,
                name: entityData.name,
                type: entityType,
                description: entityData.description || 'Thông tin chưa được khám phá.',
                displayName: (entityData && 'displayName' in entityData) ? (entityData as GameCharacter).displayName : undefined,
                position
            };
        }

        if (tooltipData) {
            setActiveTooltip({ data: tooltipData, pinned: false });
        }
    }, [gameState, activeTooltip]);

    const handleEntityMouseLeave = useCallback(() => {
        if (activeTooltip?.pinned) return;
        setActiveTooltip(null);
    }, [activeTooltip]);
    
    const handleSaveToFile = useCallback(async () => {
        try {
            await onSaveGame(gameState, worldSettings);
    
            const saveId = gameState.saveId;
            if (!saveId) {
                throw new Error("Game must be saved at least once to be downloaded.");
            }

            const freshSaveFile = await db.getSaveById(saveId);
            if (!freshSaveFile) {
                throw new Error("Could not retrieve the saved file from the database for download.");
            }
    
            await downloadSaveFile(freshSaveFile, addToast);
    
        } catch (error) {
            const message = error instanceof Error ? error.message : "Unknown error";
            console.error("Lỗi khi lưu game ra tệp .zip:", error);
            setError(`Không thể lưu tệp. Lỗi: ${message}`);
        }
    }, [gameState, worldSettings, onSaveGame, addToast, setError]);

    const handleRevert = useCallback((historyIndex: number) => {
        dispatch({ type: 'REVERT_TO_TURN', payload: historyIndex });
        setActiveModal(null);
        addToast('Đã quay lại lượt chơi trước đó.', 'success');
    }, [dispatch, addToast]);
    
    const handleRevertToPreviousTurn = useCallback(() => {
        if (gameState.history.length > 0) {
            handleRevert(gameState.history.length - 1);
        }
    }, [gameState.history, handleRevert]);

    const handleSaveLore = useCallback((newLoreRules: LoreRule[]) => {
        dispatch({ type: 'UPDATE_WORLD_SETTINGS', payload: { loreRules: newLoreRules } });
        addToast("Luật lệ đã được cập nhật và sẽ áp dụng ở lượt tiếp theo.", 'success');
    }, [dispatch, addToast]);

    const handlePinMemory = useCallback((memoryId: string) => {
        dispatch({ type: 'TOGGLE_PIN_MEMORY', payload: memoryId });
    }, [dispatch]);

    const handleDeleteMemory = useCallback((memoryId: string) => {
        dispatch({ type: 'DELETE_MEMORY', payload: memoryId });
        addToast('Đã xóa ký ức.', 'success');
    }, [dispatch, addToast]);
    
    const handleRenameEntity = useCallback((id: string, newName: string, entityType: string, oldName: string) => {
        if (!id || !newName || newName.trim() === '' || oldName === newName.trim()) {
            addToast("Tên không hợp lệ hoặc không thay đổi.", "warning");
            return;
        }
        dispatch({ type: 'RENAME_ENTITY', payload: { id, newName: newName.trim(), entityType } });
        addToast(`Đã đổi tên hiển thị của "${oldName || '(chưa có tên)'}" thành "${newName.trim()}".`, 'success');
    }, [dispatch, addToast]);
    
    const handleUpdateCharacterData = useCallback((characterId: string, updates: Partial<GameCharacter>) => {
        dispatch({ type: 'UPDATE_CHARACTER', payload: { characterId, updates } });
    }, [dispatch]);
    
    const handleUpdateWorldSummary = useCallback((newSummary: string) => {
        const newGameState = { ...gameState, worldSummary: newSummary };
        dispatch({ type: 'UPDATE_WORLD_SUMMARY', payload: newSummary });
        onSaveGame(newGameState, worldSettings);
    }, [dispatch, gameState, onSaveGame, worldSettings]);
    
    const handleAvatarClick = useCallback((characterId: string) => {
        let characterToEdit: GameCharacter | undefined;
        if (gameState.character?.id === characterId) {
            characterToEdit = gameState.character;
        } else {
            characterToEdit = gameState.knowledgeBase?.npcs?.find(npc => npc.id === characterId);
        }
        if (characterToEdit) {
            setCharacterToEditAvatar(characterToEdit);
        }
    }, [gameState]);

    const handleNavClick = useCallback((label: string) => {
        setError(null);
        setActiveTooltip(null);
        setIsMenuOpen(false); // Close menu on navigation
        if (label === 'Nhân Vật' && gameState.character) {
            setSelectedCharacterId(gameState.character.id);
            setActiveModal('character');
        } else if (label === 'Cài Đặt') setActiveModal('settings');
        else if (label === 'Luật Lệ') setActiveModal('lore');
        else if (label === 'Ký Ức') setActiveModal('memory');
        else if (label === 'Tri Thức') setActiveModal('knowledge');
        else if (label === 'Thư Viện') setActiveModal('gallery');
        else if (label === 'Lịch Sử') setActiveModal('history');
    }, [gameState.character, setError]);

    const handleNpcSelect = useCallback((npcId: string) => {
        setSelectedCharacterId(npcId);
        setActiveModal('character');
    }, []);

    const handleShowMoreTurns = useCallback(() => {
        setVisibleTurnsCount(prev => prev + 20);
    }, []);

    const characterToDisplay = useMemo(() => {
        if (!selectedCharacterId) return null;
        if (selectedCharacterId === gameState.character?.id) return gameState.character;
        return gameState.knowledgeBase?.npcs?.find(npc => npc.id === selectedCharacterId) || null;
    }, [selectedCharacterId, gameState]);

    const genreTheme = sanitizeTextForClassName(worldSettings?.genre);
    const isInCombat = gameState.isInCombat === true;
    const containerClasses = `game-container ${isInCombat ? 'in-combat' : ''} ${isFocusMode ? 'focus-mode' : ''}`;

    return (
        <div className={containerClasses} data-genre-theme={genreTheme}>
            {/* FIX: Removed 'key' prop to prevent TypeScript error. Component will still re-render correctly when 'character' prop changes. */}
            {activeModal === 'character' && <CharacterDetailView character={characterToDisplay} onClose={() => { setActiveModal(null); setSelectedCharacterId(null); }} isPlayerCharacter={characterToDisplay?.id === gameState.character?.id} onEntityClick={handleEntityClick} onEntityMouseEnter={handleEntityMouseEnter} onEntityMouseLeave={handleEntityMouseLeave} onNpcSelect={handleNpcSelect} onRenameEntity={handleRenameEntity} onUpdateCharacterData={handleUpdateCharacterData} addToast={addToast} />}
            {activeModal === 'knowledge' && <KnowledgeBaseModal onClose={() => setActiveModal(null)} onEntityClick={handleEntityClick} onEntityMouseEnter={handleEntityMouseEnter} onEntityMouseLeave={handleEntityMouseLeave} onNpcSelect={handleNpcSelect} onRenameEntity={handleRenameEntity} onUpdateWorldSummary={handleUpdateWorldSummary} addToast={addToast} />}
            {activeModal === 'settings' && <SettingsModal onClose={() => setActiveModal(null)} />}
            {activeModal === 'lore' && <LoreModal initialRules={worldSettings.loreRules || []} onSave={handleSaveLore} onClose={() => setActiveModal(null)} />}
            {activeModal === 'memory' && <MemoryModal memories={gameState.memories || []} onPin={handlePinMemory} onDelete={handleDeleteMemory} onClose={() => setActiveModal(null)} onEntityClick={handleEntityClick} onEntityMouseEnter={handleEntityMouseEnter} onEntityMouseLeave={handleEntityMouseLeave} />}
            {activeModal === 'history' && <HistoryModal turns={gameState.turns} onRevert={handleRevert} onClose={() => setActiveModal(null)} onEntityClick={handleEntityClick} onEntityMouseEnter={handleEntityMouseEnter} onEntityMouseLeave={handleEntityMouseLeave} />}
            {activeModal === 'gallery' && <GalleryModal onClose={() => setActiveModal(null)} addToast={addToast} incrementApiRequestCount={incrementApiRequestCount} />}
            {characterToEditAvatar && <AvatarEditModal 
                character={characterToEditAvatar} 
                onClose={() => setCharacterToEditAvatar(null)} 
                onSave={(newUrl) => {
                    handleUpdateCharacterData(characterToEditAvatar.id, { avatarUrl: newUrl });
                    addToast("Đã cập nhật ảnh đại diện.", "success");
                    setCharacterToEditAvatar(null);
                }} 
                addToast={addToast} 
            />}
            
            {showCombatTransition && <CombatTransitionOverlay />}
            
            <EntityTooltip data={activeTooltip?.data || null} onClose={() => setActiveTooltip(null)} onEntityClick={handleEntityClick} onEntityMouseEnter={handleEntityMouseEnter} onEntityMouseLeave={handleEntityMouseLeave} />
            
             <GameMenuSidebar
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
                onNavClick={handleNavClick}
                onSaveToFile={handleSaveToFile}
                onNavigateToMenu={onNavigateToMenu}
                isProcessing={isProcessing}
            />

            <GameHeader 
                title={gameState.title}
                gameTime={gameState.gameTime}
                turnCount={gameState.turns.length}
                totalTokenCount={gameState.totalTokenCount}
                isProcessing={isProcessing}
                onToggleMenu={() => setIsMenuOpen(!isMenuOpen)}
                isInCombat={isInCombat}
                isFocusMode={isFocusMode}
                setIsFocusMode={setIsFocusMode}
            />

            <div className={`game-main-content ${isInCombat ? 'blurred' : ''}`}>
                 <GameBody 
                    ref={gameBodyRef}
                    turns={gameState.turns}
                    worldSummary={gameState.worldSummary}
                    onEntityClick={handleEntityClick}
                    onEntityMouseEnter={handleEntityMouseEnter}
                    onEntityMouseLeave={handleEntityMouseLeave}
                    onAvatarClick={handleAvatarClick}
                    visibleTurnsCount={visibleTurnsCount}
                    onShowMoreTurns={handleShowMoreTurns}
                />
            
                <GameFooter
                    areActionsVisible={areActionsVisible}
                    onShowActions={() => setAreActionsVisible(true)}
                    isProcessing={isProcessing}
                    isAnalyzing={isAnalyzing}
                    loadingMessage={loadingMessage}
                    error={error}
                    setError={setError}
                    customAction={customAction}
                    setCustomAction={setCustomAction}
                    actionAnalysis={actionAnalysis}
                    setActionAnalysis={setActionAnalysis}
                    onEntityClick={handleEntityClick}
                    onEntityMouseEnter={handleEntityMouseEnter}
                    onEntityMouseLeave={handleEntityMouseLeave}
                    onAction={handleAction}
                    onAnalyzeAction={handleAnalyzeAction}
                    onScrollToBottom={scrollToBottom}
                    turnCreationProgress={turnCreationProgress}
                    turnCreationTimeElapsed={turnCreationTimeElapsed}
                    onRetry={retryLastAction}
                    predictiveActionId={predictiveActionId}
                    isPredicting={isPredicting}
                    predictedTurnResult={predictedTurnResult}
                    lastAction={lastAction}
                    historyLength={gameState.history.length}
                    onRevertToPreviousTurn={handleRevertToPreviousTurn}
                />
            </div>
            {isInCombat && <CombatView 
                onSubmitAction={handleAction}
                onEntityClick={handleEntityClick}
                onEntityMouseEnter={handleEntityMouseEnter}
                onEntityMouseLeave={handleEntityMouseLeave}
            />}
        </div>
    );
};