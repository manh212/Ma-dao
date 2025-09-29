/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { Type } from "@google/genai";

// This schema is shared between Character traits and Item effects.
export const STAT_EFFECT_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        stat: { type: Type.STRING, description: "The key of the stat to modify. E.g., 'strength' or 'fear_resistance'." },
        value: { type: Type.NUMBER, description: "The additive value (can be negative)." }
    },
    required: ['stat', 'value']
};