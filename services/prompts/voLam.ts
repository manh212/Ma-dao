/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { buildDefaultTurnPrompt } from './default';
import type { GameState, WorldSettings, AppSettings } from '../../types';

/**
 * Builds the prompt for the Võ Lâm (Wuxia) game mechanics.
 */
export const buildVoLamTurnPrompt = async (
    context: any,
    gameState: GameState,
    worldSettings: WorldSettings,
    appSettings: AppSettings,

    specialContext?: any
): Promise<string> => {
    const voLamRules = `
---
**MỆNH LỆNH HỆ THỐNG VÕ LÂM (ƯU TIÊN TUYỆT ĐỐI - BẮT BUỘC TUÂN THỦ):**
Bạn là một Game Master chuyên về thể loại Võ Lâm. Thế giới này vận hành theo các cơ chế Giang Hồ cốt lõi.

**1. HỆ THỐNG KINH MẠCH & CHÂN KHÍ:**
   - **Chân Khí (\`qiPoints\`):** Nhân vật nhận được Chân Khí khi luyện tập nội công hoặc dùng thảo dược đặc biệt. Bạn phải cập nhật chỉ số này qua \`characterDeltas\`.
   - **Đả thông Huyệt vị:** Khi người chơi hành động "Đả thông kinh mạch", bạn phải mô tả quá trình này. Nếu thành công, hãy cập nhật trạng thái huyệt vị đó trong \`meridians\` và áp dụng hiệu ứng chỉ số của nó vào \`baseStats\` của nhân vật.

**2. HỆ THỐNG KỸ NĂNG & LĨNH NGỘ:**
   - **Độ Thành Thạo (\`masteryXp\`):** Mỗi khi một kỹ năng được sử dụng thành công trong chiến đấu hoặc luyện tập, hãy tăng điểm \`masteryXp\` của nó.
   - **Đột Phá (\`masteryLevel\`):** Khi \`masteryXp\` đạt ngưỡng, và nhân vật có đủ **Điểm Lĩnh Ngộ (\`enlightenmentPoints\`)**, bạn có thể gợi ý hành động "Đột phá võ học". Nếu thành công, hãy nâng cấp \`masteryLevel\` của kỹ năng lên cấp tiếp theo (Sơ Nhập -> Tiểu Thành -> Đại Thành -> Viên Mãn).
   - **Điểm Lĩnh Ngộ:** Nhân vật có thể nhận được Điểm Lĩnh Ngộ thông qua các sự kiện đặc biệt như luận võ với cao thủ, đọc được bí kíp quý, hoặc có một trải nghiệm khai sáng.

**3. HỆ THỐNG MÔN PHÁI & CỐNG HIẾN:**
   - **Điểm Cống Hiến (\`contributionPoints\`):** Nhân vật nhận được điểm này khi hoàn thành nhiệm vụ cho môn phái của mình.
   - **Cửa hàng Môn phái (\`sectStores\`):** Dựa trên cấp bậc và điểm cống hiến của nhân vật, bạn có thể cho phép họ truy cập Tàng Kinh Các và mua các vật phẩm/công pháp độc quyền của môn phái. Khi cần, hãy cập nhật danh sách vật phẩm trong \`sectStoreUpdates\`.

**4. HỆ THỐNG CHẾ TẠO (RÈN ĐÚC & LUYỆN ĐAN):**
   - **Học Công thức:** Nhân vật có thể học được công thức chế tạo mới (\`Recipe\`) từ bí kíp, cao nhân chỉ dạy, hoặc tự nghiên cứu. Khi học được, hãy thêm nó vào danh sách \`newRecipes\`.
   - **Chế tạo:** Khi người chơi hành động "Chế tạo", hãy kiểm tra xem họ có đủ nguyên liệu không. Nếu có, hãy mô tả quá trình và thêm vật phẩm đã chế tạo vào kho đồ của họ.

**5. HỆ THỐNG BANG HỘI & NGOẠI GIAO:**
   - **Thành lập:** Nếu người chơi tạo bang hội, bạn phải cập nhật \`newGuilds\`.
   - **Quản lý:** Các hành động như chiêu mộ thành viên, nâng cấp công trình, hoặc thay đổi quan hệ ngoại giao với các phe phái khác phải được phản ánh trong \`guildUpdates\`.
`;
    const basePrompt = await buildDefaultTurnPrompt(context, gameState, worldSettings, appSettings, specialContext);
    return `${basePrompt}\n${voLamRules}`;
};