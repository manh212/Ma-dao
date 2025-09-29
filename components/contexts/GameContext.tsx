

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { hydrateGameState, hydrateWorldSettings } from '../../utils/hydration';
import { INITIAL_WC_FORM_DATA } from '../../constants/gameConstants';
import { DEFAULT_MERIDIANS_MAP } from '../../constants/meridians';
import { GUILD_BUILDING_UPGRADES } from '../../constants/guildConstants';
import { generateUniqueId } from '../../utils/id';
import type { GameState, WorldSettings, Character, LoreRule, Item, EquipmentSlot, KnowledgeEntity, Talent, CharacterStats, Monster, SkillMasteryLevel, VoLamCharacter, TuTienCharacter, SectStoreListing, Recipe, Guild, DiplomaticRelation } from '../../types';

interface State {
    gameState: GameState;
    worldSettings: WorldSettings;
}

const MASTERY_LEVELS_ORDER: SkillMasteryLevel[] = ['Sơ Nhập', 'Tiểu Thành', 'Đại Thành', 'Viên Mãn', 'Đăng Phong Tạo Cực'];

type Action =
    | { type: 'SET_GAME_STATE'; payload: GameState }
    | { type: 'LOAD_GAME'; payload: { gameState: GameState; worldSettings: WorldSettings } }
    | { type: 'CLEAR_GAME' }
    | { type: 'UPDATE_SAVE_ID'; payload: string }
    | { type: 'UPDATE_WORLD_SETTINGS'; payload: Partial<WorldSettings> }
    | { type: 'REVERT_TO_TURN'; payload: number }
    | { type: 'TOGGLE_PIN_MEMORY'; payload: string }
    | { type: 'DELETE_MEMORY'; payload: string }
    | { type: 'RENAME_ENTITY'; payload: { id: string; newName: string; entityType: string } }
    | { type: 'UPDATE_CHARACTER'; payload: { characterId: string; updates: Partial<Character> } }
    | { type: 'UPDATE_WORLD_SUMMARY'; payload: string }
    | { type: 'EQUIP_ITEM'; payload: { characterId: string; item: Item } }
    | { type: 'UNEQUIP_ITEM'; payload: { characterId: string; slot: EquipmentSlot } }
    | { type: 'EQUIP_TALENT'; payload: { characterId: string; skillId: string; talentId: string } }
    | { type: 'UNEQUIP_TALENT'; payload: { characterId: string; skillId: string; talentId: string } }
    | { type: 'BREAKTHROUGH_SKILL', payload: { characterId: string; skillId: string } }
    | { type: 'PURCHASE_SECT_ITEM', payload: { characterId: string; listing: SectStoreListing } }
    | { type: 'CRAFT_ITEM', payload: { characterId: string; recipe: Recipe } }
    | { type: 'UNLOCK_ACUPOINT', payload: { characterId: string; acupointId: string } }
    | { type: 'CREATE_GUILD'; payload: { ownerId: string; guildName: string } }
    | { type: 'RECRUIT_TO_GUILD'; payload: { guildId: string; npcId: string } }
    | { type: 'UPGRADE_BUILDING'; payload: { guildId: string; building: keyof Guild['buildings'] } }
    | { type: 'SET_DIPLOMACY'; payload: { guildId: string; targetFactionId: string; status: DiplomaticRelation['status'] } }
    | { 
        type: 'PROCESS_COMBAT_ACTION'; 
        payload: {
            updatedPlayer: Character;
            updatedOpponent: Character | Monster;
            log: string[];
            outcome: string;
            combatShouldEnd: boolean;
        } 
      };

const initialState: State = {
    gameState: null!,
    worldSettings: hydrateWorldSettings(INITIAL_WC_FORM_DATA),
};

const gameReducer = (state: State, action: Action): State => {
    // Helper function to recalculate character stats based on equipment
    const recalculateStats = (character: Character): Character => {
        const newChar = { ...character };
        // Start with a fresh copy of base stats
        const effectiveStats: CharacterStats = JSON.parse(JSON.stringify(newChar.baseStats || {}));

        // Add bonuses from all equipped items
        if (newChar.equipment) {
            for (const slot in newChar.equipment) {
                const item = newChar.equipment[slot as EquipmentSlot];
                if (item?.effects) {
                    for (const effect of item.effects) {
                        const statKey = effect.stat as keyof typeof effectiveStats;
                        // Initialize stat if it doesn't exist on base stats
                        if (typeof effectiveStats[statKey] === 'undefined') {
                            (effectiveStats as any)[statKey] = 0;
                        }
                        // Apply effect value
                        if (typeof (effectiveStats as any)[statKey] === 'number') {
                            (effectiveStats as any)[statKey] += effect.value;
                        }
                    }
                }
            }
        }
        newChar.stats = effectiveStats;
        return newChar;
    };


    switch (action.type) {
        case 'SET_GAME_STATE':
            return { ...state, gameState: hydrateGameState(action.payload, state.worldSettings) };
        
        case 'LOAD_GAME':
            return {
                ...state,
                gameState: hydrateGameState(action.payload.gameState, action.payload.worldSettings),
                worldSettings: hydrateWorldSettings(action.payload.worldSettings),
            };

        case 'CLEAR_GAME':
            return initialState;

        case 'UPDATE_SAVE_ID':
            if (!state.gameState) return state;
            return { ...state, gameState: { ...state.gameState, saveId: action.payload } };

        case 'UPDATE_WORLD_SETTINGS':
            return { ...state, worldSettings: { ...state.worldSettings, ...action.payload } };

        case 'UPDATE_WORLD_SUMMARY':
            if (!state.gameState) return state;
            return { ...state, gameState: { ...state.gameState, worldSummary: action.payload } };

        case 'REVERT_TO_TURN':
            if (!state.gameState || !state.gameState.history || action.payload < 0 || action.payload >= state.gameState.history.length) return state;
            return { ...state, gameState: hydrateGameState(state.gameState.history[action.payload], state.worldSettings) };

        case 'TOGGLE_PIN_MEMORY':
            if (!state.gameState) return state;
            return { ...state, gameState: { ...state.gameState, memories: state.gameState.memories.map(mem => mem.id === action.payload ? { ...mem, pinned: !mem.pinned } : mem) } };

        case 'DELETE_MEMORY':
            if (!state.gameState) return state;
            return { ...state, gameState: { ...state.gameState, memories: state.gameState.memories.filter(mem => mem.id !== action.payload) } };
        
        case 'RENAME_ENTITY': {
            if (!state.gameState) return state;
            const { id, newName, entityType } = action.payload;
            const newState = structuredClone(state);
            const { gameState: newGameState } = newState;
            
            let found = false;
            
            if (entityType === 'PC') {
                if (newGameState.character && newGameState.character.id === id) {
                    newGameState.character.displayName = newName;
                    found = true;
                }
            } else if (entityType === 'NPC') {
                const npc = newGameState.knowledgeBase.npcs.find((n: Character) => n.id === id);
                if (npc) {
                    npc.displayName = newName;
                    found = true;
                }
            } else {
                 const keyMap: Record<string, keyof GameState['knowledgeBase']> = { 'LOC': 'locations', 'FACTION': 'factions', 'MONSTER': 'monsters' };
                 const key = keyMap[entityType];
                 if (key && newGameState.knowledgeBase[key]) {
                     const entity = (newGameState.knowledgeBase[key] as (KnowledgeEntity | Character)[]).find(e => e.id === id);
                     if (entity) {
                         entity.displayName = newName;
                         found = true;
                     }
                 }
            }

            return found ? newState : state;
        }

        case 'UPDATE_CHARACTER': {
            if (!state.gameState) return state;
            const { characterId, updates } = action.payload;
            const newState = structuredClone(state);
            const { gameState: newGameState } = newState;
            let characterUpdated = false;

            if (newGameState.character && newGameState.character.id === characterId) {
                Object.assign(newGameState.character, updates);
                characterUpdated = true;
            } else {
                const npcIndex = newGameState.knowledgeBase.npcs.findIndex((npc: Character) => npc.id === characterId);
                if (npcIndex > -1) {
                    Object.assign(newGameState.knowledgeBase.npcs[npcIndex], updates);
                    characterUpdated = true;
                }
            }
            return characterUpdated ? newState : state;
        }
        
        case 'EQUIP_ITEM': {
            if (!state.gameState) return state;
            const { characterId, item } = action.payload;
            const newState = structuredClone(state);
            const { gameState: newGameState } = newState;
            const character = newGameState.character.id === characterId ? newGameState.character : newGameState.knowledgeBase.npcs.find((npc: Character) => npc.id === characterId);
            if (!character) return state;

            const getSlotFromItemType = (type: Item['type']): EquipmentSlot | null => {
                if (type === 'Weapon') return 'Weapon';
                if (type === 'Helmet') return 'Helmet';
                if (type === 'Chest Armor' || type === 'Armor') return 'Chest Armor';
                if (type === 'Boots') return 'Boots';
                if (type === 'Accessory') return 'Accessory';
                return null;
            };

            const slot = getSlotFromItemType(item.type);
            if (!slot) return state;

            const itemIndexInInventory = character.inventory.findIndex((invItem: Item) => invItem.name === item.name);
            if (itemIndexInInventory === -1) return state; // Item not in inventory

            const itemToEquip: Item = { ...character.inventory[itemIndexInInventory], quantity: 1 };
            
            // Manage inventory quantity
            if (character.inventory[itemIndexInInventory].quantity > 1) {
                character.inventory[itemIndexInInventory].quantity -= 1;
            } else {
                character.inventory.splice(itemIndexInInventory, 1);
            }

            // Unequip existing item in the slot
            const currentlyEquipped = character.equipment?.[slot];
            if (currentlyEquipped) {
                const existingInvItemIndex = character.inventory.findIndex((invItem: Item) => invItem.name === currentlyEquipped.name);
                if (existingInvItemIndex > -1) {
                    character.inventory[existingInvItemIndex].quantity += 1;
                } else {
                    character.inventory.push({ ...currentlyEquipped, quantity: 1 });
                }
            }
            
            if(!character.equipment) character.equipment = {};
            character.equipment[slot] = itemToEquip;

            // Recalculate stats for the updated character
            const updatedCharacter = recalculateStats(character);

            // Put the updated character back into the state
            if (character.id === newGameState.character.id) {
                newGameState.character = updatedCharacter;
            } else {
                const npcIndex = newGameState.knowledgeBase.npcs.findIndex((npc: Character) => npc.id === character.id);
                if (npcIndex > -1) {
                    newGameState.knowledgeBase.npcs[npcIndex] = updatedCharacter;
                }
            }
            
            return newState;
        }

        case 'UNEQUIP_ITEM': {
            if (!state.gameState) return state;
            const { characterId, slot } = action.payload;
            const newState = structuredClone(state);
            const { gameState: newGameState } = newState;
            const character = newGameState.character.id === characterId ? newGameState.character : newGameState.knowledgeBase.npcs.find((npc: Character) => npc.id === characterId);
            if (!character || !character.equipment?.[slot]) return state;

            const itemToUnequip = character.equipment[slot]!;
            delete character.equipment[slot];
            
            const existingInvItemIndex = character.inventory.findIndex((invItem: Item) => invItem.name === itemToUnequip.name);
            if (existingInvItemIndex > -1) {
                character.inventory[existingInvItemIndex].quantity += 1;
            } else {
                character.inventory.push({ ...itemToUnequip, quantity: 1 });
            }
            
            // Recalculate stats
            const updatedCharacter = recalculateStats(character);
            
            // Put the updated character back into the state
            if (character.id === newGameState.character.id) {
                newGameState.character = updatedCharacter;
            } else {
                const npcIndex = newGameState.knowledgeBase.npcs.findIndex((npc: Character) => npc.id === character.id);
                if (npcIndex > -1) {
                    newGameState.knowledgeBase.npcs[npcIndex] = updatedCharacter;
                }
            }

            return newState;
        }
        
        case 'EQUIP_TALENT': {
            if (!state.gameState) return state;
            const { characterId, skillId, talentId } = action.payload;
            const newState = structuredClone(state);
            const character = newState.gameState.character.id === characterId ? newState.gameState.character : newState.gameState.knowledgeBase.npcs.find((npc: Character) => npc.id === characterId);
            if (!character) return state;

            const skill = character.skills.find(s => s.id === skillId);
            if (!skill || skill.unlockedTalents.length >= skill.talentSlots) return state;

            const talentIndex = (character.learnedTalents || []).findIndex(t => t.id === talentId);
            if (talentIndex === -1) return state;

            const [talentToEquip] = character.learnedTalents!.splice(talentIndex, 1);
            skill.unlockedTalents.push(talentToEquip);
            
            return newState;
        }

        case 'UNEQUIP_TALENT': {
            if (!state.gameState) return state;
            const { characterId, skillId, talentId } = action.payload;
            const newState = structuredClone(state);
            const character = newState.gameState.character.id === characterId ? newState.gameState.character : newState.gameState.knowledgeBase.npcs.find((npc: Character) => npc.id === characterId);
            if (!character) return state;

            const skill = character.skills.find(s => s.id === skillId);
            if (!skill) return state;
            
            const talentIndex = skill.unlockedTalents.findIndex(t => t.id === talentId);
            if (talentIndex === -1) return state;

            const [talentToUnequip] = skill.unlockedTalents.splice(talentIndex, 1);
            if (!character.learnedTalents) character.learnedTalents = [];
            character.learnedTalents.push(talentToUnequip);

            return newState;
        }

        case 'BREAKTHROUGH_SKILL': {
            if (!state.gameState || state.worldSettings.genre !== 'Võ Lâm') {
                return state;
            }

            const { characterId, skillId } = action.payload;
            const newState = structuredClone(state);
            
            const character = newState.gameState.character as VoLamCharacter;
            if (!character || character.id !== characterId) return state;
            
            const skill = character.skills.find(s => s.id === skillId);
            if (!skill) return state;
            
            const currentIndex = MASTERY_LEVELS_ORDER.indexOf(skill.masteryLevel);
            if (currentIndex === -1 || currentIndex === MASTERY_LEVELS_ORDER.length - 1) return state; 
            
            const requiredEp = 100 * (currentIndex + 1) * skill.level;
            const enlightenmentPoints = character.stats?.enlightenmentPoints ?? 0;
            if (skill.masteryXp < requiredEp || enlightenmentPoints < 1) return state;

            if (!character.stats) {
                character.stats = {};
            }
            character.stats.enlightenmentPoints = (character.stats.enlightenmentPoints ?? 0) - 1;
            skill.masteryXp = 0; 
            skill.masteryLevel = MASTERY_LEVELS_ORDER[currentIndex + 1];
            
            return newState;
        }

        case 'PURCHASE_SECT_ITEM': {
            // Genre Guard Clause
            if (!state.gameState || state.worldSettings.genre !== 'Võ Lâm') {
                return state;
            }
            const { characterId, listing } = action.payload;
            const newState = structuredClone(state);
            const character = newState.gameState.character as VoLamCharacter;
            if (character.id !== characterId || !character.contributionPoints) {
                return state;
            }

            if (character.contributionPoints.current < listing.cost) {
                return state;
            }

            character.contributionPoints.current -= listing.cost;

            if (listing.listingType === 'SKILL') {
                const { cost, listingType, ...newSkill } = listing;
                character.skills.push(newSkill);
            } else {
                const { cost, listingType, ...newItem } = listing;
                const existingItem = character.inventory.find(i => i.name === newItem.name);
                if (existingItem) {
                    existingItem.quantity += newItem.quantity;
                } else {
                    character.inventory.push(newItem);
                }
            }

            return newState;
        }
        
        case 'CRAFT_ITEM': {
            // Genre Guard Clause
            if (!state.gameState || state.worldSettings.genre !== 'Võ Lâm') {
                return state;
            }
            const { characterId, recipe } = action.payload;
            const newState = structuredClone(state);
            const character = newState.gameState.character as VoLamCharacter;
            if (character.id !== characterId) return state;

            // Check if materials are sufficient
            const inventoryMap = new Map(character.inventory.map(item => [item.name, item.quantity]));
            for (const material of recipe.materials) {
                if ((inventoryMap.get(material.name) || 0) < material.quantity) {
                    return state; // Not enough materials
                }
            }

            // Consume materials
            for (const material of recipe.materials) {
                const itemIndex = character.inventory.findIndex(item => item.name === material.name);
                if (itemIndex !== -1) {
                    character.inventory[itemIndex].quantity -= material.quantity;
                    if (character.inventory[itemIndex].quantity <= 0) {
                        character.inventory.splice(itemIndex, 1);
                    }
                }
            }

            // Add crafted item
            const craftedItem = recipe.output;
            const existingItemIndex = character.inventory.findIndex(item => item.name === craftedItem.name);
            if (existingItemIndex !== -1) {
                character.inventory[existingItemIndex].quantity += craftedItem.quantity;
            } else {
                character.inventory.push({ ...craftedItem });
            }

            return newState;
        }

        case 'UNLOCK_ACUPOINT': {
            // Genre Guard Clause
            if (!state.gameState || state.worldSettings.genre !== 'Võ Lâm') {
                return state;
            }
            const { characterId, acupointId } = action.payload;

            const acupointData = DEFAULT_MERIDIANS_MAP.flatMap(m => m.acupoints).find(a => a.id === acupointId);
            if (!acupointData) return state;

            const newState = structuredClone(state);
            const character = newState.gameState.character as VoLamCharacter;
            if (character.id !== characterId) return state;

            if ((character.qiPoints ?? 0) < acupointData.cost || character.meridians?.[acupointId]) {
                return state;
            }

            character.qiPoints = (character.qiPoints ?? 0) - acupointData.cost;
            if (!character.meridians) character.meridians = {};
            character.meridians[acupointId] = true;

            if (!character.baseStats) character.baseStats = {};
            acupointData.effects.forEach(effect => {
                const statKey = effect.stat as keyof CharacterStats;
                const currentVal = (character.baseStats as any)[statKey] ?? 0;
                (character.baseStats as any)[statKey] = currentVal + effect.value;
            });
            
            // Recalculate effective stats after updating base stats
            const updatedCharacter = recalculateStats(character);
            newState.gameState.character = updatedCharacter;

            return newState;
        }

        case 'CREATE_GUILD': {
            if (!state.gameState || state.worldSettings.genre !== 'Võ Lâm') {
                return state;
            }
            const { ownerId, guildName } = action.payload;
            const newState = structuredClone(state);
            const newGuildId = generateUniqueId('guild');
            
            const newGuild: Guild = {
                id: newGuildId,
                name: guildName,
                ownerId,
                members: [ownerId],
                buildings: { mainHall: { level: 1 }, trainingGrounds: { level: 1 }, treasury: { level: 1 } },
                resources: { gold: 1000, wood: 500, ore: 200 },
                diplomacy: [],
                maxMembers: 10,
                passiveIncome: { gold: 100 },
            };

            if (!newState.gameState.guilds) newState.gameState.guilds = {};
            newState.gameState.guilds[newGuildId] = newGuild;
            (newState.gameState.character as VoLamCharacter).guildId = newGuildId;
            (newState.gameState.character as VoLamCharacter).sectId = undefined; // Leave sect upon creating guild

            return newState;
        }

        case 'RECRUIT_TO_GUILD': {
            // Genre Guard Clause
            if (!state.gameState || state.worldSettings.genre !== 'Võ Lâm') {
                return state;
            }
            const { guildId, npcId } = action.payload;
            const newState = structuredClone(state);
            const guild = newState.gameState.guilds?.[guildId];
        
            // Find the NPC to be recruited
            const npcToRecruitIndex = newState.gameState.knowledgeBase.npcs.findIndex(n => n.id === npcId);
            const npcToRecruit = npcToRecruitIndex !== -1 ? newState.gameState.knowledgeBase.npcs[npcToRecruitIndex] : null;
        
            // Validation checks
            if (!guild || !npcToRecruit) return state; // Guild or NPC not found
            if (guild.members.includes(npcId)) return state; // Already a member
            if (npcToRecruit.deathState?.isDead) return state; // Cannot recruit the dead
            if ((npcToRecruit as VoLamCharacter).guildId) return state; // Already in another guild
            if ((npcToRecruit.relationship ?? 0) < -25) return state; // Hostile relationship
        
            // Add to guild
            guild.members.push(npcId);
        
            // Update NPC's guild status
            (newState.gameState.knowledgeBase.npcs[npcToRecruitIndex] as VoLamCharacter).guildId = guildId;
            
            return newState;
        }

        case 'UPGRADE_BUILDING': {
            if (!state.gameState || state.worldSettings.genre !== 'Võ Lâm') return state;
        
            const { guildId, building } = action.payload;
            const newState = structuredClone(state);
            const guild = newState.gameState.guilds?.[guildId];
            const character = newState.gameState.character as VoLamCharacter;
        
            if (!guild || !character) return state;
        
            const currentLevel = guild.buildings[building].level;
            const upgradeData = GUILD_BUILDING_UPGRADES[building]?.find(u => u.level === currentLevel + 1);
        
            if (!upgradeData) return state; // Max level reached
        
            const { cost } = upgradeData;
            if (guild.resources.gold < cost.gold || guild.resources.wood < cost.wood || guild.resources.ore < cost.ore) {
                return state; // Not enough resources
            }
        
            // Deduct resources
            guild.resources.gold -= cost.gold;
            guild.resources.wood -= cost.wood;
            guild.resources.ore -= cost.ore;
        
            // Increment level
            guild.buildings[building].level += 1;
        
            // Apply rewards
            switch (building) {
                case 'mainHall':
                    if (guild.buildings.mainHall.level === 2) guild.maxMembers = 15;
                    else if (guild.buildings.mainHall.level === 3) guild.maxMembers = 25;
                    else if (guild.buildings.mainHall.level === 4) guild.maxMembers = 40;
                    break;
                case 'trainingGrounds':
                    if (!character.baseStats) character.baseStats = {};
                    if (guild.buildings.trainingGrounds.level === 2) {
                        character.baseStats.thanPhap = (character.baseStats.thanPhap ?? 0) + 1;
                    } else if (guild.buildings.trainingGrounds.level === 3) {
                        character.baseStats.lucTay = (character.baseStats.lucTay ?? 0) + 1;
                    } else if (guild.buildings.trainingGrounds.level === 4) {
                        character.baseStats.canCot = (character.baseStats.canCot ?? 0) + 2;
                    }
                    newState.gameState.character = recalculateStats(character);
                    break;
                case 'treasury':
                    if (guild.buildings.treasury.level === 2) guild.passiveIncome.gold = 250;
                    else if (guild.buildings.treasury.level === 3) guild.passiveIncome.gold = 500;
                    else if (guild.buildings.treasury.level === 4) guild.passiveIncome.gold = 1000;
                    break;
            }
        
            return newState;
        }

        case 'SET_DIPLOMACY': {
            // Genre Guard Clause
            if (!state.gameState || state.worldSettings.genre !== 'Võ Lâm') {
                return state;
            }
            const { guildId, targetFactionId, status } = action.payload;
            const newState = structuredClone(state);
            const guild = newState.gameState.guilds?.[guildId];
            if (!guild) return state;

            const existingRelationIndex = guild.diplomacy.findIndex(r => r.factionId === targetFactionId);
            if (existingRelationIndex > -1) {
                guild.diplomacy[existingRelationIndex].status = status;
            } else {
                guild.diplomacy.push({ factionId: targetFactionId, status });
            }
            return newState;
        }

        case 'PROCESS_COMBAT_ACTION': {
            if (!state.gameState) return state;
            const { updatedPlayer, updatedOpponent, log, combatShouldEnd } = action.payload;
            const newState = structuredClone(state);
            const { gameState: newGameState } = newState;

            // Update player
            newGameState.character = updatedPlayer;

            // Update opponent
            const npcIndex = newGameState.knowledgeBase.npcs.findIndex(n => n.id === updatedOpponent.id);
            if (npcIndex !== -1) {
                newGameState.knowledgeBase.npcs[npcIndex] = updatedOpponent as Character;
            } else {
                const monsterIndex = newGameState.knowledgeBase.monsters.findIndex(m => m.id === updatedOpponent.id);
                if (monsterIndex !== -1) {
                    newGameState.knowledgeBase.monsters[monsterIndex] = updatedOpponent as Monster;
                }
            }

            // Update combat log and turn
            newGameState.combatLog.push(...log);
            newGameState.combatTurnNumber += 1;

            // Handle combat end
            if (combatShouldEnd) {
                newGameState.isInCombat = false;
                newGameState.combatants = [];
                newGameState.combatLog.push("--- Trận chiến kết thúc ---");
            }
            
            return newState;
        }


        default:
            return state;
    }
};

interface GameContextType {
    gameState: GameState;
    worldSettings: WorldSettings;
    dispatch: React.Dispatch<Action>;
}

const GameContext = createContext<GameContextType>(null!);

export const GameProvider = ({ children }: { children?: ReactNode }) => {
    const [state, dispatch] = useReducer(gameReducer, initialState);
    return (
        <GameContext.Provider value={{ gameState: state.gameState, worldSettings: state.worldSettings, dispatch }}>
            {children}
        </GameContext.Provider>
    );
};

export const useGameContext = () => {
    const context = useContext(GameContext);
    if (!context) {
        throw new Error('useGameContext must be used within a GameProvider');
    }
    return context;
};