/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { FANTASY_RANK_DATA } from '../constants/gameConstants';

export const getRelationshipInfo = (score: number | undefined) => {
    const clampedScore = Math.min(Math.max(score ?? 0, -100), 100);
    if (clampedScore <= -75) return { text: 'Căm Ghét', color: 'var(--accent-danger)', score: clampedScore };
    if (clampedScore <= -25) return { text: 'Thù Địch', color: 'var(--accent-warning)', score: clampedScore };
    if (clampedScore < 25) return { text: 'Trung Lập', color: 'var(--text-muted)', score: clampedScore };
    if (clampedScore < 75) return { text: 'Thân Thiện', color: 'var(--accent-success)', score: clampedScore };
    return { text: 'Yêu Mến', color: 'var(--accent-pc)', score: clampedScore };
};

export const formatBytes = (bytes: number, decimals = 2) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export const getBase64ImageSize = (base64String: string): number => {
    if (!base64String) return 0;
    const pureBase64 = base64String.split(',').pop() || '';
    if (!pureBase64) return 0;
    const padding = (pureBase64.match(/(=*)$/) || [])[1]?.length || 0;
    return (pureBase64.length * 3 / 4) - padding;
};

export const formatFantasyRank = (rankValue: string | null | undefined): string => {
    if (!rankValue) return '';

    const rankStr = rankValue.trim().toLowerCase();
    
    // Check if it's already in the correct format like "S (Orichalcum)"
    const formattedMatch = rankValue.match(/^([A-Z]+)\s\((.+)\)$/i);
    if (formattedMatch) {
        const [, short, long] = formattedMatch;
        const found = FANTASY_RANK_DATA.find(r => r.short.toLowerCase() === short.toLowerCase() && r.long.toLowerCase() === long.toLowerCase());
        if (found) {
            return rankValue; // It's already correctly formatted
        }
    }

    // Find a match based on short or long name
    for (const rank of FANTASY_RANK_DATA) {
        if (rank.short.toLowerCase() === rankStr || rank.long.toLowerCase() === rankStr) {
            return `${rank.short} (${rank.long})`;
        }
    }

    // Fallback: return the original value if no match is found
    return rankValue;
};

export const getCurrencyName = (genre: string): string => {
    switch (genre) {
        case 'Tu Tiên':
        case 'Huyền Huyễn Truyền Thuyết':
            return 'Linh Thạch';
        case 'Võ Lâm':
        case 'Thời Chiến (Trung Hoa/Nhật Bản)':
            return 'Lượng Bạc';
        case 'Dị Giới Fantasy':
        case 'Thế Giới Giả Tưởng (Game/Tiểu Thuyết)':
            return 'Đồng Vàng';
        default:
            return 'Tiền';
    }
};