/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { Type } from "@google/genai";
import { CHARACTER_SCHEMA, CHARACTER_STATS_SCHEMA } from './character';

export const KNOWLEDGE_ENTITY_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        id: { type: Type.STRING },
        name: { type: Type.STRING },
        displayName: { type: Type.STRING },
        description: { type: Type.STRING },
        tags: { type: Type.ARRAY, items: { type: Type.STRING } },
        keywords: { type: Type.ARRAY, items: { type: Type.STRING } }
    },
    required: ['id', 'name', 'description']
};

export const MONSTER_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        ...KNOWLEDGE_ENTITY_SCHEMA.properties,
        health: {
            type: Type.OBJECT,
            properties: {
                current: { type: Type.INTEGER },
                max: { type: Type.INTEGER }
            },
        },
        stats: CHARACTER_STATS_SCHEMA,
    },
    required: ['id', 'name', 'description']
};

export const KNOWLEDGE_BASE_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        pcs: { type: Type.ARRAY, items: KNOWLEDGE_ENTITY_SCHEMA },
        npcs: { type: Type.ARRAY, items: CHARACTER_SCHEMA },
        locations: { type: Type.ARRAY, items: KNOWLEDGE_ENTITY_SCHEMA },
        factions: { type: Type.ARRAY, items: KNOWLEDGE_ENTITY_SCHEMA },
        monsters: { type: Type.ARRAY, items: MONSTER_SCHEMA }
    }
};
