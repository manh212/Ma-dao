/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { Type } from "@google/genai";
import { 
    CREATION_CHARACTER_SCHEMA as BASE_CREATION_SCHEMA, 
    POWER_SCHEMA, 
    VO_LAM_ARTS_SCHEMA 
} from './character';
import { getTurnSchemaForGenre } from './turn/index';

// Re-export all schemas for easy access from other parts of the application
export * from './character';
export * from './item';
export * from './quest';
export * from './turn/index';
export * from './utility';
export * from './world';
export * from './creation';
export * from './common';
export * from './store';
export * from './recipe';
export * from './guild';

/**
 * Creates a dynamic character creation schema based on the selected genre.
 * This function tailors the schema to include only relevant fields, reducing
 * AI confusion and improving performance.
 * @param genre The genre of the world being created.
 * @returns A tailored schema object for character creation.
 */
export const getConditionalCreationSchema = (genre: string) => {
    // Deep copy the base schema to avoid mutations
    const schema = JSON.parse(JSON.stringify(BASE_CREATION_SCHEMA));

    switch (genre) {
        case 'Tu Tiên':
            schema.properties.linhCan = { type: Type.STRING, description: "Mô tả về linh căn của nhân vật, ví dụ: 'Ngũ Hành Tạp Linh Căn'." };
            break;
        case 'Võ Lâm':
            schema.properties.voLamArts = VO_LAM_ARTS_SCHEMA;
            break;
        case 'Marvel':
            schema.properties.powers = { type: Type.ARRAY, items: POWER_SCHEMA, description: "Các siêu năng lực của nhân vật." };
            schema.properties.alignment = { type: Type.STRING, enum: ['Hero', 'Anti-Hero', 'Villain', 'Neutral'], description: "Lập trường của nhân vật." };
            break;
        // Other genres use the base schema without additions.
    }
    return schema;
};
