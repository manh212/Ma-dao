/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import type { BaseCharacter, Power } from '../core';

export interface MarvelCharacter extends BaseCharacter {
    powers?: Power[];
}