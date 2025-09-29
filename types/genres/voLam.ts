
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import type { BaseCharacter, CharacterStats, Item, StatEffect, Recipe } from '../core';

export interface VoLamArts {
    congPhap: string;
    chieuThuc: string;
    khiCong: string;
    thuat: string;
}

export interface VoLamCharacterStats extends CharacterStats {
    noiLuc?: { current: number; max: number };
    danhVong?: number;
    canCot?: number;
    lucTay?: number;
    thanPhap?: number;
    theChat?: number;
    enlightenmentPoints?: number;
}

// New Types for Meridian System
export interface Acupoint {
    id: string;
    name: string;
    description: string;
    cost: number;
    effects: StatEffect[];
}

export interface MeridianPoint {
    id: string;
    name: string;
    acupoints: Acupoint[];
}

// New Types for Guild System
export interface GuildBuilding {
    level: number;
}

export interface DiplomaticRelation {
    factionId: string;
    status: 'War' | 'Ally' | 'Neutral';
}

export interface GuildBuildingUpgradeInfo {
  level: number;
  cost: {
    gold: number;
    wood: number;
    ore: number;
  };
  description: string;
}

export interface Guild {
    id: string;
    name: string;
    ownerId: string; // PC's id
    members: string[]; // array of NPC ids
    buildings: {
        mainHall: GuildBuilding;
        trainingGrounds: GuildBuilding;
        treasury: GuildBuilding;
    };
    resources: {
        gold: number;
        wood: number;
        ore: number;
    };
    diplomacy: DiplomaticRelation[];
    maxMembers: number;
    passiveIncome: {
        gold: number;
    };
}


export interface VoLamCharacter extends BaseCharacter {
    voLamArts?: VoLamArts;
    noiLuc?: { current: number; max: number };
    baseStats: VoLamCharacterStats;
    stats: VoLamCharacterStats;

    // Sect System properties
    sectId?: string;
    sectName?: string;
    sectRankName?: string;
    contributionPoints?: { current: number; max: number };

    // Crafting System properties
    learnedRecipes?: Recipe[];

    // Meridian System properties
    qiPoints?: number; // Chân khí
    meridians?: Record<string, boolean>; // { [acupointId]: true }

    // Guild System properties
    guildId?: string;
}
