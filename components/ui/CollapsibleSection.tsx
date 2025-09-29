/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';

// Add LockIcon component
const LockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="section-lock-icon">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>
);

interface CollapsibleSectionProps {
    title: string;
    children: React.ReactNode;
    isOpen: boolean;
    onToggle: () => void;
    isLocked?: boolean;
    lockMessage?: string;
}

export const CollapsibleSection = ({ title, children, isOpen, onToggle, isLocked = false, lockMessage }: CollapsibleSectionProps) => (
    <section className={`form-section ${isOpen ? 'open' : ''}`}>
        <header 
            className="section-header" 
            onClick={onToggle} 
            role="button" 
            tabIndex={0} 
            onKeyPress={(e) => (e.key === 'Enter' || e.key === ' ') && onToggle()}
            aria-expanded={isOpen}
            aria-disabled={isLocked}
            title={isLocked ? lockMessage : `Mở/Đóng mục ${title}`}
        >
            <h2>{title}</h2>
            {isLocked ? <LockIcon /> : <span className="collapsible-chevron" />}
        </header>
        <div className="section-content-wrapper">
            <div className="section-content">{children}</div>
        </div>
    </section>
);