/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export const AI_THOUGHT_PROCESS_MESSAGES: Record<string, Record<string, string[]>> = {
  processing: {
    default: [
      'Phân tích hành động của người chơi...',
      'Xem xét các hậu quả có thể xảy ra...',
      'Dệt nên câu chuyện...',
      'Đánh giá bối cảnh hiện tại...',
      'Tham khảo trạng thái của NPC...',
      'Kiểm tra các quy luật của thế giới...',
      'Dự đoán các phản ứng có thể...',
      'Thổi hồn vào thế giới...',
      'Ghi lại định mệnh...',
    ],
    'Tu Tiên': [
      'Suy tính nhân quả...',
      'Tham vấn Thiên Đạo...',
      'Diễn giải ý trời...',
      'Cảm nhận dòng chảy linh khí...',
      'Khắc họa đạo vận...',
      'Viết về sự đột phá cảnh giới...',
    ],
    'Võ Lâm': [
      'Phân tích chiêu thức của người chơi...',
      'Cân nhắc ân oán giang hồ...',
      'Mô tả những trận giao đấu kịch tính...',
      'Xem xét danh tiếng các môn phái...',
      'Khắc họa khí chất của các cao thủ...',
    ],
    'Dị Giới Fantasy': [
      'Tham khảo các vị thần cổ đại...',
      'Cảm nhận dòng chảy ma thuật...',
      'Giải phóng sức mạnh ma thuật qua từng câu chữ...',
      'Xem xét lời tiên tri cổ xưa...',
      'Mô tả những sinh vật huyền bí...',
    ],
     'Marvel': [
        'Tính toán mức độ sức mạnh...',
        'Phân tích các dòng thời gian có thể...',
        'Đánh giá thiệt hại tài sản...',
        'Mô tả những trận chiến hoành tráng...',
        'Tham khảo cơ sở dữ liệu siêu anh hùng...',
    ],
  },
};

export const CREATION_TIPS: Record<string, string[]> = {
    default: [
        "Mẹo: Các lựa chọn của bạn sẽ định hình không chỉ nhân vật mà cả thế giới xung quanh.",
        "Bạn có biết? Các NPC sẽ ghi nhớ hành động của bạn và phản ứng tương ứng.",
        "Hãy thử kết hợp các kỹ năng khác nhau để tạo ra những hiệu ứng bất ngờ.",
    ],
    'Tu Tiên': [
        "Mẹo: Linh khí trong môi trường có thể ảnh hưởng đến tốc độ tu luyện của bạn.",
        "Bạn có biết? Một số công pháp yêu cầu thể chất đặc biệt để tu luyện đến đỉnh cao.",
        "Lore: Truyền thuyết kể về Cửu Thiên, nơi các vị tiên nhân tối cao cư ngụ.",
        "Mẹo: Đừng coi thường các tán tu, họ có thể che giấu những bí mật kinh người.",
    ],
    'Võ Lâm': [
        "Mẹo: Mối quan hệ tốt với các thương nhân có thể giúp bạn nhận được giá hời.",
        "Bạn có biết? Một số bí kíp võ công được cất giấu ở những nơi không ai ngờ tới.",
        "Lore: Trận chiến tại Hoa Sơn 50 năm trước đã định hình lại cục diện giang hồ.",
        "Mẹo: Danh tiếng của bạn sẽ quyết định thái độ của các môn phái đối với bạn.",
    ],
    'Dị Giới Fantasy': [
        "Mẹo: Hãy chú ý đến các tin đồn trong quán rượu, chúng có thể dẫn đến những nhiệm vụ bất ngờ.",
        "Bạn có biết? Các hầm ngục cổ đại thường chứa đựng cả kho báu và những nguy hiểm chết người.",
        "Lore: Cuộc chiến Đại Long Thần cách đây 500 năm đã để lại những vết sẹo vĩnh viễn trên lục địa.",
        "Mẹo: Một số quái vật chỉ có thể bị đánh bại bằng các loại ma thuật hoặc vũ khí đặc biệt.",
    ],
    'Marvel': [
        "Mẹo: Hành động của bạn có thể thu hút sự chú ý của S.H.I.E.L.D.",
        "Bạn có biết? New York là nơi tập trung nhiều siêu anh hùng và siêu tội phạm nhất.",
        "Lore: Viên đá Vô cực từng gây ra một cuộc chiến tàn khốc trên khắp vũ trụ.",
        "Mẹo: Cân bằng giữa cuộc sống đời thường và danh tính siêu anh hùng là một thử thách lớn.",
    ],
    'Quản lý Nhóm nhạc': [
        "Mẹo: Một scandal có thể hủy hoại sự nghiệp của cả nhóm. Hãy quản lý thật cẩn thận!",
        "Bạn có biết? Mối quan hệ tốt với các nhà sản xuất chương trình (PD) là chìa khóa để có nhiều suất diễn.",
        "Lore: Nhóm nhạc huyền thoại 'Starlight' đã từng tan rã vì mâu thuẫn nội bộ.",
        "Mẹo: Đừng quên chăm sóc sức khỏe tinh thần của các thành viên trong nhóm.",
    ]
};