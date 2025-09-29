/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from 'react';
import { InlineStoryRenderer } from '../game/StoryRenderer';
import { useGameContext } from '../contexts/GameContext';
import { ConfirmationModal } from './ConfirmationModal';
import type { Memory } from '../../types';
import './MemoryModal.css';

interface MemoryModalProps {
    memories: Memory[];
    onPin: (id: string) => void;
    onDelete: (id: string) => void;
    onClose: () => void;
    onEntityClick: (event: React.MouseEvent, name: string, type: string) => void;
    onEntityMouseEnter: (event: React.MouseEvent, name: string, type: string) => void;
    onEntityMouseLeave: () => void;
}

export const MemoryModal = ({ memories, onPin, onDelete, onClose, onEntityClick, onEntityMouseEnter, onEntityMouseLeave }: MemoryModalProps) => {
    const { gameState } = useGameContext();
    const [memoryToDelete, setMemoryToDelete] = useState<string | null>(null);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose]);

    const sortedMemories = [...(memories || [])].sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return 0;
    });

    const handleDeleteClick = (memoryId: string) => {
        setMemoryToDelete(memoryId);
    };

    const confirmDelete = () => {
        if (memoryToDelete) {
            onDelete(memoryToDelete);
        }
        setMemoryToDelete(null);
    };

    return (
        <>
            <div className="modal-overlay" onClick={onClose}>
                <div 
                    className="modal-content memory-modal-content" 
                    onClick={e => e.stopPropagation()}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="memory-modal-title"
                >
                    <header className="modal-header memory-header">
                        <div className="memory-title-wrapper">
                            <h3 id="memory-modal-title">Ký Ức Tạm Thời</h3>
                        </div>
                        <button onClick={onClose} className="modal-close-button" aria-label="Đóng bảng cài đặt">X</button>
                    </header>
                    <div className="modal-body">
                        {sortedMemories.length === 0 ? (
                            <p className="no-memories-message">Chưa có ký ức nào được ghi lại.</p>
                        ) : (
                            <ul className="memory-list">
                                {sortedMemories.map(memory => (
                                    <li key={memory.id} className="memory-item">
                                        <span className="memory-text">
                                            <InlineStoryRenderer text={memory.text} gameState={gameState} onEntityClick={onEntityClick} onEntityMouseEnter={onEntityMouseEnter} onEntityMouseLeave={onEntityMouseLeave}/>
                                        </span>
                                        <div className="memory-item-actions">
                                            <button
                                                className={`memory-pin-button ${memory.pinned ? 'pinned' : ''}`}
                                                onClick={() => onPin(memory.id)}
                                                aria-label={memory.pinned ? `Bỏ ghim ký ức` : `Ghim ký ức`}
                                            >
                                                <span>{memory.pinned ? 'Đã Ghim' : 'Ghim'}</span>
                                            </button>
                                            <button
                                                className="memory-delete-button"
                                                onClick={() => handleDeleteClick(memory.id)}
                                                aria-label="Xóa ký ức"
                                            >
                                                Xóa
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                     <footer className="memory-footer">
                        <button className="memory-footer-button" onClick={onClose}>Đóng</button>
                    </footer>
                </div>
            </div>
            {memoryToDelete && (
                <ConfirmationModal
                    isOpen={!!memoryToDelete}
                    onClose={() => setMemoryToDelete(null)}
                    onConfirm={confirmDelete}
                    title="Xác Nhận Xóa Ký Ức"
                    message="Bạn có chắc chắn muốn xóa ký ức này không? AI sẽ không còn tham chiếu đến nó trong tương lai."
                    confirmText="Xóa"
                />
            )}
        </>
    );
};