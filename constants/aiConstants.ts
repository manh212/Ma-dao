/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { BASE_RULES, FORMATTING_RULES, CONSISTENCY_RULES, MECHANICS_RULES, ADULT_RULES, CONTENT_RULES } from './ai/rules';
import { WorldSettings, AppSettings } from '../types';
import { STORY_LENGTH_INSTRUCTIONS } from './gameConstants';


// ====================================================================================
// GHI CHÚ QUAN TRỌNG TỪ HỆ THỐNG
//
// Các tệp quy tắc AI đã được tách thành các module nhỏ hơn trong `constants/ai/rules`.
// Tệp này chứa hàm `buildCoreAiRules` để tự động lắp ráp các quy tắc đó lại
// dựa trên cài đặt của người chơi, tạo ra một prompt động và thông minh hơn.
//
// TRONG CÁC YÊU CẦU TIẾP THEO, BẠN KHÔNG CẦN GỬI LẠI CÁC TỆP QUY TẮC.
//
// Hệ thống sẽ luôn ghi nhớ và sử dụng phiên bản đầy đủ nhất.
// Cảm ơn sự hợp tác của bạn!
// ====================================================================================

/**
 * Assembles the final set of AI rules based on game and user settings.
 * @param worldSettings The settings for the current world (genre, 18+, etc.).
 * @param appSettings The user's application settings (story length, etc.).
 * @returns A single string containing all applicable rules for the AI prompt.
 */
export const buildCoreAiRules = (worldSettings: WorldSettings, appSettings: AppSettings): string => {
    // Start with the unconditional base rules.
    const coreRules = [
        BASE_RULES,
        FORMATTING_RULES,
        CONSISTENCY_RULES,
        CONTENT_RULES,
        MECHANICS_RULES,
    ].join('\n\n---\n');
    
    // Generate dynamic instructions based on current settings.
    const instructions = [];
    const allow18Plus = worldSettings.allow18Plus;

    // Story Length (from AppSettings)
    const storyLengthInstruction = STORY_LENGTH_INSTRUCTIONS[appSettings.storyLength as keyof typeof STORY_LENGTH_INSTRUCTIONS] || STORY_LENGTH_INSTRUCTIONS.standard;
    instructions.push(`#### 1. MỆNH LỆNH VỀ ĐỘ DÀI CÂU CHUYỆN (storyLength):\n${storyLengthInstruction}`);

    // Writing Style
    switch (worldSettings.writingStyle) {
        case 'default':
            instructions.push(`#### 2. MỆNH LỆNH VỀ VĂN PHONG (writingStyle):\nBạn BẮT BUỘC phải viết theo văn phong hiện thực, không né tránh. Mô tả chi tiết và trần trụi các cảnh hành động, bạo lực, cảm xúc và (nếu ${allow18Plus}) các cảnh tình dục một cách không che đậy, tập trung vào các chi tiết sinh lý và cảm xúc xác thịt.`);
            break;
        case 'no_segg_polite':
            instructions.push(`#### 2. MỆNH LỆNH VỀ VĂN PHONG (writingStyle):\nBạn BẮT BUỘC phải viết theo văn phong văn học, lịch sự và tinh tế. Sử dụng ngôn từ gợi tả, ước lệ. **NGHIÊM CẤM TUYỆT ĐỐI** việc mô tả chi tiết các hành động tình dục, kể cả khi ${allow18Plus}. Thay vào đó, hãy sử dụng kỹ thuật 'fade to black' (màn hình mờ đi) hoặc gợi ý một cách lãng mạn.`);
            break;
    }

    // Narrative Voice
    switch (worldSettings.narrativeVoice) {
        case 'first': instructions.push("#### 3. MỆNH LỆNH VỀ NGÔI KỂ (narrativeVoice):\nViết toàn bộ diễn biến ở ngôi thứ nhất, sử dụng đại từ 'Tôi'."); break;
        case 'second': instructions.push("#### 3. MỆNH LỆNH VỀ NGÔI KỂ (narrativeVoice):\nViết toàn bộ diễn biến ở ngôi thứ hai, sử dụng đại từ 'Bạn'."); break;
        case 'third_limited': instructions.push("#### 3. MỆNH LỆNH VỀ NGÔI KỂ (narrativeVoice):\nViết toàn bộ diễn biến ở ngôi thứ ba, nhưng chỉ tập trung vào suy nghĩ và cảm xúc của nhân vật chính."); break;
        case 'third_omniscient': instructions.push("#### 3. MỆNH LỆNH VỀ NGÔI KỂ (narrativeVoice):\nViết toàn bộ diễn biến ở ngôi thứ ba. Bạn được phép mô tả suy nghĩ và cảm xúc của tất cả các nhân vật trong cảnh."); break;
    }

    // Difficulty
    switch (worldSettings.difficulty) {
        case 'easy': instructions.push("#### 4. MỆNH LỆNH VỀ ĐỘ KHÓ (difficulty):\nThế giới này đang ở độ khó Dễ. Bạn BẮT BUỘC phải: 1. Tạo ra các thử thách đơn giản. 2. Cho kẻ địch hành động kém thông minh. 3. Tăng đáng kể tỷ lệ thành công của các hành động. 4. Ưu tiên phát triển cốt truyện một cách thuận lợi."); break;
        case 'normal': instructions.push("#### 4. MỆNH LỆNH VỀ ĐỘ KHÓ (difficulty):\nThế giới này đang ở độ khó Thường. Bạn BẮT BUỘC phải: 1. Tạo ra các thử thách và phản ứng của NPC một cách logic, cân bằng. 2. Tỷ lệ thành công và phần thưởng phải hợp lý. 3. Kẻ địch hành động có tính toán."); break;
        case 'hard': instructions.push("#### 4. MỆNH LỆNH VỀ ĐỘ KHÓ (difficulty):\nThế giới này đang ở độ khó Khó. Bạn BẮT BUỘC phải: 1. Khiến kẻ địch trở nên thông minh và nguy hiểm hơn. 2. Tài nguyên và cơ hội trở nên khan hiếm. 3. Giảm tỷ lệ thành công của các hành động, đòi hỏi người chơi phải có chiến thuật. 4. Hậu quả của thất bại sẽ nghiêm trọng hơn."); break;
        case 'nightmare': instructions.push("#### 4. MỆNH LỆNH VỀ ĐỘ KHÓ (difficulty):\nThế giới này đang ở độ khó Ác Mộng. Bạn BẮT BUỘC phải trở thành một người quản trò TÀN NHẪN và KHẮC NGHIỆT: 1. Kẻ địch cực kỳ thông minh, tàn độc và có thể phục kích. 2. Mọi sai lầm của người chơi đều phải dẫn đến những hậu quả thảm khốc, bao gồm cả cái chết. 3. Luôn đẩy người chơi vào những tình huống sinh tồn ngặt nghèo."); break;
    }

    // AI Processing Mode
    switch (appSettings.aiProcessingMode) {
        case 'speed': instructions.push("#### 5. MỆNH LỆNH VỀ ĐỘ SÂU SUY LUẬN (aiProcessingMode):\nƯu tiên phản hồi nhanh. Tập trung vào các kết quả trực tiếp và các nhân vật chính. Giảm thiểu các cập nhật nền cho NPC không liên quan."); break;
        case 'quality': instructions.push("#### 5. MỆNH LỆNH VỀ ĐỘ SÂU SUY LUẬN (aiProcessingMode):\nCân bằng giữa chi tiết và tốc độ. Cập nhật trạng thái cho các NPC có liên quan và mô tả các hệ quả ngắn hạn một cách logic."); break;
        case 'max_quality': instructions.push("#### 5. MỆNH LỆNH VỀ ĐỘ SÂU SUY LUẬN (aiProcessingMode):\nƯu tiên sự chi tiết và sâu sắc. Mô tả các hệ quả sâu rộng, cập nhật trạng thái cho nhiều NPC nền (nếu hợp lý), và gieo mầm cho các cốt truyện tương lai. Thời gian xử lý có thể lâu hơn."); break;
    }
    
    const dynamicInstructions = instructions.length === 0 ? '' : `
---
**HƯỚNG DẪN ĐỘNG (Dựa trên Cài đặt của Người chơi - BẮT BUỘC TUÂN THỦ NGHIÊM NGẶT):**

${instructions.join('\n\n')}
---`;

    // Conditionally add adult content rules.
    const adultContentRules = worldSettings.allow18Plus ? `\n\n---\n${ADULT_RULES}` : '';

    const finalRules = `${coreRules}\n\n${dynamicInstructions}${adultContentRules}\n\n// AI_CORE_RULES_END_TAG_v4.0_MODULAR`;

    return finalRules;
};

// NEW: Centralized Model Names & Constants
export const GEMINI_FLASH = 'gemini-2.5-flash';

export const API_KEY_VALIDATION_PROMPT = 'This is a test to validate the API key.';