/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';

interface GameMenuSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    onNavClick: (label: string) => void;
    onSaveToFile: () => void;
    onNavigateToMenu: () => void;
    isProcessing: boolean;
}

const menuItems = [
    { label: "Nhân Vật", icon: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg> },
    { label: "Ký Ức", icon: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" transform="scale(0.8) translate(3,3)"/></svg> },
    { label: "Tri Thức", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg> },
    { label: "Thư Viện", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg> },
    { label: "Luật Lệ", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 17.5 10 19l1.5-1.5M10 10l.9-2.2c.1-.3 0-.6-.3-.7l-2.2-.9c-.3-.1-.6 0-.7.3L5.5 8.5c-.1.3 0 .6.3.7l2.2.9c.3.1.6 0 .7-.3Z"/><path d="M14 6.5l1.1-2.6c.1-.3 0-.6-.3-.7l-2.6-1.1c-.3-.1-.6 0-.7.3L9 3.5c-.1.3 0 .6.3.7l2.6 1.1c.3.1.6 0 .7-.3Z"/><path d="M17.5 8.5 19 10l1.5-1.5M14 14l.9-2.2c.1-.3 0-.6-.3-.7l-2.2-.9c-.3-.1-.6 0-.7.3L9.5 12.5c-.1.3 0 .6.3.7l2.2.9c.3.1.6 0 .7-.3Z"/><path d="M21 16.5c0 2.2-1.8 4-4 4s-4-1.8-4-4c0-1.7 1-3.2 2.4-3.8"/><path d="M3 7.5c0-2.2 1.8-4 4-4s4 1.8 4 4c0 1.7-1 3.2-2.4 3.8"/></svg> },
    { label: "Lịch Sử", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
    { label: "Cài Đặt", icon: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39,0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/></svg> },
];

const actionItems = [
    { label: "Lưu Game", className: "save-button", icon: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/></svg>, action: "onSaveToFile" },
    { label: "Thoát", className: "exit-button", icon: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M10.09 15.59 11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59zM19 3H5c-1.11 0-2 .9-2 2v4h2V5h14v14H5v-4H3v4c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/></svg>, action: "onNavigateToMenu" }
] as const;

export const GameMenuSidebar = ({ isOpen, onClose, onNavClick, onSaveToFile, onNavigateToMenu, isProcessing }: GameMenuSidebarProps) => {
    
    const actionHandlers = {
        onSaveToFile: onSaveToFile,
        onNavigateToMenu: onNavigateToMenu
    };

    return (
        <>
            <div className={`game-menu-overlay ${isOpen ? 'open' : ''}`} onClick={onClose} />
            <aside className={`game-menu-sidebar ${isOpen ? 'open' : ''}`} aria-hidden={!isOpen}>
                <nav aria-label="Menu chính của game">
                    <ul className="sidebar-nav-list">
                        {menuItems.map(item => (
                            <li key={item.label} className="sidebar-nav-item">
                                <button
                                    className="sidebar-nav-button"
                                    onClick={() => onNavClick(item.label)}
                                    disabled={isProcessing}
                                >
                                    <i>{item.icon}</i>
                                    <span>{item.label}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>
                <div className="sidebar-actions">
                    {actionItems.map(item => (
                        <button
                            key={item.label}
                            className={`sidebar-nav-button ${item.className}`}
                            onClick={actionHandlers[item.action]}
                            disabled={isProcessing}
                        >
                            <i>{item.icon}</i>
                            <span>{item.label}</span>
                        </button>
                    ))}
                </div>
            </aside>
        </>
    );
};