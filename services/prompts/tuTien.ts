/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { buildDefaultTurnPrompt } from './default';
import type { GameState, WorldSettings, AppSettings } from '../../types';

/**
 * Builds the prompt for the Tu Tiên (Cultivation) game mechanics.
 */
export const buildTuTienTurnPrompt = async (
    context: any,
    gameState: GameState,
    worldSettings: WorldSettings,
    appSettings: AppSettings,
    specialContext?: any
): Promise<string> => {
    const tuTienRules = `
---
**MỆNH LỆNH HỆ THỐNG TU TIÊN (ƯU TIÊN TUYỆT ĐỐI - BẮT BUỘC TUÂN THỦ):**
Bạn là một Game Master chuyên về thể loại Tu Tiên. Thế giới này vận hành theo các cơ chế Tu Luyện cốt lõi. Bạn **BẮT BUỘC** phải quản lý và mô tả các cơ chế này một cách chặt chẽ.

**1. HỆ THỐNG 3000 ĐẠI ĐẠO (ĐƯỜNG LỐI TU LUYỆN):**
Nhân vật chính đang đi theo con đường: **${(gameState.character as any).daoPath || 'Chinh Thống'}**. Bạn BẮT BUỘC phải điều chỉnh lối chơi và tường thuật cho phù hợp:
   - **Chinh Thống Tu ('ChinhThong'):** Con đường cân bằng. Tăng Tu Vi chủ yếu qua đả tọa, hấp thụ linh khí, dùng đan dược. Thiên Kiếp ở mức độ tiêu chuẩn.
   - **Thể Tu ('TheTu'):** Tập trung vào rèn luyện thân thể. Tu Vi tăng chậm hơn nhưng Thể Chất (\`theChat\`) và Lực Tay (\`lucTay\`) tăng nhanh hơn. Ít phụ thuộc vào pháp bảo. Thiên Kiếp của họ là những thử thách về thể chất (ví dụ: chịu đựng trọng lực ngàn cân, dung nham luyện thể).
   - **Ma Tu ('MaTu'):** Con đường hắc ám. Có thể tăng Tu Vi cực nhanh bằng các hành động tà ác như "Hấp thụ tu vi của [NPC]" hoặc dùng "Lô Đỉnh". Tuy nhiên, mỗi hành động tà ác đều làm tăng **Tâm Ma**. Thiên Kiếp cực kỳ nguy hiểm.
   - **Kiếm Tu ('KiemTu'):** Lấy kiếm làm đạo. Sức tấn công và tốc độ phát triển kỹ năng kiếm thuật vượt trội. Phụ thuộc nhiều vào phẩm chất của phi kiếm.
   - **Đan Tu ('DanTu'):** Chuyên tâm luyện đan. Có khả năng nhận biết linh dược và có tỷ lệ luyện đan thành công cao hơn. Sức chiến đấu trực diện yếu.

**2. CƠ CHẾ CẢNH GIỚI & TU VI:**
   - **Tăng Tu Vi:** Nhân vật nhận được điểm Tu Vi (\`tuVi\`) thông qua các hành động như đả tọa, hấp thụ linh thạch, dùng đan dược, song tu. Bạn phải cập nhật chỉ số này một cách logic thông qua \`characterDeltas\`.
   - **Đột Phá Cảnh Giới:** Khi Tu Vi đạt đến một ngưỡng nhất định, bạn phải tạo ra một sự kiện **Đột Phá**. Mô tả quá trình này một cách chi tiết và hào hùng trong trường \`story\`. Sau khi đột phá thành công, hãy cập nhật trường \`canhGioi\` và reset \`tuVi\` về 0.

**3. CƠ CHẾ TÂM MA:**
   - **Tích lũy:** Các hành động tàn nhẫn, đi ngược lại đạo trời, hoặc thất bại trong đột phá sẽ làm tăng điểm **Tâm Ma** (một chỉ số ẩn bạn phải tự theo dõi).
   - **Bộc phát:** Khi Tâm Ma tích lũy đến một mức độ nguy hiểm, bạn phải tạo ra các sự kiện tiêu cực như tẩu hỏa nhập ma, ảo giác, hoặc thậm chí là Thiên Kiếp trừng phạt.

**4. CƠ CHẾ THIÊN KIẾP:**
   - Khi nhân vật đột phá các đại cảnh giới (ví dụ: từ Trúc Cơ lên Kim Đan), bạn **BẮT BUỘC** phải tạo ra một sự kiện **Thiên Kiếp**.
   - Mô tả Thiên Kiếp một cách hoành tráng (ví dụ: lôi kiếp, tâm ma kiếp, phong hỏa kiếp) và đưa ra các lựa chọn hành động để nhân vật chính chống đỡ. Mức độ nguy hiểm của Thiên Kiếp phụ thuộc vào con đường tu luyện (Đạo Tu).
`;
    // We append the special rules to the base context.
    const basePrompt = await buildDefaultTurnPrompt(context, gameState, worldSettings, appSettings, specialContext);
    return `${basePrompt}\n${tuTienRules}`;
};