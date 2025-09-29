/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import * as db from './db';

const BG_KEYS = {
    MENU_DESKTOP: 'background_menu_desktop',
    MENU_MOBILE: 'background_menu_mobile',
    GAME_DESKTOP: 'background_game_desktop',
    GAME_MOBILE: 'background_game_mobile',
};

type BackgroundType = keyof typeof BG_KEYS;

const get = (key: string): string | null => {
    try {
        return localStorage.getItem(key);
    } catch (e) {
        console.warn(`Could not read from localStorage: ${key}`, e);
        return null;
    }
};

const set = (key: string, value: string) => {
    try {
        localStorage.setItem(key, value);
        window.dispatchEvent(new Event('backgroundChange'));
    } catch (e) {
        console.warn(`Could not write to localStorage: ${key}`, e);
    }
};

const remove = (key: string) => {
    try {
        localStorage.removeItem(key);
        window.dispatchEvent(new Event('backgroundChange'));
    } catch (e) {
        console.warn(`Could not remove from localStorage: ${key}`, e);
    }
};

const isLandscape = () => window.innerWidth > window.innerHeight;

const fetchImageUrl = async (id: string | null): Promise<string> => {
    if (!id) return '';
    try {
        const image = await db.getImageById(id);
        return image?.dataUrl || '';
    } catch (e) {
        console.error(`Failed to fetch image with id ${id} from DB`, e);
        return '';
    }
};

export const BackgroundManager = {
    set(type: 'menu_desktop' | 'menu_mobile' | 'game_desktop' | 'game_mobile', imageId: string) {
        const key = BG_KEYS[type.toUpperCase() as BackgroundType];
        if (key) {
            set(key, imageId);
        }
    },

    clear(type: 'menu' | 'game' | 'all') {
        if (type === 'menu' || type === 'all') {
            remove(BG_KEYS.MENU_DESKTOP);
            remove(BG_KEYS.MENU_MOBILE);
        }
        if (type === 'game' || type === 'all') {
            remove(BG_KEYS.GAME_DESKTOP);
            remove(BG_KEYS.GAME_MOBILE);
        }
    },

    async updateBackgrounds(setters: { setMenuBg: (url: string) => void; setGameBg: (url: string) => void; }) {
        const landscape = isLandscape();

        const menuId = get(landscape ? BG_KEYS.MENU_DESKTOP : BG_KEYS.MENU_MOBILE) || get(BG_KEYS.MENU_DESKTOP) || get(BG_KEYS.MENU_MOBILE);
        const gameId = get(landscape ? BG_KEYS.GAME_DESKTOP : BG_KEYS.GAME_MOBILE) || get(BG_KEYS.GAME_DESKTOP) || get(BG_KEYS.GAME_MOBILE);

        const [menuUrl, gameUrl] = await Promise.all([
            fetchImageUrl(menuId),
            fetchImageUrl(gameId)
        ]);
        
        setters.setMenuBg(menuUrl);
        setters.setGameBg(gameUrl);
    }
};
