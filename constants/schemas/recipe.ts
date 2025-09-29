/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { Type } from "@google/genai";
import { ITEM_SCHEMA } from './item';

export const RECIPE_MATERIAL_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        itemId: { type: Type.STRING, description: "ID nội bộ của vật phẩm, ví dụ 'herb_linh_tam'." },
        name: { type: Type.STRING, description: "Tên hiển thị của nguyên liệu." },
        quantity: { type: Type.INTEGER, description: "Số lượng cần thiết." }
    },
    required: ['itemId', 'name', 'quantity']
};

export const RECIPE_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        id: { type: Type.STRING, description: "ID duy nhất cho công thức." },
        name: { type: Type.STRING, description: "Tên của công thức (ví dụ: 'Đan phương: Tụ Khí Tán')." },
        description: { type: Type.STRING, description: "Mô tả ngắn gọn về công thức." },
        type: { type: Type.STRING, enum: ['Alchemy', 'Forging'], description: "Loại công thức: Luyện Đan hoặc Rèn Đúc." },
        materials: {
            type: Type.ARRAY,
            items: RECIPE_MATERIAL_SCHEMA,
            description: "Danh sách các nguyên liệu cần thiết."
        },
        output: {
            ...ITEM_SCHEMA,
            description: "Vật phẩm được tạo ra sau khi chế tạo thành công."
        }
    },
    required: ['id', 'name', 'description', 'type', 'materials', 'output']
};