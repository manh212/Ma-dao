/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { TURN_DELTAS_COMMON_SCHEMA } from './common';
import { VO_LAM_TURN_DELTAS_SCHEMA } from './voLam';
import { FANFIC_TURN_DELTAS_SCHEMA } from './fanfic';
import { MODERN_TURN_DELTAS_SCHEMA } from './modern';

export * from './action';

/**
 * Returns the appropriate turn delta schema based on the game's genre.
 * This ensures the AI is prompted with a structure that matches the world's specific mechanics.
 * @param genre The genre of the current game world.
 * @returns A schema object for turn updates.
 */
export const getTurnSchemaForGenre = (genre: string) => {
    switch (genre) {
        case 'Võ Lâm':
            return VO_LAM_TURN_DELTAS_SCHEMA;
        case 'Đồng nhân':
            return FANFIC_TURN_DELTAS_SCHEMA;
        case 'Đô Thị Hiện Đại':
        case 'Quản lý Nhóm nhạc':
        case 'Đô Thị Hiện Đại 100% bình thường':
            return MODERN_TURN_DELTAS_SCHEMA;
        // Add other genres here as they get custom schemas
        // case 'Tu Tiên':
        //     return TU_TIEN_TURN_DELTAS_SCHEMA;
        default:
            return TURN_DELTAS_COMMON_SCHEMA;
    }
};
