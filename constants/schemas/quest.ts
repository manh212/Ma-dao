/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { Type } from "@google/genai";

export const QUEST_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        id: { type: Type.STRING },
        title: { type: Type.STRING },
        description: { type: Type.STRING },
        objectives: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    description: { type: Type.STRING },
                    completed: { type: Type.BOOLEAN }
                },
                required: ['description', 'completed']
            }
        },
        status: { type: Type.STRING, enum: ['Ongoing', 'Completed', 'Failed'] },
        reward: { type: Type.STRING },
        failureConsequence: { type: Type.STRING },
        tags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Mảng các **Thẻ Lớn** để phân loại nhiệm vụ. BẮT BUỘC chọn từ danh sách `CORE_TAGS_AND_KEYWORDS` và `GENRE_SPECIFIC_TAGS_AND_KEYWORDS`." },
        keywords: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Mảng các **Từ Khóa Chi Tiết** là các danh từ riêng liên quan. Ưu tiên sử dụng định dạng `[LOẠI:Tên]` (ví dụ: '[NPC:Anya]')." }
    },
    required: ['id', 'title', 'description', 'objectives', 'status']
};

export const QUEST_UPDATE_SCHEMA = {
    type: Type.OBJECT,
    description: "Một đối tượng chứa các thay đổi cho một nhiệm vụ duy nhất.",
    properties: {
        id: { type: Type.STRING, description: "ID của nhiệm vụ cần cập nhật." },
        status: { type: Type.STRING, enum: ['Ongoing', 'Completed', 'Failed'], description: "Trạng thái mới của nhiệm vụ (nếu thay đổi)." },
        newObjective: { type: Type.STRING, description: "Thêm một mục tiêu mới vào nhiệm vụ." },
        completedObjectiveIndex: { type: Type.INTEGER, description: "Đánh dấu một mục tiêu đã hoàn thành (dựa trên chỉ số index, bắt đầu từ 0)." }
    },
    required: ['id']
};
