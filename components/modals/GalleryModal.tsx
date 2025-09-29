/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { ApiKeyManager } from '../../services/ApiKeyManager';
import { getApiErrorMessage } from '../../utils/error';
import * as db from '../../services/db';
import { generateUniqueId } from '../../utils/id';
import { useModalAccessibility } from '../../hooks/useModalAccessibility';
import { ConfirmationModal } from './ConfirmationModal';
import { FormField } from '../ui/FormField';
import { useGameContext } from '../contexts/GameContext';
import { AVATAR_SELECTION_SCHEMA } from '../../constants/schemas';
import { GEMINI_FLASH } from '../../constants/aiConstants';
import './GalleryModal.css';
import './ManualEntryModal.css';
import type { GalleryImage, Character } from '../../types';

interface GalleryModalProps {
    onClose: () => void;
    addToast: (message: string, type?: 'info' | 'success' | 'error' | 'warning') => void;
    incrementApiRequestCount: () => void;
}

const MAX_FILE_SIZE_MB = 2;

interface ImageViewerProps {
    images: GalleryImage[];
    currentIndex: number;
    onClose: () => void;
    onNavigate: (newIndex: number) => void;
}

const ImageViewer = ({ images, currentIndex, onClose, onNavigate }: ImageViewerProps) => {
    const currentImage = images[currentIndex];

    const handlePrev = useCallback(() => {
        if (currentIndex > 0) {
            onNavigate(currentIndex - 1);
        }
    }, [currentIndex, onNavigate]);

    const handleNext = useCallback(() => {
        if (currentIndex < images.length - 1) {
            onNavigate(currentIndex + 1);
        }
    }, [currentIndex, images.length, onNavigate]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            } else if (e.key === 'ArrowLeft') {
                handlePrev();
            } else if (e.key === 'ArrowRight') {
                handleNext();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [handlePrev, handleNext, onClose]);

    if (!currentImage) return null;

    return (
        <div className="image-viewer-overlay" onClick={onClose}>
            <button className="image-viewer-nav prev" onClick={(e) => { e.stopPropagation(); handlePrev(); }} disabled={currentIndex === 0}>‹</button>
            <img src={currentImage.dataUrl} alt={currentImage.description || currentImage.name} className="image-viewer-content" onClick={e => e.stopPropagation()} />
            <button className="image-viewer-nav next" onClick={(e) => { e.stopPropagation(); handleNext(); }} disabled={currentIndex === images.length - 1}>›</button>
        </div>
    );
};

interface ManualEntryModalProps {
    image: GalleryImage;
    onClose: () => void;
    onSave: (updatedImage: GalleryImage) => void;
    allCategories: string[];
}

const ManualEntryModal = ({ image, onClose, onSave, allCategories }: ManualEntryModalProps) => {
    const [formData, setFormData] = useState<GalleryImage>(image);
    const modalRef = useRef<HTMLDivElement>(null);
    useModalAccessibility(true, modalRef);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleTagChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const tags = e.target.value.split(',').map(tag => tag.trim()).filter(Boolean);
        setFormData(prev => ({ ...prev, tags }));
    };
    
    const handleSuggestionClick = (field: 'category' | 'subCategory', value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    }

    const handleSave = () => {
        onSave(formData);
    };
    
    const categorySuggestions = [...new Set([...allCategories, ...(formData.suggestedCategories || [])])];

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div ref={modalRef} className="modal-content manual-entry-modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="manual-entry-title">
                <header className="modal-header">
                    <h3 id="manual-entry-title">Chỉnh Sửa Chi Tiết Ảnh</h3>
                    <button onClick={onClose} className="modal-close-button" aria-label="Đóng">×</button>
                </header>
                <div className="modal-body manual-entry-body">
                    <div className="manual-entry-preview">
                        <img src={formData.dataUrl} alt="Preview" />
                    </div>
                    <div className="manual-entry-form">
                        <FormField label="Tên tệp (chỉ đọc)" htmlFor="image-name">
                            <input id="image-name" type="text" value={formData.name} readOnly />
                        </FormField>
                        
                        <FormField label="Danh mục" htmlFor="image-category">
                            <input 
                                id="image-category" 
                                type="text" 
                                name="category"
                                value={formData.category} 
                                onChange={handleInputChange} 
                                list="category-suggestions"
                            />
                            <datalist id="category-suggestions">
                                {categorySuggestions.map(cat => <option key={cat} value={cat} />)}
                            </datalist>
                        </FormField>
                        
                        <FormField label="Danh mục phụ" htmlFor="image-subCategory">
                            <input 
                                id="image-subCategory" 
                                type="text" 
                                name="subCategory"
                                value={formData.subCategory} 
                                onChange={handleInputChange} 
                            />
                        </FormField>
                        
                        <FormField label="Tags (phân cách bởi dấu phẩy)" htmlFor="image-tags">
                            <textarea 
                                id="image-tags" 
                                name="tags"
                                value={formData.tags.join(', ')} 
                                onChange={handleTagChange}
                                rows={4}
                            />
                        </FormField>

                        <div className="ai-suggestions-section">
                            <h4>Gợi ý từ AI</h4>
                            {formData.suggestedCategories && formData.suggestedCategories.length > 0 && (
                                <div className="suggestion-group">
                                    <label>Danh mục:</label>
                                    <div className="suggestion-buttons">
                                        {formData.suggestedCategories.map(cat => (
                                            <button key={cat} onClick={() => handleSuggestionClick('category', cat)}>{cat}</button>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {formData.suggestedSubCategories && formData.suggestedSubCategories.length > 0 && (
                                <div className="suggestion-group">
                                    <label>Danh mục phụ:</label>
                                    <div className="suggestion-buttons">
                                        {formData.suggestedSubCategories.map(subCat => (
                                            <button key={subCat} onClick={() => handleSuggestionClick('subCategory', subCat)}>{subCat}</button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <footer className="manual-entry-footer">
                    <button className="lore-button cancel" onClick={onClose}>Hủy</button>
                    <button className="lore-button save-apply" onClick={handleSave}>Lưu Thay Đổi</button>
                </footer>
            </div>
        </div>
    );
};

export const GalleryModal = ({ onClose, addToast, incrementApiRequestCount }: GalleryModalProps) => {
    const { gameState, dispatch } = useGameContext();
    const modalRef = useRef<HTMLDivElement>(null);
    const [images, setImages] = useState<GalleryImage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    const [activeFilter, setActiveFilter] = useState<'unclassified' | string>('unclassified');
    const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
    const [viewerIndex, setViewerIndex] = useState<number | null>(null);

    const [imageToDelete, setImageToDelete] = useState<GalleryImage | null>(null);
    const [showImportConfirm, setShowImportConfirm] = useState(false);
    const [imagesToImport, setImagesToImport] = useState<GalleryImage[] | null>(null);
    const [imageToEdit, setImageToEdit] = useState<GalleryImage | null>(null);
    const [isProcessingAvatars, setIsProcessingAvatars] = useState(false);
    useModalAccessibility(true, modalRef);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const importLibraryInputRef = useRef<HTMLInputElement>(null);

    const loadImages = useCallback(async () => {
        setIsLoading(true);
        try {
            const allImages = await db.getAllImages();
            setImages(allImages.reverse());
        } catch (error) {
            addToast('Không thể tải thư viện ảnh.', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [addToast]);

    useEffect(() => { loadImages(); }, [loadImages]);

    const unclassifiedImages = useMemo(() => images.filter(img => !img.category || img.category === 'unclassified'), [images]);
    const nsfwImages = useMemo(() => images.filter(img => img.category === 'NSFW'), [images]);
    const npcsWithoutAvatars = useMemo(() => gameState?.knowledgeBase?.npcs.filter(npc => !npc.avatarUrl) || [], [gameState]);

    const categories = useMemo(() => {
        const classifiedImages = images.filter(img => img.category && img.category !== 'unclassified' && img.category !== 'NSFW');
        const newCategories = new Map<string, Set<string>>();
        classifiedImages.forEach(image => {
            if (!newCategories.has(image.category)) {
                newCategories.set(image.category, new Set());
            }
            if (image.subCategory) {
                newCategories.get(image.category)!.add(image.subCategory);
            }
        });
        return newCategories;
    }, [images]);

    const filteredImages = useMemo(() => {
        if (activeFilter === 'unclassified') return unclassifiedImages;
        if (activeFilter === 'NSFW') return nsfwImages;
        return images.filter(image => {
            if (image.category !== activeFilter) return false;
            if (selectedSubCategory && image.subCategory !== selectedSubCategory) return false;
            return true;
        });
    }, [images, activeFilter, selectedSubCategory, unclassifiedImages, nsfwImages]);
    
    const handleFilterChange = (category: string) => {
        setActiveFilter(category);
        setSelectedSubCategory(null);
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;
        
        let processedCount = 0;
        // FIX: Add explicit type `File` to the mapped `file` variable to resolve property access errors.
        const uploadPromises = Array.from(files).map(async (file: File) => {
            if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
                addToast(`Tệp "${file.name}" quá lớn (tối đa ${MAX_FILE_SIZE_MB}MB) và sẽ bị bỏ qua.`, 'warning');
                return;
            }
            try {
                const dataUrl = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = e => resolve(e.target?.result as string);
                    reader.onerror = e => reject(e);
                    reader.readAsDataURL(file);
                });

                const newImage: GalleryImage = { id: generateUniqueId('img'), name: file.name, dataUrl, description: '', tags: [], category: 'unclassified', subCategory: '', };
                await db.addOrUpdateImage(newImage);
                processedCount++;
            } catch (e) {
                addToast(`Không thể đọc hoặc lưu tệp ${file.name}.`, 'error');
            }
        });
        
        await Promise.all(uploadPromises);
        if (processedCount > 0) {
            addToast(`Đã tải lên thành công ${processedCount} ảnh vào mục "Chưa Phân Loại".`, 'success');
            await loadImages();
            setActiveFilter('unclassified');
        }
        if (event.target) event.target.value = '';
    };

    const handleDeleteClick = (image: GalleryImage) => {
        setImageToDelete(image);
    };

    const confirmDelete = async () => {
        if (!imageToDelete) return;
        try {
            await db.deleteImage(imageToDelete.id);
            addToast(`Đã xóa ảnh "${imageToDelete.name}" thành công.`, 'success');
            await loadImages();
        } catch (error) {
            addToast('Xóa ảnh thất bại.', 'error');
        }
        setImageToDelete(null);
    };

    const handleExportLibrary = async () => {
        try {
            const allImages = await db.getAllImages();
            if (allImages.length === 0) {
                addToast("Thư viện trống, không có gì để xuất.", 'warning');
                return;
            }
            const jsonString = JSON.stringify(allImages, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `game_ai_gallery_export_${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            addToast("Đã xuất thư viện thành công!", 'success');
        } catch (error) {
            addToast("Xuất thư viện thất bại.", 'error');
            console.error("Failed to export library:", error);
        }
    };

    const handleImportFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target?.result;
                if (typeof content !== 'string') throw new Error("Nội dung tệp không hợp lệ");
                
                const parsedData = JSON.parse(content);
                if (!Array.isArray(parsedData) || (parsedData.length > 0 && !parsedData[0].id)) {
                    throw new Error("Định dạng tệp không hợp lệ");
                }
                setImagesToImport(parsedData);
                setShowImportConfirm(true);
            } catch (err) {
                addToast("Tệp nhập không hợp lệ hoặc bị hỏng.", 'error');
            }
        };
        reader.onerror = () => addToast("Không thể đọc tệp.", 'error');
        reader.readAsText(file);
        
        if (event.target) event.target.value = '';
    };

    const confirmImport = async () => {
        if (!imagesToImport) return;
        setShowImportConfirm(false);
        setIsLoading(true);
        try {
            await Promise.all(imagesToImport.map(img => db.addOrUpdateImage(img)));
            await loadImages();
            addToast(`Đã nhập và hợp nhất thành công ${imagesToImport.length} ảnh.`, 'success');
        } catch (error) {
            addToast("Nhập thư viện thất bại.", 'error');
        } finally {
            setIsLoading(false);
            setImagesToImport(null);
        }
    };

    const handleManualUpdate = async (updatedImage: GalleryImage) => {
        try {
            await db.updateImage(updatedImage);
            addToast(`Đã cập nhật chi tiết cho ảnh "${updatedImage.name}".`, 'success');
            setImageToEdit(null);
            await loadImages();
        } catch (error) {
            addToast('Cập nhật ảnh thất bại.', 'error');
        }
    };

    const handleAutoSetAvatars = async () => {
        if (isProcessingAvatars) return;

        const targets = npcsWithoutAvatars;
        if (targets.length === 0) {
            addToast('Tất cả NPC đã có ảnh đại diện.', 'info');
            return;
        }

        const allImages = await db.getAllImages();
        if (allImages.length === 0) {
            addToast('Thư viện ảnh trống, không thể tìm ảnh đại diện.', 'warning');
            return;
        }

        setIsProcessingAvatars(true);
        addToast(`Bắt đầu tìm kiếm ảnh đại diện cho ${targets.length} NPC...`, 'info');

        const imageMetadata = allImages.map(({ id, tags, description, category, subCategory, name }) => ({ id, tags, description, category, subCategory, name }));
        let successCount = 0;
        let failCount = 0;

        const avatarPromises = targets.map(async (npc: Character) => {
            try {
                const npcDescription = `Tên: ${npc.displayName || npc.name}, Chủng tộc: ${npc.species}, Giới tính: ${npc.gender}, Tuổi: ${npc.age}. Mô tả ngoại hình: ${npc.description}`;
                const prompt = `**VAI TRÒ:** Bạn là một AI quản lý thư viện hình ảnh thông minh cho một trò chơi.
**NHIỆM VỤ:** Dựa trên mô tả chi tiết của một nhân vật (NPC) và một danh sách các hình ảnh có sẵn, hãy chọn ra MỘT hình ảnh PHÙ HỢP NHẤT để làm ảnh đại diện cho nhân vật đó.
**TIÊU CHÍ LỰA CHỌN (ƯU TIÊN THEO THỨ TỰ):**
1.  **Độ chính xác cao:** Hình ảnh phải khớp với các đặc điểm cốt lõi của nhân vật (giới tính, chủng tộc, màu tóc, v.v.).
2.  **Sự phù hợp về phong cách:** Phong cách của ảnh (ví dụ: anime, tả thực) nên phù hợp với bối cảnh chung của thế giới.
3.  **Không có lựa chọn tốt hơn là không chọn:** Nếu không có hình ảnh nào trong danh sách là một lựa chọn tốt, hãy trả về 'null'. Đừng cố chọn một hình ảnh "gần đúng".
**MÔ TẢ NHÂN VẬT:**
${npcDescription}
---
**DANH SÁCH HÌNH ẢNH CÓ SẴN (ID và mô tả):**
${JSON.stringify(imageMetadata.slice(0, 200))}
---
**ĐẦU RA:** Trả về một đối tượng JSON duy nhất theo schema.`;

                const response = await ApiKeyManager.generateContentWithRetry(
                    {
                        model: GEMINI_FLASH,
                        contents: prompt,
                        config: { responseMimeType: 'application/json', responseSchema: AVATAR_SELECTION_SCHEMA }
                    },
                    addToast,
                    incrementApiRequestCount
                );
                const result = JSON.parse(response.text?.trim() || '{}');

                if (result.bestImageId && result.bestImageId !== 'null') {
                    const matchedImage = allImages.find(img => img.id === result.bestImageId);
                    if (matchedImage) {
                        dispatch({ type: 'UPDATE_CHARACTER', payload: { characterId: npc.id, updates: { avatarUrl: matchedImage.dataUrl } } });
                        successCount++;
                    } else {
                        failCount++;
                    }
                } else {
                    failCount++;
                }
            } catch (error) {
                failCount++;
                console.error(`Lỗi khi tìm avatar cho ${npc.name}:`, error);
                addToast(getApiErrorMessage(error, `tìm avatar cho ${npc.name}`), 'error');
            }
        });

        await Promise.all(avatarPromises);

        addToast(`Hoàn tất! Đã tự động cài đặt ${successCount} ảnh đại diện. ${failCount} NPC không tìm thấy ảnh phù hợp.`, 'success');
        setIsProcessingAvatars(false);
    };

    // FIX: Cast the result of `Array.from` to `string[]` to resolve the sort callback type error where parameters were inferred as 'unknown'.
    const sortedCategories = (Array.from(categories.keys()) as string[]).sort((a, b) => a.localeCompare(b, 'vi'));

    return (
        <>
            <div className="modal-overlay" onClick={onClose}>
                <div ref={modalRef} className="modal-content gallery-modal-content" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="gallery-modal-title">
                    <header className="modal-header">
                        <button className="lore-button file-action upload-primary" onClick={() => fileInputRef.current?.click()}>
                            + Tải Lên Ảnh Mới
                        </button>
                        <h3 id="gallery-modal-title">Thư Viện Ảnh</h3>
                        <div className="gallery-header-actions">
                             <button 
                                className="lore-button file-action auto-avatar-btn" 
                                onClick={handleAutoSetAvatars} 
                                disabled={isProcessingAvatars || npcsWithoutAvatars.length === 0 || images.length === 0}
                                title={npcsWithoutAvatars.length > 0 ? `Sẽ sử dụng ${npcsWithoutAvatars.length} yêu cầu API.` : 'Tất cả NPC đã có ảnh đại diện.'}
                            >
                                {isProcessingAvatars ? <span className="spinner spinner-sm"></span> : null}
                                Tự Động Cài Đặt Avatar ({npcsWithoutAvatars.length})
                            </button>
                             <button className="lore-button file-action" onClick={handleExportLibrary}>Xuất Thư Viện</button>
                             <button className="lore-button file-action" onClick={() => importLibraryInputRef.current?.click()}>Nhập Thư Viện</button>
                            <button onClick={onClose} className="modal-close-button" aria-label="Đóng">X</button>
                        </div>
                    </header>
                    <div className="gallery-body">
                         <aside className="gallery-sidebar">
                             <h4 className="sidebar-title">Danh Mục</h4>
                             <button className={`category-button unclassified ${activeFilter === 'unclassified' ? 'active' : ''}`} onClick={() => handleFilterChange('unclassified')}>Chưa Phân Loại ({unclassifiedImages.length})</button>
                             {nsfwImages.length > 0 && (
                                <button className={`category-button nsfw ${activeFilter === 'NSFW' ? 'active' : ''}`} onClick={() => handleFilterChange('NSFW')}>
                                    NSFW ({nsfwImages.length})
                                </button>
                             )}
                             {sortedCategories.map(cat => (
                                 <div key={cat}>
                                     <button className={`category-button ${activeFilter === cat ? 'active' : ''}`} onClick={() => handleFilterChange(cat)}>{cat}</button>
                                     {activeFilter === cat && (
                                         <div className="subcategory-list">
                                             <button className={`subcategory-button ${!selectedSubCategory ? 'active' : ''}`} onClick={() => setSelectedSubCategory(null)}>Tất cả trong "{cat}"</button>
                                             {Array.from(categories.get(cat) || []).sort().map(subCat => (
                                                 <button key={subCat} className={`subcategory-button ${selectedSubCategory === subCat ? 'active' : ''}`} onClick={() => setSelectedSubCategory(subCat)}>{subCat}</button>
                                             ))}
                                         </div>
                                     )}
                                 </div>
                             ))}
                         </aside>
                         <main className="gallery-main">
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} accept="image/png, image/jpeg, image/webp" multiple />
                            <input type="file" ref={importLibraryInputRef} onChange={handleImportFileChange} style={{ display: 'none' }} accept=".json" />
                            {isLoading ? (
                                <div className="gallery-message"><div className="spinner spinner-lg"></div></div>
                            ) : images.length === 0 ? (
                                <div className="gallery-message">Thư viện của bạn trống.</div>
                            ) : (
                                <div className="gallery-grid">
                                    {filteredImages.map((image, index) => (
                                        <div 
                                            key={image.id} 
                                            className="gallery-item" 
                                            tabIndex={0}
                                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setViewerIndex(index); } }}
                                        >
                                            <img src={image.dataUrl} alt={image.name} className="gallery-item-image" onClick={() => setViewerIndex(index)} />
                                            <div className="gallery-item-overlay">
                                                 <div className="gallery-item-actions">
                                                     <button className="edit-btn" onClick={(e) => { e.stopPropagation(); setImageToEdit(image); }} title="Chỉnh sửa chi tiết">Sửa</button>
                                                     <button className="delete-btn" onClick={(e) => { e.stopPropagation(); handleDeleteClick(image); }} title="Xóa ảnh">Xóa</button>
                                                </div>
                                                <div onClick={() => setViewerIndex(index)} style={{flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end'}}>
                                                    <p className="gallery-item-desc" title={image.description}>{image.description || image.name}</p>
                                                    {image.tags.length > 0 && (
                                                        <div className="gallery-item-tags">
                                                            <div className="tags-truncated">
                                                                {image.tags.slice(0, 3).map(tag => <span key={tag} className="gallery-item-tag">{tag}</span>)}
                                                                {image.tags.length > 3 && <span className="gallery-item-tag more-tags-indicator">...</span>}
                                                            </div>
                                                            <div className="tags-full">
                                                                {image.tags.map(tag => <span key={tag} className="gallery-item-tag">{tag}</span>)}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                         </main>
                    </div>
                </div>
            </div>
            
            {imageToEdit && (
                <ManualEntryModal
                    image={imageToEdit}
                    onClose={() => setImageToEdit(null)}
                    onSave={handleManualUpdate}
                    // FIX: Cast the result of `Array.from` to `string[]` to satisfy the prop type.
                    allCategories={Array.from(categories.keys()) as string[]}
                />
            )}

            {viewerIndex !== null && (
                <ImageViewer
                    images={filteredImages}
                    currentIndex={viewerIndex}
                    onClose={() => setViewerIndex(null)}
                    onNavigate={(newIndex) => setViewerIndex(newIndex)}
                />
            )}
            
            {imageToDelete && ( <ConfirmationModal isOpen={!!imageToDelete} onClose={() => setImageToDelete(null)} onConfirm={confirmDelete} title="Xác Nhận Xóa" message={<span>Bạn có chắc chắn muốn xóa vĩnh viễn ảnh <strong>{imageToDelete.name}</strong> không?</span>} confirmText="Xóa" /> )}
            {showImportConfirm && ( <ConfirmationModal isOpen={showImportConfirm} onClose={() => setShowImportConfirm(false)} onConfirm={confirmImport} title="Xác Nhận Nhập" message={<span>Thao tác này sẽ hợp nhất <strong>{imagesToImport?.length || 0}</strong> ảnh vào thư viện của bạn. Các ảnh có cùng ID sẽ bị ghi đè. Bạn có muốn tiếp tục?</span>} confirmText="Nhập & Hợp nhất" /> )}
        </>
    );
};