/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { generateUniqueId } from '../../utils/id';
import { useModalAccessibility } from '../../hooks/useModalAccessibility';
import { GEMINI_FLASH, API_KEY_VALIDATION_PROMPT } from '../../constants/aiConstants';
import './ApiKeyModal.css';

interface ApiKeyModalProps {
    initialConfigs: string;
    onClose: () => void;
    onSave: (configsJson: string) => void;
    incrementApiRequestCount: () => void;
    onDeleteAll: () => void;
}

type KeyStatus = 'unchecked' | 'checking' | 'valid' | 'invalid' | 'quota_exceeded';

interface ApiConfig {
    id: string;
    key: string;
}

interface KeyStatusInfo {
    status: KeyStatus;
    message?: string;
}

const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24" fill="currentColor"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
);

const EyeSlashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24" fill="currentColor"><path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/></svg>
);


export const ApiKeyModal = ({ initialConfigs, onClose, onSave, incrementApiRequestCount, onDeleteAll }: ApiKeyModalProps) => {
    const [configs, setConfigs] = useState<ApiConfig[]>([]);
    const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
    const [keyStatuses, setKeyStatuses] = useState<Map<string, KeyStatusInfo>>(new Map());
    const [isChecking, setIsChecking] = useState(false);
    const [visibleKeys, setVisibleKeys] = useState(new Set<string>());
    const modalRef = useRef<HTMLDivElement>(null);
    useModalAccessibility(true, modalRef);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                handleCloseAndSave();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose]);
    
    useEffect(() => {
        let parsedConfigs: Omit<ApiConfig, 'id'>[] = [];
        try {
            const parsed = JSON.parse(initialConfigs);
            if (Array.isArray(parsed)) {
                parsedConfigs = parsed;
            }
        } catch (e) { /* ignore malformed JSON */ }
        
        const configsWithIds = parsedConfigs.map(c => ({
            ...c,
            id: generateUniqueId('cfg'),
        }));

        if (configsWithIds.length === 0) {
            setConfigs([{ id: generateUniqueId('cfg'), key: '' }]);
        } else {
            setConfigs(configsWithIds);
        }

        const initialStatuses = new Map<string, KeyStatusInfo>();
        configsWithIds.forEach(c => {
            initialStatuses.set(c.id, { status: 'unchecked' });
        });
        setKeyStatuses(initialStatuses);
    }, [initialConfigs]);

    const handleCloseAndSave = () => {
        const validConfigs = configs
            .map(({ id, ...rest }) => rest) // remove temporary id before saving
            .filter(c => c.key.trim() !== '');
        onSave(JSON.stringify(validConfigs));
        onClose();
    };

    const handleKeyChange = (id: string, value: string) => {
        setConfigs(prev => prev.map(c => c.id === id ? { ...c, key: value } : c));
        setKeyStatuses(prev => new Map(prev).set(id, { status: 'unchecked' }));
    };
    
    const handlePaste = (e: React.ClipboardEvent, configId: string) => {
        e.preventDefault();
        const pastedText = e.clipboardData.getData('text');
        const pastedKeys = pastedText.split(/[\n\s,]+/).map(k => k.trim()).filter(Boolean);

        if (pastedKeys.length === 0) return;

        setConfigs(prev => {
            const targetIndex = prev.findIndex(c => c.id === configId);
            if (targetIndex === -1) return prev;

            const newConfigs = [...prev];
            newConfigs[targetIndex] = { ...newConfigs[targetIndex], key: pastedKeys[0] };

            const newItems: ApiConfig[] = pastedKeys.slice(1).map(key => ({
                id: generateUniqueId('pasted-cfg'),
                key: key,
            }));

            newConfigs.splice(targetIndex + 1, 0, ...newItems);
            
            return newConfigs;
        });
    };

    const handleDeleteKey = (idToDelete: string) => {
        const newConfigs = configs.filter(c => c.id !== idToDelete);
        if (newConfigs.length === 0) {
            setConfigs([{ id: generateUniqueId('cfg'), key: '' }]);
        } else {
            setConfigs(newConfigs);
        }
    };

    const handleAddKey = () => {
        setConfigs([...configs, { id: generateUniqueId('cfg'), key: '' }]);
    };
    
    const handleDeleteAll = () => {
        if (window.confirm('Bạn có chắc chắn muốn xóa tất cả các API Key đã lưu không? Hành động này không thể hoàn tác.')) {
            onDeleteAll();
        }
    };

    const toggleKeyVisibility = (id: string) => {
        setVisibleKeys(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const handleCheckKeys = async () => {
        setIsChecking(true);
        const statusesToUpdate = new Map(keyStatuses);
        configs.forEach(c => {
            if (c.key.trim()) {
                statusesToUpdate.set(c.id, { status: 'checking', message: 'Đang kiểm tra...' });
            }
        });
        setKeyStatuses(statusesToUpdate);

        const checkPromises = configs.map(async (config) => {
            if (!config.key.trim()) {
                return { id: config.id, statusInfo: { status: 'unchecked' as KeyStatus } };
            }
            incrementApiRequestCount(); // Count each check as a request
            try {
                const ai = new GoogleGenAI({ apiKey: config.key });
                const response = await ai.models.generateContent({
                    model: GEMINI_FLASH,
                    contents: API_KEY_VALIDATION_PROMPT,
                    config: { thinkingConfig: { thinkingBudget: 0 } },
                });
                
                if (response && response.candidates && response.candidates.length > 0) {
                    return { id: config.id, statusInfo: { status: 'valid' as KeyStatus, message: 'Hợp lệ' }};
                } else {
                    return { id: config.id, statusInfo: { status: 'invalid' as KeyStatus, message: 'Phản hồi không hợp lệ.' }};
                }
            } catch (error: any) {
                const errorMessage = error.message?.toLowerCase() || '';
                if (errorMessage.includes('api key not valid') || errorMessage.includes('permission denied')) {
                     return { id: config.id, statusInfo: { status: 'invalid' as KeyStatus, message: 'API Key không hợp lệ.' }};
                }
                if (errorMessage.includes('quota') || errorMessage.includes('rate limit')) {
                    return { id: config.id, statusInfo: { status: 'quota_exceeded' as KeyStatus, message: 'Hết hạn mức (thử lại sau).' }};
                }
                if (errorMessage.includes('billing')) {
                    return { id: config.id, statusInfo: { status: 'invalid' as KeyStatus, message: 'Lỗi thanh toán.' }};
                }
                return { id: config.id, statusInfo: { status: 'invalid' as KeyStatus, message: 'Lỗi không xác định.' }};
            }
        });

        const results = await Promise.all(checkPromises);
        const finalStatuses = new Map<string, KeyStatusInfo>();
        results.forEach(res => finalStatuses.set(res.id, res.statusInfo));
        setKeyStatuses(finalStatuses);
        setIsChecking(false);
    };

    return (
        <div className="modal-overlay" onClick={handleCloseAndSave}>
            <div 
                ref={modalRef}
                className="modal-content api-key-modal" 
                onClick={e => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="api-key-modal-title"
            >
                <header className="modal-header">
                    <h3 id="api-key-modal-title">Thiết lập API Key Gemini</h3>
                    <button onClick={handleCloseAndSave} className="modal-close-button" aria-label="Đóng">×</button>
                </header>
                <div className="modal-body api-key-modal-body">
                    <section className="api-key-section">
                        <ul className="api-key-list">
                            {configs.map((config, index) => {
                                const statusInfo = keyStatuses.get(config.id) || { status: 'unchecked' };
                                return (
                                <li key={config.id} className="api-key-list-item">
                                    <span className="api-key-index">{index + 1}.</span>
                                    <div className={`api-key-input-wrapper ${focusedIndex === index ? 'selected' : ''}`}>
                                        <input
                                            type={visibleKeys.has(config.id) ? 'text' : 'password'}
                                            className="api-key-input"
                                            value={config.key}
                                            onChange={(e) => handleKeyChange(config.id, e.target.value)}
                                            onPaste={(e) => handlePaste(e, config.id)}
                                            onFocus={() => setFocusedIndex(index)}
                                            onBlur={() => setFocusedIndex(null)}
                                            placeholder="Dán API Key Gemini của bạn tại đây..."
                                            aria-label={`Khóa API ${index + 1}`}
                                        />
                                        <button
                                            type="button"
                                            className="api-key-visibility-btn"
                                            onClick={() => toggleKeyVisibility(config.id)}
                                            aria-label={visibleKeys.has(config.id) ? `Ẩn khóa API ${index + 1}` : `Hiện khóa API ${index + 1}`}
                                        >
                                            {visibleKeys.has(config.id) ? <EyeSlashIcon /> : <EyeIcon />}
                                        </button>
                                    </div>
                                    <div className="api-key-status-wrapper">
                                        {statusInfo.status === 'checking' ? (
                                            <div className="spinner spinner-sm"></div>
                                        ) : (
                                            <span className={`api-key-status-indicator ${statusInfo.status}`}></span>
                                        )}
                                        <span className={`api-key-status-message ${statusInfo.status}`}>{statusInfo.message}</span>
                                    </div>
                                    <button 
                                        className="api-key-delete-btn" 
                                        onClick={() => handleDeleteKey(config.id)}
                                        aria-label={`Xóa khóa API ${index + 1}`}
                                    >
                                        ×
                                    </button>
                                </li>
                                );
                            })}
                        </ul>
                        <button 
                            className="api-key-add-btn" 
                            onClick={handleAddKey}
                        >
                            + Thêm khóa API
                        </button>
                    </section>
                </div>
                <footer className="api-key-footer">
                    <button
                        className="api-key-delete-all-btn"
                        onClick={handleDeleteAll}
                        disabled={configs.length === 0 || (configs.length === 1 && configs[0].key.trim() === '')}
                        title="Xóa tất cả các khóa đã lưu trong trình duyệt này."
                    >
                        Xóa Toàn Bộ
                    </button>
                    <div style={{display: 'flex', gap: '1rem'}}>
                        <button 
                            className="api-key-close-btn" 
                            onClick={handleCheckKeys} 
                            disabled={isChecking || configs.every(c => !c.key.trim())}
                        >
                            {isChecking ? 'Đang kiểm tra...' : 'Kiểm tra khóa'}
                        </button>
                        <button className="api-key-check-btn" onClick={handleCloseAndSave}>
                            Lưu & Đóng
                        </button>
                    </div>
                </footer>
            </div>
        </div>
    );
};