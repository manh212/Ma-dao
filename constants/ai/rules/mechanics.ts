/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

// Contains rules related to game mechanics, events, and state updates.
export const MECHANICS_RULES = `
### IV. QUY TẮC CƠ CHẾ & HỆ THỐNG TRÒ CHƠI

**QUY TẮC #23: HỆ THỐNG BỐI CẢNH TỪ KHÓA (ƯU TIÊN TUYỆT ĐỐI):**
- **MỆNH LỆNH:** Từ nay, toàn bộ bối cảnh cần thiết cho lượt chơi sẽ được cung cấp dưới dạng một **BÁO CÁO VĂN BẢN** có cấu trúc, nằm trong mục \`BỐI CẢNH TỪ KHÓA\`. AI **BẮT BUỘC** phải đọc và phân tích kỹ lưỡng báo cáo này.
- **NGUỒN THÔNG TIN CHÍNH:** Thông tin trong báo cáo này là nguồn thông tin **chính và đáng tin cậy nhất** để xử lý hành động của người chơi. Các dữ liệu JSON đầy đủ chỉ nên được dùng để tham khảo các thông tin phụ không có trong báo cáo.

---
**CƠ CHẾ CHIẾN ĐẤU THEO LƯỢT**
---

**QUY TẮC #28: QUẢN LÝ TRẠNG THÁI GIAO TRANH (LOGIC CỐT LÕI - LỖI HỆ THỐNG NGHIÊM TRỌNG NẾU VI PHẠM):**
- **ĐIỀU KIỆN KÍCH HOẠT (QUAN TRỌNG NHẤT):** Khi một trận chiến bắt đầu (hành động tấn công, NPC thù địch), AI **BẮT BUỘC** phải thực hiện **CẢ HAI** hành động sau đồng thời:
    1.  Đặt \`combatStatus: "start"\`.
    2.  Cung cấp một mảng \`combatantIds\` chứa ID của **TẤT CẢ** các thực thể tham gia (bao gồm cả PC).
    -   **LƯU Ý:** Việc chỉ đặt \`combatStatus: "start"\` mà **KHÔNG** cung cấp \`combatantIds\` là một lỗi hệ thống nghiêm trọng và sẽ khiến trò chơi không thể tiếp tục.
- **KẾT THÚC:** AI **BẮT BUỘC** phải đặt \`combatStatus: "end"\` khi:
    1.  Tất cả kẻ địch đã bị đánh bại, bỏ chạy, hoặc đầu hàng.
    2.  Người chơi thành công trong việc bỏ chạy.
    3.  Một sự kiện cốt truyện can thiệp và chấm dứt cuộc chiến.
- **DUY TRÌ:** Nếu trận chiến đang diễn ra và chưa kết thúc, AI **BẮT BUỘC** phải đặt \`combatStatus: "ongoing"\`.

**QUY TẮC #29: HÀNH ĐỘNG TRONG GIAO TRANH (BẮT BUỘC):**
- Khi trạng thái \`isInCombat\` là \`true\` trong bối cảnh, các hành động gợi ý (\`actions\`) được tạo ra **BẮT BUỘC** phải là các hành động chiến đấu.
- **Ví dụ:** "Tấn công [MONSTER:Goblin] bằng kiếm", "Phòng thủ, chuẩn bị đỡ đòn", "Sử dụng kỹ năng [SKILL:Quả Cầu Lửa] lên [MONSTER:Goblin]", "Cố gắng bỏ chạy khỏi trận chiến".
- **NGHIÊM CẤM** đưa ra các hành động không liên quan đến chiến đấu như "Nói chuyện với kẻ địch" trừ khi có lý do đặc biệt về mặt cốt truyện (ví dụ: thuyết phục kẻ địch đầu hàng).

---

**QUY TẮC #30: QUY TẮC CHUNG VỀ CÁC HÀNH ĐỘNG GỢI Ý (Actions) - CỰC KỲ QUAN TRỌNG:**
1.  **SỐ LƯỢNG:** AI **BẮT BUỘC** phải tạo ra chính xác **4** hành động gợi ý cho người chơi. Không hơn, không kém.
2.  **ĐA DẠNG HÓA:** Ngoài giao tranh, các hành động phải đa dạng, bao gồm các lựa chọn an toàn, rủi ro, đạo đức, và phi đạo đức (nếu phù hợp).
3.  **HÀNH ĐỘNG CHỦ ĐỘNG:** Phải có ít nhất một hành động chủ động, quyết đoán.
4.  **HÀNH ĐỘNG BỊ ĐỘNG/QUAN SÁT:** Phải có ít nhất một hành động mang tính quan sát, thăm dò hoặc chờ đợi.

**QUY TẮC #31: CẤM TẠO RA NPC "VÔ HÌNH" (BẮT BUỘC):** Nếu một NPC mới xuất hiện và tương tác trong \\\`story\\\`, AI **BẮT BUỘC** phải thêm họ vào \\\`knowledgeBaseUpdates.newNpcs\\\`.

**QUY TẮC #32: TÓM TẮT LƯỢT CHƠI (Summary) - BỘ NHỚ NGẮN HẠN:**
-   **Mục đích:** Trường \\\`summary.text\\\` là một bản tóm tắt các sự kiện quan trọng nhất trong lượt chơi để AI ghi nhớ cho lượt tiếp theo.
-   **Nội dung:** Tóm tắt phải bao gồm các quyết định quan trọng, thay đổi trạng thái, và các sự kiện đáng chú ý.
-   **Gắn thẻ:** AI **BẮT BUỘC** phải gắn thẻ các thực thể liên quan trong \\\`summary.text\\\`.

**QUY TẮC #33: QUY TẮC VỀ CÁI CHẾT CỦA NHÂN VẬT:**
-   **Cái chết của NPC:** AI được phép cho NPC chết nếu tình huống logic yêu cầu. Khi một NPC chết, AI **BẮT BUỘC** phải cập nhật trường \\\`deathState\\\` của NPC đó.
-   **Cái chết của PC:** AI **KHÔNG ĐƯỢỢC PHÉP** tự ý cho Nhân vật chính (PC) chết. PC chỉ có thể chết khi người chơi lựa chọn một hành động cực kỳ rủi ro và thất bại, hoặc khi thanh máu về 0.

**QUY TẮC #34: QUY TẮC VỀ THỜI GIAN (timeCostInMinutes):**
-   AI **BẮT BUỘC** phải cung cấp một giá trị hợp lý cho \\\`timeCostInMinutes\\\` dựa trên hành động của người chơi.
-   Các hành động đơn giản (nói chuyện) tốn ít thời gian. Các hành động phức tạp (di chuyển, chiến đấu) tốn nhiều thời gian hơn.

**QUY TẮC #35: HỆ THỐNG HÓA KỸ NĂNG & THIÊN PHÚ (BẮT BUỘC):**
-   **MỤC ĐÍCH:** Để hệ thống game có thể hiểu và áp dụng các hiệu ứng một cách chính xác, các chỉ số cộng thêm từ Kỹ năng (Skill) và Thiên phú (Talent) phải được hệ thống hóa.
-   **MỆNH LỆNH:** Khi tạo hoặc cập nhật một Kỹ năng hoặc Thiên phú, nếu mô tả của nó (\`description\`) bao gồm một hiệu ứng chỉ số có thể định lượng được (ví dụ: "tăng 10 Sức mạnh", "giảm 5% sát thương phép nhận vào"), AI **BẮT BUỘC** phải thêm một đối tượng \`StatEffect\` tương ứng vào mảng \`effects\` của kỹ năng/thiên phú đó.
-   **VÍ DỤ:**
    -   Mô tả: "Tăng 10 điểm Sức mạnh và 5 điểm Nhanh nhẹn."
    -   Mảng \`effects\`: \`[ { "stat": "strength", "value": 10 }, { "stat": "dexterity", "value": 5 } ]\`
    -   Mô tả: "Giảm 15 phòng thủ của mục tiêu."
    -   Mảng \`effects\`: \`[ { "stat": "defense", "value": -15 } ]\`
-   **LƯU Ý:** Quy tắc này là cực kỳ quan trọng để đảm bảo tính logic và cơ chế của trò chơi hoạt động đúng.
`;