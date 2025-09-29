/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import type { BaseCharacter, CharacterStats, StatEffect } from '../core';

export interface Job {
    id: string;
    name: string;
    rank: string;
    salary: number;
}

export interface Asset {
    id: string;
    name: string;
    type: 'Apartment' | 'Vehicle';
    description: string;
    purchaseCost: number;
    maintenanceCost: number;
    passiveEffects?: StatEffect[];
}

export interface ModernCharacterStats extends CharacterStats {
    stress?: number; // 0-100, căng thẳng
    socialEnergy?: number; // 0-100, năng lượng xã hội
    happiness?: number; // 0-100, chỉ số hạnh phúc tổng hợp
}

export interface ModernCharacter extends BaseCharacter {
    job?: Job;
    assets?: Asset[];
    baseStats: ModernCharacterStats;
    stats: ModernCharacterStats;
}
