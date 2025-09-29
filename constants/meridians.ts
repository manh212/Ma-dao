/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import type { MeridianPoint } from '../types';

export const DEFAULT_MERIDIANS_MAP: MeridianPoint[] = [
    {
        id: 'nham_mach',
        name: 'Nhâm Mạch (Mạch Sức Bền)',
        acupoints: [
            { id: 'huyet_hai', name: 'Huyết Hải', description: 'Biển của Khí Huyết, tăng cường thể chất.', cost: 1, effects: [{ stat: 'theChat', value: 5 }, { stat: 'constitution', value: 1 }] },
            { id: 'dan_dien', name: 'Đan Điền', description: 'Nguồn của Nội Lực, tăng cường khí tức.', cost: 1, effects: [{ stat: 'noiLuc', value: 50 }, { stat: 'maxNoiLuc', value: 50 }] },
            { id: 'trung_quan', name: 'Trung Quản', description: 'Trung tâm cơ thể, tăng sức chịu đựng.', cost: 2, effects: [{ stat: 'theChat', value: 10 }, { stat: 'constitution', value: 2 }] },
            { id: 'thien_dot', name: 'Thiên Đột', description: 'Yết hầu quan trọng, tăng khả năng phòng ngự.', cost: 2, effects: [{ stat: 'canCot', value: 5 }, { stat: 'defense', value: 2 }] },
        ]
    },
    {
        id: 'doc_mach',
        name: 'Đốc Mạch (Mạch Sức Mạnh)',
        acupoints: [
            { id: 'menh_mon', name: 'Mệnh Môn', description: 'Cửa của Sinh mệnh, tăng cường sức mạnh.', cost: 1, effects: [{ stat: 'lucTay', value: 5 }, { stat: 'strength', value: 1 }] },
            { id: 'linh_dai', name: 'Linh Đài', description: 'Nền tảng tinh thần, tăng cường ý chí.', cost: 1, effects: [{ stat: 'danhVong', value: 10 }] },
            { id: 'dai_chuy', name: 'Đại Chùy', description: 'Giao điểm các đường kinh, tăng toàn diện.', cost: 2, effects: [{ stat: 'lucTay', value: 10 }, { stat: 'strength', value: 2 }] },
            { id: 'bach_hoi', name: 'Bách Hội', description: 'Hội tụ của trăm kinh mạch, tăng thần thức.', cost: 2, effects: [{ stat: 'thanPhap', value: 5 }, { stat: 'dexterity', value: 2 }] },
        ]
    }
];