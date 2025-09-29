/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { Type } from "@google/genai";
import { STAT_EFFECT_SCHEMA } from './common';

export const ITEM_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING },
        description: { type: Type.STRING },
        quantity: { type: Type.INTEGER },
        type: { type: Type.STRING, enum: ['Quest Item', 'Key', 'Tome', 'Consumable', 'Material', 'Misc', 'Weapon', 'Helmet', 'Chest Armor', 'Boots', 'Accessory', 'Armor'] },
        effects: {
            type: Type.ARRAY,
            items: STAT_EFFECT_SCHEMA,
            description: "Mechanical effects of this item when equipped."
        },
        tags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Mảng các **Thẻ Lớn** để phân loại cấp cao. BẮT BUỘC chọn từ danh sách `CORE_TAGS_AND_KEYWORDS` và `GENRE_SPECIFIC_TAGS_AND_KEYWORDS` được cung cấp." },
        keywords: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Mảng các **Từ Khóa Chi Tiết**. BẮT BUỘC ưu tiên tạo dựa trên các danh mục được cung cấp. Nếu một khái niệm quan trọng MỚI xuất hiện (ví dụ: một tông môn mới), được phép tạo một từ khóa mới theo định dạng `[Loại:Tên]`." }
    },
    required: ['name', 'description', 'quantity', 'type']
};