/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import type { WorldSettings, LoreRule, DaoPath } from '../types';

export const WC_FORM_DATA_KEY = 'worldCreatorFormData';
export const FANFIC_TEXT_LIMIT = 200 * 1024; // 200KB limit
export const MAX_BG_FILE_SIZE_MB = 2;

export const GENRES = [
    'Marvel',
    'Quản lý Nhóm nhạc',
    'Đồng nhân',
    'Dị Giới Fantasy',
    'Thế Giới Giả Tưởng (Game/Tiểu Thuyết)',
    'Tu Tiên',
    'Võ Lâm',
    'Thời Chiến (Trung Hoa/Nhật Bản)',
    'Đô Thị Hiện Đại',
    'Đô Thị Hiện Đại 100% bình thường',
    'Hậu Tận Thế',
    'Huyền Huyễn Truyền Thuyết',
];

export const SETTINGS = [
    'Dựa trên Tệp Tải lên',
    'New York City',
    'Toàn Cầu (Global)',
    'Vũ Trụ (Cosmic)',
    'Đường Phố (Street-Level)',
    'Dị Giới (Đa dạng văn hóa)',
    'Fantasy phương Tây',
    'Trung Quốc',
    'Nhật Bản',
    'Hàn Quốc',
    'Việt Nam',
    'Tự Do (Do người chơi hoặc AI quyết định)',
];

export const GENRE_SETTING_MAP: Record<string, string[]> = {
    'Marvel': ['New York City', 'Toàn Cầu (Global)', 'Vũ Trụ (Cosmic)', 'Đường Phố (Street-Level)', 'Tự Do (Do người chơi hoặc AI quyết định)'],
    'Quản lý Nhóm nhạc': ['Việt Nam', 'Trung Quốc', 'Nhật Bản', 'Hàn Quốc', 'Tự Do (Do người chơi hoặc AI quyết định)'],
    'Đồng nhân': ['Dựa trên Tệp Tải lên'],
    'Dị Giới Fantasy': ['Dị Giới (Đa dạng văn hóa)', 'Fantasy phương Tây', 'Nhật Bản', 'Tự Do (Do người chơi hoặc AI quyết định)'],
    'Thế Giới Giả Tưởng (Game/Tiểu Thuyết)': ['Dị Giới (Đa dạng văn hóa)', 'Fantasy phương Tây', 'Nhật Bản', 'Tự Do (Do người chơi hoặc AI quyết định)'],
    'Tu Tiên': ['Việt Nam', 'Trung Quốc', 'Tự Do (Do người chơi hoặc AI quyết định)'],
    'Võ Lâm': ['Việt Nam', 'Trung Quốc', 'Hàn Quốc', 'Tự Do (Do người chơi hoặc AI quyết định)'],
    'Thời Chiến (Trung Hoa/Nhật Bản)': ['Trung Quốc', 'Nhật Bản', 'Tự Do (Do người chơi hoặc AI quyết định)'],
    'Đô Thị Hiện Đại': ['Việt Nam', 'Trung Quốc', 'Nhật Bản', 'Hàn Quốc', 'Tự Do (Do người chơi hoặc AI quyết định)'],
    'Đô Thị Hiện Đại 100% bình thường': ['Việt Nam', 'Trung Quốc', 'Nhật Bản', 'Hàn Quốc', 'Tự Do (Do người chơi hoặc AI quyết định)'],
    'Hậu Tận Thế': ['Việt Nam', 'Dị Giới (Đa dạng văn hóa)', 'Fantasy phương Tây', 'Trung Quốc', 'Nhật Bản', 'Hàn Quốc', 'Tự Do (Do người chơi hoặc AI quyết định)'],
    'Huyền Huyễn Truyền Thuyết': ['Việt Nam', 'Trung Quốc', 'Tự Do (Do người chơi hoặc AI quyết định)'],
};

export const INITIAL_WC_FORM_DATA: WorldSettings = {
    genre: 'Đô Thị Hiện Đại',
    setting: 'Việt Nam',
    idea: '',
    startingScene: 'safe_alone',
    details: '',
    name: '',
    personalityOuter: 'ai',
    species: '',
    gender: 'Nam',
    linhCan: '',
    backstory: '',
    skills: [],
    powers: [],
    alignment: 'Hero',
    voLamArts: {
        congPhap: '',
        chieuThuc: '',
        khiCong: '',
        thuat: '',
    },
    writingStyle: 'default',
    narrativeVoice: 'second',
    difficulty: 'normal',
    allow18Plus: true,
    loreRules: [],
    daoPath: 'ChinhThong',
    startingJob: '',
};

export const DAO_PATH_DETAILS: Record<DaoPath, { name: string; description: string }> = {
    'ChinhThong': {
        name: 'Chính Thống Tu',
        description: 'Con đường tu luyện cân bằng, lấy việc đả tọa hấp thụ linh khí làm gốc, kết hợp với đan dược và pháp bảo. Thiên Kiếp ở mức độ tiêu chuẩn.'
    },
    'TheTu': {
        name: 'Thể Tu',
        description: 'Tập trung rèn luyện thân thể, khiến cơ thể trở nên cường tráng như pháp bảo. Sức mạnh thể chất vượt trội nhưng tu vi tăng chậm hơn. Thiên Kiếp là những thử thách về thể chất.'
    },
    'MaTu': {
        name: 'Ma Tu',
        description: 'Con đường hắc ám, dùng các phương pháp tà đạo như hấp thụ tu vi, luyện hóa linh hồn để tăng tiến sức mạnh cực nhanh. Dễ bị tâm ma quấy nhiễu, Thiên Kiếp vô cùng nguy hiểm.'
    },
    'KiemTu': {
        name: 'Kiếm Tu',
        description: 'Lấy kiếm làm đạo, dồn hết tinh hoa vào một thanh bản mệnh phi kiếm. Sức tấn công vô song, có thể vượt cấp thách đấu nhưng các phương diện khác tương đối yếu hơn.'
    },
    'DanTu': {
        name: 'Đan Tu',
        description: 'Chuyên tâm vào thuật luyện đan, có thể nhận biết linh dược quý hiếm và luyện ra các loại đan dược có công hiệu thần kỳ. Khả năng chiến đấu trực diện yếu, chủ yếu dựa vào đan dược và pháp bảo phụ trợ.'
    }
};


type DifficultyLevel = {
    label: string;
    notes: string[];
};

export const DIFFICULTY_LEVELS: Record<string, DifficultyLevel> = {
    easy: {
        label: 'Dễ - Dạo Chơi',
        notes: [
            'Tập trung vào cốt truyện, ít thử thách.',
            'Tỷ lệ thành công của hành động rất cao.',
            'Kẻ địch yếu, dễ dàng vượt qua.',
            'Lý tưởng cho người chơi mới hoặc muốn thư giãn.'
        ]
    },
    normal: {
        label: 'Thường - Cân bằng',
        notes: [
            'Trải nghiệm cân bằng và logic.',
            'Tỷ lệ thành công và phần thưởng ở mức tiêu chuẩn.',
            'NPC và kẻ địch hành động hợp lý.',
            'Độ khó tiêu chuẩn, đòi hỏi sự tính toán.'
        ]
    },
    hard: {
        label: 'Khó - Thử Thách',
        notes: [
            'Kẻ địch thông minh và mạnh hơn.',
            'Tài nguyên khan hiếm, lựa chọn cần cẩn trọng.',
            'Tỷ lệ thành công thấp hơn, đòi hỏi chiến thuật.',
            'Dành cho người chơi tìm kiếm thử thách thực sự.'
        ]
    },
    nightmare: {
        label: 'Ác Mộng - Sinh Tồn',
        notes: [
            'Thế giới cực kỳ khắc nghiệt và nguy hiểm.',
            'Kẻ địch tàn nhẫn và có thể phục kích.',
            'Mọi sai lầm đều có thể dẫn đến kết quả tồi tệ.',
            'Dành cho những người chơi dày dạn kinh nghiệm và gan dạ.'
        ]
    }
};

export const STORY_LENGTH_OPTIONS = {
    short: 'Ngắn Gọn',
    standard: 'Tiêu Chuẩn',
    detailed: 'Chi Tiết',
    epic: 'Sử Thi',
};

export const STORY_LENGTH_INSTRUCTIONS = {
    short: 'Hãy viết diễn biến trong 1-2 đoạn văn ngắn gọn, súc tích, tập trung vào hành động chính và kết quả ngay lập tức.',
    standard: 'Viết diễn biến trong khoảng 2-4 đoạn văn. Cân bằng giữa mô tả hành động, đối thoại và một chút suy nghĩ nội tâm của nhân vật để giữ nhịp độ truyện vừa phải.',
    detailed: 'Viết diễn biến trong khoảng 4-6 đoạn văn. Đi sâu vào mô tả môi trường, các chi tiết giác quan (âm thanh, mùi vị), và cảm xúc phức tạp của các nhân vật liên quan.',
    epic: 'Viết như một chương truyện ngắn, từ 6-8 đoạn văn trở lên. Sử dụng ngôn ngữ văn học, trau chuốt. Kết hợp nhiều yếu tố: mô tả bối cảnh rộng lớn, những đoạn hồi tưởng hoặc suy ngẫm sâu sắc, diễn biến tâm lý phức tạp, và các chi tiết ẩn ý cho cốt truyện tương lai.',
};

export const FANTASY_RANK_DATA: {short: string; long: string}[] = [
  { short: 'F', long: 'Sắt' },
  { short: 'E', long: 'Đồng' },
  { short: 'D', long: 'Bạc' },
  { short: 'C', long: 'Vàng' },
  { short: 'B', long: 'Bạch kim' },
  { short: 'A', long: 'Mithril' },
  { short: 'S', long: 'Orichalcum' },
  { short: 'SS', long: 'Adamantite' }
];

// FIX: Added IDOL_MANAGER_LORE_RULES to be exported for use in useWorldCreatorForm.ts.
export const IDOL_MANAGER_LORE_RULES: Omit<LoreRule, 'id'>[] = [
    { text: "Nhân vật chính là quản lý, không phải idol.", isActive: true },
    { text: "Mục tiêu chính là đưa nhóm nhạc đến đỉnh cao danh vọng.", isActive: true },
    { text: "Các chỉ số quan trọng của nhóm nhạc bao gồm: Danh tiếng, Kỹ năng (Hát, Nhảy, Trình diễn), Tinh thần, và Tài chính công ty.", isActive: true },
    { text: "Các scandal (tin đồn hẹn hò, mâu thuẫn nội bộ, phát ngôn sai lầm) có thể ảnh hưởng nghiêm trọng đến Danh tiếng và Tinh thần của nhóm.", isActive: true },
    { text: "Mối quan hệ cá nhân với các thành viên trong nhóm, nhân viên công ty, và các đối tác truyền thông là rất quan trọng để thành công.", isActive: true },
    { text: "Lịch trình của nhóm (tập luyện, biểu diễn, quảng bá, nghỉ ngơi) phải được quản lý một cách cân bằng để tránh làm giảm Tinh thần.", isActive: true },
];

export const KNOWLEDGE_BASE_CATEGORIES = {
    npcs: { label: "NPC", key: 'npcs' },
    world_summary: { label: "Thế Giới", key: 'world_summary' },
    monsters: { label: "Quái Vật", key: 'monsters' },
    locations: { label: "Địa Điểm", key: 'locations' },
    factions: { label: "Phe Phái", key: 'factions' },
};

export const KB_CATEGORY_ORDER: (keyof typeof KNOWLEDGE_BASE_CATEGORIES)[] = [
    'npcs',
    'world_summary',
    'monsters',
    'locations',
    'factions',
];


export const ENTITY_TYPE_LABELS = {
    PC: 'Nhân Vật',
    NPC: 'NPC',
    MONSTER: 'Quái Vật',
    LOC: 'Địa Điểm',
    FACTION: 'Phe Phái',
};

export const startingSceneOptions = [
    { value: 'easy_18', label: '18+ Dễ', description: 'Bắt đầu thuận lợi trong một cảnh lãng mạn.' },
    { value: 'hard_18', label: '18+ Khó', description: 'Bắt đầu trong một cảnh 18+ có thử thách.' },
    { value: 'danger_alone', label: 'Hiểm Nguy', description: 'Một mình đối mặt với tình huống khó khăn.' },
    { value: 'safe_alone', label: 'An Toàn', description: 'Một mình trong hoàn cảnh thuận lợi, yên bình.' },
    { value: 'with_crowd', label: 'Đông Người', description: 'Bắt đầu giữa một đám đông hoặc sự kiện.' }
];