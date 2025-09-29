/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { Type } from "@google/genai";
import { ITEM_SCHEMA } from './item';
import { STAT_EFFECT_SCHEMA } from './common';

export const VO_LAM_ARTS_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        congPhap: { type: Type.STRING },
        chieuThuc: { type: Type.STRING },
        khiCong: { type: Type.STRING },
        thuat: { type: Type.STRING },
    },
};

export const DEATH_STATE_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        isDead: { type: Type.BOOLEAN },
        reason: { type: Type.STRING },
        isPublicKnowledge: { type: Type.BOOLEAN }
    },
    required: ['isDead', 'reason', 'isPublicKnowledge']
};

export const TRAIT_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        id: { type: Type.STRING },
        type: { type: Type.STRING, enum: ['Trait', 'Flaw'] },
        name: { type: Type.STRING },
        description: { type: Type.STRING },
        effects: {
            type: Type.ARRAY,
            items: STAT_EFFECT_SCHEMA,
            description: "Mechanical effects of this trait. These are additive modifiers."
        }
    },
    required: ['id', 'type', 'name', 'description']
};

export const SECRET_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        id: { type: Type.STRING },
        text: { type: Type.STRING },
        isKnownByPlayer: { type: Type.BOOLEAN }
    },
    required: ['id', 'text', 'isKnownByPlayer']
};

export const SCAR_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        id: { type: Type.STRING },
        description: { type: Type.STRING },
        sourceTurnId: { type: Type.STRING }
    },
    required: ['id', 'description', 'sourceTurnId']
};

export const CHARACTER_ARC_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING },
        stage: { type: Type.INTEGER },
        description: { type: Type.STRING }
    },
    required: ['name', 'stage', 'description']
};

export const MOOD_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        current: { type: Type.STRING },
        intensity: { type: Type.INTEGER },
        reason: { type: Type.STRING }
    },
    required: ['current', 'intensity', 'reason']
};

export const CHARACTER_STATS_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        strength: { type: Type.INTEGER },
        dexterity: { type: Type.INTEGER },
        constitution: { type: Type.INTEGER },
        intelligence: { type: Type.INTEGER },
        wisdom: { type: Type.INTEGER },
        charisma: { type: Type.INTEGER },
        canhGioi: { type: Type.STRING },
        tuVi: { type: Type.INTEGER },
        thanThuc: { type: Type.INTEGER },
        theChat: { type: Type.INTEGER },
        lucTay: { type: Type.INTEGER },
        thanPhap: { type: Type.INTEGER },
        noiLuc: { type: Type.INTEGER },
        canCot: { type: Type.INTEGER },
        power: { type: Type.INTEGER },
        speed: { type: Type.INTEGER },
        durability: { type: Type.INTEGER },
        fightingSkills: { type: Type.INTEGER },
        attack: { type: Type.INTEGER },
        defense: { type: Type.INTEGER },
        // Modern stats
        stress: { type: Type.INTEGER },
        socialEnergy: { type: Type.INTEGER },
        happiness: { type: Type.INTEGER },
    }
};

export const JOB_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        id: { type: Type.STRING },
        name: { type: Type.STRING },
        rank: { type: Type.STRING },
        salary: { type: Type.INTEGER },
    },
    required: ['id', 'name', 'rank', 'salary']
};

export const ASSET_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        id: { type: Type.STRING },
        name: { type: Type.STRING },
        type: { type: Type.STRING, enum: ['Apartment', 'Vehicle'] },
        description: { type: Type.STRING },
        purchaseCost: { type: Type.INTEGER },
        maintenanceCost: { type: Type.INTEGER },
        passiveEffects: { type: Type.ARRAY, items: STAT_EFFECT_SCHEMA },
    },
    required: ['id', 'name', 'type', 'description', 'purchaseCost', 'maintenanceCost']
};


export const POWER_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        id: { type: Type.STRING },
        name: { type: Type.STRING },
        description: { type: Type.STRING },
        powerSource: { type: Type.STRING, enum: ['Mutant', 'Technology', 'Magic', 'Scientific Accident', 'Cosmic', 'Other'] },
    },
    required: ['id', 'name', 'description', 'powerSource']
};

export const TALENT_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        id: { type: Type.STRING },
        name: { type: Type.STRING },
        description: { type: Type.STRING },
        type: { type: Type.STRING, enum: ['MODIFIER', 'AUGMENT', 'TRIGGER', 'SYNERGY'] },
        skillId: { type: Type.STRING },
        effects: { type: Type.ARRAY, items: STAT_EFFECT_SCHEMA, description: "Hiệu ứng chỉ số cơ học của thiên phú này." },
    },
    required: ['id', 'name', 'description', 'type', 'skillId']
};

export const SKILL_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        id: { type: Type.STRING },
        name: { type: Type.STRING },
        description: { type: Type.STRING },
        evolutionDescription: { type: Type.STRING },
        type: { type: Type.STRING, enum: ['Active', 'Passive'] },
        level: { type: Type.INTEGER },
        xp: { type: Type.INTEGER },
        talentSlots: { type: Type.INTEGER },
        unlockedTalents: { type: Type.ARRAY, items: TALENT_SCHEMA },
        effects: { type: Type.ARRAY, items: STAT_EFFECT_SCHEMA, description: "Hiệu ứng chỉ số cơ học của kỹ năng này." },
    },
    required: ['id', 'name', 'description', 'type', 'level', 'xp', 'talentSlots', 'unlockedTalents']
};

export const EQUIPMENT_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        'Weapon': ITEM_SCHEMA,
        'Helmet': ITEM_SCHEMA,
        'Chest Armor': ITEM_SCHEMA,
        'Boots': ITEM_SCHEMA,
        'Accessory': ITEM_SCHEMA,
    }
};

export const LIFE_EVENT_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        turnId: { type: Type.STRING },
        description: { type: Type.STRING },
    },
    required: ['turnId', 'description']
};

export const REPUTATION_SCHEMA = {
    type: Type.ARRAY,
    description: "Một mảng các đối tượng đại diện cho danh vọng với các phe phái.",
    items: {
        type: Type.OBJECT,
        properties: {
            factionId: { type: Type.STRING, description: "ID duy nhất của phe phái." },
            factionName: { type: Type.STRING, description: "Tên của phe phái." },
            score: { type: Type.INTEGER, description: "Điểm danh vọng (-100 đến 100)." },
            title: { type: Type.STRING, description: "Danh hiệu tương ứng (ví dụ: 'Thành viên Thân thiện')." }
        },
        required: ['factionId', 'factionName', 'score', 'title']
    }
};

export const CHARACTER_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        id: { type: Type.STRING },
        name: { type: Type.STRING },
        displayName: { type: Type.STRING },
        title: { type: Type.STRING },
        species: { type: Type.STRING },
        age: { type: Type.INTEGER },
        ageDescription: { type: Type.STRING },
        gender: { type: Type.STRING },
        avatarUrl: { type: Type.STRING },
        linhCan: {
            type: Type.OBJECT,
            properties: {
                types: { type: Type.ARRAY, items: { type: Type.STRING } },
                quality: { type: Type.INTEGER }
            },
        },
        health: {
            type: Type.OBJECT,
            properties: {
                current: { type: Type.INTEGER },
                max: { type: Type.INTEGER }
            },
        },
        personality: { type: Type.STRING },
        personalityStats: {
            type: Type.OBJECT,
            properties: {
                bravery: { type: Type.INTEGER },
                cunning: { type: Type.INTEGER },
                honesty: { type: Type.INTEGER }
            },
        },
        description: { type: Type.STRING },
        backstory: { type: Type.STRING },
        adventurerRank: { type: Type.STRING },
        rankPoints: { type: Type.INTEGER },
        threatLevel: { type: Type.STRING, enum: ['Street', 'City', 'National', 'Global', 'Cosmic'] },
        threatPoints: { type: Type.INTEGER },
        alignment: { type: Type.STRING, enum: ['Hero', 'Anti-Hero', 'Villain', 'Neutral'] },
        alignmentScore: { type: Type.INTEGER },
        baseStats: CHARACTER_STATS_SCHEMA,
        stats: CHARACTER_STATS_SCHEMA,
        skills: { type: Type.ARRAY, items: SKILL_SCHEMA },
        powers: { type: Type.ARRAY, items: POWER_SCHEMA },
        voLamArts: VO_LAM_ARTS_SCHEMA,
        abilities: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: { name: { type: Type.STRING }, description: { type: Type.STRING } },
                required: ['name', 'description']
            }
        },
        relationships: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    targetId: { type: Type.STRING },
                    type: { type: Type.STRING },
                    description: { type: Type.STRING },
                    rationale: { type: Type.STRING },
                    flags: { type: Type.ARRAY, items: { type: Type.STRING } },
                    sentimentDetails: {
                        type: Type.OBJECT,
                        description: "Chi tiết về mối quan hệ ân oán.",
                        properties: {
                            type: { type: Type.STRING, enum: ['Favor', 'Grudge', 'Neutral'] },
                            reason: { type: Type.STRING },
                            magnitude: { type: Type.STRING, enum: ['Small', 'Large', 'Life-changing'] }
                        },
                        required: ['type', 'reason', 'magnitude']
                    }
                },
                required: ['targetId', 'type', 'description']
            }
        },
        keyMemories: { type: Type.ARRAY, items: { type: Type.STRING } },
        money: { type: Type.INTEGER },
        inventory: { type: Type.ARRAY, items: ITEM_SCHEMA },
        equipment: EQUIPMENT_SCHEMA,
        learnedTalents: { type: Type.ARRAY, items: TALENT_SCHEMA },
        relationship: { type: Type.INTEGER },
        respect: { type: Type.INTEGER },
        trust: { type: Type.INTEGER },
        fear: { type: Type.INTEGER },
        mood: MOOD_SCHEMA,
        goals: { type: Type.ARRAY, items: { type: Type.STRING } },
        deathState: DEATH_STATE_SCHEMA,
        mealsEatenStats: {
            type: Type.OBJECT,
            properties: { day: { type: Type.INTEGER }, count: { type: Type.INTEGER } }
        },
        traits: { type: Type.ARRAY, items: TRAIT_SCHEMA },
        ideals: { type: Type.ARRAY, items: { type: Type.STRING } },
        bonds: { type: Type.ARRAY, items: { type: Type.STRING } },
        reputation: REPUTATION_SCHEMA,
        secrets: { type: Type.ARRAY, items: SECRET_SCHEMA },
        scars: { type: Type.ARRAY, items: SCAR_SCHEMA },
        characterArc: CHARACTER_ARC_SCHEMA,
        lifeEvents: { type: Type.ARRAY, items: LIFE_EVENT_SCHEMA },
        tags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Mảng các **Thẻ Lớn** để phân loại vai trò/phe phái." },
        keywords: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Mảng các **Từ Khóa Chi Tiết**." },
        qiPoints: { type: Type.INTEGER, description: "Chân khí để đả thông kinh mạch." },
        meridians: {
            type: Type.OBJECT,
            description: "Một đối tượng ghi lại các huyệt vị đã được đả thông.",
            additionalProperties: { type: Type.BOOLEAN }
        },
        interventionPoints: { type: Type.INTEGER, description: "Điểm Can Thiệp, dùng để thay đổi vận mệnh trong Đồng nhân." }
    },
    required: ['id', 'name', 'displayName', 'species', 'age', 'gender', 'personality', 'description', 'backstory', 'skills', 'abilities', 'relationships', 'inventory']
};

export const CREATION_CHARACTER_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING },
        displayName: { type: Type.STRING },
        title: { type: Type.STRING },
        species: { type: Type.STRING },
        age: { type: Type.INTEGER },
        gender: { type: Type.STRING },
        personality: { type: Type.STRING },
        description: { type: Type.STRING },
        backstory: { type: Type.STRING },
        tags: { type: Type.ARRAY, items: { type: Type.STRING } },
        keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
    },
    required: ['name', 'displayName', 'species', 'age', 'gender', 'personality', 'description', 'backstory']
};
