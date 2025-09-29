/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { Type } from "@google/genai";
import { TURN_DELTAS_COMMON_SCHEMA } from './common';
import { SECT_STORE_LISTING_SCHEMA } from "../store";
import { RECIPE_SCHEMA } from "../recipe";
import { GUILD_SCHEMA } from "../guild";

const voLamProperties = {
    sectStoreUpdates: {
        type: Type.OBJECT,
        description: "If the player's sect store needs to be created or updated, provide the data here.",
        properties: {
            sectId: { type: Type.STRING },
            listings: { type: Type.ARRAY, items: SECT_STORE_LISTING_SCHEMA }
        },
        required: ['sectId', 'listings']
    },
    newRecipes: {
        type: Type.ARRAY,
        items: RECIPE_SCHEMA,
        description: "Grant new crafting recipes to the player."
    },
    newGuilds: {
        type: Type.ARRAY,
        items: GUILD_SCHEMA,
        description: "Create new NPC-led guilds in the world."
    },
    guildUpdates: {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                id: { type: Type.STRING },
                updates: { 
                    additionalProperties: true,
                    description: "A flexible object containing fields to update for the guild."
                }
            },
            required: ['id', 'updates']
        },
        description: "Update existing guilds (e.g., diplomacy changes)."
    },
};

export const VO_LAM_TURN_DELTAS_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        ...TURN_DELTAS_COMMON_SCHEMA.properties,
        ...voLamProperties
    },
    required: TURN_DELTAS_COMMON_SCHEMA.required,
};