/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

// Gợi ý cho ô "Ý Tưởng Của Bạn" dựa trên Kiểu Thế Giới (Genre)
export const IDEA_SUGGESTIONS: Record<string, string[]> = {
    'default': ["Một nhân vật chính có khả năng hồi sinh sau mỗi lần chết, nhưng mỗi lần lại mất đi một phần ký ức."],
    'Quản lý Nhóm nhạc': [
        "Tôi là quản lý của một nhóm nhạc nữ sắp tan rã, và tôi phải làm mọi cách để vực dậy sự nghiệp của họ.",
        "Một nhóm nhạc nam tân binh đầy tài năng nhưng cũng lắm tật, và tôi phải chèo lái họ đến đỉnh vinh quang.",
        "Tôi bị xuyên không vào cơ thể quản lý của idol mình yêu thích, nhưng phát hiện ra thế giới giải trí khắc nghiệt hơn tôi tưởng."
    ],
    'Đồng nhân': [
        "Nhập vai vào một nhân vật phụ trong thế giới Naruto và thay đổi cốt truyện.",
        "Trở thành một thành viên mới của băng Mũ Rơm trong One Piece.",
        "Xuyên không vào Harry Potter nhưng không phải ở Gryffindor."
    ],
    'Dị Giới Fantasy': [
        "Sau khi chết, tôi được một nữ thần cho chuyển sinh đến thế giới kiếm và ma thuật với một năng lực độc nhất vô nhị.",
        "Bị triệu hồi đến một thế giới khác cùng cả lớp, nhưng chỉ mình tôi có nghề nghiệp yếu nhất.",
        "Tôi là một mạo hiểm giả kỳ cựu, nhưng một nhiệm vụ sai lầm đã khiến tôi mất hết tất cả và phải làm lại từ đầu."
    ],
    'Tu Tiên': [
        "Một phế vật tình cờ nhặt được bí kíp thượng cổ và bắt đầu con đường nghịch thiên.",
        "Là một đại năng chuyển thế, tôi mang theo ký ức của kiếp trước để tu luyện lại từ đầu.",
        "Xuyên không đến thế giới tu tiên và nhận được một hệ thống giúp tôi trở nên mạnh mẽ hơn."
    ],
    'Võ Lâm': [
        "Là đệ tử của một môn phái vô danh, tôi quyết tâm khôi phục lại danh tiếng cho sư môn.",
        "Bị cả giang hồ truy sát vì một bí kíp võ công, tôi phải tìm cách sống sót và minh oan cho bản thân.",
        "Sau khi bị kẻ thù hãm hại, tôi trọng sinh về quá khứ và quyết tâm báo thù."
    ],
    'Đô Thị Hiện Đại': [
        "Một người bình thường bỗng nhiên thức tỉnh dị năng và bị cuốn vào một thế giới ẩn giấu.",
        "Là một vệ sĩ, tôi được giao nhiệm vụ bảo vệ con gái của một gia tộc tài phiệt.",
        "Sau khi bị bạn gái phản bội, tôi nhận được một hệ thống giúp tôi làm lại cuộc đời."
    ],
    'Huyền Huyễn Truyền Thuyết': [
        "Mang trong mình huyết mạch của Thần Long, tôi bắt đầu hành trình tìm lại sức mạnh của tổ tiên.",
        "Là hậu duệ của một gia tộc phong thủy đã sa sút, tôi phải đối mặt với các thế lực tà ác.",
        "Trong một thế giới nơi Thần và Ma cùng tồn tại, tôi phải lựa chọn con đường của riêng mình."
    ],
};

// Gợi ý cho ô "Sơ Lược Tiểu Sử" dựa trên Tính Cách
export const BACKSTORY_SUGGESTIONS: Record<string, string[]> = {
    'default': ["Là một đứa trẻ mồ côi, lớn lên trong một ngôi làng hẻo lánh."],
    'ai': ["Lớn lên trong một gia đình bình thường nhưng luôn khao khát những chuyến phiêu lưu."],
    'Anh Hùng Cổ Điển (Dũng cảm, chính trực, vì lẽ phải)': [
        "Xuất thân từ một gia đình hiệp sĩ, từ nhỏ đã được dạy về danh dự và công lý.",
        "Là người duy nhất sống sót sau khi quê hương bị quái vật phá hủy, tôi thề sẽ trả thù.",
        "Được một anh hùng già cứu mạng, tôi quyết định đi theo con đường của ông ấy."
    ],
    'Phản Anh Hùng (Mục đích tốt, phương pháp tàn nhẫn)': [
        "Từng là một hiệp sĩ chính nghĩa, nhưng sau khi bị phản bội, tôi quyết định dùng mọi thủ đoạn để đạt được công lý.",
        "Lớn lên trong khu ổ chuột, tôi hiểu rằng chỉ có sức mạnh và sự tàn nhẫn mới giúp mình tồn tại.",
        "Gia đình tôi bị giới quý tộc hãm hại, tôi thề sẽ khiến chúng phải trả giá, bất kể phải làm gì."
    ],
    'Lạnh Lùng & Nội Tâm (Hành động theo lý trí, ít nói)': [
        "Từng trải qua một biến cố đau thương khiến tôi khép lòng mình lại.",
        "Là một sát thủ được huấn luyện từ nhỏ, cảm xúc là thứ xa xỉ đối với tôi.",
        "Tôi mang trong mình một bí mật to lớn, và sự im lặng là cách tốt nhất để bảo vệ nó."
    ],
    'Hòa Đồng & Lạc Quan (Thân thiện, lan tỏa năng lượng tích cực)': [
        "Lớn lên trong một gia đình hạnh phúc, tôi luôn tin vào những điều tốt đẹp trong cuộc sống.",
        "Tôi thích kết bạn và khám phá thế giới, mỗi ngày đều là một cuộc phiêu lưu mới.",
        "Dù gặp khó khăn, tôi luôn mỉm cười và tin rằng mọi chuyện rồi sẽ ổn thôi."
    ],
    'Kiêu Ngạo & Tham Vọng (Tự tin, luôn có mục tiêu lớn)': [
        "Là con trai của một gia tộc hùng mạnh, tôi sinh ra đã định sẵn để trở thành người đứng đầu.",
        "Tôi có một tài năng thiên bẩm, và tôi sẽ không để bất cứ ai cản đường mình.",
        "Mục tiêu của tôi là trở thành người mạnh nhất thế giới, và tôi sẽ làm mọi thứ để đạt được nó."
    ],
    'Điềm Tĩnh & Mưu Lược (Suy nghĩ thấu đáo, giỏi chiến thuật)': [
        "Từ nhỏ tôi đã thích đọc sách và nghiên cứu, kiến thức là sức mạnh lớn nhất của tôi.",
        "Tôi không mạnh về chiến đấu, nhưng tôi có thể đánh bại kẻ thù bằng trí tuệ của mình.",
        "Mọi hành động của tôi đều được tính toán kỹ lưỡng, không bao giờ có chỗ cho sự ngẫu hứng."
    ],
    'Bộc Trực & Nóng Nảy (Thẳng thắn, hành động theo bản năng)': [
        "Tôi không thích những kẻ giả tạo, có gì nói đó là phương châm sống của tôi.",
        "Thà làm trước rồi hối hận còn hơn là không làm gì cả.",
        "Nắm đấm của tôi thường đi trước lời nói, nhưng trái tim tôi luôn đặt đúng chỗ."
    ],
    'Bí Ẩn & Khó Đoán (Che giấu quá khứ và động cơ thật)': [
        "Không ai biết tôi từ đâu đến, và tôi cũng không có ý định cho họ biết.",
        "Mỗi người đều có những bí mật, của tôi chỉ nhiều hơn một chút thôi.",
        "Mục đích của tôi là gì ư? Cứ từ từ rồi bạn sẽ biết."
    ],
    'Nhút Nhát & Tốt Bụng (Ngại giao tiếp nhưng có trái tim ấm áp)': [
        "Tôi không giỏi nói chuyện với người lạ, nhưng tôi luôn sẵn lòng giúp đỡ người khác.",
        "Lớn lên trong sự bao bọc, tôi chưa từng phải đối mặt với thế giới bên ngoài.",
        "Tôi có thể không dũng cảm, nhưng tôi sẽ không bao giờ bỏ rơi bạn bè."
    ],
    'Tinh Ranh & Thực Dụng (Thông minh, đôi khi dùng thủ đoạn)': [
        "Trong thế giới này, kẻ ngốc thì chết sớm. Tôi không phải là kẻ ngốc.",
        "Mục đích biện minh cho phương tiện. Miễn là kết quả tốt, quá trình không quan trọng.",
        "Tôi có thể lừa dối cả thế giới, nhưng tôi sẽ không bao giờ phản bội những người tôi tin tưởng."
    ],
    'Kẻ Sĩ Tình (Hành động vì tình yêu, lãng mạn)': [
        "Tôi có thể làm tất cả vì người tôi yêu, kể cả việc chống lại cả thế giới.",
        "Tình yêu là sức mạnh lớn nhất, và tôi sẽ dùng nó để vượt qua mọi khó khăn.",
        "Tìm thấy một nửa của mình là mục tiêu lớn nhất trong cuộc đời tôi."
    ]
};
