/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import type { Character, Monster, GameAction, GameCharacter } from '../types';

type CombatActionType = 'Tấn công' | 'Phòng thủ' | 'Bỏ chạy' | 'Kỹ năng';
type CombatOutcome = 'ongoing' | 'win' | 'loss' | 'fled';

// A type guard to check if an entity is combat-ready
export const isCombatant = (entity: any): entity is (Character | Monster) & { stats: object, health: object } => {
    return entity && typeof entity.stats === 'object' && typeof entity.health === 'object';
};

/**
 * A simple combat resolution function.
 * @param attacker The character initiating the attack.
 * @param target The character or monster being attacked.
 * @returns An object containing the calculated damage.
 */
const resolveAttack = (attacker: Character | Monster, target: Character | Monster): { damage: number; } => {
    // Lấy chỉ số công và thủ, với giá trị mặc định nếu không có.
    const attackerAttack = (attacker.stats as any)?.attack ?? 10;
    const targetDefense = (target.stats as any)?.defense ?? 5;

    // Sát thương cơ bản là chênh lệch giữa công và thủ, tối thiểu là 1.
    let damage = Math.max(1, attackerAttack - targetDefense);

    // Thêm yếu tố ngẫu nhiên (80% - 120%) để làm cho trận đấu bớt đoán trước.
    damage = Math.round(damage * (Math.random() * 0.4 + 0.8)); 
    return { damage };
};

/**
 * Processes a full combat turn, including player action and enemy counter-attack.
 * @param action The player's chosen action.
 * @param player The player character.
 * @param opponent The opponent character or monster.
 * @returns An object with updated entities, a combat log, and the turn's outcome.
 */
const processTurn = (
    action: GameAction,
    player: GameCharacter,
    opponent: GameCharacter | Monster
) => {
    const log: string[] = [];
    const updatedPlayer = structuredClone(player);
    const updatedOpponent = structuredClone(opponent);
    let outcome: CombatOutcome = 'ongoing';

    const playerName = updatedPlayer.displayName;
    const opponentName = updatedOpponent.displayName || updatedOpponent.name;

    let playerDamageReduction = 1;
    let actionType: CombatActionType = 'Tấn công';
    if (action.skillId) actionType = 'Kỹ năng';
    else if (action.description?.includes('Phòng thủ')) actionType = 'Phòng thủ';
    else if (action.description?.includes('Bỏ chạy')) actionType = 'Bỏ chạy';


    // 1. Resolve Player Action
    switch (actionType) {
        case 'Tấn công': {
            const { damage } = resolveAttack(updatedPlayer, updatedOpponent);
            updatedOpponent.health.current = Math.max(0, updatedOpponent.health.current - damage);
            log.push(`${playerName} tấn công ${opponentName}, gây ${damage} sát thương.`);
            if (updatedOpponent.health.current <= 0) {
                log.push(`${opponentName} đã bị đánh bại!`);
                outcome = 'win';
            }
            break;
        }
        case 'Phòng thủ': {
            const defenseChance = calculateDefenseChance(updatedPlayer, updatedOpponent);
            if (Math.random() * 100 < defenseChance) {
                log.push(`${playerName} giơ vũ khí lên phòng thủ.`);
                playerDamageReduction = 0.25; // Chỉ nhận 25% sát thương

                const riposteChance = (updatedPlayer.stats?.dexterity ?? 5) * 1.5;
                if (Math.random() * 100 < riposteChance) {
                    const riposteDamage = Math.max(1, Math.round(resolveAttack(updatedPlayer, updatedOpponent).damage * 0.25));
                    updatedOpponent.health.current = Math.max(0, updatedOpponent.health.current - riposteDamage);
                    log.push(`Nhân lúc đối thủ sơ hở, ${playerName} phản công, gây ${riposteDamage} sát thương!`);
                    if (updatedOpponent.health.current <= 0) {
                        log.push(`${opponentName} đã bị đánh bại sau đòn phản công!`);
                        outcome = 'win';
                    }
                }

            } else {
                log.push(`${playerName} phòng thủ thất bại.`);
            }
            break;
        }
        case 'Bỏ chạy': {
            const fleeChance = calculateFleeChance(updatedPlayer, updatedOpponent);
            if (Math.random() * 100 < fleeChance) {
                log.push(`${playerName} đã bỏ chạy thành công!`);
                outcome = 'fled';
            } else {
                log.push(`${playerName} bỏ chạy thất bại!`);
            }
            break;
        }
        case 'Kỹ năng': {
            const skill = updatedPlayer.skills.find(s => s.id === action.skillId);
            if (!skill || ('linhLuc' in updatedPlayer && updatedPlayer.linhLuc && updatedPlayer.linhLuc.current < skill.manaCost)) {
                log.push(`${playerName} định dùng kỹ năng nhưng thất bại.`);
                break;
            }
            
            if ('linhLuc' in updatedPlayer && updatedPlayer.linhLuc) {
                updatedPlayer.linhLuc.current -= skill.manaCost;
            }
            log.push(`${playerName} sử dụng [${skill.name}]!`);
            
            // Apply skill effects
            skill.effects?.forEach(effect => {
                switch (effect.stat) {
                    case 'damage': // Direct damage effect
                        updatedOpponent.health.current = Math.max(0, updatedOpponent.health.current - effect.value);
                        log.push(`Kỹ năng gây ${effect.value} sát thương lên ${opponentName}.`);
                        break;
                    case 'health': // Healing effect
                        updatedPlayer.health.current = Math.min(updatedPlayer.health.max, updatedPlayer.health.current + effect.value);
                        log.push(`${playerName} hồi phục ${effect.value} Máu.`);
                        break;
                    // Add cases for other effects like 'defense', 'attack' buffs/debuffs later
                }
            });

            if (updatedOpponent.health.current <= 0) {
                log.push(`${opponentName} đã bị đánh bại!`);
                outcome = 'win';
            }
            break;
        }
    }

    // 2. Resolve Opponent Counter-Attack (if combat is ongoing)
    if (outcome === 'ongoing') {
        log.push(`${opponentName} phản công!`);
        const { damage: opponentDamage } = resolveAttack(updatedOpponent, updatedPlayer);
        const finalDamage = Math.round(opponentDamage * playerDamageReduction);
        updatedPlayer.health.current = Math.max(0, updatedPlayer.health.current - finalDamage);
        
        if (playerDamageReduction < 1) {
            log.push(`${playerName} chỉ nhận ${finalDamage} sát thương nhờ phòng thủ.`);
        } else {
            log.push(`${opponentName} gây ${finalDamage} sát thương cho ${playerName}.`);
        }

        if (updatedPlayer.health.current <= 0) {
            log.push(`${playerName} đã gục ngã!`);
            outcome = 'loss';
        }
    }
    
    const combatShouldEnd = outcome !== 'ongoing';

    return {
        updatedPlayer,
        updatedOpponent,
        log,
        outcome,
        combatShouldEnd,
    };
};


/**
 * Calculates the chance of successfully defending.
 * Logic: Tỷ lệ cơ bản là 50%. Mỗi điểm chênh lệch Tốc độ (speed) giữa người chơi và đối thủ sẽ thay đổi tỷ lệ 2%.
 * @param character The defending character.
 * @param mainOpponent The primary opponent.
 * @returns A percentage chance (0-100).
 */
const calculateDefenseChance = (character: GameCharacter, mainOpponent: GameCharacter | Monster): number => {
    const charSpeed = character.stats?.speed ?? 10;
    const oppSpeed = mainOpponent.stats?.speed ?? 10;
    // Tỷ lệ cơ bản là 50%, được điều chỉnh bởi chênh lệch tốc độ.
    const chance = 50 + (charSpeed - oppSpeed) * 2;
    // Giới hạn tỷ lệ trong khoảng 10% - 95% để tránh kết quả tuyệt đối.
    return Math.max(10, Math.min(95, Math.round(chance)));
};

/**
 * Calculates the chance of successfully fleeing combat.
 * Logic: Bỏ chạy khó hơn phòng thủ, tỷ lệ cơ bản là 30%. Chênh lệch Tốc độ có ảnh hưởng lớn hơn (x2.5).
 * @param character The character attempting to flee.
 * @param mainOpponent The primary opponent.
 * @returns A percentage chance (0-100).
 */
const calculateFleeChance = (character: GameCharacter, mainOpponent: GameCharacter | Monster): number => {
    const charSpeed = character.stats?.speed ?? 10;
    const oppSpeed = mainOpponent.stats?.speed ?? 10;
    // Bỏ chạy khó hơn, tỷ lệ cơ bản là 30%.
    const chance = 30 + (charSpeed - oppSpeed) * 2.5;
    // Giới hạn tỷ lệ trong khoảng 5% - 90%.
    return Math.max(5, Math.min(90, Math.round(chance)));
};


export const CombatService = {
    isCombatant,
    calculateDefenseChance,
    calculateFleeChance,
    processTurn,
};