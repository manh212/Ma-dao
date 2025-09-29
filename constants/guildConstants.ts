
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import type { GuildBuildingUpgradeInfo } from '../types';

export const GUILD_BUILDING_UPGRADES: Record<string, GuildBuildingUpgradeInfo[]> = {
  mainHall: [
    { level: 1, cost: { gold: 0, wood: 0, ore: 0 }, description: "Cho phép tối đa 10 thành viên." },
    { level: 2, cost: { gold: 1000, wood: 1000, ore: 0 }, description: "Tăng giới hạn thành viên lên 15." },
    { level: 3, cost: { gold: 2500, wood: 2500, ore: 500 }, description: "Tăng giới hạn thành viên lên 25." },
    { level: 4, cost: { gold: 5000, wood: 5000, ore: 1500 }, description: "Tăng giới hạn thành viên lên 40." },
  ],
  trainingGrounds: [
    { level: 1, cost: { gold: 0, wood: 0, ore: 0 }, description: "Thành viên nhận thêm 10% kinh nghiệm kỹ năng." },
    { level: 2, cost: { gold: 500, wood: 1000, ore: 500 }, description: "Thành viên nhận thêm 20% kinh nghiệm. Bang chủ được +1 Thân Pháp." },
    { level: 3, cost: { gold: 1500, wood: 2000, ore: 1000 }, description: "Thành viên nhận thêm 30% kinh nghiệm. Bang chủ được +1 Lực Tay." },
    { level: 4, cost: { gold: 3000, wood: 3500, ore: 2000 }, description: "Thành viên nhận thêm 45% kinh nghiệm. Bang chủ được +2 Căn Cốt." },
  ],
  treasury: [
    { level: 1, cost: { gold: 0, wood: 0, ore: 0 }, description: "Tạo ra 100 vàng mỗi ngày." },
    { level: 2, cost: { gold: 1000, wood: 500, ore: 1000 }, description: "Tăng sản lượng lên 250 vàng mỗi ngày." },
    { level: 3, cost: { gold: 2000, wood: 1000, ore: 2000 }, description: "Tăng sản lượng lên 500 vàng mỗi ngày." },
    { level: 4, cost: { gold: 4000, wood: 1500, ore: 3500 }, description: "Tăng sản lượng lên 1000 vàng mỗi ngày." },
  ],
};
