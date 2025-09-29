/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export interface AppSettings {
    theme: 'system' | 'midnight' | 'parchment' | 'cyberpunk' | 'serenity' | 'solarized-dusk' | 'evergreen-grove' | 'mobile';
    mobilePalette: 'default' | 'high-contrast' | 'neon';
    fontFamily: string;
    fontSize: number;
    lineHeight: number;
    textWidth: number;
    storyLength: 'short' | 'standard' | 'detailed' | 'epic';
    autoPinMemory: boolean;
    enableCheats: boolean;
    textColor: 'default' | 'classic' | 'solarized' | 'nordic';
    aiProcessingMode: 'speed' | 'quality' | 'max_quality';
    enablePerformanceEffects: boolean;
}

export interface ToastData {
    id: string;
    message: string;
    type: 'info' | 'success' | 'error' | 'warning';
}

export interface EntityTooltipData {
    id: string;
    name: string;
    type: string;
    description: string;
    displayName?: string;
    position: { top: number, left: number };
    avatarUrl?: string;
    age?: number;
    ageDescription?: string;
    gender?: string;
    relationship?: number;
    respect?: number;
    trust?: number;
    fear?: number;
}

export interface GalleryImage {
    id: string;
    name: string;
    dataUrl: string;
    description: string;
    tags: string[];
    category: string;
    subCategory: string;
    suggestedCategories?: string[];
    suggestedSubCategories?: string[];
}

export interface MemoryChunk {
    id: string;
    saveId: string;
    turnStart: number;
    turnEnd: number;
    content: string;
    keywords: string[];
}

export type IdDataItemType = 'CORE' | 'SKILL' | 'TALENT' | 'RELATIONSHIP' | 'TRAIT' | 'SCAR';

export interface IdDataItem {
    id: string;
    type: IdDataItemType;
    label: string;
    value: string | number;
    notes?: string;
}

export interface IdDataSystem {
    systemId: string;
    systemName: string;
    items: IdDataItem[];
}