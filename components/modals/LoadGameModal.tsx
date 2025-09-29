/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useRef, useState, useEffect } from 'react';
import { ConfirmationModal } from './ConfirmationModal';
import { formatBytes } from '../../utils/game';
import type { SaveFile } from '../../types';
import './LoadGameModal.css';

interface LoadGameModalProps {
    saves: SaveFile[];
    onClose: () => void;
    onLoad: (save: SaveFile) => void;
    onDelete: (saveId: string) => void;
    onUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onDownload: (saveFile: SaveFile) => void;
}

export const LoadGameModal = ({ saves, onClose, onLoad, onDelete, onUpload, onDownload }: LoadGameModalProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [saveToDelete, setSaveToDelete] = useState<{ id: string; name: string } | null>(null);

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

    const handleDeleteClick = (saveId: string, saveName: string) => {
        setSaveToDelete({ id: saveId, name: saveName });
        setShowConfirmModal(true);
    };

    const confirmDelete = () => {
        if (saveToDelete) {
            onDelete(saveToDelete.id);
        }
        setShowConfirmModal(false);
        setSaveToDelete(null);
    };
    
    // Sắp xếp các tệp lưu theo số thứ tự (slotNumber) nếu có, nếu không thì theo thời gian.
    const sortedSaves = [...saves].sort((a, b) => {
        if (a.slotNumber && b.slotNumber) return a.slotNumber - b.slotNumber;
        if (a.slotNumber) return -1;
        if (b.slotNumber) return 1;
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
    
    const numberedSaves = sortedSaves.filter(s => s.slotNumber);
    const otherSaves = sortedSaves.filter(s => !s.slotNumber);
    
    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const renderSaveCard = (save: SaveFile) => (
        <div key={save.id} className="save-card" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onLoad(save); }}>
            <div className="save-card-content">
                {save.slotNumber && <span className="save-card-slot">Slot {save.slotNumber}</span>}
                <h5 className="save-card-name">{save.name}</h5>
                <div className="save-card-meta">
                    <span>Lần cuối lưu: {new Date(save.timestamp).toLocaleString('vi-VN')}</span>
                    <span>Dung lượng: {formatBytes(JSON.stringify(save).length)}</span>
                </div>
            </div>
            <div className="save-card-footer">
                <div className="save-card-actions-secondary">
                     <button onClick={() => onDownload(save)}>Tải Xuống</button>
                     <button className="danger" onClick={() => handleDeleteClick(save.id, save.name)}>Xóa</button>
                </div>
                <button className="btn-load" onClick={() => onLoad(save)}>Tải Game</button>
            </div>
        </div>
    );

    return (
        <>
            <div className="modal-overlay" onClick={onClose}>
                <div 
                    className="modal-content load-game-modal" 
                    onClick={e => e.stopPropagation()}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="load-game-title"
                >
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={onUpload} 
                        style={{ display: 'none' }} 
                        accept=".zip"
                        multiple 
                    />
                    <header className="load-game-header">
                        <h3 id="load-game-title" className="load-game-title">Quản Lý & Tải Game</h3>
                        <div className="load-game-header-actions">
                             <button onClick={handleUploadClick} className="load-game-upload-button">
                                Tải Lên Tệp (.zip)
                            </button>
                            <button onClick={onClose} className="load-game-back-button">Quay Lại</button>
                        </div>
                    </header>
                    <div className="modal-body">
                        {saves.length === 0 ? (
                            <p className="no-saves-message">Không tìm thấy tệp lưu nào.</p>
                        ) : (
                            <div className="saves-container">
                                {numberedSaves.length > 0 && (
                                    <section className="saves-section">
                                        <h4 className="saves-section-title">Các Ô Lưu Chính</h4>
                                        <div className="saves-grid">
                                            {numberedSaves.map(save => renderSaveCard(save))}
                                        </div>
                                    </section>
                                )}
                                {otherSaves.length > 0 && (
                                    <section className="saves-section">
                                        <h4 className="saves-section-title">Các File Lưu Khác (Đã Nhập, Cũ)</h4>
                                        <div className="saves-grid">
                                            {otherSaves.map(save => renderSaveCard(save))}
                                        </div>
                                    </section>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {showConfirmModal && saveToDelete && (
                <ConfirmationModal
                    isOpen={showConfirmModal}
                    onClose={() => setShowConfirmModal(false)}
                    onConfirm={confirmDelete}
                    title="Xác Nhận Xóa"
                    message={<span>Bạn có chắc chắn muốn xóa tệp lưu <strong>"{saveToDelete.name}"</strong> không? Hành động này không thể hoàn tác.</span>}
                    confirmText="Xóa"
                />
            )}
        </>
    );
};