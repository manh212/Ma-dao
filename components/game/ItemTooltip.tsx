/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useLayoutEffect, useRef, useState } from 'react';
import type { Item } from '../../types';

interface ItemTooltipProps {
    tooltipData: {
        item: Item;
        top: number;
        left: number;
    } | null;
}

export const ItemTooltip = ({ tooltipData }: ItemTooltipProps) => {
    const tooltipRef = useRef<HTMLDivElement>(null);
    const [style, setStyle] = useState<React.CSSProperties>({
        position: 'fixed',
        opacity: 0,
        pointerEvents: 'none',
        zIndex: 10002,
    });

    useLayoutEffect(() => {
        if (tooltipData && tooltipRef.current) {
            const { item, top, left } = tooltipData;
            const tooltipEl = tooltipRef.current;
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            const margin = 10;

            let finalLeft = left;
            let finalTop = top - margin; // Default above

            // Initially render it to get its dimensions
            const tooltipRect = tooltipEl.getBoundingClientRect();
            
            // Adjust horizontal position
            if (finalLeft + tooltipRect.width + margin > viewportWidth) {
                finalLeft = viewportWidth - tooltipRect.width - margin;
            }
            if (finalLeft < margin) {
                finalLeft = margin;
            }

            // Adjust vertical position
            finalTop = top - tooltipRect.height - margin; // Position above the slot
            if (finalTop < margin) { // If it overflows above, place it below
                finalTop = top + 40 + margin; // 40 is approx slot height
            }


            setStyle({
                position: 'fixed',
                top: `${finalTop}px`,
                left: `${finalLeft}px`,
                zIndex: 10002,
                pointerEvents: 'none',
                opacity: 1,
            });
        } else {
            setStyle(prev => ({ ...prev, opacity: 0, pointerEvents: 'none' }));
        }
    }, [tooltipData]);
    
    if (!tooltipData) return <div ref={tooltipRef} className="entity-tooltip item-tooltip" style={style}></div>;

    const { item } = tooltipData;
    return (
        <div ref={tooltipRef} className="entity-tooltip item-tooltip" style={style}>
            <div className="item-tooltip-header">
                <span className={`entity-label entity-label-item`}>{item.type}</span>
                <h4 className="tooltip-name">{item.name}</h4>
            </div>
            <p className="tooltip-description">{item.description}</p>
        </div>
    );
};