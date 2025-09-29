/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { useGameContext } from '../contexts/GameContext';
import { InlineStoryRenderer } from './StoryRenderer';
import { cleanAndStripTags } from '../../utils/text';
import { ActionTooltip } from './ActionTooltip';
import type { GameState, GameAction } from '../../types';

interface GameFooterProps {
    areActionsVisible: boolean;
    onShowActions: () => void;
    isProcessing: boolean;
    isAnalyzing: boolean;
    loadingMessage: string;
    error: string | null;
    setError: (error: string | null) => void;
    customAction: string;
    setCustomAction: (action: string) => void;
    actionAnalysis: any;
    setActionAnalysis: (analysis: any) => void;
    onEntityClick: (event: React.MouseEvent, name: string, type: string) => void;
    onEntityMouseEnter: (event: React.MouseEvent, name: string, type: string) => void;
    onEntityMouseLeave: () => void;
    onAction: (action: Partial<GameAction>, isCustom?: boolean) => void;
    onAnalyzeAction: () => void;
    onScrollToBottom: (behavior: 'smooth' | 'auto') => void;
    turnCreationProgress: number;
    turnCreationTimeElapsed: number;
    onRetry: () => void;
    predictiveActionId: string | null;
    isPredicting: boolean;
    predictedTurnResult: { finalGameState: GameState; predictedActionId: string | null; } | null;
    lastAction: Partial<GameAction> | null;
    historyLength: number;
    onRevertToPreviousTurn: () => void;
}

const RetryIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 4v6h6"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>;
const RevertIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 4v6h6"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>;
const SendIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21 23 12 2.01 3 2 10l15 2-15 2z"/></svg>;
const ChevronUpIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>;
const MoreIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"></path></svg>;

const ActionPotentials = ({ benefit = 0, risk = 0 }: { benefit?: number; risk?: number }) => {
    const total = Math.max(1, benefit + risk);
    const riskStop = (risk / total) * 100;

    const gradientStyle: React.CSSProperties = {
        background: `linear-gradient(to right, var(--accent-danger) ${riskStop}%, var(--accent-success) ${riskStop}%)`
    };

    const conflictIconStyle: React.CSSProperties = {
        left: `${riskStop}%`,
    };
    
    return (
        <div className="action-potentials">
            <span className="potential-label risk">Hại</span>
            <div className="potential-bar-wrapper combined">
                <div className="potential-bar combined-bar" style={gradientStyle}>
                    <span className="potential-conflict-icon" style={conflictIconStyle}>⚔️</span>
                </div>
            </div>
            <span className="potential-label benefit">Lợi</span>
        </div>
    );
};


export const GameFooter = React.memo(({
    areActionsVisible,
    onShowActions,
    isProcessing,
    isAnalyzing,
    loadingMessage,
    error,
    setError,
    customAction,
    setCustomAction,
    actionAnalysis,
    setActionAnalysis,
    onEntityClick,
    onEntityMouseEnter,
    onEntityMouseLeave,
    onAction,
    onAnalyzeAction,
    onScrollToBottom,
    turnCreationProgress,
    turnCreationTimeElapsed,
    onRetry,
    predictiveActionId,
    isPredicting,
    predictedTurnResult,
    lastAction,
    historyLength,
    onRevertToPreviousTurn
}: GameFooterProps) => {
    const { settings, appliedTheme } = useSettings();
    const { gameState } = useGameContext();
    const [actionTooltip, setActionTooltip] = useState<{
        action: GameAction;
        position: { top: number; left: number; right: number; bottom: number; };
    } | null>(null);
    const tooltipTimerRef = useRef<number | null>(null);
    const [processingActionId, setProcessingActionId] = useState<string | null>(null);
    const [isMoreActionsMenuOpen, setIsMoreActionsMenuOpen] = useState(false);
    const moreActionsRef = useRef<HTMLDivElement>(null);
    
    // Mobile Action Slider State
    const [currentActionIndex, setCurrentActionIndex] = useState(0);
    const touchStartX = useRef(0);
    const touchEndX = useRef(0);

    const mainActions = gameState.actions.slice(0, 4);

    useEffect(() => {
        setCurrentActionIndex(0);
    }, [gameState.actions]);

    useEffect(() => {
        if (!isProcessing) {
            setProcessingActionId(null);
        }
    }, [isProcessing]);
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (moreActionsRef.current && !moreActionsRef.current.contains(event.target as Node)) {
                setIsMoreActionsMenuOpen(false);
            }
        };
        if (isMoreActionsMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isMoreActionsMenuOpen]);

    const handleActionClick = (action: Partial<GameAction>, isCustom: boolean = false) => {
        if (isProcessing) return;
        if (action.id) {
            setProcessingActionId(action.id);
        } else if (isCustom) {
            setProcessingActionId('custom_action');
        }
        onAction(action, isCustom);
    };

    const handleActionMouseEnter = useCallback((event: React.MouseEvent, action: GameAction) => {
        if (tooltipTimerRef.current) clearTimeout(tooltipTimerRef.current);
        const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
        tooltipTimerRef.current = window.setTimeout(() => {
            setActionTooltip({
                action,
                position: { top: rect.top, left: rect.left, right: rect.right, bottom: rect.bottom },
            });
        }, 500); // 500ms delay
    }, []);

    const handleActionMouseLeave = useCallback(() => {
        if (tooltipTimerRef.current) clearTimeout(tooltipTimerRef.current);
        setActionTooltip(null);
    }, []);

    const estimatedDuration = gameState.isIntercourseScene ? 12 : (settings.aiProcessingMode === 'quality' ? 24 : 12);
    
    const isEffectivelyCollapsed = !areActionsVisible && !isProcessing && !error;

    // --- Mobile Slider Logic ---
    const handleNextAction = useCallback(() => {
        if (mainActions.length > 1) {
            setCurrentActionIndex(prev => (prev + 1) % mainActions.length);
        }
    }, [mainActions.length]);

    const handlePrevAction = useCallback(() => {
        if (mainActions.length > 1) {
            setCurrentActionIndex(prev => (prev - 1 + mainActions.length) % mainActions.length);
        }
    }, [mainActions.length]);
    
    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.targetTouches[0].clientX;
        touchEndX.current = 0;
    };
    const handleTouchMove = (e: React.TouchEvent) => {
        if (touchStartX.current !== 0) {
            touchEndX.current = e.targetTouches[0].clientX;
        }
    };
    const handleTouchEnd = () => {
        if (touchStartX.current === 0 || touchEndX.current === 0) return;
        const deltaX = touchEndX.current - touchStartX.current;
        if (Math.abs(deltaX) > 50) { // Swipe threshold
            if (deltaX < 0) { // Swipe left
                handleNextAction();
            } else { // Swipe right
                handlePrevAction();
            }
        }
        touchStartX.current = 0;
        touchEndX.current = 0;
    };
    // --- End Mobile Slider Logic ---


    const renderDesktopActions = () => (
        mainActions.map((action) => {
            const isThisButtonProcessing = isProcessing && processingActionId === action.id;
            const isThisActionBeingPredicted = isPredicting && predictiveActionId === action.id;
            const isPredictedAndReady = predictiveActionId === action.id && !!predictedTurnResult && !isPredicting;
            const isFateAltering = action.isFateAltering === true;
            const ipCost = action.ipCost || 0;
            const canAfford = (gameState.character?.interventionPoints || 0) >= ipCost;

            let buttonClasses = 'suggested-action-button';
            if (isThisButtonProcessing) buttonClasses += ' processing';
            if (isPredictedAndReady) buttonClasses += ' predicted-ready';
            if (isFateAltering) buttonClasses += ' fate-altering';

            return (
                <button
                    key={action.id}
                    className={buttonClasses}
                    onClick={() => handleActionClick(action)}
                    disabled={isProcessing || (isFateAltering && !canAfford)}
                    onMouseEnter={(e) => handleActionMouseEnter(e, action)}
                    onMouseLeave={handleActionMouseLeave}
                    title={isFateAltering && !canAfford ? `Cần ${ipCost} Điểm Can Thiệp` : ''}
                >
                    {isThisButtonProcessing ? (
                        <div className="action-button-loading-state">
                            <div className="spinner spinner-md"></div>
                            <span>{loadingMessage || 'Đang xử lý...'}</span>
                        </div>
                    ) : (
                        <div className="action-button-content">
                            <div className="action-button-header">
                                {isThisActionBeingPredicted && <div className="prediction-indicator" title="AI đang suy nghĩ trước lựa chọn này"/>}
                                {isPredictedAndReady && <span role="img" aria-label="predicted ready" title="Hành động tức thì">⚡</span>}
                                <span className="action-button-text">{cleanAndStripTags(action.description)}</span>
                                {isFateAltering && (
                                    <div className={`fate-altering-cost ${canAfford ? 'affordable' : 'unaffordable'}`}>
                                        {ipCost}
                                    </div>
                                )}
                            </div>
                            <ActionPotentials benefit={action.benefitPotential} risk={action.riskPotential} />
                        </div>
                    )}
                </button>
            );
        })
    );

    const renderMobileSlider = () => {
        const action = mainActions[currentActionIndex];
        if (!action) return null;

        const isThisButtonProcessing = isProcessing && processingActionId === action.id;
        const isThisActionBeingPredicted = isPredicting && predictiveActionId === action.id;
        const isPredictedAndReady = predictiveActionId === action.id && !!predictedTurnResult && !isPredicting;
        const isFateAltering = action.isFateAltering === true;
        const ipCost = action.ipCost || 0;
        const canAfford = (gameState.character?.interventionPoints || 0) >= ipCost;

        const { benefitPotential = 0, riskPotential = 0 } = action;
        const total = Math.max(1, benefitPotential + riskPotential);
        const riskStop = (riskPotential / total) * 100;

        const buttonStyle: React.CSSProperties = {
            '--risk-stop-percent': `${riskStop}%`,
        } as React.CSSProperties;

        let buttonClasses = 'suggested-action-button';
        if (isThisButtonProcessing) buttonClasses += ' processing';
        if (isPredictedAndReady) buttonClasses += ' predicted-ready';
        if (isFateAltering) buttonClasses += ' fate-altering';
        
        return (
            <>
                {mainActions.length > 1 && <button className="action-slider-nav" onClick={handlePrevAction}>‹</button>}
                <div 
                    className="action-slider-content"
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    <button
                        key={action.id}
                        className={buttonClasses}
                        onClick={() => handleActionClick(action)}
                        disabled={isProcessing || (isFateAltering && !canAfford)}
                        onMouseEnter={(e) => handleActionMouseEnter(e, action)}
                        onMouseLeave={handleActionMouseLeave}
                        title={isFateAltering && !canAfford ? `Cần ${ipCost} Điểm Can Thiệp` : ''}
                        style={buttonStyle}
                    >
                        {isThisButtonProcessing ? (
                            <div className="action-button-loading-state">
                                <div className="spinner spinner-md"></div>
                                <span>{loadingMessage || 'Đang xử lý...'}</span>
                            </div>
                        ) : (
                            <div className="action-button-content">
                                <div className="action-button-header">
                                    {isThisActionBeingPredicted && <div className="prediction-indicator" title="AI đang suy nghĩ trước lựa chọn này"/>}
                                    {isPredictedAndReady && <span role="img" aria-label="predicted ready" title="Hành động tức thì">⚡</span>}
                                    <span className="action-button-text">{cleanAndStripTags(action.description)}</span>
                                    {isFateAltering && (
                                        <div className={`fate-altering-cost ${canAfford ? 'affordable' : 'unaffordable'}`}>
                                            {ipCost}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </button>
                </div>
                {mainActions.length > 1 && <button className="action-slider-nav" onClick={handleNextAction}>›</button>}
            </>
        )
    };


    return (
        <footer className={`game-footer ${isEffectivelyCollapsed ? 'collapsed' : ''}`}>
             <ActionTooltip
                tooltipData={actionTooltip}
                onEntityClick={onEntityClick}
                onEntityMouseEnter={onEntityMouseEnter}
                onEntityMouseLeave={onEntityMouseLeave}
            />
            <div className={`game-footer-content ${areActionsVisible ? 'visible' : ''}`}>
                <div className="suggested-actions-container">
                    {appliedTheme === 'theme-mobile' ? renderMobileSlider() : renderDesktopActions()}
                </div>

                <div className="main-input-container">
                    <div className="custom-action-wrapper">
                        <input
                            type="text"
                            className="custom-action-input"
                            placeholder="Bạn làm gì tiếp theo?"
                            value={customAction}
                            onChange={(e) => { setCustomAction(e.target.value); setActionAnalysis(null); }}
                            onKeyPress={(e) => e.key === 'Enter' && handleActionClick({ description: customAction }, true)}
                            disabled={isProcessing}
                        />
                         <button 
                            className="analyze-button-inline" 
                            onClick={onAnalyzeAction} 
                            disabled={!customAction.trim() || isProcessing || gameState.isIntercourseScene || isAnalyzing}
                            title="Phân tích hành động (Dùng AI)"
                        >
                            {isAnalyzing ? <span className="spinner spinner-sm"></span> : '✨'}
                        </button>
                    </div>
                    <button 
                        className="send-action-button" 
                        onClick={() => handleActionClick({ description: customAction }, true)} 
                        disabled={!customAction.trim() || isProcessing}
                        title="Gửi hành động"
                    >
                        <SendIcon />
                    </button>
                    <div className="more-actions-wrapper" ref={moreActionsRef}>
                        <button
                            className="turn-mod-button more-actions-button"
                            onClick={() => setIsMoreActionsMenuOpen(prev => !prev)}
                            disabled={isProcessing}
                            title="Hành động khác"
                        >
                            <MoreIcon />
                        </button>
                        {isMoreActionsMenuOpen && (
                            <div className="more-actions-menu">
                                <button
                                    className="turn-mod-button"
                                    onClick={() => { onRetry(); setIsMoreActionsMenuOpen(false); }}
                                    disabled={isProcessing || !lastAction}
                                >
                                    <EditIcon /> Thử lại
                                </button>
                                <button
                                    className="turn-mod-button"
                                    onClick={() => { onRevertToPreviousTurn(); setIsMoreActionsMenuOpen(false); }}
                                    disabled={isProcessing || historyLength === 0}
                                >
                                    <RevertIcon /> Lùi lại
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {actionAnalysis && (
                    <div className="action-analysis-container">
                         <div className="analysis-details">
                            <strong className="benefit">Lợi:</strong> <InlineStoryRenderer text={actionAnalysis.benefit} gameState={gameState} onEntityClick={onEntityClick} onEntityMouseEnter={onEntityMouseEnter} onEntityMouseLeave={onEntityMouseLeave}/>
                            <br/>
                            <strong className="risk">Hại:</strong> <InlineStoryRenderer text={actionAnalysis.risk} gameState={gameState} onEntityClick={onEntityClick} onEntityMouseEnter={onEntityMouseEnter} onEntityMouseLeave={onEntityMouseLeave}/>
                        </div>
                        <div className="analysis-potentials">
                            <ActionPotentials benefit={actionAnalysis.benefitPotential} risk={actionAnalysis.riskPotential} />
                        </div>
                    </div>
                )}
            </div>

            {isEffectivelyCollapsed && (
                <div className="show-actions-container">
                    <button className="show-actions-button" onClick={onShowActions}>
                        <ChevronUpIcon />
                        <span>Hiện các lựa chọn</span>
                    </button>
                </div>
            )}

            {(isProcessing && !isAnalyzing) && (
                <div className="loading-indicator turn-processing-container">
                    <div className="turn-processing-progress">
                        <span className="loading-message">{loadingMessage}</span>
                        <div className="progress-bar-container"><div className="progress-bar" style={{ width: `${turnCreationProgress}%` }}></div></div>
                        <div className="progress-details">
                            <span>{turnCreationTimeElapsed.toFixed(1)}s / ~{estimatedDuration}s</span>
                        </div>
                    </div>
                </div>
            )}
            
             {error && ( 
                <div className="error-message">
                    <span>{error}</span>
                    <div className="error-actions">
                        <button onClick={onRetry} className="error-action-button fix-button" aria-label="Thử lại hành động trước"><RetryIcon/></button>
                        <button onClick={() => setError(null)} className="error-action-button close-button" aria-label="Đóng thông báo lỗi">X</button>
                    </div>
                </div>
             )}
        </footer>
    );
});