/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { useGameContext } from '../../contexts/GameContext';
import { NoInfoPlaceholder } from '../../ui/NoInfoPlaceholder';
import type { CanonEvent } from '../../../types';

const statusLabels: Record<CanonEvent['status'], string> = {
    past: 'Đã qua',
    present: 'Hiện tại',
    future: 'Sắp tới',
    diverged: 'Đã thay đổi'
};

export const TimelineTab = () => {
    const { worldSettings, gameState } = useGameContext();
    const timeline = worldSettings.canonTimeline || [];
    const interventionPoints = gameState.character.interventionPoints || 0;
    const canonCompatibility = worldSettings.canonCompatibility ?? 100;

    if (timeline.length === 0) {
        return <NoInfoPlaceholder text="Không có Dòng Thời Gian nào được tạo cho câu chuyện này." />;
    }

    return (
        <div className="char-detail-section">
            <h4>Dòng Thời Gian Nguyên Tác</h4>
            
            <div className="timeline-stats-container">
                <div className="timeline-stat">
                    <span className="timeline-stat-label">Điểm Can Thiệp</span>
                    <span className="timeline-stat-value ip-value">{interventionPoints}</span>
                </div>
                <div className="timeline-stat compatibility-stat">
                    <span className="timeline-stat-label">Tương Thích Nguyên Tác</span>
                    <div className="compatibility-bar-wrapper">
                        <div className="compatibility-bar" style={{ width: `${canonCompatibility}%` }}></div>
                    </div>
                     <span className="timeline-stat-value">{canonCompatibility.toFixed(0)}%</span>
                </div>
            </div>

            <ul className="timeline-container">
                {timeline.map(event => (
                    <li key={event.id} className={`timeline-event status-${event.status}`}>
                        <div className="timeline-marker"></div>
                        <div className="timeline-content">
                            <h5 className="timeline-event-title">
                                {event.title}
                                <span className={`status-badge ${event.status}`}>{statusLabels[event.status]}</span>
                            </h5>
                            <p className="timeline-event-description">{event.description}</p>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};