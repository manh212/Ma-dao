




/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

// Forward-declare genre types without exporting them to resolve ambiguity with actual types from `types/genres`.
// These are placeholders for type composition within this file only.
import { IdDataSystem } from "./system";
import { Job, Asset } from './genres/modern'; // Import new types
type TuTienCharacter = any;
type VoLamCharacter = any;
type MarvelCharacter = any;
type FanficCharacter = any; // Add FanficCharacter placeholder
// Define and export Power and PowerSource types to be used across the application.
export type PowerSource = 'Mutant' | 'Technology' | 'Magic' | 'Scientific Accident' | 'Cosmic' | 'Other';
export interface Power {
    id: string;
    name: string;
    description: string;
    powerSource: PowerSource;
}
type VoLamArts = any;
type DaoPath = any;
type Guild = any;

//====================================================================================
// Prerequisite Sub-Types for Game State
// These types must be defined before they are used in `GameState`, `BaseCharacter`, etc.
//====================================================================================

export interface StatEffect {
    stat: string;
    value: number;
}

export enum TalentType {
    MODIFIER = 'MODIFIER',
    AUGMENT = 'AUGMENT',
    TRIGGER = 'TRIGGER',
    SYNERGY = 'SYNERGY',
}

export interface Talent {
    id: string;
    name: string;
    description: string;
    type: TalentType;
    skillId: string;
    effects?: StatEffect[];
}

export type SkillMasteryLevel = 'Sơ Nhập' | 'Tiểu Thành' | 'Đại Thành' | 'Viên Mãn' | 'Đăng Phong Tạo Cực';

export interface Skill {
    id: string;
    name: string;
    description: string;
    evolutionDescription?: string;
    type: 'Active' | 'Passive';
    skillType: 'Attack' | 'Heal' | 'Buff' | 'Debuff' | 'Social' | 'Professional';
    target: 'Self' | 'Enemy' | 'Ally';
    manaCost: number;
    level: number;
    xp: number;
    talentSlots: number;
    unlockedTalents: Talent[];
    effects?: StatEffect[];
    masteryLevel: SkillMasteryLevel;
    masteryXp: number;
}

export type EquipmentSlot = 'Weapon' | 'Helmet' | 'Chest Armor' | 'Boots' | 'Accessory';
export type ItemType = 'Quest Item' | 'Key' | 'Tome' | 'Consumable' | 'Material' | 'Misc' | EquipmentSlot | 'Armor';
export const ALL_EQUIPPABLE_ITEM_TYPES: ReadonlyArray<ItemType> = ['Weapon', 'Helmet', 'Chest Armor', 'Boots', 'Accessory', 'Armor'];

export interface Item {
    name: string;
    description: string;
    quantity: number;
    type: ItemType;
    effects?: StatEffect[];
    tags?: string[];
    keywords?: string[];
}

// FIX: Duplicate identifier 'SectStoreListing'.
// Moved definitions before first use and removed forward declaration.
export interface SectStorePurchaseable {
    cost: number;
}

// Discriminated union for store items
export type SectStoreListing = (Item & SectStorePurchaseable & { listingType: 'ITEM' }) | (Skill & SectStorePurchaseable & { listingType: 'SKILL' });


//====================================================================================
// Core Game State & Save File Structure
// ====================================================================================

export interface GameState {
    saveId?: string;
    title: string;
    worldSummary: string;
    gameTime: GameTime;
    character: GameCharacter; // Use the union type for the player character
    turns: Turn[];
    actions: GameAction[];
    knowledgeBase: {
        pcs: BaseCharacter[];
        npcs: GameCharacter[]; // NPCs can also have genre-specific properties
        locations: KnowledgeEntity[];
        factions: KnowledgeEntity[];
        monsters: Monster[];
    };
    memories: Memory[];
    history: GameState[];
    totalTokenCount: number;
    quests: Quest[];
    isIntercourseScene: boolean;
    intercourseStep: number;
    isInCombat?: boolean;
    combatants?: string[];
    combatTurnNumber: number;
    combatLog: string[];
    sect?: any; // To be defined in genre-specific types
    sectStores?: Record<string, SectStoreListing[]>;
    guilds?: Record<string, Guild>;
    worldState?: Record<string, any>;
}

export interface SaveFile {
    id: string;
    name: string;
    timestamp: string;
    gameState: GameState;
    worldSettings: WorldSettings;
    slotNumber?: number;
    idControlData?: Record<string, IdDataSystem[]>;
}


// ====================================================================================
// Game World & Turn Structure
// ====================================================================================

export interface Turn {
    id: string;
    story: string | null;
    messages: { 
        id: string; 
        text: string;
        type?: 'system' | 'reality_ripple';
    }[];
    chosenAction: string | null;
    tokenCount: number;
    summary?: string;
    worldEvent?: {
        title: string;
        description: string;
    };
}

export interface GameAction {
    id: string;
    description: string;
    successChance?: number;
    benefit?: string;
    risk?: string;
    timeCost?: string;
    benefitPotential?: number;
    riskPotential?: number;
    skillId?: string;
    ipCost?: number;
    isFateAltering?: boolean;
}

export interface GameTime {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    weather: string;
}


// ====================================================================================
// Character & Entity Types
// ====================================================================================

export interface BaseCharacter {
    id: string;
    name: string;
    displayName: string;
    title?: string;
    species: string;
    age: number;
    ageDescription?: string;
    gender: string;
    avatarUrl?: string;
    personality: string;
    personalityStats?: { bravery: number; cunning: number; honesty: number };
    description: string;
    backstory: string;
    adventurerRank?: string;
    rankPoints?: number;
    threatLevel?: 'Street' | 'City' | 'National' | 'Global' | 'Cosmic';
    threatPoints?: number;
    alignment?: 'Hero' | 'Anti-Hero' | 'Villain' | 'Neutral';
    alignmentScore?: number;
    baseStats?: CharacterStats;
    stats?: CharacterStats;
    skills: Skill[];
    abilities: { name: string; description: string }[];
    relationships: Relationship[];
    keyMemories?: string[];
    money?: number;
    inventory: Item[];
    equipment?: Partial<Record<EquipmentSlot, Item>>;
    learnedTalents?: Talent[];
    relationship?: number;
    respect?: number;
    trust?: number;
    fear?: number;
    mood?: Mood;
    goals?: string[];
    deathState?: DeathState;
    mealsEatenStats?: { day: number; count: number };
    traits?: Trait[];
    ideals?: string[];
    bonds?: string[];
    reputation?: Reputation[];
    secrets?: Secret[];
    scars?: Scar[];
    characterArc?: CharacterArc;
    lifeEvents?: { turnId: string; description: string }[];
    tags?: string[];
    keywords?: string[];
    // Urban Flow System Stats
    stress?: number;
    socialEnergy?: number;
    happiness?: number;
    job?: Job;
    assets?: Asset[];
}

export interface KnowledgeEntity {
    id: string;
    name: string;
    displayName: string;
    description: string;
    tags?: string[];
    keywords?: string[];
}

export interface Monster extends KnowledgeEntity {
    health: { current: number; max: number };
    stats?: CharacterStats;
    linhLuc?: { current: number; max: number };
}

export interface CharacterStats {
    strength?: number;
    dexterity?: number;
    constitution?: number;
    intelligence?: number;
    wisdom?: number;
    charisma?: number;
    power?: number;
    speed?: number;
    durability?: number;
    fightingSkills?: number;
    attack?: number;
    defense?: number;
}


// ====================================================================================
// Detailed Sub-Types (Skills, Items, Quests, etc.)
// ====================================================================================

export interface Quest {
    id: string;
    title: string;
    description: string;
    objectives: QuestObjective[];
    status: 'Ongoing' | 'Completed' | 'Failed';
    reward?: string;
    failureConsequence?: string;
    tags?: string[];
    keywords?: string[];
    questGiverId?: string;
    questGiverType?: 'SECT' | 'NPC' | 'FACTION';
}

export interface QuestObjective {
    description: string;
    completed: boolean;
}

// FIX: Moved Recipe types here from voLam.ts to create a single source of truth.
// New Types for Crafting System
export interface RecipeMaterial {
    itemId: string; // Internal ID, e.g., 'herb_linh_tam'
    name: string;   // Display name, e.g., 'Linh Tâm Thảo'
    quantity: number;
}

export interface Recipe {
    id: string;
    name: string;
    description: string;
    type: 'Alchemy' | 'Forging'; // Luyện Đan | Rèn Đúc
    materials: RecipeMaterial[];
    output: Item;
}


// ====================================================================================
// Character Detail & Personality Types
// ====================================================================================

export interface Relationship {
    targetId: string;
    type: string;
    description: string;
    rationale?: string;
    flags?: string[];
    sentimentDetails?: {
        type: 'Favor' | 'Grudge' | 'Neutral';
        reason: string;
        magnitude: 'Small' | 'Large' | 'Life-changing';
    };
    // Urban Flow System Stats
    closeness?: number; // 0-100
    influence?: number; // 0-100
}

export interface Mood {
    current: string;
    intensity: number;
    reason: string;
}

export interface DeathState {
    isDead: true;
    reason: string;
    isPublicKnowledge: boolean;
}

export interface Trait {
    id: string;
    type: 'Trait' | 'Flaw';
    name: string;
    description: string;
    effects?: StatEffect[];
}

export interface Reputation {
    factionId: string;
    factionName: string;
    score: number;
    title: string;
}

export interface Secret {
    id: string;
    text: string;
    isKnownByPlayer: boolean;
}

export interface Scar {
    id: string;
    description: string;
    sourceTurnId: string;
}

export interface CharacterArc {
    name: string;
    stage: number;
    description: string;
}


// ====================================================================================
// World & Lore Types
// ====================================================================================

export interface CanonEvent {
    id: string;
    title: string;
    description: string;
    turnNumber: number;
    status: 'past' | 'present' | 'future' | 'diverged';
}

export interface WorldSettings {
    genre: string;
    setting: string;
    idea: string;
    startingScene: string;
    details: string;
    name: string;
    personalityOuter: string;
    species: string;
    gender: string;
    backstory: string;
    skills: Omit<Skill, 'type' | 'level' | 'xp' | 'talentSlots' | 'unlockedTalents' | 'effects' | 'manaCost' | 'skillType' | 'target' | 'masteryLevel' | 'masteryXp'>[];
    alignment?: 'Hero' | 'Anti-Hero' | 'Villain' | 'Neutral';
    writingStyle: string;
    narrativeVoice: string;
    difficulty: string;
    allow18Plus: boolean;
    loreRules: LoreRule[];
    // Genre specific properties
    powers?: Power[];
    voLamArts?: VoLamArts;
    linhCan?: string;
    daoPath?: DaoPath;
    // Fanfiction specific properties
    canonStory?: string;
    canonTimeline?: CanonEvent[];
    canonCompatibility?: number;
    startingJob?: string;
}

export interface LoreRule {
    text: string;
    isActive: boolean;
    id?: string;
}

export interface Memory {
    id: string;
    text: string;
    tags: string[];
    pinned: boolean;
}

// ====================================================================================
// Union & Alias Types
// ====================================================================================

// This is the single source of truth for what a "GameCharacter" can be.
// It combines the base properties with all possible genre-specific properties.
export type GameCharacter = BaseCharacter & Partial<TuTienCharacter> & Partial<VoLamCharacter> & Partial<MarvelCharacter> & Partial<FanficCharacter>;

export type Character = GameCharacter;