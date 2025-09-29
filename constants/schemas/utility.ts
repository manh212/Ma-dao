/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { Type } from "@google/genai";

export const SUGGESTIONS_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        suggestions: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "An array of 3 distinct, creative suggestions."
        }
    },
    required: ['suggestions']
};

export const KEYWORD_EXTRACTION_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        summary: {
            type: Type.STRING,
            description: "A concise summary of the most important events."
        },
        keywords: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "An array of 5-10 of the most relevant keywords from the summary, in lowercase."
        }
    },
    required: ['summary', 'keywords']
};

export const AVATAR_SELECTION_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        bestImageId: { type: Type.STRING }
    },
    required: ['bestImageId']
};
