/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useRef, useEffect, useCallback } from 'react';
import * as db from '../../services/db';
import { useModalAccessibility } from '../../hooks/useModalAccessibility';
import type { GameCharacter, GalleryImage } from '../../types';
import './AvatarEditModal.css';

interface AvatarEditModalProps {
    character: GameCharacter;
    onClose: () => void;
    onSave: (newUrl: string) => void;
    addToast: (message: string, type?: 'info' | 'success' | 'error' | 'warning') => void;
}

const MAX_FILE_SIZE_MB = 2;

export const AvatarEditModal = ({ character, onClose, onSave, addToast }: AvatarEditModalProps) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const [activeTab, setActiveTab] = useState('upload');
    const [urlInput, setUrlInput] = useState('');
    const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
    const [isLoadingGallery, setIsLoadingGallery] = useState(true);
    useModalAccessibility(true, modalRef);

    const fileInputRef = useRef<HTMLInputElement>(null);

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

    useEffect(() => {
        const loadGallery = async () => {
            setIsLoadingGallery(true);
            try {
                const images = await db.getAllImages();
                setGalleryImages(images.reverse());
                if (images.length > 0) {
                    setActiveTab('gallery');
                }
            } catch (err) {
                addToast("Không thể tải ảnh từ thư viện.", 'error');
            } finally {
                setIsLoadingGallery(false);
            }
        };
        loadGallery();
    }, [addToast]);

    const handleImageSelect = useCallback((url: string) => {
        const img = new Image();
        img.src = url;
        img.onload = () => {
            onSave(url);
            onClose();
        };
        img.onerror = () => {
            addToast('Không thể tải ảnh từ URL được cung cấp.', 'error');
        }
    }, [onSave, onClose, addToast]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
            addToast(`Tệp "${file.name}" quá lớn (tối đa ${MAX_FILE_SIZE_MB}MB).`, 'error');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => handleImageSelect(reader.result as string);
        reader.onerror = () => addToast(`Không thể đọc tệp "${file.name}".`, 'error');
        reader.readAsDataURL(file);
        e.target.value = '';
    };

    const handleUrlSave = () => {
        if (urlInput.trim()) {
            handleImageSelect(urlInput.trim());
        }
    };

    return (
        <div className="modal-overlay confirmation-overlay" onClick={onClose}>
            <div 
                ref={modalRef}
                className="modal-content avatar-edit-modal" 
                onClick={e => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="avatar-edit-title"
            >
                <header className="modal-header">
                    <h3 id="avatar-edit-title">Chọn Ảnh Đại Diện</h3>
                    <button onClick={onClose} className="modal-close-button" aria-label="Đóng">×</button>
                </header>
                <div className="modal-body">
                    <div className="image-gen-tabs">
                        <button className={`image-gen-tab-button ${activeTab === 'gallery' ? 'active' : ''}`} onClick={() => setActiveTab('gallery')}>Chọn từ Thư Viện</button>
                        <button className={`image-gen-tab-button ${activeTab === 'upload' ? 'active' : ''}`} onClick={() => setActiveTab('upload')}>Tải Lên từ Máy</button>
                        <button className={`image-gen-tab-button ${activeTab === 'url' ? 'active' : ''}`} onClick={() => setActiveTab('url')}>Dùng từ URL</button>
                    </div>
                    
                    {activeTab === 'gallery' && (
                        <div className="avatar-edit-tab-content">
                            {isLoadingGallery ? <div className="avatar-upload-label"><div className="spinner spinner-md"></div></div> :
                             galleryImages.length > 0 ? (
                                <div className="avatar-preview-grid">
                                    {galleryImages.map((image) => (
                                        <div key={image.id} className="avatar-preview-item" onClick={() => handleImageSelect(image.dataUrl)} title={image.description}>
                                            <img src={image.dataUrl} alt={image.name} />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <label className="avatar-upload-label" onClick={() => setActiveTab('upload')}>
                                    Thư viện của bạn trống.
                                    <br/><small>Chuyển sang tab "Tải Lên từ Máy" để bắt đầu.</small>
                                </label>
                            )}
                        </div>
                    )}

                    {activeTab === 'upload' && (
                        <div className="avatar-edit-tab-content">
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/png, image/jpeg, image/webp" style={{display: 'none'}} />
                            <label className="avatar-upload-label" onClick={() => fileInputRef.current?.click()}>
                                Nhấp để chọn tệp...
                                <br/><small>(Tối đa {MAX_FILE_SIZE_MB}MB)</small>
                            </label>
                        </div>
                    )}

                    {activeTab === 'url' && (
                        <div className="avatar-edit-tab-content">
                            <div className="avatar-edit-url-input">
                                <input type="text" placeholder="https://..." value={urlInput} onChange={e => setUrlInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleUrlSave()} />
                                <button className="wc-button" style={{width: 'auto', marginTop: 0}} onClick={handleUrlSave}>Sử dụng</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};