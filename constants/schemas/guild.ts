/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { Type } from "@google/genai";

const GUILD_BUILDING_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        level: { type: Type.INTEGER }
    },
    required: ['level']
};

const DIPLOMATIC_RELATION_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        factionId: { type: Type.STRING },
        status: { type: Type.STRING, enum: ['War', 'Ally', 'Neutral'] }
    },
    required: ['factionId', 'status']
};

export const GUILD_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        id: { type: Type.STRING },
        name: { type: Type.STRING },
        ownerId: { type: Type.STRING },
        members: { type: Type.ARRAY, items: { type: Type.STRING } },
        buildings: {
            type: Type.OBJECT,
            properties: {
                mainHall: GUILD_BUILDING_SCHEMA,
                trainingGrounds: GUILD_BUILDING_SCHEMA,
                treasury: GUILD_BUILDING_SCHEMA,
            },
            required: ['mainHall', 'trainingGrounds', 'treasury']
        },
        resources: {
            type: Type.OBJECT,
            properties: {
                gold: { type: Type.INTEGER },
                wood: { type: Type.INTEGER },
                ore: { type: Type.INTEGER },
            },
            required: ['gold', 'wood', 'ore']
        },
        diplomacy: {
            type: Type.ARRAY,
            items: DIPLOMATIC_RELATION_SCHEMA
        }
    },
    required: ['id', 'name', 'ownerId', 'members', 'buildings', 'resources', 'diplomacy']
};