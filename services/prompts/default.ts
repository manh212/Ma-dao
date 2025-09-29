/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { buildCoreAiRules } from '../../constants/aiConstants';
import { buildKeywordContext } from '../../utils/contextBuilder';
import { commonTags, fantasyTags, marvelTags, modernTags, tuTienTags, voLamTags } from '../../constants/tags';
import type { GameState, WorldSettings, AppSettings } from '../../types';

/**
 * Merges the common tags with genre-specific tags to create a complete context library.
 * @param genre The genre of the world.
 * @returns A combined object of tags and keywords for the AI.
 */
const getGenreSpecificTags = (genre: string) => {
    let genreSpecificTags = {};
    switch (genre) {
        case 'Dị Giới Fantasy':
        case 'Thế Giới Giả Tưởng (Game/Tiểu Thuyết)':
            genreSpecificTags = fantasyTags;
            break;
        case 'Marvel':
            genreSpecificTags = marvelTags;
            break;
        case 'Đô Thị Hiện Đại':
        case 'Quản lý Nhóm nhạc':
        case 'Đô Thị Hiện Đại 100% bình thường':
            genreSpecificTags = modernTags;
            break;
        case 'Tu Tiên':
        case 'Huyền Huyễn Truyền Thuyết':
            genreSpecificTags = tuTienTags;
            break;
        case 'Võ Lâm':
        case 'Thời Chiến (Trung Hoa/Nhật Bản)':
            genreSpecificTags = voLamTags;
            break;
        default:
            break;
    }

    // Deep merge commonTags and genreSpecificTags
    const merged: any = JSON.parse(JSON.stringify(commonTags));
    for (const category in genreSpecificTags) {
        if (!merged[category]) {
            merged[category] = {};
        }
        for (const key in (genreSpecificTags as any)[category]) {
            if (merged[category][key]) {
                 if (Array.isArray(merged[category][key])) {
                    merged[category][key] = [...new Set([...merged[category][key], ...(genreSpecificTags as any)[category][key]])];
                 } else { // It's an object of keywords
                    merged[category][key] = { ...merged[category][key], ...(genreSpecificTags as any)[category][key] };
                 }
            } else {
                merged[category][key] = (genreSpecificTags as any)[category][key];
            }
        }
    }
    return merged;
};

/**
 * Builds the prompt for the default game mechanics. This serves as the base for all genres.
 */
export const buildDefaultTurnPrompt = async (
    context: any,
    gameState: GameState,
    worldSettings: WorldSettings,
    appSettings: AppSettings,
    specialContext?: any
): Promise<string> => {
    const coreRules = buildCoreAiRules(worldSettings, appSettings);
    const keywordContext = buildKeywordContext(gameState, context.playerAction);
    const genreTags = getGenreSpecificTags(worldSettings.genre);
    
    let combatInstruction = '';
    if (gameState.isInCombat) {
        combatInstruction = `\n\n---
**MỆNH LỆNH CHIẾN ĐẤU (ƯU TIÊN CAO NHẤT):**
BẠN HIỆN ĐANG TRONG TRẬN CHIẾN.
- **Diễn biến (\`story\`):** Phải mô tả hành động và phản ứng của các bên trong cuộc chiến.
- **Hành động gợi ý (\`actions\`):** BẮT BUỘC phải là các hành động chiến đấu (tấn công, phòng thủ, dùng kỹ năng, bỏ chạy). Tuân thủ nghiêm ngặt các quy tắc chiến đấu.
---`;
    } else {
        combatInstruction = `\n\n---
**MỆNH LỆNH PHÂN TÍCH GIAO TRANH (ƯU TIÊN CAO NHẤT):**
Dựa trên hành động của người chơi (\`playerAction\`), hãy xác định xem nó có phải là một hành động gây chiến hay không.
- **NẾU** hành động là một hành động tấn công rõ ràng (ví dụ: "rút kiếm tấn công", "lao vào đánh", "bắn một quả cầu lửa"), **THÌ** bạn **BẮT BUỘC** phải bắt đầu trận chiến bằng cách đặt \`combatStatus: "start"\` và cung cấp \`combatantIds\`.
- **NẾU** không, hãy tiếp tục câu chuyện như bình thường.
---`;
    }

    const specialContextInstruction = specialContext
        ? `\n\n---
**BỐI CẢNH ĐẶC BIỆT (ƯU TIÊN TUYỆT ĐỐI):**
Hành động này là một phần của một sự kiện đặc biệt. Bạn BẮT BUỘC phải tường thuật lại diễn biến dựa trên kết quả đã được tính toán trước sau đây:
**Loại sự kiện:** ${specialContext.type}
**Kết quả:** ${specialContext.details}
Nhiệm vụ của bạn là viết một đoạn văn tường thuật hấp dẫn dựa trên kết quả này, sau đó tiếp tục tạo ra các hành động và cập nhật trạng thái như bình thường.
---`
        : '';
    
    return `
**VAI TRÒ:** Bạn là một Người quản trò (Game Master) AI tài ba.
**NHIÊM VỤ:** Dựa trên TOÀN BỘ bối cảnh được cung cấp, hãy xử lý hành động của người chơi và tạo ra lượt chơi tiếp theo.
---
**BỐI CẢNH TỪ KHÓA (ƯU TIÊN HÀNG ĐẦU):**
Đây là những thông tin quan trọng và liên quan nhất cho lượt chơi này. Hãy tập trung vào chúng.
\`\`\`text
${keywordContext}
\`\`\`
---
**THƯ VIỆN BỐI CẢNH (BẮT BUỘC THAM KHẢO):**
Đây là bộ từ điển về các khái niệm, thẻ (tags) và từ khóa (keywords) cho thể loại "${worldSettings.genre}". Bạn BẮT BUỘC phải sử dụng thư viện này để tạo ra các thực thể mới (NPC, vật phẩm, nhiệm vụ) và đảm bảo các lựa chọn hành động phù hợp với thế giới.
\`\`\`json
${JSON.stringify(genreTags, null, 2)}
\`\`\`
---
**BỐI CẢNH TOÀN DIỆN (JSON - DÙNG ĐỂ THAM KHẢO):**
Đây là trạng thái đầy đủ của game, đã được lược bỏ các trường văn bản dài.
\`\`\`json
${JSON.stringify(context, null, 2)}
\`\`\`
${combatInstruction}
${specialContextInstruction}
---
**MỆNH LỆNH THỰC THI:**
1.  **ĐỌC & HIỂU:** Phân tích kỹ lưỡng **BỐI CẢNH TỪ KHÓA** và toàn bộ bối cảnh JSON ở trên.
2.  **XỬ LÝ:** Xử lý hành động của người chơi (\`playerAction\`) trong bối cảnh đó.
3.  **TẠO KẾT QUẢ:** Tạo ra một đối tượng JSON hợp lệ theo schema được cung cấp, mô tả diễn biến tiếp theo và các thay đổi trong thế giới.
4.  **TUÂN THỦ QUY TẮC:** Tuân thủ **TUYỆT ĐỐI** tất cả các quy tắc trong \`coreAiRules\`.

${coreRules}
`;
};
