/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { Type } from "@google/genai";
import { ITEM_SCHEMA } from './item';
import { SKILL_SCHEMA, TALENT_SCHEMA } from './character';

// A schema for a single item or skill available for purchase in a sect store.
// The AI must provide either itemData or skillData, but not both.
export const SECT_STORE_LISTING_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        cost: { 
            type: Type.INTEGER,
            description: "Chi phí bằng điểm cống hiến để mua."
        },
        listingType: {
            type: Type.STRING,
            enum: ['ITEM', 'SKILL'],
            description: "Phân loại đây là vật phẩm hay kỹ năng."
        },
        // Spread item and skill properties directly
        // This is a workaround for the lack of 'oneOf' in the Gemini API's schema definition.
        // We will rely on the `listingType` field to determine which type of object it is.
        // Item properties from ITEM_SCHEMA
        name: { type: Type.STRING },
        description: { type: Type.STRING },
        quantity: { type: Type.INTEGER },
        type: { type: Type.STRING },
        effects: ITEM_SCHEMA.properties.effects,
        // Skill properties from SKILL_SCHEMA
        id: { type: Type.STRING },
        evolutionDescription: { type: Type.STRING },
        level: { type: Type.INTEGER },
        xp: { type: Type.INTEGER },
        talentSlots: { type: Type.INTEGER },
        unlockedTalents: { type: Type.ARRAY, items: TALENT_SCHEMA },
        skillType: { type: Type.STRING },
        target: { type: Type.STRING },
        manaCost: { type: Type.INTEGER },
        masteryLevel: { type: Type.STRING },
        masteryXp: { type: Type.INTEGER },
    },
    required: ['cost', 'listingType', 'name', 'description']
};