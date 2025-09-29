/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import type { BaseCharacter } from '../core';

/**
 * Defines properties specific to characters within a Fanfiction ('Đồng nhân') genre.
 */
export interface FanficCharacter extends BaseCharacter {
    /**
     * A special resource for the player to perform actions that alter the original story's timeline.
     * This property is exclusive to the Fanfiction genre.
     */
    interventionPoints?: number;
}