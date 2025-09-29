/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Type } from "@google/genai";
import './WorldCreator.css';
import { CollapsibleSection } from '../ui/CollapsibleSection';
import { FormField } from '../ui/FormField';
import { ToggleSwitch } from '../ui/ToggleSwitch';
import { LoreModal } from '../modals/LoreModal';
import { ArtisticLoadingOverlay } from './ArtisticLoadingOverlay';
import { useToasts } from '../contexts/ToastContext';
import { ApiKeyManager } from '../../services/ApiKeyManager';
import { getApiErrorMessage } from '../../utils/error';
import { generateUniqueId } from '../../utils/id';
import { sanitizeTextForClassName } from '../../utils/text';
import { hydrateWorldSettings } from '../../utils/hydration';
import { useWorldCreatorForm } from '../../hooks/useWorldCreatorForm';
import { useWorldCreation, FanficAnalysisResult } from '../../hooks/useWorldCreation';
import { DIFFICULTY_LEVELS, GENRES, SETTINGS, GENRE_SETTING_MAP, INITIAL_WC_FORM_DATA, startingSceneOptions, FANFIC_TEXT_LIMIT, DAO_PATH_DETAILS } from '../../constants/gameConstants';
import { STORY_TEMPLATES, type StoryTemplate } from '../../constants/storyTemplates';
import { SUGGESTIONS_SCHEMA } from '../../constants/schemas';
import { IDEA_SUGGESTIONS, BACKSTORY_SUGGESTIONS } from '../../constants/suggestionConstants';
import { GEMINI_FLASH } from '../../constants/aiConstants';
import type { WorldSettings, GameState, LoreRule, Skill, Character as CharType, Power, DaoPath } from '../../types';
import { TalentType } from '../../types';

const GENRE_DETAILS: { [key: string]: { description: string; icon: React.ReactNode } } = {
    'Marvel': { description: "Bước vào vũ trụ của các siêu anh hùng và ác nhân, nơi công nghệ, đột biến và phép thuật định hình nên số phận.", icon: null },
    'Quản lý Nhóm nhạc': { description: "Đứng sau ánh đèn sân khấu, quản lý lịch trình, đối mặt scandal và dẫn dắt một nhóm nhạc đến đỉnh cao danh vọng.", icon: null },
    'Đồng nhân': { description: "Viết lại một câu chuyện quen thuộc. Thay đổi số phận của các nhân vật bạn yêu thích hoặc tạo ra một nhân vật hoàn toàn mới.", icon: null },
    'Dị Giới Fantasy': { description: "Một thế giới của kiếm, ma thuật và những sinh vật huyền bí. Chuyển sinh, được triệu hồi hay là một người bản địa.", icon: null },
    'Thế Giới Giả Tưởng (Game/Tiểu Thuyết)': { description: "Bước vào một thế giới đã được xây dựng sẵn từ game hoặc tiểu thuyết, trở thành nhân vật chính hoặc một tồn tại mới.", icon: null },
    'Tu Tiên': { description: "Vấn đạo trường sinh, nghịch thiên cải mệnh trong một thế giới của linh khí, công pháp và pháp bảo.", icon: null },
    'Võ Lâm': { description: "Ân oán giang hồ, tranh đoạt bí kíp, trở thành đại hiệp hoặc ma đầu trong một thế giới võ học Trung Hoa.", icon: null },
    'Thời Chiến (Trung Hoa/Nhật Bản)': { description: "Sống sót và tạo dựng danh tiếng trong thời kỳ chiến quốc loạn lạc của Trung Hoa hoặc Nhật Bản.", icon: null },
    'Đô Thị Hiện Đại': { description: "Những câu chuyện về tình yêu, quyền lực, và các thế lực siêu nhiên ẩn mình dưới ánh đèn neon của thành phố.", icon: null },
    'Đô Thị Hiện Đại 100% bình thường': { description: "Không có siêu năng lực, không có hệ thống. Chỉ là những câu chuyện đời thường về tình yêu, công việc và cuộc sống.", icon: null },
    'Hậu Tận Thế': { description: "Sinh tồn trong một thế giới hoang tàn sau thảm họa, đối mặt với quái vật, tài nguyên khan hiếm và những người sống sót khác.", icon: null },
    'Huyền Huyễn Truyền Thuyết': { description: "Khi những truyền thuyết về thần, ma, và các sinh vật cổ xưa trở thành hiện thực. Một thế giới của sức mạnh phi thường.", icon: null },
};

const LoadingSpinner = () => <div className="spinner spinner-sm">Đang tải...</div>;

interface WorldCreatorProps {
    onBack: () => void;
    onCreateWorld: (gameState: GameState, worldSettings: WorldSettings) => void;
    incrementApiRequestCount: () => void;
    addDebugPrompt: (content: string, purpose: string) => void;
}

const FanficRoleSelection = ({ analysisResult, onSelectRole }: { analysisResult: FanficAnalysisResult, onSelectRole: (role: string) => void }) => {
    return (
        <div className="fanfic-role-selection-container">
            <h3>Phân Tích Hoàn Tất!</h3>
            <p><strong>Tiêu đề:</strong> {analysisResult.title}</p>
            <p><strong>Tóm tắt:</strong> {analysisResult.worldSummary}</p>
            <h4>Chọn Vai Trò Khởi Đầu Của Bạn:</h4>
            <div className="role-options">
                {analysisResult.suggestedRoles.map((role, index) => (
                    <button key={index} className="wc-button" onClick={() => onSelectRole(role)}>
                        {role}
                    </button>
                ))}
            </div>
        </div>
    );
};


export const WorldCreator = ({ onBack, onCreateWorld, incrementApiRequestCount, addDebugPrompt }: WorldCreatorProps) => {
    const { addToast } = useToasts();
    const { formData, setFormData, fanficFileInfo, setFanficFileInfo, handleInputChange, handleStoryTemplateChange, handleVoLamArtsChange } = useWorldCreatorForm();
    const [isWorldSectionOpen, setIsWorldSectionOpen] = useState(true);
    const [isCharacterSectionOpen, setIsCharacterSectionOpen] = useState(false);
    const [isSettingsSectionOpen, setIsSettingsSectionOpen] = useState(false);
    const [showLoreModal, setShowLoreModal] = useState(false);
    const [ideaSuggestions, setIdeaSuggestions] = useState<string[]>([]);
    const [backstorySuggestions, setBackstorySuggestions] = useState<string[]>([]);
    const [isSuggesting, setIsSuggesting] = useState<'idea' | 'backstory' | null>(null);
    const [genreSelected, setGenreSelected] = useState(false);
    const [newSkill, setNewSkill] = useState({ name: '', description: '' });
    const [newPower, setNewPower] = useState<Omit<Power, 'id'>>({ name: '', description: '', powerSource: 'Mutant' });
    const [selectedFanficRole, setSelectedFanficRole] = useState<string | null>(null);


    const toggleWorldSection = () => setIsWorldSectionOpen(!isWorldSectionOpen);
    const toggleCharacterSection = () => setIsCharacterSectionOpen(!isCharacterSectionOpen);
    const toggleSettingsSection = () => setIsSettingsSectionOpen(!isSettingsSectionOpen);
    
    // FIX: Destructure `setFanficAnalysisResult` to allow resetting the analysis state.
    const {
        isCreating, creationMessage, error, setError, creationProgress, creationTimeElapsed, estimatedTime, creationSuccess, handleSuggestContext, isGeneratingContext, handleSuggestCharacter, isGeneratingChar, handleSuggestLoreRules, isGeneratingLoreRules, handleInitiateCreation, isAnalyzingFanfic, fanficAnalysisResult, setFanficAnalysisResult, handleAnalyzeFanfic
    } = useWorldCreation({ formData, setFormData, onCreateWorld, addToast, incrementApiRequestCount, addDebugPrompt });

    const fileInputRef = useRef<HTMLInputElement>(null);

    const isWorldLocked = formData.genre === 'Đồng nhân';
    const isTuTien = formData.genre === 'Tu Tiên';
    const isVoLam = formData.genre === 'Võ Lâm';
    const isMarvel = formData.genre === 'Marvel';
    const isModern = ['Đô Thị Hiện Đại', 'Quản lý Nhóm nhạc', 'Đô Thị Hiện Đại 100% bình thường'].includes(formData.genre);
    
    const handleGenreSelect = (genre: string) => {
        setFormData(prev => ({ ...prev, genre }));
        setGenreSelected(true);
    };

    const handleRefresh = () => {
        setFormData(INITIAL_WC_FORM_DATA);
        setFanficFileInfo(null);
        setIdeaSuggestions([]);
        setBackstorySuggestions([]);
        setGenreSelected(false);
        addToast("Biểu mẫu đã được làm mới.", 'info');
    };

    const isMounted = useRef(true);
    useEffect(() => { isMounted.current = true; return () => { isMounted.current = false; }; }, []);
    const handleGenericAiError = useCallback((error: unknown, context: string) => { if (isMounted.current) { addToast(getApiErrorMessage(error, context), 'error'); } }, [addToast]);

    const handleSuggest = useCallback(async (type: 'idea' | 'backstory') => {
        setIsSuggesting(type);
        const suggestionsKey = type === 'idea' ? formData.genre : formData.personalityOuter;
        const suggestionsMap = type === 'idea' ? IDEA_SUGGESTIONS : BACKSTORY_SUGGESTIONS;
        const baseSuggestion = suggestionsMap[suggestionsKey] || suggestionsMap['default'];
        
        const contextInfo = type === 'idea' 
            ? `Kiểu thế giới: "${formData.genre}", Bối cảnh: "${formData.setting}"`
            : `Tính cách nhân vật: "${formData.personalityOuter}"`;
    
        const prompt = `**VAI TRÒ:** Bạn là một người cố vấn sáng tạo, chuyên gia gợi ý ý tưởng cho việc xây dựng thế giới và nhân vật trong game.
    **NHIỆM VỤ:** Dựa vào bối cảnh được cung cấp và một gợi ý cơ bản, hãy tạo ra **BA (3)** gợi ý mới, độc đáo và hấp dẫn.
    **BỐI CẢNH:** ${contextInfo}.
    **GỢI Ý CƠ BẢN (để tham khảo phong cách):** "${baseSuggestion[0]}"
    **YÊU CẦU:**
    1.  Các gợi ý phải đa dạng và khơi gợi trí tưởng tượng.
    2.  Không lặp lại gợi ý cơ bản.
    3.  Mỗi gợi ý phải là một chuỗi string hoàn chỉnh.
    4.  Toàn bộ các gợi ý phải bằng tiếng Việt.
    5.  Trả về kết quả dưới dạng một đối tượng JSON duy nhất, tuân thủ nghiêm ngặt schema đã cho.`;
    
        try {
            const response = await ApiKeyManager.generateContentWithRetry({ model: GEMINI_FLASH, contents: prompt, config: { responseMimeType: "application/json", responseSchema: SUGGESTIONS_SCHEMA } }, addToast, incrementApiRequestCount, { logPrompt: addDebugPrompt, purpose: `Gợi ý ${type === 'idea' ? 'Tình huống' : 'Tiểu sử'}` });
            const result = JSON.parse(response.text?.trim() || '{}');
            if (isMounted.current && result.suggestions) {
                if (type === 'idea') setIdeaSuggestions(result.suggestions);
                else setBackstorySuggestions(result.suggestions);
            }
        } catch (err) {
            handleGenericAiError(err, `gợi ý ${type}`);
        } finally {
            if (isMounted.current) setIsSuggesting(null);
        }
    }, [formData.genre, formData.setting, formData.personalityOuter, addToast, incrementApiRequestCount, handleGenericAiError, addDebugPrompt]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > FANFIC_TEXT_LIMIT) { addToast(`Tệp quá lớn. Giới hạn là ${FANFIC_TEXT_LIMIT / 1024}KB.`, 'error'); return; }
            const reader = new FileReader();
            reader.onload = (event) => {
                const content = event.target?.result as string;
                setFanficFileInfo({ name: file.name, content });
                handleAnalyzeFanfic(content); // Automatically analyze after upload
                addToast("Đã tải lên và bắt đầu phân tích tệp...", 'info');
            };
            reader.readAsText(file);
        }
    };
    
    const handleAddSkill = () => {
        if (newSkill.name.trim() && newSkill.description.trim()) {
            setFormData(prev => ({ ...prev, skills: [...prev.skills, { 
                id: generateUniqueId('skill'), 
                ...newSkill,
                type: 'Active', skillType: 'Attack', target: 'Enemy', manaCost: 10, level: 1, xp: 0, talentSlots: 1, unlockedTalents: [], masteryLevel: 'Sơ Nhập', masteryXp: 0,
            }] }));
            setNewSkill({ name: '', description: '' });
        }
    };
    const handleDeleteSkill = (idToDelete: string) => {
        setFormData(prev => ({ ...prev, skills: prev.skills.filter(s => s.id !== idToDelete) }));
    };

    const handleAddPower = () => {
        if (newPower.name.trim() && newPower.description.trim()) {
            setFormData(prev => ({
                ...prev,
                powers: [...(prev.powers || []), { id: generateUniqueId('power'), ...newPower }]
            }));
            setNewPower({ name: '', description: '', powerSource: 'Mutant' });
        }
    };
    const handleDeletePower = (idToDelete: string) => {
        setFormData(prev => ({
            ...prev,
            powers: (prev.powers || []).filter(p => p.id !== idToDelete)
        }));
    };

    useEffect(() => { if (creationSuccess.current) { onBack(); } }, [creationSuccess.current, onBack]);

    if (!genreSelected) {
        // Genre Selection UI (unchanged)
        return (
            <div className="genre-selection-container">
                <h2>Chọn một cuộc phiêu lưu để bắt đầu</h2>
                <div className="genre-selection-grid">
                    {GENRES.map(genre => {
                        const details = GENRE_DETAILS[genre] || { description: "Một thế giới mới đang chờ bạn khám phá.", icon: null };
                        return (
                            <button key={genre} className="genre-card" onClick={() => handleGenreSelect(genre)}>
                                {details.icon && <div className="genre-card-icon">{details.icon}</div>}
                                <div className="genre-card-info">
                                    <span className="genre-card-label">{genre}</span>
                                    <p className="genre-card-description">{details.description}</p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    }
    
    const selectedDaoPathInfo = formData.daoPath ? DAO_PATH_DETAILS[formData.daoPath as DaoPath] : null;

    return (
        <div className="wc-container">
            {isCreating && <ArtisticLoadingOverlay worldSettings={formData} message={creationMessage} progress={creationProgress} timeElapsed={creationTimeElapsed} estimatedTime={estimatedTime} />}
            {showLoreModal && <LoreModal initialRules={formData.loreRules} onSave={(newRules) => setFormData(prev => ({ ...prev, loreRules: newRules }))} onClose={() => setShowLoreModal(false)} />}
            
            <form className="wc-creation-tome" onSubmit={(e) => { e.preventDefault(); handleInitiateCreation(selectedFanficRole); }}>
                <header className="wc-header">
                    <button type="button" className="wc-button-icon" onClick={onBack}>
                        Quay Lại
                    </button>
                    <h1 className="wc-title">Tạo Dựng Thế Giới</h1>
                    <button type="button" className="wc-button-icon" onClick={handleRefresh}>
                        Làm Mới
                    </button>
                </header>
                
                 <div className="selected-genre-display">
                    <span>Kiểu Thế Giới: <strong>{formData.genre}</strong></span>
                    <button type="button" onClick={() => setGenreSelected(false)}>Thay đổi</button>
                </div>

                <div className="form-grid">
                    {/* World Pillar */}
                    <div className={`grid-col world-column ${isWorldLocked ? 'section-locked' : ''}`}>
                        <CollapsibleSection title="Thông Tin Thế Giới" isOpen={isWorldSectionOpen} onToggle={toggleWorldSection} isLocked={false}>
                            <fieldset>
                                {formData.genre === 'Đồng nhân' ? (
                                    <>
                                        <FormField label="Tải & Phân Tích Đồng Nhân (.txt)" htmlFor="fanfic-file">
                                            <input type="file" id="fanfic-file" ref={fileInputRef} onChange={handleFileChange} accept=".txt" style={{ display: 'none' }} />
                                            {!fanficFileInfo && (
                                                <button type="button" className="wc-button" onClick={() => fileInputRef.current?.click()} disabled={isAnalyzingFanfic}>
                                                    {isAnalyzingFanfic ? <LoadingSpinner/> : 'Chọn Tệp Để Phân Tích'}
                                                </button>
                                            )}
                                            {fanficFileInfo && !isAnalyzingFanfic && (
                                                <div className="fanfic-file-info">
                                                    <span className="fanfic-file-name"><strong>Tệp:</strong> {fanficFileInfo.name}</span>
                                                    <button type="button" className="fanfic-remove-button" onClick={() => {setFanficFileInfo(null); setFanficAnalysisResult(null); setSelectedFanficRole(null);}}>Xóa</button>
                                                </div>
                                            )}
                                        </FormField>
                                        {isAnalyzingFanfic && <p>Đang phân tích, vui lòng chờ...</p>}
                                        {fanficAnalysisResult && !isAnalyzingFanfic && (
                                            <FanficRoleSelection analysisResult={fanficAnalysisResult} onSelectRole={setSelectedFanficRole} />
                                        )}
                                    </>
                                 ) : (
                                    <>
                                        <FormField label="Bối Cảnh (Setting)" htmlFor="setting">
                                            <div className="select-wrapper"><select name="setting" id="setting" value={formData.setting} onChange={handleInputChange}>{GENRE_SETTING_MAP[formData.genre]?.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                                        </FormField>
                                        <FormField label="Tình Huống Khởi Đầu (Idea)" htmlFor="idea">
                                            <div className="textarea-with-button">
                                                <textarea name="idea" id="idea" value={formData.idea} onChange={handleInputChange} rows={4} placeholder="Ví dụ: Bị triệu hồi đến dị giới với tư cách anh hùng, nhưng chỉ số của tôi lại yếu nhất."></textarea>
                                                <button type="button" className="wc-button-suggest-ai" onClick={() => handleSuggest('idea')} disabled={isSuggesting === 'idea'} title="Gợi ý bằng AI">{isSuggesting === 'idea' ? <LoadingSpinner/> : 'Gợi ý'}</button>
                                            </div>
                                            {ideaSuggestions.length > 0 && <div className="suggestion-list-container"><ul>{ideaSuggestions.map((s, i) => <li key={i} className="suggestion-item" onClick={() => {setFormData(p => ({...p, idea: s})); setIdeaSuggestions([]);}}>{s}</li>)}</ul></div>}
                                            <div className="wc-context-actions">
                                                <div className="select-wrapper"><select id="story-template" value="" onChange={handleStoryTemplateChange}><option value="" disabled>Hoặc chọn một mẫu truyện...</option>{Object.entries(STORY_TEMPLATES).map(([category, templates]) => (
                                                    <optgroup label={category} key={category}>
                                                        {(templates as StoryTemplate[]).map(template => (
                                                            <option key={template.label} value={`${category}::${template.label}`}>{template.label}</option>
                                                        ))}
                                                    </optgroup>
                                                ))}</select></div>
                                            </div>
                                        </FormField>
                                        <FormField label="Tổng Quan Về Thế Giới (Details)" htmlFor="details">
                                            <div className="textarea-with-button">
                                                <textarea name="details" id="details" value={formData.details} onChange={handleInputChange} rows={8} placeholder="Mô tả về lịch sử, địa lý, các phe phái, hoặc các quy luật đặc biệt của thế giới."></textarea>
                                                <button type="button" className="wc-button-suggest-ai" onClick={handleSuggestContext} disabled={isGeneratingContext} title="Tạo tổng quan bằng AI">{isGeneratingContext ? <LoadingSpinner/> : 'Tạo'}</button>
                                            </div>
                                        </FormField>
                                    </>
                                 )}
                            </fieldset>
                        </CollapsibleSection>
                    </div>

                    {/* Character Pillar */}
                    <div className={`grid-col character-column theme-${sanitizeTextForClassName(formData.genre)} ${isWorldLocked ? 'section-locked' : ''}`}>
                        <CollapsibleSection title="Thông Tin Nhân Vật Chính" isOpen={isCharacterSectionOpen} onToggle={toggleCharacterSection} isLocked={isWorldLocked} lockMessage="Thông tin nhân vật sẽ được tùy chỉnh sau khi phân tích Đồng nhân.">
                           <fieldset disabled={isGeneratingChar || isWorldLocked}>
                               {/* Character form fields are hidden for fanfic until analysis is done and role is chosen */}
                               {!isWorldLocked && (
                                   <>
                                        <FormField label="Tên Nhân Vật" htmlFor="name"><input type="text" name="name" id="name" value={formData.name} onChange={handleInputChange} placeholder="Để trống để AI tự tạo" /></FormField>
                                        <FormField label="Tính Cách Bề Ngoài" htmlFor="personalityOuter"><div className="select-wrapper"><select name="personalityOuter" id="personalityOuter" value={formData.personalityOuter} onChange={handleInputChange}><option value="ai">Để AI quyết định</option><optgroup label="Thiện & Chính Trực">{Object.entries(BACKSTORY_SUGGESTIONS).slice(1, 5).map(([p]) => <option key={p} value={p}>{p}</option>)}</optgroup><optgroup label="Trung Lập & Thực Dụng">{Object.entries(BACKSTORY_SUGGESTIONS).slice(5, 9).map(([p]) => <option key={p} value={p}>{p}</option>)}</optgroup><optgroup label="Phức Tạp & Khác">{Object.entries(BACKSTORY_SUGGESTIONS).slice(9).map(([p]) => <option key={p} value={p}>{p}</option>)}</optgroup></select></div></FormField>
                                        {isModern && (
                                            <FormField label="Công việc Khởi đầu" htmlFor="startingJob">
                                                <input
                                                    type="text"
                                                    name="startingJob"
                                                    id="startingJob"
                                                    value={formData.startingJob || ''}
                                                    onChange={handleInputChange}
                                                    placeholder="Ví dụ: Lập trình viên, Sinh viên Y khoa"
                                                />
                                            </FormField>
                                        )}
                                        {isTuTien && (
                                            <>
                                                <FormField label="Đạo Tu Luyện" htmlFor="daoPath">
                                                    <div className="select-wrapper">
                                                        <select name="daoPath" id="daoPath" value={formData.daoPath} onChange={handleInputChange}>
                                                            <option value="ChinhThong">Chính Thống Tu (Cân bằng)</option>
                                                            <option value="TheTu">Thể Tu (Rèn luyện thân thể)</option>
                                                            <option value="MaTu">Ma Tu (Tà đạo, tốc độ nhanh)</option>
                                                            <option value="KiemTu">Kiếm Tu (Tập trung vào kiếm đạo)</option>
                                                            <option value="DanTu">Đan Tu (Luyện đan dược)</option>
                                                        </select>
                                                    </div>
                                                </FormField>
                                                {selectedDaoPathInfo && (
                                                    <div className="dao-path-description">
                                                        <h6>{selectedDaoPathInfo.name}</h6>
                                                        <p>{selectedDaoPathInfo.description}</p>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                        <FormField label="Sơ Lược Tiểu Sử" htmlFor="backstory">
                                            <div className="textarea-with-button">
                                                <textarea name="backstory" id="backstory" value={formData.backstory} onChange={handleInputChange} rows={8} placeholder="Mô tả quá khứ, xuất thân và những sự kiện quan trọng đã định hình nên nhân vật."></textarea>
                                                <button type="button" className="wc-button-suggest-ai" onClick={() => handleSuggest('backstory')} disabled={isSuggesting === 'backstory'} title="Gợi ý bằng AI">{isSuggesting === 'backstory' ? <LoadingSpinner/> : 'Gợi ý'}</button>
                                            </div>
                                            {backstorySuggestions.length > 0 && <div className="suggestion-list-container"><ul>{backstorySuggestions.map((s, i) => <li key={i} className="suggestion-item" onClick={() => {setFormData(p => ({...p, backstory: s})); setBackstorySuggestions([]);}}>{s}</li>)}</ul></div>}
                                        </FormField>
                                   </>
                               )}
                           </fieldset>
                        </CollapsibleSection>
                    </div>

                    {/* Settings Pillar */}
                    <div className="grid-col settings-column">
                        <CollapsibleSection title="Cài Đặt Nâng Cao" isOpen={isSettingsSectionOpen} onToggle={toggleSettingsSection}>
                            <FormField label="Bắt đầu trong hoàn cảnh:" htmlFor="startingScene"><div className="select-wrapper"><select name="startingScene" id="startingScene" value={formData.startingScene} onChange={handleInputChange}>{startingSceneOptions.map(o => <option key={o.value} value={o.value}>{o.label} - {o.description}</option>)}</select></div></FormField>
                            <FormField label="Văn phong:" htmlFor="writingStyle"><div className="select-wrapper"><select name="writingStyle" id="writingStyle" value={formData.writingStyle} onChange={handleInputChange}><option value="default">Chủ nghĩa Hiện thực (Thô & Chi tiết)</option><option value="no_segg_polite">Không có segg, rất lịch sự</option></select></div></FormField>
                            <FormField label="Ngôi kể:" htmlFor="narrativeVoice"><div className="select-wrapper"><select name="narrativeVoice" id="narrativeVoice" value={formData.narrativeVoice} onChange={handleInputChange}><option value="first">Ngôi thứ nhất ("Tôi")</option><option value="second">Ngôi thứ hai ("Bạn")</option><option value="third_limited">Ngôi thứ ba Giới hạn</option><option value="third_omniscient">Ngôi thứ ba Toàn tri</option></select></div></FormField>
                            <FormField label="Độ khó:" htmlFor="difficulty"><div className="select-wrapper"><select name="difficulty" id="difficulty" value={formData.difficulty} onChange={handleInputChange}>{Object.entries(DIFFICULTY_LEVELS).map(([key, value]) => <option key={key} value={key}>{value.label}</option>)}</select></div></FormField>
                            <ToggleSwitch id="allow18Plus" label="Cho phép nội dung 18+" description="Cho phép các chủ đề và mô tả người lớn, bao gồm cả nội dung khiêu dâm." name="allow18Plus" checked={formData.allow18Plus} onChange={handleInputChange} />
                            <div className="lore-generation-section">
                                <button type="button" className="wc-button" onClick={() => setShowLoreModal(true)}>Quản Lý Luật Lệ ({formData.loreRules?.length || 0})</button>
                                <button type="button" className="wc-button" onClick={() => handleSuggestLoreRules(null)} disabled={isGeneratingLoreRules}>{isGeneratingLoreRules ? <LoadingSpinner/> : 'Tạo Luật Lệ (Dùng AI)'}</button>
                            </div>
                        </CollapsibleSection>
                    </div>
                </div>

                <footer className="wc-footer">
                    {error && <div className="error-message"><span>{error}</span><button onClick={() => setError(null)} className="error-action-button close-button">X</button></div>}
                    <button type="submit" className="wc-button button-create-world" disabled={isCreating || (isWorldLocked && !selectedFanficRole)}>
                        {isCreating ? <LoadingSpinner /> : 'Tạo Thế Giới'}
                    </button>
                </footer>
            </form>
        </div>
    );
};