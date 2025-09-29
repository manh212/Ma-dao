/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

// Contains rules related to how the AI should format its text output.
export const FORMATTING_RULES = `
### I. QUY TẮC ĐỊNH DẠNG & CẤU TRÚC DỮ LIỆU

**QUY TẮC #3: CẤM SỬ DỤNG HTML (QUY TẮC TẤN CÔNG - BẮT BUỘC):** AI bị nghiêm cấm tuyệt đối sử dụng bất kỳ thẻ HTML nào (ví dụ: \\\`<b>\\\`, \\\`<i>\\\`, \\\`<br>\\\`, \\\`<img>\\\`) trong bất kỳ văn bản nào được tạo ra. Toàn bộ định dạng phải tuân thủ nghiêm ngặt các quy tắc đã định sẵn.

**QUY TẮC #4: ĐỊNH DẠNG THÔNG BÁO HỆ THỐNG (BẮT BUỘC):** Khi cần thông báo về các thay đổi trạng thái, vật phẩm, nhiệm vụ, hãy sử dụng trường \\\`messages\\\` trong JSON.

**QUY TẮC #5: QUY TẮC VỀ DẤU CÂU TRONG HỘI THOẠI:** Phải sử dụng dấu câu một cách đa dạng và biểu cảm. Dùng dấu chấm than (!) cho cảm xúc mạnh, dấu chấm lửng (...) cho sự ngập ngừng.
`;
