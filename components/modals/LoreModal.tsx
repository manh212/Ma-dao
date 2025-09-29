/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useRef, useEffect } from 'react';
import { generateUniqueId } from '../../utils/id';
import type { LoreRule } from '../../types';
import './LoreModal.css';

interface LoreModalProps {
    initialRules: LoreRule[];
    onSave: (rules: Omit<LoreRule, 'id'>[]) => void;
    onClose: () => void;
}

export const LoreModal = ({ initialRules, onSave, onClose }: LoreModalProps) => {
    const [rules, setRules] = useState<LoreRule[]>(() => {
        return (initialRules || []).map((rule) => ({
            ...rule,
            id: rule.id || generateUniqueId('rule-init')
        }));
    });
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

    const handleAddRule = () => {
        setRules(prev => [...prev, { id: generateUniqueId('rule'), text: '', isActive: true }]);
    };

    const handleRuleChange = (id: string, field: keyof LoreRule, value: string | boolean) => {
        setRules(prev => prev.map(rule =>
            rule.id === id ? { ...rule, [field]: value } : rule
        ));
    };

    const handleDeleteRule = (id: string) => {
        setRules(prev => prev.filter(rule => rule.id !== id));
    };

    const handleSaveAndApply = () => {
        const rulesToSave = rules.map(({ id, ...rest }) => ({...rest}));
        onSave(rulesToSave);
        onClose();
    };
    
    const handleSaveToFile = () => {
        try {
            const rulesToSave = rules.map(({ id, ...rest }) => ({...rest}));
            const jsonString = JSON.stringify(rulesToSave, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `game_ai_luat_le_${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Failed to save rules to file:", error);
            alert("Lỗi khi lưu tệp luật lệ.");
        }
    };

    const handleLoadFromFileClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target?.result;
                if (typeof content === 'string') {
                    const loadedRules = JSON.parse(content);
                    if (Array.isArray(loadedRules) && loadedRules.every(r => typeof r.text === 'string' && typeof r.isActive === 'boolean')) {
                        const rulesWithIds = loadedRules.map((rule) => ({
                            ...rule,
                            id: generateUniqueId('loaded-rule')
                        }));
                        setRules(rulesWithIds);
                    } else {
                        throw new Error("Invalid file format.");
                    }
                }
            } catch (error) {
                console.error("Failed to load or parse rule file:", error);
                alert("Tệp không hợp lệ hoặc bị hỏng.");
            }
        };
        reader.readAsText(file);
        if (event.target) {
            event.target.value = '';
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div 
                className="modal-content lore-modal-content" 
                onClick={e => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="lore-modal-title"
            >
                <header className="modal-header">
                    <h3 id="lore-modal-title">Nạp Tri Thức & Quản Lý Luật Lệ</h3>
                    <button onClick={onClose} className="modal-close-button" aria-label="Đóng bảng luật lệ">X</button>
                </header>
                <div className="modal-body">
                    <p className="lore-description">
                        Thêm luật lệ, vật phẩm, nhân vật, hoặc bất kỳ thông tin nào bạn muốn AI tuân theo. AI sẽ ưu tiên các luật lệ đang hoạt động. Luật lệ sẽ được áp dụng vào lượt sau.
                        <br/>
                        <strong>Ví dụ:</strong> "Tạo ra một thanh kiếm tên là 'Hỏa Long Kiếm' có khả năng phun lửa, miêu tả chi tiết hoặc nhờ AI tự viết ra." hoặc "KHÓA HÀNH ĐỘNG TÙY Ý".
                    </p>
                    <button className="lore-button add-new" onClick={handleAddRule}>+ Thêm Luật Mới</button>
                    <div className="lore-list">
                        {(rules || []).map(rule => (
                            <div key={rule.id} className="lore-item">
                                <textarea
                                    className="lore-textarea"
                                    value={rule.text}
                                    onChange={(e) => handleRuleChange(rule.id!, 'text', e.target.value)}
                                    placeholder="Nhập nội dung luật lệ tại đây..."
                                    rows={3}
                                />
                                <div className="lore-item-controls">
                                    <label className="lore-active-toggle">
                                        <input
                                            type="checkbox"
                                            checked={rule.isActive}
                                            onChange={(e) => handleRuleChange(rule.id!, 'isActive', e.target.checked)}
                                        />
                                        <span>Hoạt động</span>
                                    </label>
                                    <button className="lore-button delete" onClick={() => handleDeleteRule(rule.id!)}>Xóa</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <footer className="lore-footer">
                    <div className="lore-file-actions">
                        <button className="lore-button file-action" onClick={handleSaveToFile}>Lưu Luật Ra File</button>
                        <button className="lore-button file-action" onClick={handleLoadFromFileClick}>Tải Luật Từ File</button>
                        <input type="file" ref={fileInputRef} onChange={handleFileSelected} style={{ display: 'none' }} accept=".json" />
                    </div>
                    <div className="lore-main-actions">
                        <button className="lore-button cancel" onClick={onClose}>Hủy</button>
                        <button className="lore-button save-apply" onClick={handleSaveAndApply}>Lưu & Áp Dụng</button>
                    </div>
                </footer>
            </div>
        </div>
    );
};