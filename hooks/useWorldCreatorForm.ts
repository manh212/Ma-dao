/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { useState, useEffect, useCallback, useRef } from 'react';
import type React from 'react';
import { useToasts } from '../components/contexts/ToastContext';
import { hydrateWorldSettings } from '../utils/hydration';
import { WC_FORM_DATA_KEY, INITIAL_WC_FORM_DATA, GENRE_SETTING_MAP, IDOL_MANAGER_LORE_RULES } from '../constants/gameConstants';
import { STORY_TEMPLATES } from '../constants/storyTemplates';
import type { WorldSettings } from '../types';

export const useWorldCreatorForm = () => {
    const { addToast } = useToasts();
    const [formData, setFormData] = useState<WorldSettings>(() => {
        try {
            const savedData = localStorage.getItem(WC_FORM_DATA_KEY);
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                const hydratedData = hydrateWorldSettings({ ...INITIAL_WC_FORM_DATA, ...parsedData });
                if (!Array.isArray(hydratedData.loreRules) || hydratedData.loreRules.length === 0) {
                     hydratedData.loreRules = INITIAL_WC_FORM_DATA.loreRules;
                }
                return hydratedData;
            }
        } catch (error) {
            console.error("Failed to load or parse world creator form data:", error);
        }
        return INITIAL_WC_FORM_DATA;
    });
    const [fanficFileInfo, setFanficFileInfo] = useState<{ name: string; content: string } | null>(null);

    const prevGenreRef = useRef<string | undefined>(undefined);

    useEffect(() => {
        const currentGenre = formData.genre;
        const previousGenre = prevGenreRef.current;
        const genreChanged = previousGenre !== currentGenre;

        // Update settings if invalid for the current genre
        const validSettings = GENRE_SETTING_MAP[currentGenre] || [];
        if (!validSettings.includes(formData.setting)) {
            setFormData(prev => ({
                ...prev,
                setting: validSettings[0] || '',
                idea: '', // Reset idea to prevent inconsistency from a previous template.
            }));
            addToast('Bối cảnh đã được tự động cập nhật để phù hợp với Kiểu Thế Giới. Tình huống khởi đầu đã được xóa.', 'info');
        }

        // If genre changed to "Quản lý Nhóm nhạc", add the rules.
        if (genreChanged && currentGenre === 'Quản lý Nhóm nhạc') {
             setFormData(prev => {
                const currentRuleTexts = new Set((prev.loreRules || []).map(r => r.text));
                const rulesToAdd = IDOL_MANAGER_LORE_RULES.filter(rule => !currentRuleTexts.has(rule.text));
                if (rulesToAdd.length > 0) {
                    addToast('Đã tự động thêm các luật lệ đặc biệt cho thể loại "Quản lý Nhóm nhạc".', 'info');
                    return { ...prev, loreRules: [...(prev.loreRules || []), ...rulesToAdd] };
                }
                return prev;
            });
        }

        // Update ref for next render
        prevGenreRef.current = currentGenre;
    }, [formData.genre, formData.setting, addToast]);


    useEffect(() => {
        const handler = window.setTimeout(() => {
            try {
                localStorage.setItem(WC_FORM_DATA_KEY, JSON.stringify(formData));
            } catch (error) {
                console.error("Failed to save world creator form data:", error);
            }
        }, 500);

        return () => window.clearTimeout(handler);
    }, [formData]);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        
        if (name === 'idea') {
            setFanficFileInfo(null);
        }

        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    }, []);

    const handleStoryTemplateChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        const [selectedCategory, selectedLabel] = e.target.value.split('::');
        const templatesInCategory = STORY_TEMPLATES[selectedCategory];
        if (templatesInCategory) {
            const template = templatesInCategory.find(t => t.label === selectedLabel);
            if (template) {
                const validSettingsForGenre = GENRE_SETTING_MAP[formData.genre] || [];
                const isRecommendedSettingValid = validSettingsForGenre.includes(template.recommendedSetting);
                setFormData(prev => ({
                    ...prev,
                    setting: isRecommendedSettingValid ? template.recommendedSetting : prev.setting,
                    idea: template.idea,
                }));
                setFanficFileInfo(null);
                addToast(`Đã áp dụng mẫu "${template.label}".`, 'success');
                if (!isRecommendedSettingValid) {
                    addToast(`Bối cảnh "${template.recommendedSetting}" của mẫu không tương thích và đã được giữ nguyên.`, 'warning');
                }
            }
        }
    }, [addToast, formData.genre]);

    const handleVoLamArtsChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            voLamArts: {
                ...(prev.voLamArts || { congPhap: '', chieuThuc: '', khiCong: '', thuat: '' }),
                [name]: value,
            }
        }));
    }, []);
    
    return {
        formData,
        setFormData,
        fanficFileInfo,
        setFanficFileInfo,
        handleInputChange,
        handleStoryTemplateChange,
        handleVoLamArtsChange,
    };
};