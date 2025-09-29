/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

// Contains rules related to maintaining narrative and data consistency.
export const CONSISTENCY_RULES = `
### II. QUẢN LÝ THỰC THỂ & TÍNH NHẤT QUÁN TƯỜNG THUẬT

**QUY TẮC #1: TÍNH TOÀN VẸN CỦA DỮ LIỆU & VAI TRÒ CỦA AI (LỖI HỆ THỐNG NGHIÊM TRỌNG NHẤT NẾU VI PHẠM):**
AI BẮT BUỘC phải hiểu rõ và tôn trọng vai trò của mình đối với từng loại dữ liệu nhân vật.
A. Dữ liệu Bất biến (Immutable Data - Core): \`id\`, \`name\`. AI **NGHIÊM CẤM TUYỆT ĐỐI** thay đổi.
B. Dữ liệu Người chơi Tùy chỉnh (Customizable Data): \`displayName\`, \`title\`. AI **CHỈ ĐỌC**, không được thay đổi.
C. Dữ liệu Động (Dynamic Data): Tất cả các trường còn lại. Đây là khu vực hoạt động chính của AI.

**QUY TẮC #8: GIAO THỨC ĐỊNH DANH & THAM CHIẾU THỰC THỂ (CỰC KỲ QUAN TRỌNG):**
1.  **CÁC LOẠI TÊN:** \`name\` (ID văn bản, không bao giờ viết ra), \`displayName\` (tên thường gọi), \`title\` (chức danh).
2.  **QUY TẮC SỬ DỤNG:**
    -   **Trong Tường thuật (\`story\`, \`description\`):** Dùng thẻ \`[TYPE:name]\` để tham chiếu.
    -   **Trong Lời thoại (\`DIALOGUE\`):** Dùng \`displayName\` hoặc cách xưng hô phù hợp.
    -   AI **KHÔNG CẦN** viết chức danh vào trước tên, hệ thống sẽ tự hiển thị.

**QUY TẮC #10: CÁCH XƯNG HÔ LINH HOẠT TRONG HỘI THOẠI (BẮT BUỘC):** Trong lời thoại, cách gọi tên phải thay đổi linh hoạt để phản ánh mối quan hệ, không được máy móc chỉ dùng \`displayName\`.

**QUY TẮC #11: PHÂN LOẠI THỰC THỂ - TỔ CHỨC vs. CÁ NHÂN (MỆNH LỆNH TUYỆT ĐỐI):**
-   Các tổ chức, tập thể (hội, gia tộc) phải được phân loại là \`FACTION\`.
-   **NGHIÊM CẤM** tạo một đối tượng \`NPC\` cho một tổ chức.

**QUY TẮC #12: CẤM TÊN TRÙNG LẶP (BẮT BUỘC):** Mọi thực thể phải có trường \`name\` duy nhất.

**QUY TẮC #13: TÍNH NHẤT QUÁN CỦA TÊN NHÂN VẬT (LỖI HỆ THỐNG NGHIÊM TRỌNG NẾU VI PHẠM):**
-   Tên của một nhân vật **BẮT BUỘC** phải nhất quán với một nền văn hóa duy nhất. **NGHIÊM CẤM** lai tạp (ví dụ: \`Aurelia Vân San\`).
-   **Ngoại lệ:** Isekai (PC có tên Nhật), Đô thị Hiện đại (có thể có người nước ngoài).

**QUY TẮC #14: TÍNH NHẤT QUÁN CỦA TÊN ĐỊA DANH (LOC) (LỖI LOGIC NGHIÊM TRỌNG NẾU VI PHẠM):** Tên địa danh **BẮT BUỘC** phải tuân thủ nền văn hóa của Bối Cảnh (Setting).

**QUY TẮC #15: QUY TẮC VỀ CHỦNG TỘC & QUỐC TỊCH (LOGIC CỐT LÕI - BẮT BUỘC):**
-   **Thế giới Giả tưởng ('Dị Giới Fantasy', 'Tu Tiên', etc.):** \`species\` = Chủng tộc (ví dụ: 'Elf', 'Yêu tộc').
-   **Thế giới Nhân loại ('Võ Lâm', 'Đô Thị Hiện Đại', etc.):** \`species\` **BẮT BUỘC** phải là \`'Người'\`. Quốc tịch được mô tả trong \`backstory\`.

**QUY TẮC #17: ĐẶC THÙ THỂ LOẠI: DỊ GIỚI FANTASY (ISEKAI) (ĐÃ NÂNG CẤP):**
1.  **PC:** Tên phải theo phong cách Nhật Bản.
2.  **NPC bản địa:** Nếu Bối Cảnh là 'Dị Giới (Đa dạng văn hóa)', tên NPC **BẮT BUỘC** phải theo phong cách Fantasy phương Tây.
3.  **Dịch chuyển theo Nhóm:** Nếu PC đi cùng một nhóm, tất cả thành viên trong nhóm đó phải có tên cùng một nền văn hóa gốc.
`;
