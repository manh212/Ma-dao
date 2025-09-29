/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
export interface ChangelogEntry {
  version: string;
  date: string;
  changes: {
    type: 'new' | 'improvement' | 'fix' | 'update';
    description: string;
  }[];
}

export const CHANGELOG_DATA: ChangelogEntry[] = [
  {
    version: "v1.7.1",
    date: "Tháng 8, 2024",
    changes: [
      { type: 'improvement', description: "Đơn giản hóa giao diện Cài đặt bằng cách loại bỏ các tùy chọn tùy chỉnh Giao diện. Ứng dụng giờ đây sử dụng một giao diện mặc định, tối ưu để tập trung vào trải nghiệm cốt lõi." },
    ],
  },
  {
    version: "v1.7.0",
    date: "Tháng 8, 2024",
    changes: [
      { type: 'new', description: "Giới thiệu bản cập nhật 'Thế Giới Sống Động', một cuộc đại tu toàn diện nhằm mang lại chiều sâu và các cơ chế độc đáo cho từng kiểu thế giới." },
      { type: 'improvement', description: "Tu Tiên: Hệ thống **3000 Đại Đạo** cho phép người chơi lựa chọn con đường tu luyện riêng (Chính Thống, Thể Tu, Ma Tu) với lối chơi, thử thách Thiên Kiếp và giao diện độc đáo. Bổ sung các cơ chế cốt lõi như Cảnh Giới, Tu Vi, Đột Phá, và Tâm Ma." },
      { type: 'improvement', description: "Võ Lâm: Đại tu toàn diện thể loại Võ Lâm với các hệ thống mới: **Kinh Mạch & Chân Khí**, **Luyện Đan & Rèn Đúc**, và **Môn Phái** với điểm cống hiến và cửa hàng riêng. Giới thiệu hệ thống **Bang Hội** cho phép người chơi xây dựng thế lực, chiêu mộ thành viên và quản lý ngoại giao." },
      { type: 'improvement', description: "Đồng nhân: Làm sâu sắc thêm lối chơi Đồng nhân với hệ thống **Dòng Thời Gian Nguyên Tác**. Người chơi giờ đây có thể dùng **Điểm Can Thiệp** để thay đổi các sự kiện cốt lõi, gây ra những 'gợn sóng trong thực tại' và ảnh hưởng đến chỉ số **Tương Thích Nguyên Tác**." },
    ],
  },
  {
    version: "v1.6.0",
    date: "Tháng 7, 2024",
    changes: [
      { type: 'improvement', description: 'Đại tu toàn diện giao diện "Tạo Thế Giới Mới", biến nó thành một "Sổ Tay Nhiệm Vụ" lôi cuốn và nhập vai hơn.' },
      { type: 'improvement', description: 'Nâng cấp "Búp bê Trang bị" (Equipment Doll) với bố cục giải phẫu trực quan, hiệu ứng phát sáng khi thay đổi, và tính năng so sánh trang bị tiện lợi.' },
      { type: 'improvement', description: 'Thiết kế lại hoàn toàn tab "Kỹ Năng & Thiên Phú" với bố cục hai cột, thanh kinh nghiệm (XP bar) và các ô thiên phú trực quan để quản lý dễ dàng hơn.' },
      { type: 'improvement', description: 'Cải thiện tab "Mối Quan Hệ" bằng cách nhóm các NPC theo mức độ thiện cảm, thêm "Nhật ký Tương tác" và "Mối quan hệ Xã hội" giữa các NPC để thế giới sống động hơn.' },
      { type: 'improvement', description: 'Tinh chỉnh giao diện trong game (HUD) với hiệu ứng tiêu đề bắt mắt và cách sắp xếp thông tin hợp lý hơn.' },
      { type: 'fix', description: 'Xóa avatar khỏi bảng thông tin nhân vật để khắc phục lỗi che mất tên nhân vật.' },
    ],
  },
  {
    version: "v1.5.0",
    date: "Tháng 7, 2024",
    changes: [
      { type: 'new', description: 'Thêm mục "Cập nhật" để theo dõi các thay đổi của trò chơi.' },
      { type: 'improvement', description: 'Thiết kế lại giao diện thông tin nhân vật theo phong cách "Hồ Sơ" (Dossier) độc đáo cho từng thể loại thế giới.' },
      { type: 'improvement', description: 'Thêm các tab mới trong Hồ Sơ Nhân Vật: Túi Đồ và Nhật Ký Nhiệm Vụ.' },
      { type: 'fix', description: 'Sửa lỗi nghiêm trọng "Race Condition" có thể xảy ra khi người dùng thao tác quá nhanh.' },
      { type: 'improvement', description: 'Tối ưu hóa hệ thống Ký Ức Dài Hạn (RAG), giảm độ trễ và chi phí API bằng cách loại bỏ lệnh gọi kép.' },
      { type: 'improvement', description: 'Chuyển đổi các mục tùy chọn trong Cài đặt sang dạng thanh trượt hiện đại.' },
    ],
  },
];