/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useMemo, useState, useEffect } from 'react';
import type { GameTime } from '../../types';

interface GameHeaderProps {
    title: string;
    gameTime?: GameTime;
    turnCount: number;
    totalTokenCount: number;
    isProcessing: boolean;
    onToggleMenu: () => void;
    isInCombat: boolean;
    isFocusMode: boolean;
    setIsFocusMode: (isFocus: boolean) => void;
}

const TimeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const TurnIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>;
const TokenIcon = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.55 2.55a1 1 0 0 0-1.1 0L2.7 9.7a1 1 0 0 0 0 1.1l8.75 7.15a1 1 0 0 0 1.1 0l8.75-7.15a1 1 0 0 0 0-1.1Z"/><path d="m17 14-5-5-5 5"/><path d="m12 19-5-5"/></svg>;
const MenuIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>;
const CombatIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.9,8.5c-0.1-0.2-0.3-0.3-0.5-0.3H18V4.5C18,3.7,17.3,3,16.5,3h-2C13.7,3,13,3.7,13,4.5V6H9V4.5C9,3.7,8.3,3,7.5,3h-2 C4.7,3,4,3.7,4,4.5V8H2.6c-0.2,0-0.4,0.1-0.5,0.3C2,8.7,2,8.9,2.1,9.1l5.5,8.8C7.8,18.3,8.1,18.5,8.5,18.5h6 c0.4,0,0.7-0.2,0.9-0.6l5.5-8.8C21,8.9,21,8.7,20.9,8.5z M13.3,16.5H9.7l-4-6.4h2.8v-4h1v4.5c0,0.3,0.2,0.5,0.5,0.5h3 c0.3,0,0.5-0.2,0.5-0.5v-4h1v4.5c0,0.3,0.2,0.5,0.5,0.5h2.8L13.3,16.5z"/></svg>;
const EnterFocusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>;
const ExitFocusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>;
const FullscreenEnterIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>;
const FullscreenExitIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/></svg>;


const formatGameTimeOnly = (time?: GameTime) => {
    if (!time) return '';
    const { year, month, day, hour, minute } = time;
    const paddedHour = String(hour).padStart(2, '0');
    const paddedMinute = String(minute).padStart(2, '0');
    return `${paddedHour}:${paddedMinute} - ${day}/${month}/${year}`;
};

export const GameHeader = React.memo(({
    title,
    gameTime,
    turnCount,
    totalTokenCount,
    isProcessing,
    onToggleMenu,
    isInCombat,
    isFocusMode,
    setIsFocusMode,
}: GameHeaderProps) => {
    const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error(`Lỗi khi bật chế độ toàn màn hình: ${err.message} (${err.name})`);
            });
        } else {
            document.exitFullscreen();
        }
    };

    const formattedTime = useMemo(() => formatGameTimeOnly(gameTime), [gameTime]);

    return (
        <header className="game-header">
            <div className="game-header-left">
                {/* Mobile-only menu button */}
                <button
                    className="menu-toggle-button mobile-menu-button"
                    onClick={onToggleMenu}
                    disabled={isProcessing}
                    aria-label="Mở menu chính"
                >
                    <MenuIcon />
                </button>
                <h1 className="game-title">{title}</h1>
                <div className="game-status-bar" role="status" aria-live="polite">
                    {isInCombat && (
                        <div className="status-item combat-indicator">
                            <CombatIcon />
                            <span>ĐANG GIAO CHIẾN</span>
                        </div>
                    )}
                    <div className="status-item" title={gameTime?.weather}>
                        <TimeIcon/>
                        <span>{formattedTime}</span>
                    </div>
                    {!isInCombat && (
                        <div className="status-item" title="Số lượt chơi">
                            <TurnIcon/>
                            <span>{turnCount.toLocaleString('vi-VN')}</span>
                        </div>
                    )}
                    <div className="status-item" title={`Tổng tokens đã sử dụng: ${totalTokenCount.toLocaleString('vi-VN')}`}>
                        <TokenIcon />
                        <span>{(totalTokenCount / 1000).toFixed(1)}k</span>
                    </div>
                </div>
            </div>
            
            <div className="game-header-right">
                 <button
                    className={`menu-toggle-button fullscreen-toggle ${isFullscreen ? 'active' : ''}`}
                    onClick={toggleFullscreen}
                    disabled={isProcessing}
                    aria-pressed={isFullscreen}
                    aria-label={isFullscreen ? 'Thoát chế độ Toàn màn hình' : 'Bật chế độ Toàn màn hình'}
                    title={isFullscreen ? 'Thoát chế độ Toàn màn hình' : 'Bật chế độ Toàn màn hình'}
                >
                    {isFullscreen ? <FullscreenExitIcon /> : <FullscreenEnterIcon />}
                </button>
                 <button
                    className={`menu-toggle-button focus-mode-toggle ${isFocusMode ? 'active' : ''}`}
                    onClick={() => setIsFocusMode(!isFocusMode)}
                    disabled={isProcessing}
                    aria-pressed={isFocusMode}
                    aria-label={isFocusMode ? 'Thoát Chế độ Tập trung' : 'Bật Chế độ Tập trung'}
                    title={isFocusMode ? 'Thoát Chế độ Tập trung' : 'Bật Chế độ Tập trung'}
                >
                    {isFocusMode ? <ExitFocusIcon /> : <EnterFocusIcon />}
                </button>
                {/* Desktop-only menu button */}
                <button
                    className="menu-toggle-button desktop-menu-button"
                    onClick={onToggleMenu}
                    disabled={isProcessing}
                    aria-label="Mở menu chính"
                >
                    <MenuIcon />
                </button>
            </div>
        </header>
    );
});