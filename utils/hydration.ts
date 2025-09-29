/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { INITIAL_WC_FORM_DATA } from '../constants/gameConstants';
import { generateUniqueId } from './id';
import { DEFAULT_MERIDIANS_MAP } from '../constants/meridians';
import type { GameState, WorldSettings, Character, Monster, GameTime, Relationship, Mood, Skill, EquipmentSlot, CharacterStats, KnowledgeEntity, Talent } from '../types';
import { TalentType } from '../types';

const isObject = (item: any): item is object => {
    return (item && typeof item === 'object' && !Array.isArray(item));
};

export const CHAR_DEFAULTS = {
    species: 'Chưa rõ',
    age: 20,
    ageDescription: undefined,
    gender: 'Chưa rõ',
    personality: 'Chưa rõ',
    description: '',
    backstory: '',
    adventurerRank: null,
    skills: [],
    abilities: [],
    relationship: 0,
    respect: 0,
    trust: 0,
    fear: 0,
    mood: { current: 'Trung lập', intensity: 50, reason: 'Trạng thái ban đầu.' },
    goals: [],
    relationships: [],
    health: { current: 100, max: 100 },
    keyMemories: [],
    money: 0,
    inventory: [],
    displayName: '',
    title: '',
    avatarUrl: undefined,
    mealsEatenStats: { day: 1, count: 0 },
    equipment: {},
    baseStats: {},
    stats: {},
    learnedTalents: [],
    traits: [],
    ideals: [],
    bonds: [],
    reputation: [],
    secrets: [],
    scars: [],
    characterArc: { name: 'Khởi đầu', stage: 1, description: 'Bắt đầu cuộc hành trình.' },
    linhCan: undefined,
    personalityStats: { bravery: 50, cunning: 50, honesty: 50 },
    rankPoints: 0,
    threatPoints: 0,
    alignmentScore: 0,
    learnedRecipes: [],
    qiPoints: 0,
    meridians: {},
    guildId: undefined,
    interventionPoints: 0,
    stress: 0,
    socialEnergy: 100,
    happiness: 50,
    job: undefined,
    assets: [],
};

const hydrateTalent = (talentData: Partial<Talent>): Talent => {
    return {
        id: talentData.id || generateUniqueId('talent'),
        name: talentData.name || 'Thiên phú không tên',
        description: talentData.description || '',
        type: talentData.type || TalentType.MODIFIER,
        skillId: talentData.skillId || '',
        effects: Array.isArray(talentData.effects) ? talentData.effects : [],
    };
};

const hydrateSkill = (skill: Partial<Skill>): Skill => {
    return {
        id: skill.id || generateUniqueId('skill'),
        name: skill.name || 'Kỹ năng không tên',
        description: skill.description || '',
        evolutionDescription: skill.evolutionDescription,
        type: skill.type || 'Active',
        skillType: skill.skillType || 'Attack',
        target: skill.target || 'Enemy',
        manaCost: typeof skill.manaCost === 'number' ? skill.manaCost : 10,
        level: skill.level || 1,
        xp: skill.xp || 0,
        talentSlots: skill.talentSlots || 1,
        unlockedTalents: Array.isArray(skill.unlockedTalents) ? skill.unlockedTalents.map(hydrateTalent) : [],
        effects: Array.isArray(skill.effects) ? skill.effects : [],
        masteryLevel: skill.masteryLevel || 'Sơ Nhập',
        masteryXp: typeof skill.masteryXp === 'number' ? skill.masteryXp : 0,
    };
};


export const hydrateCharacterData = (characterData: Partial<Character>, defaultData: any): Character => {
    const hydrated: any = { ...characterData };

    if (!hydrated.id) {
        hydrated.id = generateUniqueId('char');
    }
    
    Object.keys(defaultData).forEach(key => {
        hydrated[key] = hydrated[key] ?? defaultData[key];
    });
    
    // Meridian system hydration: Ensure it's a valid object
    if (typeof hydrated.meridians !== 'object' || hydrated.meridians === null || Array.isArray(hydrated.meridians)) {
        hydrated.meridians = {};
    }


    // Migration for old 'age: string' format
    if (typeof hydrated.age === 'string') {
        const parsedAge = parseInt(hydrated.age, 10);
        if (!isNaN(parsedAge)) {
            hydrated.age = parsedAge;
        } else {
            hydrated.ageDescription = hydrated.age; // Keep descriptive age
            hydrated.age = 20; // Assign a default numerical age
        }
    }

    // Migration for old 'linhCan: string' format
    if (typeof hydrated.linhCan === 'string' && hydrated.linhCan) {
        hydrated.linhCan = {
            types: hydrated.linhCan.split(/[,/\s]+/).filter(Boolean), // try to split by common delimiters
            quality: 50 // default quality
        };
    }

    hydrated.avatarUrl = hydrated.avatarUrl || undefined;
    hydrated.keyMemories = Array.isArray(hydrated.keyMemories) ? hydrated.keyMemories : [];
    hydrated.money = typeof hydrated.money === 'number' ? hydrated.money : (defaultData.money || 0);
    hydrated.inventory = Array.isArray(hydrated.inventory) ? hydrated.inventory : [];
    hydrated.relationships = (Array.isArray(hydrated.relationships) ? hydrated.relationships : []).map((rel: Partial<Relationship>) => ({
        ...rel,
        rationale: rel.rationale || '',
        flags: Array.isArray(rel.flags) ? rel.flags : [],
        sentimentDetails: rel.sentimentDetails || undefined,
        closeness: typeof rel.closeness === 'number' ? rel.closeness : 0,
        influence: typeof rel.influence === 'number' ? rel.influence : 0,
    }));

    hydrated.respect = typeof hydrated.respect === 'number' ? hydrated.respect : 0;
    hydrated.trust = typeof hydrated.trust === 'number' ? hydrated.trust : 0;
    hydrated.fear = typeof hydrated.fear === 'number' ? hydrated.fear : 0;

    // Mood migration and hydration
    if (typeof hydrated.mood === 'string') {
        hydrated.mood = {
            current: hydrated.mood,
            intensity: 50,
            reason: 'Trạng thái ban đầu.'
        };
    } else {
        hydrated.mood = hydrated.mood && typeof hydrated.mood.current === 'string'
            ? hydrated.mood
            : (defaultData.mood || { current: 'Trung lập', intensity: 50, reason: 'Trạng thái ban đầu.' });
    }

    hydrated.health = hydrated.health && typeof hydrated.health.current === 'number' && typeof hydrated.health.max === 'number'
        ? hydrated.health
        : defaultData.health || { current: 100, max: 100 };
    
    hydrated.mealsEatenStats = hydrated.mealsEatenStats && typeof hydrated.mealsEatenStats.day === 'number' && typeof hydrated.mealsEatenStats.count === 'number'
        ? hydrated.mealsEatenStats
        : (defaultData.mealsEatenStats || { day: 1, count: 0 });
    
    hydrated.equipment = hydrated.equipment || {};
    
    // Hydrate baseStats and stats for backward compatibility
    if (hydrated.stats && !hydrated.baseStats) {
        // Old save format: copy stats to baseStats
        hydrated.baseStats = JSON.parse(JSON.stringify(hydrated.stats));
    } else {
        hydrated.baseStats = hydrated.baseStats || {};
    }

    // Recalculate effective stats based on equipment to ensure consistency on load.
    const effectiveStats: CharacterStats = JSON.parse(JSON.stringify(hydrated.baseStats));
    if (hydrated.equipment) {
        for (const slot in hydrated.equipment) {
            const item = hydrated.equipment[slot as EquipmentSlot];
            if (item && item.effects) {
                for (const effect of item.effects) {
                    const statKey = effect.stat as keyof CharacterStats;
                     if (typeof (effectiveStats as any)[statKey] === 'undefined') {
                        (effectiveStats as any)[statKey] = 0;
                    }
                    if (typeof (effectiveStats as any)[statKey] === 'number') {
                        (effectiveStats as any)[statKey] += effect.value;
                    }
                }
            }
        }
    }
    hydrated.stats = effectiveStats;

    // New Skill & Talent system hydration
    hydrated.skills = (Array.isArray(hydrated.skills) ? hydrated.skills : []).map(hydrateSkill);
    hydrated.learnedTalents = Array.isArray(hydrated.learnedTalents) ? hydrated.learnedTalents.map(hydrateTalent) : [];


    // New fields hydration
    hydrated.traits = Array.isArray(hydrated.traits) ? hydrated.traits : (defaultData.traits || []);
    hydrated.ideals = Array.isArray(hydrated.ideals) ? hydrated.ideals : (defaultData.ideals || []);
    hydrated.bonds = Array.isArray(hydrated.bonds) ? hydrated.bonds : (defaultData.bonds || []);
    hydrated.reputation = Array.isArray(hydrated.reputation) ? hydrated.reputation : (defaultData.reputation || []);
    hydrated.secrets = Array.isArray(hydrated.secrets) ? hydrated.secrets : (defaultData.secrets || []);
    hydrated.scars = Array.isArray(hydrated.scars) ? hydrated.scars : (defaultData.scars || []);
    hydrated.characterArc = isObject(hydrated.characterArc) ? hydrated.characterArc : (defaultData.characterArc || { name: 'Khởi đầu', stage: 1, description: 'Bắt đầu cuộc hành trình.' });
    hydrated.personalityStats = isObject(hydrated.personalityStats) ? hydrated.personalityStats : (defaultData.personalityStats || { bravery: 50, cunning: 50, honesty: 50 });
    hydrated.rankPoints = typeof hydrated.rankPoints === 'number' ? hydrated.rankPoints : (defaultData.rankPoints || 0);
    hydrated.threatPoints = typeof hydrated.threatPoints === 'number' ? hydrated.threatPoints : (defaultData.threatPoints || 0);
    hydrated.alignmentScore = typeof hydrated.alignmentScore === 'number' ? hydrated.alignmentScore : (defaultData.alignmentScore || 0);
    hydrated.title = hydrated.title || '';
    hydrated.displayName = hydrated.displayName || hydrated.name || 'Nhân vật không tên';


    return hydrated as Character;
};

export const hydrateGameState = (rawState: any, _worldSettings: WorldSettings = INITIAL_WC_FORM_DATA): GameState => {
    const state = JSON.parse(JSON.stringify(rawState || {}));
    
    state.character = hydrateCharacterData(state.character || {}, CHAR_DEFAULTS);

    state.knowledgeBase = state.knowledgeBase || {};
    const kbTypes: (keyof GameState['knowledgeBase'])[] = ['pcs', 'npcs', 'locations', 'factions', 'monsters'];
    kbTypes.forEach(type => {
        state.knowledgeBase[type] = Array.isArray(state.knowledgeBase[type]) ? state.knowledgeBase[type] : [];
    });
    
    state.knowledgeBase.npcs = state.knowledgeBase.npcs.map((npc: any) => hydrateCharacterData(npc, CHAR_DEFAULTS));

    state.knowledgeBase.locations.forEach((e: KnowledgeEntity) => { if (e) e.displayName = e.displayName || e.name; });
    state.knowledgeBase.factions.forEach((e: KnowledgeEntity) => { if (e) e.displayName = e.displayName || e.name; });
    state.knowledgeBase.monsters = state.knowledgeBase.monsters.map((monster: Partial<Monster>) => ({
        ...monster,
        name: monster.name || 'Quái vật không tên',
        displayName: monster.displayName || monster.name || 'Quái vật không tên',
        description: monster.description || 'Không có mô tả.',
    }));

    state.turns = Array.isArray(state.turns) ? state.turns : [];
    state.turns.forEach((turn: any) => {
        turn.tokenCount = typeof turn.tokenCount === 'number' ? turn.tokenCount : 0;
    });

    state.actions = Array.isArray(state.actions) ? state.actions : [];
    state.memories = Array.isArray(state.memories) ? state.memories : [];
    state.history = Array.isArray(state.history) ? state.history : [];
    state.quests = Array.isArray(state.quests) ? state.quests : [];
    state.isIntercourseScene = !!state.isIntercourseScene;
    state.intercourseStep = typeof state.intercourseStep === 'number' ? state.intercourseStep : 0;
    state.totalTokenCount = typeof state.totalTokenCount === 'number' ? state.totalTokenCount : 0;
    
    // Ensure combat-related properties are initialized for backward compatibility
    state.isInCombat = !!state.isInCombat;
    state.combatants = Array.isArray(state.combatants) ? state.combatants : [];
    state.combatTurnNumber = typeof state.combatTurnNumber === 'number' ? state.combatTurnNumber : 0;
    state.combatLog = Array.isArray(state.combatLog) ? state.combatLog : [];
    state.sectStores = state.sectStores || {};
    state.worldState = state.worldState || {};
    state.guilds = state.guilds || {};

    const defaultTime: GameTime = { year: 547, month: 3, day: 1, hour: 8, minute: 0, weather: 'Trời quang mây tạnh' };
    state.gameTime = (typeof state.gameTime === 'string' || !state.gameTime) 
        ? defaultTime
        : {
            year: state.gameTime.year || defaultTime.year,
            month: state.gameTime.month || defaultTime.month,
            day: state.gameTime.day || defaultTime.day,
            hour: typeof state.gameTime.hour === 'number' ? state.gameTime.hour : defaultTime.hour,
            minute: typeof state.gameTime.minute === 'number' ? state.gameTime.minute : defaultTime.minute,
            weather: state.gameTime.weather || defaultTime.weather,
        };
    
    return state as GameState;
};

export const hydrateWorldSettings = (rawSettings: Partial<WorldSettings>): WorldSettings => {
    const settings = { ...INITIAL_WC_FORM_DATA, ...rawSettings };
    settings.loreRules = Array.isArray(settings.loreRules) ? settings.loreRules : [];
    // Fanfiction specific hydration
    settings.canonStory = settings.canonStory || '';
    settings.canonTimeline = Array.isArray(settings.canonTimeline) ? settings.canonTimeline : [];
    settings.canonCompatibility = typeof settings.canonCompatibility === 'number' ? settings.canonCompatibility : 100;
    return settings;
};
