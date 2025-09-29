/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { Type } from "@google/genai";
import { ACTION_SCHEMA } from './action';
import { CREATION_CHARACTER_SCHEMA } from '../character';
import { KNOWLEDGE_ENTITY_SCHEMA, MONSTER_SCHEMA } from '../world';
import { QUEST_SCHEMA } from "../quest";

const KNOWLEDGE_BASE_CREATION_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        newNpcs: { type: Type.ARRAY, items: CREATION_CHARACTER_SCHEMA },
        newLocations: { type: Type.ARRAY, items: KNOWLEDGE_ENTITY_SCHEMA },
        newFactions: { type: Type.ARRAY, items: KNOWLEDGE_ENTITY_SCHEMA },
        newMonsters: { type: Type.ARRAY, items: MONSTER_SCHEMA },
    }
};

export const TURN_DELTAS_COMMON_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        story: { type: Type.STRING },
        timeCostInMinutes: { type: Type.INTEGER },
        weatherUpdate: { type: Type.STRING },
        actions: { type: Type.ARRAY, items: ACTION_SCHEMA },
        summary: {
            type: Type.OBJECT,
            properties: { 
                text: { type: Type.STRING }, 
                tags: { type: Type.ARRAY, items: { type: Type.STRING } } 
            },
            required: ['text'],
        },
        knowledgeBaseUpdates: KNOWLEDGE_BASE_CREATION_SCHEMA,
        npcBackgroundUpdates: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
        },
        messages: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    text: { type: Type.STRING },
                    type: { type: Type.STRING, enum: ['system', 'reality_ripple'] }
                },
                required: ['text']
            },
        },
        isIntercourseSceneStart: { type: Type.BOOLEAN },
        predictedActionId: { type: Type.STRING },
        combatStatus: { type: Type.STRING, enum: ['start', 'end', 'ongoing'] },
        combatantIds: { type: Type.ARRAY, items: { type: Type.STRING }, description: "When combatStatus is 'start', this is a REQUIRED field containing the IDs of all combatants (including PC)." },
        worldEvent: {
            type: Type.OBJECT,
            description: "A major, significant event occurring in the world.",
            properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING }
            }
        },
        newQuests: {
            type: Type.ARRAY,
            items: QUEST_SCHEMA,
            description: "Add new quests for the player."
        },
    },
    required: ['story', 'timeCostInMinutes', 'actions', 'summary']
};