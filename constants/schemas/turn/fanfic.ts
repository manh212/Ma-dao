/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { Type } from "@google/genai";
import { TURN_DELTAS_COMMON_SCHEMA } from './common';

const fanficProperties = {
    canonTimelineUpdates: {
        type: Type.ARRAY,
        description: "Update the status of events in the Canon Timeline.",
        items: {
            type: Type.OBJECT,
            properties: {
                id: { type: Type.STRING, description: "ID of the event to update." },
                newStatus: { type: Type.STRING, enum: ['past', 'present', 'diverged'], description: "The new status of the event." }
            },
            required: ['id', 'newStatus']
        }
    },
    interventionPointsChange: { type: Type.INTEGER, description: "The number of Intervention Points awarded (or deducted) this turn." },
    canonCompatibilityChange: { type: Type.NUMBER, description: "The change in Canon Compatibility score (use a negative value to decrease)." }
};

export const FANFIC_TURN_DELTAS_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        ...TURN_DELTAS_COMMON_SCHEMA.properties,
        ...fanficProperties
    },
    required: TURN_DELTAS_COMMON_SCHEMA.required,
};