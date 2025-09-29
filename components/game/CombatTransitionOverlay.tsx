/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import './CombatTransitionOverlay.css';

export const CombatTransitionOverlay = () => {
    return (
        <div className="combat-transition-overlay">
            <div className="crack" style={{ '--i': 1 } as React.CSSProperties}></div>
            <div className="crack" style={{ '--i': 2 } as React.CSSProperties}></div>
            <div className="crack" style={{ '--i': 3 } as React.CSSProperties}></div>
            <div className="crack" style={{ '--i': 4 } as React.CSSProperties}></div>
            <div className="crack" style={{ '--i': 5 } as React.CSSProperties}></div>
        </div>
    );
};