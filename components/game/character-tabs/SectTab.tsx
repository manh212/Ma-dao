/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { NoInfoPlaceholder } from '../../ui/NoInfoPlaceholder';
import type { GameCharacter } from '../../../types';

interface SectTabProps {
    character: GameCharacter;
    onOpenStore: () => void;
    onNavigateToTab: (tabName: string) => void;
}

export const SectTab = ({ character, onOpenStore, onNavigateToTab }: SectTabProps) => {
    const { sectName, sectRankName, contributionPoints } = character;

    if (!sectName) {
        return <NoInfoPlaceholder text="Vô Môn Phái" />;
    }

    const contributionPercentage = contributionPoints ? (contributionPoints.current / contributionPoints.max) * 100 : 0;

    return (
        <div className="char-detail-section">
            <h4>Thông Tin Môn Phái</h4>
            <div className="sect-info-card">
                <div className="sect-info-header">
                    <div className="sect-crest-placeholder">
                        {/* Placeholder for sect crest/icon */}
                        <span>{sectName.charAt(0)}</span>
                    </div>
                    <div className="sect-info-identity">
                        <h5 className="sect-info-name">{sectName}</h5>
                        <p className="sect-info-rank">{sectRankName || 'Đệ tử'}</p>
                    </div>
                </div>
                {contributionPoints && (
                    <div className="sect-contribution-section">
                        <div className="xp-bar-label">
                            <span>Điểm Cống Hiến</span>
                            <span>{contributionPoints.current.toLocaleString()} / {contributionPoints.max.toLocaleString()}</span>
                        </div>
                        <div className="xp-bar-wrapper">
                            <div className="xp-bar" style={{ width: `${contributionPercentage}%`, backgroundColor: 'var(--accent-loc)' }}></div>
                        </div>
                    </div>
                )}
                <div className="sect-actions">
                    <button className="sect-action-button" onClick={() => onNavigateToTab('Nhiệm Vụ')}>
                        Nhiệm Vụ Sư Môn
                    </button>
                    <button className="sect-action-button store" onClick={onOpenStore}>
                        Tàng Kinh Các
                    </button>
                </div>
            </div>
        </div>
    );
};