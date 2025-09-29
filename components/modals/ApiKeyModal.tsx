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
    addDebugPrompt: (content: string, purpose: string) => void;
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

export const ApiKeyModal = ({ initialConfigs, onClose, onSave, incrementApiRequestCount, onDeleteAll, addDebugPrompt }: ApiKeyModalProps) => {
    const [configs, setConfigs] = useState<ApiConfig[]>([]);
    const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
    const [keyStatuses, setKeyStatuses] = useState<Map<string, KeyStatusInfo>>(new Map());
    const [isChecking, setIsChecking] = useState(false);
    const [visibleKeys, setVisibleKeys] = useState(new Set<string>());
    const modalRef = useRef<HTMLDivElement>(null);
    useModalAccessibility(true, modalRef);

    const handleCloseAndSave = () => {
        const validConfigs = configs
            .map(({ id, ...rest }) => rest) // remove temporary id before saving
            .filter(c => c.key.trim() !== '');
        onSave(JSON.stringify(validConfigs));
        onClose();
    };

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
    }, [onClose, handleCloseAndSave]);
    
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

        const checkPromises = configs.map(async (config, index) => {
            if (!config.key.trim()) {
                return { id: config.id, statusInfo: { status: 'unchecked' as KeyStatus } };
            }
            incrementApiRequestCount(); // Count each check as a request
            addDebugPrompt(API_KEY_VALIDATION_PROMPT, `Kiểm tra API Key #${index + 1}`);
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
                                            {visibleKeys.has(config.id) ? '[Ẩn]' : '[Hiện]'}
                                        </button>
                                    </div>
                                    <div className="api-key-status-wrapper">
                                        {statusInfo.status === 'checking' ? (
                                            <span className="spinner spinner-sm"></span>
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
                            className="api-key-check-btn" 
                            onClick={handleCheckKeys} 
                            disabled={isChecking || configs.every(c => !c.key.trim())}
                        >
                            {isChecking ? 'Đang kiểm tra...' : 'Kiểm Tra Toàn Bộ'}
                        </button>
                        <button className="api-key-close-btn" onClick={handleCloseAndSave}>Lưu & Đóng</button>
                    </div>
                </footer>
            </div>
        </div>
    );
};