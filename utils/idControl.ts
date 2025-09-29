/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import type { Character, IdDataSystem } from '../types';

/**
 * Maps a character object to a structured format for the ID Control debug view.
 * This is a fallback for older save files that don't have this data embedded.
 * @param character The character to analyze.
 * @returns An array of systems with their associated ID data.
 */
export const mapCharacterToIdStructure = (character: Character | null): IdDataSystem[] => {
    if (!character) return [];

    const systems: IdDataSystem[] = [];

    // Core IDs
    systems.push({
        systemId: 'core',
        systemName: 'Core Identifiers',
        items: [
            { id: character.id, type: 'CORE' as const, label: 'Entity ID', value: character.id, notes: 'Unique identifier for this character.' },
            { id: character.name, type: 'CORE' as const, label: 'Internal Name', value: character.name, notes: 'The unique, internal name used for tagging.' },
            { id: character.displayName, type: 'CORE' as const, label: 'Display Name', value: character.displayName, notes: 'The name shown to the user in-game.' },
        ]
    });

    // Skills & Talents
    if (character.skills && character.skills.length > 0) {
        systems.push({
            systemId: 'skills',
            systemName: 'Skills & Talents',
            items: character.skills.flatMap(skill => [
                { id: skill.id, type: 'SKILL' as const, label: 'Skill', value: skill.name, notes: skill.description },
                ...skill.unlockedTalents.map(talent => ({
                    id: talent.id, type: 'TALENT' as const, label: `Talent for ${skill.name}`, value: talent.name, notes: talent.description
                }))
            ])
        });
    }

    // Relationships
    if (character.relationships && character.relationships.length > 0) {
        systems.push({
            systemId: 'relationships',
            systemName: 'Relationships',
            items: character.relationships.map(rel => ({
                id: rel.targetId, type: 'RELATIONSHIP' as const, label: rel.type, value: `Target ID: ${rel.targetId}`, notes: rel.description
            }))
        });
    }

    // Traits & Scars
    const traitsAndScars = [];
    if (character.traits && character.traits.length > 0) {
        traitsAndScars.push(...character.traits.map(t => ({ id: t.id, type: 'TRAIT' as const, label: t.name, value: t.description, notes: `Type: ${t.type}` })));
    }
    if (character.scars && character.scars.length > 0) {
        traitsAndScars.push(...character.scars.map(s => ({ id: s.id, type: 'SCAR' as const, label: 'Scar', value: s.description, notes: `From turn: ${s.sourceTurnId}` })));
    }
    if (traitsAndScars.length > 0) {
        systems.push({ systemId: 'attributes', systemName: 'Attributes', items: traitsAndScars });
    }

    return systems;
};