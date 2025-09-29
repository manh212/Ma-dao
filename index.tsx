
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './components/modals/modals.css';
import { MainMenu } from './components/views/MainMenu';
import { WorldCreator } from './components/views/WorldCreator';
import { GameView } from './components/views/GameView';
import { LoadingView } from './components/views/LoadingView';
import { ApiKeyModal } from './components/modals/ApiKeyModal';
import { LoadGameModal } from './components/modals/LoadGameModal';
import { SettingsModal } from './components/modals/SettingsModal';
import { ChangelogModal } from './components/modals/ChangelogModal';
import { SettingsProvider } from './components/contexts/SettingsContext';
import { ToastProvider, useToasts } from './components/contexts/ToastContext';
import { GameProvider, useGameContext } from './components/contexts/GameContext';
import { useHashNavigation } from './hooks/useHashNavigation';
import { ApiKeyManager } from './services/ApiKeyManager';
import * as db from './services/db';
import * as MemoryService from './services/MemoryService';
import { BackgroundManager } from './services/BackgroundManager';
import { generateUniqueId } from './utils/id';
import { downloadSaveFile, uploadAndProcessSaveFiles } from './utils/fileUtils';
import type { SaveFile, GameState, WorldSettings } from './types';

//================================================================
// WELCOME ANIMATION COMPONENT
//================================================================
const IntroAnimation = ({ onEnd }: { onEnd: () => void }) => {
    useEffect(() => {
        const timer = setTimeout(onEnd, 4000); // 4 seconds duration
        return () => clearTimeout(timer);
    }, [onEnd]);

    const particles = useMemo(() => Array.from({ length: 50 }), []);

    return (
        <div className="intro-animation-overlay">
            <div className="particle-container">
                {particles.map((_, i) => (
                    <div className="particle" key={i} style={{ '--i': i } as React.CSSProperties} />
                ))}
            </div>
        </div>
    );
};


//================================================================
// CONTENT COMPONENT
//================================================================
const AppContent = () => {
    const currentView = useHashNavigation();
    const { addToast } = useToasts();
    const { gameState, dispatch } = useGameContext();
    
    const [showApiKeyModal, setShowApiKeyModal] = useState(false);
    const [isApiKeyModalForced, setIsApiKeyModalForced] = useState(false);
    const [showIntroAnimation, setShowIntroAnimation] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [showChangelogModal, setShowChangelogModal] = useState(false);
    const [apiConfigs, setApiConfigs] = useState('[]');
    const [showLoadGameModal, setShowLoadGameModal] = useState(false);
    const [saves, setSaves] = useState<SaveFile[]>([]);
    const [apiStatus, setApiStatus] = useState('Đang kiểm tra trạng thái API...');
    const [apiRequestCount, setApiRequestCount] = useState(0);
    const [isLoadingGame, setIsLoadingGame] = useState(false);
    const [saveDataToLoad, setSaveDataToLoad] = useState<SaveFile | null>(null);

    const [menuBackgroundUrl, setMenuBackgroundUrl] = useState('');
    const [gameBackgroundUrl, setGameBackgroundUrl] = useState('');

    const navigate = (view: string) => {
        window.location.hash = view;
    };

    const updateBackgrounds = useCallback(() => {
        BackgroundManager.updateBackgrounds({
            setMenuBg: setMenuBackgroundUrl,
            setGameBg: setGameBackgroundUrl
        });
    }, [setMenuBackgroundUrl, setGameBackgroundUrl]);

    useEffect(() => {
        updateBackgrounds();
        window.addEventListener('resize', updateBackgrounds);
        window.addEventListener('backgroundChange', updateBackgrounds);

        return () => {
            window.removeEventListener('resize', updateBackgrounds);
            window.removeEventListener('backgroundChange', updateBackgrounds);
        };
    }, [updateBackgrounds]);

    useEffect(() => {
        if (currentView === 'game' && !gameState && !isLoadingGame) {
            navigate('menu');
        }
    }, [currentView, gameState, isLoadingGame]);
    
    // Robust Game Loading Logic
    const handleLoadGame = useCallback((saveData: SaveFile) => {
        if (!saveData || !saveData.gameState) {
            console.error('Tệp lưu không hợp lệ. Dữ liệu nhận được:', saveData);
            addToast("Tệp lưu không hợp lệ hoặc bị hỏng.", 'error');
            return;
        }
        setShowLoadGameModal(false);
        setSaveDataToLoad(saveData);
        // This state change will trigger the useEffect below to show the loading screen.
    }, [addToast]);
    
    useEffect(() => {
        // This effect ONLY runs when we decide to start loading a game.
        // It ensures the LoadingView is rendered BEFORE the heavy processing starts.
        if (saveDataToLoad) {
            setIsLoadingGame(true);
        }
    }, [saveDataToLoad]);

    useEffect(() => {
        // This effect runs AFTER the re-render with the loading screen is complete.
        if (isLoadingGame && saveDataToLoad) {
            const processLoading = () => {
                dispatch({ type: 'LOAD_GAME', payload: { gameState: saveDataToLoad.gameState, worldSettings: saveDataToLoad.worldSettings } });
                setSaveDataToLoad(null);
                setIsLoadingGame(false);
                navigate('game');
            };
            // Use a minimal timeout to yield to the browser's render queue, ensuring the loading screen is painted.
            const timer = setTimeout(processLoading, 10);
            return () => clearTimeout(timer);
        }
    }, [isLoadingGame, saveDataToLoad, dispatch]);
    // End of Robust Game Loading Logic

    useEffect(() => {
        if (gameState && currentView === 'create') {
            navigate('game');
        }
    }, [gameState, currentView]);
    
    const incrementApiRequestCount = useCallback(() => {
        setApiRequestCount(prevCount => {
            const newCount = prevCount + 1;
            try {
                localStorage.setItem('apiRequestCount', String(newCount));
            } catch (error) {
                console.warn("Could not save API request count to localStorage:", error);
            }
            return newCount;
        });
    }, []);

    const getApiStatusText = useCallback(() => {
        const hasKey = !!ApiKeyManager.getKey();
        if (hasKey) {
            const geminiKeys = ApiKeyManager.keys;
            const currentIndex = ApiKeyManager.getCurrentIndex();
            return `Đang dùng API Key Gemini ${currentIndex + 1}/${geminiKeys.length}.`;
        } else {
            return 'Vui lòng thiết lập API Key để chơi.';
        }
    }, []);

    const handleApiKeyUpdate = useCallback(() => {
        const statusText = getApiStatusText();
        setApiStatus(statusText);
        addToast(statusText, 'info');
    }, [addToast, getApiStatusText]);

    const refreshApiStatus = useCallback(() => {
        const statusText = getApiStatusText();
        setApiStatus(statusText);
    }, [getApiStatusText]);

    useEffect(() => {
        if (currentView === 'menu') {
            refreshApiStatus();
        }
    }, [currentView, refreshApiStatus]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (!ApiKeyManager.getKey()) {
                addToast('Chào mừng! Vui lòng thiết lập API Key để bắt đầu.', 'info');
                setShowApiKeyModal(true);
                setIsApiKeyModalForced(true);
            }
        }, 100);

        return () => clearTimeout(timer);
    }, [addToast]);

    useEffect(() => {
        const migrateData = async () => {
            const migrationKey = 'db_migrated_v1';
            if (localStorage.getItem(migrationKey)) {
                return;
            }

            console.log("Starting migration from localStorage to IndexedDB...");
            addToast("Đang nâng cấp hệ thống lưu trữ...", 'info');

            try {
                const existingSavesRaw = localStorage.getItem('game_saves');
                if (existingSavesRaw) {
                    const existingSaves: SaveFile[] = JSON.parse(existingSavesRaw);
                    if (Array.isArray(existingSaves) && existingSaves.length > 0) {
                        await Promise.all(existingSaves.map(save => db.addOrUpdateSave(save)));
                        console.log(`Migrated ${existingSaves.length} saves.`);
                    }
                }
                localStorage.setItem(migrationKey, 'true');
                addToast("Nâng cấp hoàn tất!", 'success');
                console.log("Migration complete.");
            } catch (error) {
                console.error("Migration failed:", error);
                addToast("Nâng cấp hệ thống lưu trữ thất bại.", 'error');
            }
        };

        const loadApiConfigs = () => {
            const storedConfigs = localStorage.getItem('api_configs') || '[]';
            setApiConfigs(storedConfigs);
        };
        
        const loadApiRequestCount = () => {
            try {
                const storedCount = localStorage.getItem('apiRequestCount');
                setApiRequestCount(storedCount ? parseInt(storedCount, 10) : 0);
            } catch (error) {
                console.warn("Could not load API request count from localStorage:", error);
                setApiRequestCount(0);
            }
        };

        migrateData();
        handleApiKeyUpdate();
        loadApiConfigs();
        loadApiRequestCount();
    }, [addToast, handleApiKeyUpdate]);
    
    const handleSaveApiKeys = (configsJson: string) => {
        try {
            JSON.parse(configsJson);
            localStorage.setItem('api_configs', configsJson);
            setApiConfigs(configsJson);
            ApiKeyManager.loadKeys();
            handleApiKeyUpdate();
        } catch (e) {
            addToast('Lỗi khi lưu cấu hình API.', 'error');
        }
    };
    
    const handleDeleteAllApiKeys = useCallback(() => {
        localStorage.removeItem('api_configs');
        ApiKeyManager.loadKeys();
        setApiConfigs('[]');
        handleApiKeyUpdate();
        addToast("Đã xóa toàn bộ API Key đã lưu.", 'success');
    }, [addToast, handleApiKeyUpdate]);

    const handleSaveGame = async (currentGameState: GameState, currentWorldSettings: WorldSettings) => {
        try {
            const isNewGame = !currentGameState.saveId;
            const saveId = currentGameState.saveId || generateUniqueId('save');
            
            let slotNumber: number | undefined;
            if (isNewGame) {
                const allSaves = await db.getAllSaves();
                const usedSlots = new Set(allSaves.map(s => s.slotNumber).filter(Boolean));
                let nextSlot = 1;
                while (usedSlots.has(nextSlot) && nextSlot <= 99) {
                    nextSlot++;
                }
                if (nextSlot <= 99) {
                    slotNumber = nextSlot;
                } else {
                    addToast("Đã hết slot lưu được đánh số thứ tự.", 'warning');
                }
            } else {
                const existingSave = await db.getSaveById(saveId);
                slotNumber = existingSave?.slotNumber;
            }

            const gameStateToSave = { ...currentGameState, history: [], saveId };
            const saveFile: SaveFile = {
                id: saveId,
                name: currentGameState.title,
                timestamp: new Date().toISOString(),
                gameState: gameStateToSave,
                worldSettings: currentWorldSettings,
                slotNumber: slotNumber,
            };

            await db.addOrUpdateSave(saveFile);

            if (isNewGame) {
                dispatch({ type: 'UPDATE_SAVE_ID', payload: saveId });
            }
        } catch (error) {
            console.error("Lỗi khi lưu game vào DB:", error);
            addToast("Đã xảy ra lỗi khi lưu game.", 'error');
        }
    };

    const handleCreateWorld = (newGameState: GameState, newWorldSettings: WorldSettings) => {
        dispatch({ type: 'LOAD_GAME', payload: { gameState: newGameState, worldSettings: newWorldSettings } });
        handleSaveGame(newGameState, newWorldSettings);
        addToast('Thế giới đã được tạo và lưu thành công!', 'success');
    };

    const handleDeleteGame = async (saveId: string) => {
        try {
            await db.deleteSave(saveId);
            await MemoryService.deleteMemoriesForSave(saveId);
            setSaves(prevSaves => prevSaves.filter(s => s.id !== saveId));

            if (gameState && gameState.saveId === saveId) {
                dispatch({ type: 'CLEAR_GAME' });
            }

            addToast("Đã xóa tệp lưu và các dữ liệu liên quan thành công.", "success");
        } catch (error) {
            console.error("Lỗi khi xóa tệp lưu từ DB:", error);
            addToast("Đã xảy ra lỗi khi xóa tệp lưu.", "error");
        }
    };
    
    const handleDownloadGame = useCallback(async (saveFile: SaveFile) => {
        await downloadSaveFile(saveFile, addToast);
    }, [addToast]);

    const handleOpenLoadGameModal = async () => {
        try {
            const allSaves = await db.getAllSaves();
            setSaves(allSaves);
        } catch (error) {
            console.error("Failed to load save games from DB:", error);
            addToast("Không thể tải các tệp lưu từ cơ sở dữ liệu.", 'error');
            setSaves([]);
        }
        setShowLoadGameModal(true);
    };
    
    const handleUploadSaves = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
        const newSaves = await uploadAndProcessSaveFiles(event, saves, addToast);
        if (newSaves) {
            setSaves(newSaves);
        }
    }, [saves, addToast]);
    
    const handleBackFromCreator = () => {
        navigate('menu');
    };

    const renderView = () => {
        if (isLoadingGame) {
            return <LoadingView saveData={saveDataToLoad} />;
        }
        
        if (currentView === 'game' && !gameState) {
             return null;
        }

        switch (currentView) {
            case 'create':
                return <WorldCreator onBack={handleBackFromCreator} onCreateWorld={handleCreateWorld} incrementApiRequestCount={incrementApiRequestCount} />;
            case 'game':
                return <GameView
                    onNavigateToMenu={() => {
                        dispatch({ type: 'CLEAR_GAME' });
                        navigate('menu');
                    }}
                    onSaveGame={handleSaveGame}
                    incrementApiRequestCount={incrementApiRequestCount}
                    apiRequestCount={apiRequestCount}
                />;
            case 'menu':
            default:
                return <MainMenu 
                    onNavigate={(view) => {
                        const hasKey = !!ApiKeyManager.getKey();
                        if (view === 'create' && !hasKey) {
                            addToast('Vui lòng thiết lập API Key của bạn để tạo thế giới.', 'warning');
                            setShowApiKeyModal(true);
                            setIsApiKeyModalForced(true);
                            return;
                        }
                        
                        if (view === 'load') {
                            handleOpenLoadGameModal();
                        } else {
                            navigate(view);
                        }
                    }} 
                    onOpenApiKeyModal={() => setShowApiKeyModal(true)} 
                    onOpenSettingsModal={() => setShowSettingsModal(true)}
                    onOpenChangelogModal={() => setShowChangelogModal(true)}
                    apiStatus={apiStatus} 
                />;
        }
    };

    const viewClasses: { [key: string]: string } = { menu: 'menu-view', create: 'creator-view', game: 'game-view', loading: 'loading-view' };
    const backgroundUrl = currentView === 'menu' ? menuBackgroundUrl : gameBackgroundUrl;

    return (
        <>
            {showIntroAnimation && <IntroAnimation onEnd={() => setShowIntroAnimation(false)} />}
            <div className={`app-container ${viewClasses[currentView] || 'menu-view'} ${showIntroAnimation ? 'hidden' : ''}`}>
                {backgroundUrl && (
                    <>
                        <div 
                            key={backgroundUrl}
                            className="app-background-image" 
                            style={{ backgroundImage: `url(${backgroundUrl})` }}
                        ></div>
                        <div className="app-background-overlay"></div>
                    </>
                )}
                {renderView()}
                {showApiKeyModal && <ApiKeyModal 
                    initialConfigs={apiConfigs} 
                    onClose={() => {
                        ApiKeyManager.loadKeys();
                        if (ApiKeyManager.getKey()) {
                             if (isApiKeyModalForced) {
                                setShowIntroAnimation(true);
                            }
                            setShowApiKeyModal(false);
                            setIsApiKeyModalForced(false);
                        } else if (!isApiKeyModalForced) {
                            setShowApiKeyModal(false);
                        }
                        else {
                            addToast('Vui lòng cung cấp ít nhất một API Key của Google Gemini để tiếp tục.', 'warning');
                        }
                    }} 
                    onSave={handleSaveApiKeys} 
                    incrementApiRequestCount={incrementApiRequestCount}
                    onDeleteAll={handleDeleteAllApiKeys}
                />}
                {showLoadGameModal && <LoadGameModal 
                    saves={saves} 
                    onClose={() => setShowLoadGameModal(false)} 
                    onLoad={handleLoadGame} 
                    onDelete={handleDeleteGame}
                    onUpload={handleUploadSaves}
                    onDownload={handleDownloadGame}
                />}
                {showSettingsModal && <SettingsModal onClose={() => setShowSettingsModal(false)} />}
                {showChangelogModal && <ChangelogModal onClose={() => setShowChangelogModal(false)} />}
            </div>
        </>
    );
};

//================================================================
// ROOT APP COMPONENT
//================================================================
const App = () => (
    <ToastProvider>
        <SettingsProvider>
            <GameProvider>
                <AppContent />
            </GameProvider>
        </SettingsProvider>
    </ToastProvider>
);

//================================================================
// RENDERER
//================================================================
const container = document.getElementById('root');
if (container) {
    const root = createRoot(container);
    root.render(<React.StrictMode><App /></React.StrictMode>);
}
