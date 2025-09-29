/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { GameState, Turn, Memory, Character, Monster, GameTime, VoLamCharacter, Guild, WorldSettings, CanonEvent, SectStoreListing, Recipe, ModernCharacter, Job, Asset } from '../types';
import { generateUniqueId } from '../utils/id';
import { hydrateCharacterData, CHAR_DEFAULTS } from '../utils/hydration';

// Helper function for deep merging objects, crucial for delta updates.
const mergeDeep = (target: any, source: any) => {
    for (const key in source) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
            if (!target[key]) {
                Object.assign(target, { [key]: {} });
            }
            mergeDeep(target[key], source[key]);
        } else {
            Object.assign(target, { [key]: source[key] });
        }
    }
    return target;
};

const advanceGameTime = (currentTime: GameTime, minutesToAdd: number, newWeather?: string): GameTime => {
    let { year, month, day, hour, minute, weather } = { ...currentTime };
    
    minute += minutesToAdd;

    hour += Math.floor(minute / 60);
    minute %= 60;

    day += Math.floor(hour / 24);
    hour %= 24;

    while (day > 30) {
        day -= 30;
        month += 1;
        if (month > 12) {
            month = 1;
            year += 1;
        }
    }

    return { year, month, day, hour, minute, weather: newWeather || weather };
};

/**
 * Applies core updates that are common to all genres.
 * @returns A partially updated GameState object.
 */
const applyCoreDeltas = (
    stateBeforeAction: GameState,
    turnResult: any,
    actionDescription: string | null,
    totalTokensForTurn: number,
    autoPinMemory: boolean
): { finalGameState: GameState } => {
    const { 
        story: storySegment, 
        timeCostInMinutes,
        weatherUpdate,
        actions, 
        summary: summaryObject, 
        messages, 
        isIntercourseSceneStart,
        combatStatus,
        combatantIds,
        worldEvent,
        newQuests,
        knowledgeBaseUpdates
    } = turnResult;

    if (!storySegment || !actions || actions.length === 0 || typeof timeCostInMinutes !== 'number') {
        throw new Error("InvalidTurnStructure: AI response was missing critical fields like story, actions, or timeCostInMinutes.");
    }

    const finalGameState: GameState = JSON.parse(JSON.stringify(stateBeforeAction));

    // 1. Apply Time and Weather Updates
    finalGameState.gameTime = advanceGameTime(finalGameState.gameTime, timeCostInMinutes, weatherUpdate);

    // 2. Process NEW entities first
    if (knowledgeBaseUpdates) {
        const { newNpcs, newLocations, newFactions, newMonsters } = knowledgeBaseUpdates;
        if (newNpcs) {
            const hydratedNewNpcs = newNpcs.map((npc: Partial<Character>) => hydrateCharacterData(npc, CHAR_DEFAULTS));
            finalGameState.knowledgeBase.npcs.push(...hydratedNewNpcs);
        }
        if (newLocations) finalGameState.knowledgeBase.locations.push(...newLocations);
        if (newFactions) finalGameState.knowledgeBase.factions.push(...newFactions);
        if (newMonsters) finalGameState.knowledgeBase.monsters.push(...newMonsters);
    }

    // 3. Handle Combat Status and Turn Number
    if (combatStatus === 'start') {
        finalGameState.isInCombat = true;
        finalGameState.combatTurnNumber = 1;
        if (Array.isArray(combatantIds) && combatantIds.length > 0) {
            finalGameState.combatants = combatantIds;
        } else {
            console.warn("AI started combat but did not provide combatant IDs. Falling back to story parsing.");
            const opponent = [...finalGameState.knowledgeBase.npcs, ...finalGameState.knowledgeBase.monsters].find(
                e => storySegment.includes(e.name) && e.id !== finalGameState.character.id
            );
            finalGameState.combatants = [finalGameState.character.id, ...(opponent ? [opponent.id] : [])];
        }
    } else if (combatStatus === 'end') {
        finalGameState.isInCombat = false;
        finalGameState.combatTurnNumber = 0;
        finalGameState.combatants = [];
        finalGameState.combatLog = []; // Clear combat log after combat
    }

    // 4. Update simple values
    finalGameState.actions = actions || [];
    
    // 5. Handle Turn, History, and Memories
    const newTurn: Turn = { 
        id: generateUniqueId('turn'), 
        story: storySegment, 
        messages: (messages || []).map((msg: any) => ({ ...msg, id: generateUniqueId('msg') })), 
        chosenAction: actionDescription, 
        tokenCount: totalTokensForTurn, 
        summary: summaryObject?.text,
        worldEvent: worldEvent || undefined,
    };
    finalGameState.turns.push(newTurn);
    
    if (summaryObject?.text) { 
        const newMemory: Memory = { 
            id: generateUniqueId('mem'), 
            text: summaryObject.text, 
            tags: summaryObject.tags || [], 
            pinned: autoPinMemory 
        };
        finalGameState.memories.push(newMemory);
    }
    
    finalGameState.history.push(stateBeforeAction);
    finalGameState.totalTokenCount += totalTokensForTurn;

    // 6. Handle intercourse scenes
    let newIsIntercourseScene = stateBeforeAction.isIntercourseScene || false, 
        newIntercourseStep = stateBeforeAction.intercourseStep || 0;
        
    if (isIntercourseSceneStart === true) { 
        newIntercourseStep = newIsIntercourseScene ? newIntercourseStep + 1 : 1; 
        newIsIntercourseScene = true; 
    } else if (isIntercourseSceneStart === false) { 
        newIsIntercourseScene = false; 
        newIntercourseStep = 0; 
    } else if (newIsIntercourseScene) { 
        newIntercourseStep += 1; 
    }
    finalGameState.isIntercourseScene = newIsIntercourseScene;
    finalGameState.intercourseStep = newIntercourseStep;

    // 7. Update Key Memories for involved characters
    if (summaryObject?.text) {
        const involvedCharacterNames = new Set<string>();
        const regex = /\[(?:PC|NPC):([^\]]+)\]/g;
        let match;
        while ((match = regex.exec(summaryObject.text)) !== null) {
            involvedCharacterNames.add(match[1]);
        }
        
        const updateMemories = (char: Character) => {
            if (involvedCharacterNames.has(char.name)) {
                if (!Array.isArray(char.keyMemories)) char.keyMemories = [];
                char.keyMemories.push(summaryObject.text);
                if (char.keyMemories.length > 15) char.keyMemories.shift();
            }
        };

        updateMemories(finalGameState.character);
        finalGameState.knowledgeBase.npcs.forEach(updateMemories);
    }
    
    // 8. Add new quests
    if (newQuests && Array.isArray(newQuests)) {
        finalGameState.quests.push(...newQuests);
    }

    return { finalGameState };
};

/**
 * Applies updates specific to the Võ Lâm genre.
 */
const applyVoLamDeltas = (gameState: GameState, turnResult: any): GameState => {
    const { sectStoreUpdates, newRecipes, newGuilds, guildUpdates } = turnResult;
    
    // 9. Update sect stores
    if (sectStoreUpdates) {
        if (!gameState.sectStores) gameState.sectStores = {};
        gameState.sectStores[sectStoreUpdates.sectId] = sectStoreUpdates.listings;
    }

    // 10. Add new recipes
    if (newRecipes && Array.isArray(newRecipes)) {
        const voLamChar = gameState.character as VoLamCharacter;
        if (voLamChar) {
            if (!voLamChar.learnedRecipes) voLamChar.learnedRecipes = [];
            voLamChar.learnedRecipes.push(...newRecipes);
        }
    }

    // 11. Handle Guild updates
    if (newGuilds && Array.isArray(newGuilds)) {
        if (!gameState.guilds) gameState.guilds = {};
        newGuilds.forEach((guild: Guild) => {
            gameState.guilds![guild.id] = guild;
        });
    }
    if (guildUpdates && Array.isArray(guildUpdates)) {
        if (!gameState.guilds) gameState.guilds = {};
        guildUpdates.forEach((update: { id: string, updates: Partial<Guild> }) => {
            if (gameState.guilds![update.id]) {
                mergeDeep(gameState.guilds![update.id], update.updates);
            }
        });
    }

    return gameState;
};

/**
 * Applies updates specific to the Fanfiction (Đồng nhân) genre.
 */
const applyFanficDeltas = (gameState: GameState, worldSettings: WorldSettings, turnResult: any): { finalGameState: GameState, finalWorldSettings: WorldSettings } => {
    const { canonTimelineUpdates, interventionPointsChange, canonCompatibilityChange } = turnResult;

    // 12. Handle Canon Timeline updates
    if (canonTimelineUpdates && Array.isArray(canonTimelineUpdates)) {
        if (!worldSettings.canonTimeline) worldSettings.canonTimeline = [];
        canonTimelineUpdates.forEach((update: { id: string, newStatus: CanonEvent['status'] }) => {
            const eventIndex = worldSettings.canonTimeline!.findIndex(event => event.id === update.id);
            if (eventIndex > -1) {
                worldSettings.canonTimeline![eventIndex].status = update.newStatus;
            }
        });
    }
    
    // 13. Handle Fanfic system updates
    if (typeof interventionPointsChange === 'number') {
        const currentIP = gameState.character.interventionPoints || 0;
        gameState.character.interventionPoints = currentIP + interventionPointsChange;
    }
    if (typeof canonCompatibilityChange === 'number') {
        const currentCC = worldSettings.canonCompatibility ?? 100;
        worldSettings.canonCompatibility = Math.max(0, Math.min(100, currentCC + canonCompatibilityChange));
    }

    return { finalGameState: gameState, finalWorldSettings: worldSettings };
};

/**
 * Applies updates specific to the Modern Urban genre.
 */
const applyModernDeltas = (gameState: GameState, turnResult: any): GameState => {
    const { jobChange, newAssets } = turnResult;
    const modernChar = gameState.character as ModernCharacter;

    if (jobChange) {
        modernChar.job = jobChange as Job;
    }

    if (newAssets && Array.isArray(newAssets)) {
        if (!modernChar.assets) {
            modernChar.assets = [];
        }
        modernChar.assets.push(...(newAssets as Asset[]));
    }

    return gameState;
};


export const GameStateUpdaterService = {
  /**
   * Main dispatcher function. Applies core updates first, then genre-specific updates.
   */
  applyTurnDeltas: (
    stateBeforeAction: GameState,
    worldSettingsBeforeAction: WorldSettings,
    turnResult: any,
    actionDescription: string | null,
    totalTokensForTurn: number,
    autoPinMemory: boolean
  ): { finalGameState: GameState, finalWorldSettings: WorldSettings } => {
    
    // Step 1: Apply all the common, genre-agnostic updates.
    let { finalGameState } = applyCoreDeltas(
        stateBeforeAction,
        turnResult,
        actionDescription,
        totalTokensForTurn,
        autoPinMemory
    );
    
    // Make a mutable copy of world settings to pass to genre updaters.
    let finalWorldSettings = worldSettingsBeforeAction;

    // Step 2: Dispatch to genre-specific updaters for additional logic.
    switch (worldSettingsBeforeAction.genre) {
        case 'Võ Lâm':
            finalGameState = applyVoLamDeltas(finalGameState, turnResult);
            break;
        case 'Đồng nhân':
            ({ finalGameState, finalWorldSettings } = applyFanficDeltas(finalGameState, finalWorldSettings, turnResult));
            break;
        case 'Đô Thị Hiện Đại':
        case 'Quản lý Nhóm nhạc':
        case 'Đô Thị Hiện Đại 100% bình thường':
            finalGameState = applyModernDeltas(finalGameState, turnResult);
            break;
        // Add other genres here as they get specific mechanics
        // case 'Tu Tiên':
        //     finalGameState = applyTuTienDeltas(finalGameState, turnResult);
        //     break;
        default:
            // No genre-specific updates needed for default case.
            break;
    }

    // Step 3: Apply dynamic character deltas (generic for all genres).
    if (turnResult.characterDeltas && Array.isArray(turnResult.characterDeltas)) {
        turnResult.characterDeltas.forEach((delta: { id: string, updates: Partial<Character> }) => {
            if (delta.id === finalGameState.character.id) {
                mergeDeep(finalGameState.character, delta.updates);
            } else {
                const npc = finalGameState.knowledgeBase.npcs.find(n => n.id === delta.id);
                if (npc) {
                    mergeDeep(npc, delta.updates);
                }
            }
        });
    }

    return { finalGameState, finalWorldSettings };
  }
};
