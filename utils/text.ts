/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import type { GameState, Character, KnowledgeEntity } from '../types';

export const stripEntityTags = (text: string | null | undefined): string => {
    if (!text) return '';
    return text.replace(/\[[A-Z_]+:([^\]]+)\]/g, '$1');
};

export const cleanAndStripTags = (text: string | null | undefined): string => {
    if (!text) return '';
    // First, strip valid entity tags to get the name, then remove any remaining brackets.
    return stripEntityTags(text).replace(/\[|\]/g, '');
};

export const removeAccents = (str: string | null | undefined): string => {
    if (!str) return '';
    return str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D");
};

export const parseActionForEntities = (actionText: string, gameState: GameState): Set<string> => {
    const ids = new Set<string>();
    if (!actionText || !gameState) return ids;

    const allEntities: (Character | KnowledgeEntity)[] = [
        gameState.character,
        ...(gameState.knowledgeBase.npcs || []),
        ...(gameState.knowledgeBase.locations || []),
        ...(gameState.knowledgeBase.factions || []),
        ...(gameState.knowledgeBase.monsters || [])
    ].filter((e): e is Character | KnowledgeEntity => e != null);

    // Sắp xếp theo độ dài tên giảm dần để khớp các tên dài hơn trước (ví dụ: "Hắc Long Vương" trước "Long Vương")
    allEntities.sort((a, b) => {
        const nameA = ('displayName' in a && a.displayName) ? a.displayName : a.name;
        const nameB = ('displayName' in b && b.displayName) ? b.displayName : b.name;
        return nameB.length - nameA.length;
    });

    for (const entity of allEntities) {
        const namesToMatch = [entity.name];
        if ('displayName' in entity && entity.displayName && entity.displayName !== entity.name) {
            namesToMatch.push(entity.displayName);
        }

        for (const name of namesToMatch) {
            // Sử dụng regex với word boundaries để tránh khớp một phần
            const regex = new RegExp(`\\b${name.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i');
            if (regex.test(actionText)) {
                ids.add(entity.id);
                break; // Tìm thấy một kết quả khớp cho thực thể này, chuyển sang thực thể tiếp theo
            }
        }
    }
    return ids;
};

/**
 * Sanitizes a string to be used as a CSS class name or data-attribute value.
 * Normalizes accents, converts to lowercase, replaces spaces with hyphens,
 * and removes any non-alphanumeric characters except hyphens.
 * @param text The string to sanitize.
 * @returns A CSS-friendly string.
 */
export const sanitizeTextForClassName = (text: string): string => {
    if (!text) return 'default';
    return removeAccents(text)
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-');
};
