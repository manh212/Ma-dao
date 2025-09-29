/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { FormField } from '../ui/FormField';
import { ToggleSwitch } from '../ui/ToggleSwitch';
import { useSettings } from '../contexts/SettingsContext';
import { useGameContext } from '../contexts/GameContext';
import { useToasts } from '../contexts/ToastContext';
import { useModalAccessibility } from '../../hooks/useModalAccessibility';
import * as db from '../../services/db';
import { generateUniqueId } from '../../utils/id';
import { BackgroundManager } from '../../services/BackgroundManager';
import { STORY_LENGTH_OPTIONS, DIFFICULTY_LEVELS } from '../../constants/gameConstants';
import type { AppSettings, GalleryImage } from '../../types';
import './SettingsModal.css';

interface SettingsModalProps {
    onClose: () => void;
}

const MAX_BG_FILE_SIZE_MB = 2;

// SVG Icons for Navigation
const AppearanceIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>;
const ExperienceIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 17.5 18 14l-5-5-5 5 3.5 3.5M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/></svg>;
const WorldIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20M2 12h20"/></svg>;
const BackgroundIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>;
const PlaceholderIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>;

const BackgroundCard = ({ title, previewUrl, onSet, onClear, setLabel, clearLabel }: { title: string; previewUrl: string; onSet: () => void; onClear: () => void; setLabel: string; clearLabel: string; }) => (
    <div className="background-card">
        <div className="background-preview">
            {previewUrl ? <img src={previewUrl} alt={`${title} preview`} /> : <div className="background-placeholder"><PlaceholderIcon/></div>}
        </div>
        <div className="background-info">
            <h5>{title}</h5>
            <div className="background-actions">
                <button className="wc-button" onClick={onSet} aria-label={setLabel}>Thay Đổi</button>
                <button className="wc-button button-clear" onClick={onClear} disabled={!previewUrl} aria-label={clearLabel}>Xóa</button>
            </div>
        </div>
    </div>
);


export const SettingsModal = ({ onClose }: SettingsModalProps) => {
    const { settings, updateSetting } = useSettings();
    const { gameState, worldSettings, dispatch: gameDispatch } = useGameContext();
    const { addToast } = useToasts();
    const modalRef = useRef<HTMLDivElement>(null);
    const backgroundInputRef = useRef<HTMLInputElement>(null);
    const [bgTypeToSet, setBgTypeToSet] = useState<'menu' | 'game' | null>(null);
    const [activeTab, setActiveTab] = useState('experience');

    const [menuBgUrl, setMenuBgUrl] = useState('');
    const [gameBgUrl, setGameBgUrl] = useState('');

    useModalAccessibility(true, modalRef);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose]);

    useEffect(() => {
        BackgroundManager.updateBackgrounds({
            setMenuBg: setMenuBgUrl,
            setGameBg: setGameBgUrl,
        });
    }, []);

    const turnCount = gameState?.turns?.length || 0;
    const totalTokenCount = gameState?.totalTokenCount || 0;
    const latestTurn = gameState?.turns?.[gameState.turns.length - 1];
    const latestTurnTokens = latestTurn?.tokenCount || 0;

    const handleSettingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        if (type === 'checkbox') {
            updateSetting(name as keyof AppSettings, checked);
            return;
        }
        if (name === 'fontSize' || name === 'lineHeight' || name === 'textWidth') {
            updateSetting(name, parseFloat(value));
        } else {
            updateSetting(name as keyof AppSettings, value);
        }
    };

    const handleWorldSettingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        const payloadValue = type === 'checkbox' ? checked : value;
    
        gameDispatch({
            type: 'UPDATE_WORLD_SETTINGS',
            payload: { [name]: payloadValue }
        });
        addToast('Thay đổi sẽ được áp dụng ở lượt tiếp theo.', 'info');
    };

    const handleSetBackgroundClick = (type: 'menu' | 'game') => {
        setBgTypeToSet(type);
        backgroundInputRef.current?.click();
    };
    
    const handleBackgroundFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !bgTypeToSet) return;
    
        if (file.size > MAX_BG_FILE_SIZE_MB * 1024 * 1024) {
            addToast(`Tệp quá lớn (tối đa ${MAX_BG_FILE_SIZE_MB}MB).`, 'error');
            return;
        }
    
        try {
            const dataUrl = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = e => resolve(e.target?.result as string);
                reader.onerror = e => reject(e);
                reader.readAsDataURL(file);
            });
    
            const newImage: GalleryImage = {
                id: generateUniqueId('bg-img'),
                name: `background-${bgTypeToSet}-${Date.now()}`,
                dataUrl,
                description: `Ảnh nền cho ${bgTypeToSet}`,
                tags: ['background', bgTypeToSet],
                category: 'Background',
                subCategory: bgTypeToSet === 'menu' ? 'Menu' : 'Game',
            };
    
            await db.addOrUpdateImage(newImage);
    
            if (bgTypeToSet === 'menu') {
                BackgroundManager.set('menu_desktop', newImage.id);
                BackgroundManager.set('menu_mobile', newImage.id);
                setMenuBgUrl(dataUrl);
                addToast('Đã cập nhật ảnh nền Menu.', 'success');
            } else {
                BackgroundManager.set('game_desktop', newImage.id);
                BackgroundManager.set('game_mobile', newImage.id);
                setGameBgUrl(dataUrl);
                addToast('Đã cập nhật ảnh nền Game.', 'success');
            }
        } catch (e) {
            addToast('Tải lên và đặt ảnh nền thất bại.', 'error');
            console.error(e);
        } finally {
            if (event.target) event.target.value = '';
            setBgTypeToSet(null);
        }
    };
    
    const handleClearMenuBackground = () => {
        BackgroundManager.clear('menu');
        setMenuBgUrl('');
        addToast('Đã xóa ảnh nền Menu.', 'info');
    };
    
    const handleClearGameBackground = () => {
        BackgroundManager.clear('game');
        setGameBgUrl('');
        addToast('Đã xóa ảnh nền Game.', 'info');
    };

    const renderPanel = () => {
        switch(activeTab) {
            case 'experience':
                return (
                    <div className="settings-panel">
                        <h4>Trải Nghiệm Chơi</h4>
                        <FormField label="Độ dài diễn biến AI" htmlFor="settings-story-length">
                            <div className="select-wrapper"><select id="settings-story-length" name="storyLength" value={settings.storyLength || 'standard'} onChange={handleSettingChange}>{Object.entries(STORY_LENGTH_OPTIONS).map(([key, label]) => (<option key={key} value={key}>{label}</option>))}</select></div>
                        </FormField>
                        <FormField label="Chế độ xử lý của AI" htmlFor="settings-ai-processing-mode">
                            <div className="select-wrapper"><select id="settings-ai-processing-mode" name="aiProcessingMode" value={settings.aiProcessingMode || 'quality'} onChange={handleSettingChange}>
                                <option value="speed">Tốc Độ (AI xử lý nhanh, tập trung vào kết quả chính)</option>
                                <option value="quality">Cân Bằng (Cân bằng giữa tốc độ và độ sâu của thế giới)</option>
                                <option value="max_quality">Sâu Sắc (AI suy nghĩ kỹ, tạo hệ quả phức tạp, chậm hơn)</option>
                            </select></div>
                        </FormField>
                        <ToggleSwitch id="autoPinMemory" label="Tự động ghim ký ức" description="Ghim lại ký ức được AI tạo ra sau mỗi lượt chơi." name="autoPinMemory" checked={settings.autoPinMemory || false} onChange={handleSettingChange} />
                        <ToggleSwitch id="enableCheats" label="Bật chế độ Cheat" description="Lựa chọn nhập vào ô sẽ có 100% thành công." name="enableCheats" checked={settings.enableCheats || false} onChange={handleSettingChange} />
                    </div>
                );
            case 'world':
                return gameState && (
                     <div className="settings-panel">
                        <h4>Cài Đặt Thế Giới</h4>
                        <FormField label="Văn phong:" htmlFor="settings-writing-style">
                            <div className="select-wrapper"><select id="settings-writing-style" name="writingStyle" value={worldSettings.writingStyle} onChange={handleWorldSettingChange}><option value="default">Chủ nghĩa Hiện thực (Thô & Chi tiết)</option><option value="no_segg_polite">Không có segg, rất lịch sự</option></select></div>
                        </FormField>
                        <FormField label="Ngôi kể:" htmlFor="settings-narrative-voice">
                            <div className="select-wrapper"><select id="settings-narrative-voice" name="narrativeVoice" value={worldSettings.narrativeVoice} onChange={handleWorldSettingChange}><option value="first">Ngôi thứ nhất ("Tôi")</option><option value="second">Ngôi thứ hai ("Bạn")</option><option value="third_limited">Ngôi thứ ba Giới hạn</option><option value="third_omniscient">Ngôi thứ ba Toàn tri</option></select></div>
                        </FormField>
                        <FormField label="Độ khó:" htmlFor="settings-difficulty">
                            <div className="select-wrapper"><select id="settings-difficulty" name="difficulty" value={worldSettings.difficulty} onChange={handleWorldSettingChange}>{Object.entries(DIFFICULTY_LEVELS).map(([key, value]) => (<option key={key} value={key}>{value.label}</option>))}</select></div>
                        </FormField>
                        <ToggleSwitch id="allow18Plus" label="Cho phép nội dung 18+" description="Cho phép các chủ đề và mô tả người lớn, bao gồm cả nội dung khiêu dâm." name="allow18Plus" checked={worldSettings.allow18Plus} onChange={handleWorldSettingChange} />
                    </div>
                );
            case 'background':
                 return (
                    <div className="settings-panel">
                        <h4>Tùy Chỉnh Ảnh Nền</h4>
                        <input type="file" ref={backgroundInputRef} onChange={handleBackgroundFileChange} style={{ display: 'none' }} accept="image/png, image/jpeg, image/webp" />
                        <div className="background-cards-container">
                            <BackgroundCard 
                                title="Ảnh Nền Menu Chính" 
                                previewUrl={menuBgUrl} 
                                onSet={() => handleSetBackgroundClick('menu')} 
                                onClear={handleClearMenuBackground}
                                setLabel="Thay đổi ảnh nền menu chính"
                                clearLabel="Xóa ảnh nền menu chính"
                            />
                            <BackgroundCard 
                                title="Ảnh Nền Trong Game" 
                                previewUrl={gameBgUrl} 
                                onSet={() => handleSetBackgroundClick('game')} 
                                onClear={handleClearGameBackground}
                                setLabel="Thay đổi ảnh nền trong game"
                                clearLabel="Xóa ảnh nền trong game"
                            />
                        </div>
                    </div>
                );
            default: return null;
        }
    };

    return (
        <>
            <div className="modal-overlay" onClick={onClose}>
                <div 
                    ref={modalRef}
                    className="modal-content settings-modal-content" 
                    onClick={e => e.stopPropagation()}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="settings-modal-title"
                >
                    <header className="modal-header">
                        <h3 id="settings-modal-title">Cài Đặt</h3>
                        <button onClick={onClose} className="modal-close-button" aria-label="Đóng bảng cài đặt">X</button>
                    </header>
                    <div className="settings-layout">
                        <nav className="settings-sidebar" aria-label="Menu cài đặt">
                            <button aria-label="Cài đặt Trải nghiệm" className={`settings-nav-button ${activeTab === 'experience' ? 'active' : ''}`} onClick={() => setActiveTab('experience')}><ExperienceIcon/> <span>Trải Nghiệm</span></button>
                            {gameState && <button aria-label="Cài đặt Thế giới" className={`settings-nav-button ${activeTab === 'world' ? 'active' : ''}`} onClick={() => setActiveTab('world')}><WorldIcon/> <span>Thế Giới</span></button>}
                            <button aria-label="Cài đặt Ảnh nền" className={`settings-nav-button ${activeTab === 'background' ? 'active' : ''}`} onClick={() => setActiveTab('background')}><BackgroundIcon/> <span>Ảnh Nền</span></button>
                        </nav>
                        <main className="settings-content">
                            {renderPanel()}
                        </main>
                    </div>
                    {gameState && (
                        <footer className="settings-footer">
                            <div className="stat-item"><span className="stat-label">Lượt chơi hiện tại</span><span className="stat-value">{turnCount.toLocaleString('vi-VN')}</span></div>
                            <div className="stat-item"><span className="stat-label">Token lượt gần nhất</span><span className="stat-value">{latestTurnTokens.toLocaleString('vi-VN')}</span></div>
                            <div className="stat-item"><span className="stat-label">Tổng Tokens đã dùng</span><span className="stat-value">{totalTokenCount.toLocaleString('vi-VN')}</span></div>
                        </footer>
                    )}
                </div>
            </div>
        </>
    );
};