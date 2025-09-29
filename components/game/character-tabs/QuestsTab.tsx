/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import { useGameContext } from '../../contexts/GameContext';
import { InlineStoryRenderer } from '../StoryRenderer';
import { NoInfoPlaceholder } from '../../ui/NoInfoPlaceholder';
import type { Quest } from '../../../types';

interface QuestItemProps {
    quest: Quest;
    onEntityClick: (event: React.MouseEvent, name: string, type: string) => void;
    onEntityMouseEnter: (event: React.MouseEvent, name: string, type: string) => void;
    onEntityMouseLeave: () => void;
}

const translateQuestStatus = (status: Quest['status']): string => {
    switch (status) {
        case 'Ongoing': return 'Đang làm';
        case 'Completed': return 'Hoàn thành';
        case 'Failed': return 'Thất bại';
        default: return status;
    }
};

const QuestItem = ({ quest, onEntityClick, onEntityMouseEnter, onEntityMouseLeave }: QuestItemProps) => {
    const { gameState } = useGameContext();
    const [isExpanded, setIsExpanded] = useState(quest.status === 'Ongoing');
    
    const statusClass = `quest-status-${quest.status.toLowerCase()}`;
    const itemClass = `quest-item ${isExpanded ? 'expanded' : ''} ${statusClass}`;

    return (
        <li className={itemClass}>
            <header className="quest-header" onClick={() => setIsExpanded(!isExpanded)}>
                <h6 className="quest-title">{quest.title}</h6>
                <span className={`quest-status ${statusClass}`}>{translateQuestStatus(quest.status)}</span>
                <span className="section-chevron-icon">▼</span>
            </header>
            <div className="quest-details-content">
                <p className="quest-description-summary">
                    <InlineStoryRenderer text={quest.description} gameState={gameState} onEntityClick={onEntityClick} onEntityMouseEnter={onEntityMouseEnter} onEntityMouseLeave={onEntityMouseLeave} />
                </p>
                <ul className="quest-objectives-list">
                    {quest.objectives.map((obj, index) => (
                        <li key={index} className={`quest-objective-item ${obj.completed ? 'completed' : ''}`}>
                            <span className="quest-objective-icon">{obj.completed ? '✓' : '□'}</span>
                            <span className="quest-objective-text">
                                <InlineStoryRenderer text={obj.description} gameState={gameState} onEntityClick={onEntityClick} onEntityMouseEnter={onEntityMouseEnter} onEntityMouseLeave={onEntityMouseLeave} />
                            </span>
                        </li>
                    ))}
                </ul>
                {quest.reward && (
                    <div className="quest-reward">
                        <strong>Phần thưởng:</strong>
                        <InlineStoryRenderer text={quest.reward} gameState={gameState} onEntityClick={onEntityClick} onEntityMouseEnter={onEntityMouseEnter} onEntityMouseLeave={onEntityMouseLeave} />
                    </div>
                )}
                 {quest.failureConsequence && (
                    <div className="quest-punishment">
                        <strong>Hậu quả (Thất bại):</strong>
                         <InlineStoryRenderer text={quest.failureConsequence} gameState={gameState} onEntityClick={onEntityClick} onEntityMouseEnter={onEntityMouseEnter} onEntityMouseLeave={onEntityMouseLeave} />
                    </div>
                )}
            </div>
        </li>
    );
};

interface QuestsTabProps {
    onEntityClick: (event: React.MouseEvent, name: string, type: string) => void;
    onEntityMouseEnter: (event: React.MouseEvent, name: string, type: string) => void;
    onEntityMouseLeave: () => void;
}

export const QuestsTab = ({ onEntityClick, onEntityMouseEnter, onEntityMouseLeave }: QuestsTabProps) => {
    const { gameState } = useGameContext();

    const ongoingQuests = gameState.quests?.filter(q => q.status === 'Ongoing') || [];
    const completedQuests = gameState.quests?.filter(q => q.status === 'Completed') || [];
    const failedQuests = gameState.quests?.filter(q => q.status === 'Failed') || [];

    const renderQuestList = (quests: Quest[]) => (
        <ul className="quest-list">
            {quests.map(quest => (
                <QuestItem 
                    key={quest.id} 
                    quest={quest}
                    onEntityClick={onEntityClick}
                    onEntityMouseEnter={onEntityMouseEnter}
                    onEntityMouseLeave={onEntityMouseLeave}
                />
            ))}
        </ul>
    );

    if (!gameState.quests || gameState.quests.length === 0) {
        return <NoInfoPlaceholder text="Không có nhiệm vụ nào." />;
    }

    return (
        <div className="char-detail-section">
            <h4>Nhật Ký Nhiệm Vụ</h4>
            {ongoingQuests.length > 0 && (
                <div className="relationships-category">
                    <h5 className="relationships-category-title">Đang Thực Hiện</h5>
                    {renderQuestList(ongoingQuests)}
                </div>
            )}
            {completedQuests.length > 0 && (
                 <div className="relationships-category">
                    <h5 className="relationships-category-title">Đã Hoàn Thành</h5>
                    {renderQuestList(completedQuests)}
                </div>
            )}
            {failedQuests.length > 0 && (
                 <div className="relationships-category">
                    <h5 className="relationships-category-title">Đã Thất Bại</h5>
                    {renderQuestList(failedQuests)}
                </div>
            )}
        </div>
    );
};