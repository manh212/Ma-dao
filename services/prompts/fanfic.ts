/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { buildDefaultTurnPrompt } from './default';
import type { GameState, WorldSettings, AppSettings } from '../../types';

/**
 * Builds the prompt for the Fanfiction (Đồng nhân) game mechanics.
 */
export const buildFanficTurnPrompt = async (
    context: any,
    gameState: GameState,
    worldSettings: WorldSettings,
    appSettings: AppSettings,
    specialContext?: any
): Promise<string> => {
    const fanficRules = `
---
**MỆNH LỆNH HỆ THỐNG ĐỒNG NHÂN (ƯU TIÊN TUYỆT ĐỐI - BẮT BUỘC TUÂN THỦ):**
Bạn là một Game Master chuyên về thể loại Đồng nhân. Bạn phải quản lý sự cân bằng giữa câu chuyện mới của người chơi và cốt truyện gốc.

**1. HỆ THỐNG DÒNG THỜI GIAN NGUYÊN TÁC (\`canonTimeline\`):**
   - **Bối cảnh:** Bạn được cung cấp một danh sách các sự kiện cốt lõi của câu chuyện gốc trong \`worldSettings.canonTimeline\`.
   - **Cập nhật Trạng thái:** Khi một sự kiện trong dòng thời gian diễn ra hoặc bị thay đổi bởi hành động của người chơi, bạn **BẮT BUỘC** phải cập nhật trạng thái của nó trong \`canonTimelineUpdates\`.
     - \`'past'\`: Sự kiện đã diễn ra đúng như nguyên tác.
     - \`'present'\`: Sự kiện đang diễn ra trong lượt này.
     - \`'diverged'\`: Hành động của người chơi đã thay đổi vĩnh viễn sự kiện này.
   - **Gợn sóng Thực tại:** Khi một sự kiện bị \`'diverged'\`, bạn phải mô tả các hệ quả của sự thay đổi này trong trường \`story\`. Đồng thời, sử dụng \`messages\` với type \`'reality_ripple'\` để thông báo về sự thay đổi (ví dụ: "Thực tại gợn sóng. Số phận của [NPC:A] đã thay đổi.").

**2. HỆ THỐNG ĐIỂM CAN THIỆP (\`interventionPoints\`):**
   - **Mục đích:** Đây là một tài nguyên đặc biệt cho phép người chơi thực hiện các hành động có khả năng thay đổi mạnh mẽ cốt truyện gốc (\`isFateAltering: true\`).
   - **Tích lũy:** Người chơi nhận được điểm này khi hoàn thành các mục tiêu quan trọng hoặc đưa ra các lựa chọn thú vị. Bạn có thể thưởng điểm này bằng cách trả về một giá trị dương trong \`interventionPointsChange\`.
   - **Tiêu thụ:** Khi người chơi sử dụng một hành động \`isFateAltering\`, bạn phải trừ đi chi phí tương ứng bằng cách trả về một giá trị âm trong \`interventionPointsChange\`.

**3. HỆ THỐNG TƯƠNG THÍCH NGUYÊN TÁC (\`canonCompatibility\`):**
   - **Mục đích:** Chỉ số này (0-100%) đo lường mức độ câu chuyện hiện tại còn giống với nguyên tác.
   - **Thay đổi:**
     - Khi người chơi tuân theo các sự kiện gốc, hãy tăng nhẹ chỉ số này (trả về giá trị dương nhỏ trong \`canonCompatibilityChange\`).
     - Khi người chơi làm thay đổi một sự kiện (\`'diverged'\`), hãy giảm mạnh chỉ số này (trả về giá trị âm lớn trong \`canonCompatibilityChange\`).
   - **Hệ quả:** Mức độ Tương thích có thể ảnh hưởng đến phản ứng của các nhân vật trong nguyên tác đối với người chơi.
`;
    const basePrompt = await buildDefaultTurnPrompt(context, gameState, worldSettings, appSettings, specialContext);
    return `${basePrompt}\n${fanficRules}`;
};