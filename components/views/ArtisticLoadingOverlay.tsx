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
    theme: string;
    path: string;
    marker: React.ReactNode;
    parallaxLayers: { className: string; }[];
    messages: string[];
}

const getGenreConfig = (worldSettings: WorldSettings): GenreConfig => {
    const genre = worldSettings.genre;
    const messages = CREATION_TIPS[genre] || CREATION_TIPS.default;

    switch (genre) {
        case 'Tu Tiên':
        case 'Huyền Huyễn Truyền Thuyết':
            return {
                theme: 'tu-tien',
                path: 'M 20 80 C 40 20, 120 20, 140 80 S 240 140, 260 80',
                marker: <path d="M-5,-10 L0,0 L-5,10 L5,0 Z" />,
                parallaxLayers: [
                    { className: 'parallax-layer-1' },
                    { className: 'parallax-layer-2' },
                    { className: 'parallax-layer-3' },
                    { className: 'parallax-layer-4' },
                ],
                messages: messages
            };
        case 'Võ Lâm':
        case 'Thời Chiến (Trung Hoa/Nhật Bản)':
             return {
                theme: 'vo-lam',
                path: 'M 20 80 L 80 80 L 100 60 L 160 60 L 180 80 L 240 80',
                marker: <circle r="6" />,
                parallaxLayers: [
                    { className: 'parallax-layer-1' },
                    { className: 'parallax-layer-2' },
                    { className: 'parallax-layer-3' },
                    { className: 'parallax-layer-4' },
                ],
                messages: messages
            };
        case 'Dị Giới Fantasy':
        case 'Thế Giới Giả Tưởng (Game/Tiểu Thuyết)':
            return {
                theme: 'fantasy',
                path: 'M 20 80 Q 80 90, 140 60 T 260 70',
                marker: <path d="M-6 -6 L6 -6 L6 6 L-6 6 Z" />,
                parallaxLayers: [
                    { className: 'parallax-layer-1' },
                    { className: 'parallax-layer-2' },
                    { className: 'parallax-layer-3' },
                    { className: 'parallax-layer-4' },
                ],
                messages: messages
            };
        default:
            return {
                theme: 'default',
                path: 'M 20 80 L 100 80 C 120 80, 120 40, 140 40 L 260 40',
                marker: <circle r="7" />,
                 parallaxLayers: [
                    { className: 'parallax-layer-1' },
                    { className: 'parallax-layer-2' },
                    { className: 'parallax-layer-3' },
                    { className: 'parallax-layer-4' },
                ],
                messages: messages
            };
    }
};

export const ArtisticLoadingOverlay = ({ worldSettings, message, progress, timeElapsed, estimatedTime }: ArtisticLoadingOverlayProps) => {
    const { theme, path, marker, parallaxLayers, messages } = useMemo(() => getGenreConfig(worldSettings), [worldSettings]);
    const [dynamicMessage, setDynamicMessage] = useState(messages[0]);
    const pathRef = useRef<SVGPathElement>(null);
    const [pathLength, setPathLength] = useState(0);

    useEffect(() => {
        if (pathRef.current) {
            setPathLength(pathRef.current.getTotalLength());
        }
    }, [path]);

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

    const timeRemaining = Math.max(0, estimatedTime - timeElapsed);

    return (
        <div className={`artistic-loading-overlay theme-${theme}`}>
            <div className="parallax-bg">
                {parallaxLayers.map((layer, index) => (
                    <div key={index} className={`parallax-layer ${layer.className}`}></div>
                ))}
                <div className="parallax-vignette"></div>
            </div>

            <div className="artistic-loading-content">
                <div className="artistic-loading-text">
                    <p className="primary-message">{message}</p>
                    <p className="secondary-message">{dynamicMessage}</p>
                </div>
                
                <div className="progress-svg-container">
                    <svg viewBox="0 0 280 100" preserveAspectRatio="xMidYMid meet">
                        <path className="progress-path-track" d={path} ref={pathRef} />
                        <path 
                            className="progress-path-fill" 
                            d={path} 
                            style={{ 
                                strokeDasharray: pathLength, 
                                strokeDashoffset: pathLength * (1 - progress / 100) 
                            }} 
                        />
                        <g 
                            className="progress-marker" 
                            style={{ 
                                offsetPath: `path('${path}')`, 
                                offsetDistance: `${progress}%`
                            }}
                        >
                            {marker}
                        </g>
                    </svg>
                </div>
                
                <div className="artistic-loading-stats">
                    <div className="artistic-stat">
                        <span className="stat-value">{Math.round(progress)}%</span>
                        <span className="stat-label">Tiến độ</span>
                    </div>
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