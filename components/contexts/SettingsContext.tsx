/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';
import type { AppSettings } from '../../types';

interface SettingsContextType {
    settings: AppSettings;
    updateSetting: (key: keyof AppSettings, value: any) => void;
    appliedTheme: string;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const SETTINGS_STORAGE_KEY = 'app_settings';

const initialSettings: AppSettings = {
    theme: 'system', 
    mobilePalette: 'default',
    fontFamily: "'Be Vietnam Pro', sans-serif", 
    fontSize: 17, 
    lineHeight: 1.7,
    textWidth: 80,
    storyLength: 'standard',
    autoPinMemory: true,
    enableCheats: false,
    textColor: 'default',
    aiProcessingMode: 'quality',
    enablePerformanceEffects: true,
};

export const SettingsProvider = ({ children }: { children?: React.ReactNode }) => {
    const [settings, setSettings] = useState<AppSettings>(() => {
        try {
            const savedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
            if (savedSettings) {
                // Hợp nhất với cài đặt ban đầu để đảm bảo các khóa mới được bao gồm
                return { ...initialSettings, ...JSON.parse(savedSettings) };
            }
        } catch (error) {
            console.error("Không thể tải cài đặt từ localStorage", error);
        }
        return initialSettings;
    });
    
    const getSystemTheme = () => window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>(getSystemTheme());

    const updateSetting = (key: keyof AppSettings, value: any) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    // Lưu cài đặt vào localStorage mỗi khi chúng thay đổi
    useEffect(() => {
        try {
            localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
        } catch (error) {
            console.error("Không thể lưu cài đặt vào localStorage", error);
        }
    }, [settings]);


     useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e: MediaQueryListEvent) => {
            setSystemTheme(e.matches ? 'dark' : 'light');
        };
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);
    
    const appliedTheme = useMemo(() => {
        const { theme } = settings;
        if (theme === 'mobile') return 'theme-mobile';
        if (theme === 'midnight') return 'theme-midnight';
        if (theme === 'parchment') return 'theme-parchment';
        if (theme === 'cyberpunk') return 'theme-cyberpunk';
        if (theme === 'serenity') return 'theme-serenity';
        if (theme === 'solarized-dusk') return 'theme-solarized-dusk';
        if (theme === 'evergreen-grove') return 'theme-evergreen-grove';
        
        // System theme fallback
        return systemTheme === 'dark' ? 'theme-midnight' : 'theme-parchment';
    }, [settings.theme, systemTheme]);
    
    useEffect(() => {
        document.documentElement.style.setProperty('--base-font-size', `${settings.fontSize}px`);
        document.documentElement.style.setProperty('--line-height', String(settings.lineHeight));
        document.documentElement.style.setProperty('--text-max-width', `${settings.textWidth}ch`);
        document.body.style.fontFamily = settings.fontFamily;
        
        document.body.setAttribute('data-text-color', settings.textColor);
        
        // Apply main theme class
        document.body.classList.remove('theme-dark', 'theme-light', 'theme-solarized-dark', 'theme-dracula', 'theme-midnight', 'theme-parchment', 'theme-cyberpunk', 'theme-serenity', 'theme-solarized-dusk', 'theme-evergreen-grove', 'theme-mobile');
        document.body.classList.add(appliedTheme);

        // Apply mobile palette attribute if needed
        if (appliedTheme === 'theme-mobile') {
            document.body.setAttribute('data-mobile-palette', settings.mobilePalette);
        } else {
            document.body.removeAttribute('data-mobile-palette');
        }

        // Apply performance effects attribute
        if (settings.enablePerformanceEffects) {
            document.body.removeAttribute('data-performance-effects');
        } else {
            document.body.setAttribute('data-performance-effects', 'disabled');
        }

    }, [settings.fontSize, settings.fontFamily, settings.textColor, appliedTheme, settings.mobilePalette, settings.enablePerformanceEffects, settings.lineHeight, settings.textWidth]);


    const contextValue = useMemo(() => ({ settings, updateSetting, appliedTheme }), [settings, appliedTheme]);

    return (
        <SettingsContext.Provider value={contextValue}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};