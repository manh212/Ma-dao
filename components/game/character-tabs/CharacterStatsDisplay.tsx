/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import type { GameCharacter } from '../../../types';
import { TuTienStatsDisplay } from './stats/TuTienStatsDisplay';
import { VoLamStatsDisplay } from './stats/VoLamStatsDisplay';
import { ModernStatsDisplay } from './stats/ModernStatsDisplay';
import { DefaultStatsDisplay } from './stats/DefaultStatsDisplay';

interface CharacterStatsDisplayProps {
    character: GameCharacter;
    genre: string;
}

/**
 * This component acts as a dispatcher, rendering the correct stat display
 * based on the game's genre. This implements the user's request for a 
 * "distinguishing function" for the UI.
 */
export const CharacterStatsDisplay = ({ character, genre }: CharacterStatsDisplayProps) => {
    
    switch (genre) {
        case 'Tu Tiên':
            return <TuTienStatsDisplay character={character} />;
        case 'Võ Lâm':
            return <VoLamStatsDisplay character={character} />;
        case 'Đô Thị Hiện Đại':
        case 'Quản lý Nhóm nhạc':
        case 'Đô Thị Hiện Đại 100% bình thường':
            return <ModernStatsDisplay character={character} />;
        case 'Marvel':
        case 'Dị Giới Fantasy':
        default:
            return <DefaultStatsDisplay character={character} genre={genre} />;
    }
};
