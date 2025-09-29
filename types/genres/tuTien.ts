/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import type { BaseCharacter, CharacterStats } from '../core';

export type DaoPath = 'ChinhThong' | 'TheTu' | 'MaTu' | 'KiemTu' | 'DanTu';

export interface TuTienCharacterStats extends CharacterStats {
    canhGioi?: string;
    tuVi?: number;
    thanThuc?: number;
    theChat?: number;
}

export interface TuTienCharacter extends BaseCharacter {
    daoPath?: DaoPath;
    linhLuc?: { current: number; max: number };
    linhCan?: { types: string[]; quality: number };
    baseStats: TuTienCharacterStats;
    stats: TuTienCharacterStats;
}

export interface SectData {
    id: string;
    name: string;
    prestige: number;
    masterId: string;
    disciples: {
        count: number;
        talentLevels: { low: number; medium: number; high: number; };
    };
    resources: {
        linhThach: number;
        materials: Record<string, number>;
    };
    facilities: {
        mainHallLevel: number;
        trainingGroundsLevel: number;
        alchemyPavilionLevel: number;
        forgeLevel: number;
        spiritVeinQuality: number;
    };
}