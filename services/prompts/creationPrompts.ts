/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { buildCoreAiRules } from '../../constants/aiConstants';
import { DIFFICULTY_LEVELS } from '../../constants/gameConstants';
import type { WorldSettings, AppSettings } from '../../types';

// These functions were moved from useWorldCreation.ts to centralize AI logic.

export const buildPlanningPrompt = (creationData: WorldSettings, appSettings: AppSettings): string => {
    const activeLore = (creationData.loreRules || []).filter(r => r.isActive).map(r => r.text).join('\n');
    const coreAiRules = buildCoreAiRules(creationData, appSettings);
    const difficultyNotes = DIFFICULTY_LEVELS[creationData.difficulty]?.notes.join(' ');

    return `
**VAI TRÒ:** Bạn là một Đạo diễn Game AI, một người lên kế hoạch bậc thầy.
**NHIỆM VỤ:** Dựa trên các thông tin nền tảng do người chơi cung cấp, hãy tạo ra một BẢN KẾ HOẠCH CHI TIẾT cho lượt chơi ĐẦU TIÊN của game. Đây là bước chuẩn bị, không phải viết truyện.
---
**THÔNG TIN NỀN TẢNG (Từ Người chơi):**
\`\`\`json
${JSON.stringify(creationData, null, 2)}
\`\`\`
---
${activeLore ? `**LUẬT LỆ TỐI THƯỢỢNG (BẮT BUỘC TUÂN THỦ):**\n${activeLore}\n\n---` : ''}
**MỆNH LỆNH LÊN KẾ HOẠCH:**
1.  **Sự kiện chính (keyEvents):** Liệt kê 2-3 sự kiện hoặc tương tác chính sẽ xảy ra trong cảnh mở đầu.
2.  **Thay đổi Nhân vật chính (characterChangesSummary):** Mô tả ngắn gọn trạng thái ban đầu của nhân vật chính và những gì họ có thể học được hoặc thay đổi trong lượt đầu tiên.
3.  **Cập nhật NPC (npcUpdatesSummary):** Liệt kê các NPC sẽ xuất hiện và vai trò của họ trong cảnh.
4.  **Thực thể Mới (newEntitiesToIntroduce):** Nếu cần giới thiệu quái vật hoặc NPC phụ, hãy liệt kê chúng ở đây.
5.  **Tiến triển Nhiệm vụ (questProgressSummary):** Mô tả cách lượt chơi đầu tiên sẽ giới thiệu hoặc bắt đầu một nhiệm vụ (nếu có).
6.  **Tông màu (overallTone):** Mô tả không khí chung của cảnh (ví dụ: "Bí ẩn và căng thẳng", "Hài hước và nhẹ nhàng", "Hành động dồn dập").
7.  **Độ khó:** Hãy ghi nhớ độ khó được chọn là '${creationData.difficulty}' (${difficultyNotes}). Kế hoạch của bạn phải phản ánh điều này.
---
**ĐỊNH DẠNG ĐẦU RA:** Trả về một đối tượng JSON hợp lệ theo schema được cung cấp.
${coreAiRules}
`;
};

export const buildCharacterPrompt = (creationData: WorldSettings, creationPlan: any, appSettings: AppSettings): string => {
    const activeLore = (creationData.loreRules || []).filter(r => r.isActive).map(r => r.text).join('\n');
    const coreAiRules = buildCoreAiRules(creationData, appSettings);

    const startingJobInstruction = creationData.startingJob
        ? `\n- **Công việc Khởi đầu (QUAN TRỌNG):** Người chơi đã chỉ định công việc khởi đầu là "${creationData.startingJob}". BẮT BUỘC phải tạo nhân vật với công việc này.`
        : '';

    return `
**VAI TRÒ:** Bạn là một Nhà tạo hình nhân vật (Character Designer) tài ba.
**NHIỆM VỤ:** Dựa trên thông tin người chơi, kế hoạch của đạo diễn, và luật lệ thế giới, hãy tạo ra các đối tượng nhân vật chi tiết.
---
**THÔNG TIN TỪ NGƯỜI CHƠI (JSON):**
\`\`\`json
${JSON.stringify(creationData, null, 2)}
\`\`\`
---
**KẾ HOẠCH CỦA ĐẠO DIỄN (JSON):**
\`\`\`json
${JSON.stringify(creationPlan, null, 2)}
\`\`\`
---
${activeLore ? `**LUẬT LỆ TỐI THƯỢỢNG (BẮT BUỘC TUÂN THỦ):**\n${activeLore}\n\n---` : ''}
**MỆNH LỆNH TẠO NHÂN VẬT:**
1.  **Tạo Nhân vật chính (playerCharacter):**
    -   Nếu người chơi đã cung cấp tên, hãy sử dụng nó. Nếu không, hãy tạo một cái tên phù hợp.
    -   Viết một đoạn mô tả ngoại hình và tính cách chi tiết, kết hợp thông tin của người chơi và kế hoạch.${startingJobInstruction}
    -   Tạo một bộ kỹ năng (skills) ban đầu (khoảng 2-3 kỹ năng) phù hợp với bối cảnh và tiểu sử.
2.  **Tạo các NPC Ban đầu (initialNpcs):**
    -   Dựa trên \`npcUpdatesSummary\` và \`newEntitiesToIntroduce\` từ kế hoạch, tạo các đối tượng NPC đầy đủ.
    -   Mỗi NPC phải có mô tả, tính cách và kỹ năng riêng.
    -   Thiết lập mối quan hệ (\`relationship\`) ban đầu của họ với nhân vật chính.
---
**ĐỊNH DẠNG ĐẦU RA:** Trả về một đối tượng JSON hợp lệ theo schema được cung cấp.
${coreAiRules}
`;
};

export const buildSceneWritingPrompt = (creationData: WorldSettings, creationPlan: any, characters: any, appSettings: AppSettings): string => {
    const activeLore = (creationData.loreRules || []).filter(r => r.isActive).map(r => r.text).join('\n');
    const coreAiRules = buildCoreAiRules(creationData, appSettings);

    return `
**VAI TRÒ:** Bạn là một Người quản trò (Game Master) kiêm nhà văn xuất sắc.
**NHIỆM VỤ:** Viết cảnh mở đầu của câu chuyện và thiết lập trạng thái ban đầu của thế giới.
---
**BỐI CẢNH (JSON):**
- **Thông tin Người chơi:** ${JSON.stringify(creationData, null, 2)}
- **Kế hoạch Đạo diễn:** ${JSON.stringify(creationPlan, null, 2)}
- **Nhân vật đã tạo:** ${JSON.stringify(characters, null, 2)}
---
${activeLore ? `**LUẬT LỆ TỐI THƯỢỢNG (BẮT BUỘC TUÂN THỦ):**\n${activeLore}\n\n---` : ''}
**MỆNH LỆNH VIẾT CẢNH:**
1.  **Tạo Tiêu đề (title):** Đặt một cái tên thật hấp dẫn cho thế giới hoặc câu chuyện.
2.  **Tóm tắt Thế giới (worldSummary):** Dựa trên \`creationData.details\`, viết lại một bản tóm tắt thế giới ngắn gọn (2-3 câu) theo văn phong trong game.
3.  **Thiết lập Thời gian (gameTime):** Đặt thời gian bắt đầu của câu chuyện.
4.  **Viết Diễn biến Mở đầu (story):**
    -   Dựa vào \`keyEvents\` từ kế hoạch, viết một đoạn văn tường thuật chi tiết, lôi cuốn cho lượt chơi đầu tiên.
    -   Giới thiệu nhân vật chính và các NPC có liên quan một cách tự nhiên.
5.  **Tạo Hành động Gợi ý (actions):** Đưa ra BỐN hành động đầu tiên mà người chơi có thể lựa chọn, phải hấp dẫn và phù hợp với tình huống.
6.  **Tạo Nhiệm vụ Ban đầu (initialQuests):** Nếu kế hoạch có đề cập, hãy tạo một hoặc hai nhiệm vụ đầu tiên.
---
**ĐỊNH DẠNG ĐẦU RA:** Trả về một đối tượng JSON hợp lệ theo schema được cung cấp.
${coreAiRules}
`;
};

export const buildWorldEnrichmentPrompt = (creationData: WorldSettings, creationPlan: any, characters: any, sceneData: any, appSettings: AppSettings): string => {
    const activeLore = (creationData.loreRules || []).filter(r => r.isActive).map(r => r.text).join('\n');
    const coreAiRules = buildCoreAiRules(creationData, appSettings);

    return `
**VAI TRÒ:** Bạn là một Người xây dựng Thế giới (World Builder) sáng tạo.
**NHIỆM VỤ:** Làm giàu thêm cho thế giới bằng cách tạo ra các địa điểm, phe phái, và quái vật nền.
---
**BỐI CẢNH (JSON):**
- **Thông tin Người chơi:** ${JSON.stringify(creationData, null, 2)}
- **Kế hoạch Đạo diễn:** ${JSON.stringify(creationPlan, null, 2)}
- **Nhân vật:** ${JSON.stringify(characters, null, 2)}
- **Cảnh mở đầu:** ${JSON.stringify(sceneData, null, 2)}
---
${activeLore ? `**LUẬT LỆ TỐI THƯỢỢNG (BẮT BUỘC TUÂN THỦ):**\n${activeLore}\n\n---` : ''}
**MỆNH LỆNH LÀM GIÀU THẾ GIỚI:**
1.  **Tạo Địa điểm (locations):** Dựa trên bối cảnh, tạo ra 3-5 địa điểm thú vị có thể tồn tại trong khu vực lân cận.
2.  **Tạo Phe phái (factions):** Tạo ra 2-3 phe phái hoặc tổ chức có liên quan đến câu chuyện.
3.  **Tạo Quái vật (monsters):** Tạo ra 2-3 loại quái vật phù hợp với thế giới.
4.  **Tạo Nhiệm vụ Phụ (quests):** Opcional. Tạo 1-2 nhiệm vụ phụ mà người chơi có thể khám phá.
5.  **Tạo NPC Phụ (npcs):** Opcional. Tạo 1-2 NPC phụ để làm thế giới thêm sống động.
---
**ĐỊNH DẠNG ĐẦU RA:** Trả về một đối tượng JSON hợp lệ theo schema được cung cấp.
${coreAiRules}
`;
};