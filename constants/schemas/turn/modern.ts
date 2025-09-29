/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { Type } from "@google/genai";
import { TURN_DELTAS_COMMON_SCHEMA } from './common';
import { JOB_SCHEMA, ASSET_SCHEMA, CHARACTER_STATS_SCHEMA, MOOD_SCHEMA } from '../character';
import { ITEM_SCHEMA } from '../item';

const modernProperties = {
    jobChange: {
        ...JOB_SCHEMA,
        description: "Nếu có sự thay đổi về công việc của nhân vật chính (thăng chức, đổi việc), hãy cung cấp đối tượng Job mới tại đây."
    },
    newAssets: {
        type: Type.ARRAY,
        items: ASSET_SCHEMA,
        description: "Nếu nhân vật chính mua hoặc nhận được tài sản mới (nhà, xe), hãy thêm chúng vào mảng này."
    },
    characterDeltas: {
        type: Type.ARRAY,
        description: "Một mảng các đối tượng chứa các thay đổi thuộc tính cho các nhân vật (PC và NPC), bao gồm cả các chỉ số mới như stress, socialEnergy.",
        items: {
            type: Type.OBJECT,
            properties: {
                id: { type: Type.STRING, description: "ID của nhân vật cần cập nhật." },
                updates: {
                    type: Type.OBJECT,
                    description: "Một đối tượng chứa các trường cần cập nhật cho nhân vật, ví dụ: { 'stats': { 'stress': 10 } }.",
                    properties: {
                        stats: CHARACTER_STATS_SCHEMA,
                        mood: MOOD_SCHEMA,
                        inventory: { type: Type.ARRAY, items: ITEM_SCHEMA },
                        money: { type: Type.INTEGER },
                        job: JOB_SCHEMA,
                        assets: { type: Type.ARRAY, items: ASSET_SCHEMA },
                        relationship: { type: Type.INTEGER, description: "Thiện cảm với người chơi." },
                        respect: { type: Type.INTEGER },
                        trust: { type: Type.INTEGER },
                        fear: { type: Type.INTEGER },
                        health: {
                            type: Type.OBJECT,
                            properties: {
                                current: { type: Type.INTEGER },
                                max: { type: Type.INTEGER }
                            },
                        },
                        title: { type: Type.STRING },
                        description: { type: Type.STRING },
                    },
                }
            },
            required: ['id', 'updates']
        }
    },
};

export const MODERN_TURN_DELTAS_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        ...TURN_DELTAS_COMMON_SCHEMA.properties,
        ...modernProperties
    },
    required: TURN_DELTAS_COMMON_SCHEMA.required,
};