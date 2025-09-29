/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useMemo, useRef } from 'react';
import './ArtisticLoadingOverlay.css';
import { CREATION_TIPS } from '../../constants/loadingConstants';
import type { WorldSettings } from '../../types';

interface ArtisticLoadingOverlayProps {
    worldSettings: WorldSettings;
    message: string;
    progress: number;
    timeElapsed: number;
    estimatedTime: number;
}

interface GenreConfig {
    messages: string[];
}

const getGenreConfig = (worldSettings: WorldSettings): GenreConfig => {
    const genre = worldSettings.genre;
    const messages = CREATION_TIPS[genre] || CREATION_TIPS.default;
    return { messages };
};

export const ArtisticLoadingOverlay = ({ worldSettings, message, progress, timeElapsed, estimatedTime }: ArtisticLoadingOverlayProps) => {
    const { messages } = useMemo(() => getGenreConfig(worldSettings), [worldSettings]);
    const [dynamicMessage, setDynamicMessage] = useState(messages[0]);
    const [announcedProgress, setAnnouncedProgress] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setDynamicMessage(prev => {
                const currentIndex = messages.indexOf(prev);
                const nextIndex = (currentIndex + 1) % messages.length;
                return messages[nextIndex];
            });
        }, 3500); // Increased duration for longer tips
        return () => clearInterval(interval);
    }, [messages]);

    useEffect(() => {
        const currentProgressTenPercentStep = Math.floor(progress / 10);
        const announcedTenPercentStep = Math.floor(announcedProgress / 10);

        if (currentProgressTenPercentStep > announcedTenPercentStep) {
            setAnnouncedProgress(progress);
        }
    }, [progress, announcedProgress]);


    const timeRemaining = Math.max(0, estimatedTime - timeElapsed);
    const announcedProgressText = `Đang tạo thế giới: ${Math.floor(announcedProgress / 10) * 10}%`;

    return (
        <div className={`artistic-loading-overlay`}>
            <div className="artistic-loading-content" role="status" aria-live="polite" aria-atomic="false">
                <div className="artistic-loading-text">
                    <p className="primary-message">{message}</p>
                    <p className="secondary-message" aria-hidden="true">{dynamicMessage}</p>
                </div>
                
                <div 
                    className="progress-text-container" 
                    role="progressbar" 
                    aria-valuenow={progress} 
                    aria-valuemin={0} 
                    aria-valuemax={100}
                    aria-valuetext={announcedProgressText}
                >
                   <span>{`[${'#'.repeat(Math.floor(progress/5)).padEnd(20, '-')}]`}</span>
                </div>
                
                <div className="artistic-loading-stats" aria-hidden="true">
                    <div className="artistic-stat">
                        <span className="stat-value">{timeElapsed.toFixed(1)}s</span>
                        <span className="stat-label">Đã trôi qua</span>
                    </div>
                    <div className="artistic-stat">
                        <span className="stat-value">{timeRemaining.toFixed(1)}s</span>
                        <span className="stat-label">Ước tính còn lại</span>
                    </div>
                </div>
            </div>
        </div>
    );
};