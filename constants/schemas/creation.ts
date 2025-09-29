/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { Type } from "@google/genai";
import { GENRES, SETTINGS, DIFFICULTY_LEVELS } from '../gameConstants';
import { VO_LAM_ARTS_SCHEMA, CREATION_CHARACTER_SCHEMA } from './character';
import { ACTION_SCHEMA, GAME_TIME_SCHEMA } from './turn/action';
import { QUEST_SCHEMA } from './quest';
import { KNOWLEDGE_ENTITY_SCHEMA, MONSTER_SCHEMA } from './world';
import { STAT_EFFECT_SCHEMA } from "./common";

export const ENRICHED_SKILL_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        id: { type: Type.STRING, description: "ID gốc của kỹ năng từ form, nếu có." },
        name: { type: Type.STRING, description: "Tên kỹ năng." },
        description: { type: Type.STRING, description: "Mô tả kỹ năng." },
        type: { type: Type.STRING, enum: ['Active', 'Passive'], description: "Loại kỹ năng: Active (Chủ động) hoặc Passive (Bị động)." },
        manaCost: { type: Type.INTEGER, description: "Chi phí Linh Lực/Mana để sử dụng." },
        skillType: { type: Type.STRING, enum: ['Attack', 'Heal', 'Buff', 'Debuff'], description: "Phân loại kỹ năng." },
        target: { type: Type.STRING, enum: ['Self', 'Enemy', 'Ally'], description: "Mục tiêu của kỹ năng." },
        effects: { type: Type.ARRAY, items: STAT_EFFECT_SCHEMA, description: "Hiệu ứng cơ học trực tiếp (ví dụ: gây sát thương, hồi máu)." }
    },
    required: ['id', 'name', 'description', 'type', 'manaCost', 'skillType', 'target']
};

export const COMPLETE_CREATION_CHARACTER_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        ...CREATION_CHARACTER_SCHEMA.properties,
        skills: { type: Type.ARRAY, items: ENRICHED_SKILL_SCHEMA }
    },
    required: [...CREATION_CHARACTER_SCHEMA.required, 'skills']
};

const CANON_EVENT_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        id: { type: Type.STRING, description: "Một ID duy nhất cho sự kiện, ví dụ 'event_01_hogwarts_letter'." },
        title: { type: Type.STRING, description: "Tiêu đề ngắn gọn cho sự kiện, ví dụ 'Nhận thư Hogwarts'." },
        description: { type: Type.STRING, description: "Mô tả chi tiết hơn về sự kiện." },
        turnNumber: { type: Type.INTEGER, description: "Lượt chơi (hoặc thứ tự) mà sự kiện này dự kiến sẽ xảy ra." },
        status: { type: Type.STRING, enum: ['future'], description: "Trạng thái ban đầu của tất cả các sự kiện phải là 'future'." }
    },
    required: ['id', 'title', 'description', 'turnNumber', 'status']
};

export const FANFIC_ANALYSIS_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING, description: "Một tiêu đề hấp dẫn cho câu chuyện dựa trên nội dung được phân tích." },
        worldSummary: { type: Type.STRING, description: "Một bản tóm tắt ngắn gọn (2-3 câu) về bối cảnh và tiền đề chính của câu chuyện." },
        mainCharacter: {
            type: Type.OBJECT,
            description: "Thông tin chi tiết về nhân vật chính trong nguyên tác.",
            properties: {
                name: { type: Type.STRING },
                species: { type: Type.STRING },
                gender: { type: Type.STRING },
                description: { type: Type.STRING, description: "Mô tả ngắn gọn về ngoại hình và tính cách." },
            },
            required: ['name', 'species', 'gender', 'description']
        },
        canonTimeline: {
            type: Type.ARRAY,
            items: CANON_EVENT_SCHEMA,
            description: "Một danh sách các sự kiện cốt lõi của câu chuyện, theo thứ tự thời gian."
        },
        suggestedRoles: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Ba vai trò khởi đầu được gợi ý cho người chơi, ví dụ: 'Trở thành một nhân vật hoàn toàn mới' hoặc 'Thay thế nhân vật chính [Tên]'."
        }
    },
    required: ['title', 'worldSummary', 'mainCharacter', 'canonTimeline', 'suggestedRoles']
};


export const TURN_PLAN_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        keyEvents: { type: Type.ARRAY, items: { type: Type.STRING } },
        characterChangesSummary: { type: Type.STRING },
        npcUpdatesSummary: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    npcName: { type: Type.STRING },
                    summaryOfChanges: { type: Type.STRING }
                },
                required: ['npcName', 'summaryOfChanges']
            }
        },
        newEntitiesToIntroduce: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    type: { type: Type.STRING, enum: ['NPC', 'MONSTER'] },
                    briefDescription: { type: Type.STRING }
                },
                required: ['name', 'type', 'briefDescription']
            }
        },
        questProgressSummary: { type: Type.STRING },
        overallTone: { type: Type.STRING }
    },
    required: ['keyEvents', 'characterChangesSummary', 'npcUpdatesSummary', 'questProgressSummary', 'overallTone']
};

export const LORE_RULES_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        rules: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "An array of lore rule strings."
        }
    },
    required: ['rules']
};

export const INITIAL_CHARACTERS_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        playerCharacter: COMPLETE_CREATION_CHARACTER_SCHEMA,
        initialNpcs: { type: Type.ARRAY, items: COMPLETE_CREATION_CHARACTER_SCHEMA }
    },
    required: ['playerCharacter', 'initialNpcs']
};

export const SCENE_WRITING_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        story: { type: Type.STRING, description: "Diễn biến câu chuyện mở đầu." },
        worldSummary: { type: Type.STRING, description: "Tóm tắt ngắn gọn về bối cảnh thế giới." },
        title: { type: Type.STRING, description: "Tên của câu chuyện/thế giới." },
        gameTime: GAME_TIME_SCHEMA,
        actions: { type: Type.ARRAY, items: ACTION_SCHEMA, description: "BỐN hành động gợi ý đầu tiên." },
        initialQuests: { type: Type.ARRAY, items: QUEST_SCHEMA, description: "Các nhiệm vụ ban đầu (nếu có)." },
        messages: {
            type: Type.ARRAY,
            maxItems: 1,
            items: {
                type: Type.OBJECT,
                properties: { text: { type: Type.STRING } },
                required: ['text']
            },
            description: "Thông báo hệ thống ban đầu (nếu có)."
        },
    },
    required: ['story', 'worldSummary', 'title', 'gameTime', 'actions']
};

export const WORLD_ENRICHMENT_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        locations: { type: Type.ARRAY, items: KNOWLEDGE_ENTITY_SCHEMA },
        factions: { type: Type.ARRAY, items: KNOWLEDGE_ENTITY_SCHEMA },
        monsters: { type: Type.ARRAY, items: MONSTER_SCHEMA },
        quests: { type: Type.ARRAY, items: QUEST_SCHEMA },
        npcs: { type: Type.ARRAY, items: CREATION_CHARACTER_SCHEMA }
    },
    required: ['locations', 'factions', 'monsters', 'npcs']
};