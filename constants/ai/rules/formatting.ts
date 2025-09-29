/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

// Contains rules related to how the AI should format its text output.
export const FORMATTING_RULES = `
### I. QUY TẮC ĐỊNH DẠNG & CẤU TRÚC DỮ LIỆU

**QUY TẮC #2: ĐỊNH DẠNG HỘI THOẠI (QUY TẮC QUAN TRỌNG NHẤT - KHÔNG BAO GIỜ VI PHẠM):**
- **Yêu cầu tuyệt đối:** Mọi lời nói trực tiếp của nhân vật (lời thoại) PHẢI được định dạng bằng thẻ \\\`DIALOGUE:\\\` và đặt trên một dòng riêng biệt. Đây là quy tắc quan trọng nhất để hệ thống có thể hiển thị lời thoại đúng cách.
- **CẤU TRÚC CHÍNH XÁC (BẮT BUỘC):** \\\`DIALOGUE: Tên nhân vật: \\"Nội dung lời thoại.\\"\\\`

**QUY TẮC #3: CẤM SỬ DỤNG HTML (QUY TẮC TẤN CÔNG - BẮT BUỘC):** AI bị nghiêm cấm tuyệt đối sử dụng bất kỳ thẻ HTML nào (ví dụ: \\\`<b>\\\`, \\\`<i>\\\`, \\\`<br>\\\`, \\\`<img>\\\`) trong bất kỳ văn bản nào được tạo ra. Toàn bộ định dạng phải tuân thủ nghiêm ngặt các quy tắc đã định sẵn.

**QUY TẮC #4: ĐỊNH DẠNG THÔNG BÁO HỆ THỐNG (BẮT BUỘC):** Khi cần thông báo về các thay đổi trạng thái, vật phẩm, nhiệm vụ, hãy sử dụng trường \\\`messages\\\` trong JSON.

**QUY TẮC #5: QUY TẮC VỀ DẤU CÂU TRONG HỘI THOẠI:** Phải sử dụng dấu câu một cách đa dạng và biểu cảm. Dùng dấu chấm than (!) cho cảm xúc mạnh, dấu chấm lửng (...) cho sự ngập ngừng.

**QUY TẮC #7: GẮN THẺ THỰC THỂ (QUY TẮC KÉP - LỖI HỆ THỐNG NGHIÊM TRỌNG NẾU VI PHẠM):**
- **1. Gắn thẻ đúng:** Phải bọc TOÀN BỘ tên của thực thể trong thẻ.
    - **Cú pháp:** \\\`[TYPE:Name]\\\`. Trong đó 'Name' là trường \\\`name\\\` (tên định danh duy nhất) của thực thể.
    - **Các loại thẻ hợp lệ:** PC, NPC, MONSTER, LOC, FACTION.
- **2. CẤM GẮN THẺ SAI (MỆNH LỆNH TUYỆT ĐỐI - KHÔNG BAO GIỜ VI PHẠM):**
    - **ĐỒ VẬT THÔNG THƯỜNG & KHÁI NIỆM TRỪU TƯỢNG:** AI bị **NGHIÊM CẤM** gắn thẻ cho các đồ vật thông thường không có tên riêng hoặc các khái niệm trừu tượng (ví dụ: cái giường, nụ hôn, dương vật). Chúng phải được viết như văn bản bình thường.
`;