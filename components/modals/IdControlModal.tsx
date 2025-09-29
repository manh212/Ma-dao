
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useMemo, useEffect } from 'react';
import './IdControlModal.css';
import { useGameContext } from '../contexts/GameContext';
import { mapCharacterToIdStructure } from '../../utils/idControl';
import * as db from '../../services/db';
import type { SaveFile, Character, IdDataSystem } from '../../types';

interface IdControlModalProps {
    saves: SaveFile[];
    onClose: () => void;
    initialSelectedSaveId?: string;
    initialSelectedEntityId?: string;
}

export const IdControlModal = ({ saves, onClose, initialSelectedSaveId, initialSelectedEntityId }: IdControlModalProps) => {
    const [selectedSaveId, setSelectedSaveId] = useState<string | null>(null);
    const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
    const [idData, setIdData] = useState<IdDataSystem[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(false);

     useEffect(() => {
        if (initialSelectedSaveId) {
            setSelectedSaveId(initialSelectedSaveId);
        }
        if (initialSelectedEntityId) {
            setSelectedEntityId(initialSelectedEntityId);
        }
    }, [initialSelectedSaveId, initialSelectedEntityId]);

    const selectedSave = useMemo(() => {
        if (!selectedSaveId) return null;
        return saves.find(s => s.id === selectedSaveId) || null;
    }, [selectedSaveId, saves]);

    const entities = useMemo(() => {
        if (!selectedSave) return [];
        const pc = selectedSave.gameState.character;
        const npcs = selectedSave.gameState.knowledgeBase.npcs || [];
        return [pc, ...npcs].filter(Boolean);
    }, [selectedSave]);

    const selectedEntity = useMemo(() => {
        if (!selectedEntityId) return null;
        return entities.find(e => e.id === selectedEntityId) || null;
    }, [selectedEntityId, entities]);

    useEffect(() => {
        const fetchData = () => {
            if (!selectedSave || !selectedEntityId || !selectedEntity) {
                setIdData([]);
                return;
            }
            setIsLoadingData(true);
            
            // New logic: Check for embedded data first
            if (selectedSave.idControlData && selectedSave.idControlData[selectedEntityId]) {
                setIdData(selectedSave.idControlData[selectedEntityId]);
            } else {
                // Fallback for older saves or missing data: generate on the fly
                console.warn(`ID Control data not found in save file for entity ${selectedEntityId}. Generating fallback data.`);
                setIdData(mapCharacterToIdStructure(selectedEntity));
            }
            
            setIsLoadingData(false);
        };

        fetchData();
    }, [selectedSave, selectedEntityId, selectedEntity]);


    const handleSelectSave = (saveId: string) => {
        setSelectedSaveId(saveId);
        setSelectedEntityId(null); // Reset entity selection when save changes
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content id-control-modal" onClick={e => e.stopPropagation()}>
                <header className="modal-header">
                    <h3>Bảng Điều Khiển ID</h3>
                    <button onClick={onClose} className="modal-close-button" aria-label="Đóng">×</button>
                </header>
                <div className="id-control-body">
                    {/* Column 1: Save Files */}
                    <div className="id-column saves-column">
                        <div className="id-column-header">Tệp Lưu</div>
                        <ul className="id-list">
                            {saves.map(save => (
                                <li 
                                    key={save.id} 
                                    className={`id-list-item save-item ${selectedSaveId === save.id ? 'active' : ''}`}
                                    onClick={() => handleSelectSave(save.id)}
                                >
                                    <span className="item-icon">💾</span>
                                    <div className="item-details">
                                        <span className="item-name">{save.name}</span>
                                        <span className="item-meta">{new Date(save.timestamp).toLocaleString('vi-VN')}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Column 2: Entities */}
                    <div className="id-column entities-column">
                        <div className="id-column-header">Thực Thể</div>
                        <ul className="id-list">
                            {entities.map(entity => (
                                <li 
                                    key={entity.id}
                                    className={`id-list-item entity-item ${selectedEntityId === entity.id ? 'active' : ''}`}
                                    onClick={() => setSelectedEntityId(entity.id)}
                                >
                                    <span className="item-icon">{entity.id === selectedSave?.gameState.character.id ? '👤' : '👥'}</span>
                                    <div className="item-details">
                                        <span className="item-name">{entity.displayName}</span>
                                        <span className="item-meta">{entity.id}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Column 3: ID Data */}
                    <div className="id-column data-column">
                        <div className="id-column-header">Dữ Liệu ID</div>
                        <div className="id-data-view">
                            {isLoadingData ? (
                                <div className="no-data-placeholder"><div className="spinner spinner-md"></div></div>
                            ) : idData.length > 0 ? idData.map(system => (
                                <div key={system.systemId} className="id-system-group">
                                    <h5 className="system-title">{system.systemId} - {system.systemName}</h5>
                                    <ul className="id-data-list">
                                        {system.items.map(item => (
                                            <li key={item.id} className="id-data-item">
                                                <div className="data-item-header">
                                                    <span className={`data-item-id ${item.type}`}>{item.id}</span>
                                                    <span className="data-item-label">{item.label}</span>
                                                </div>
                                                <div className="data-item-value-wrapper">
                                                    <pre className="data-item-value">{String(item.value)}</pre>
                                                </div>
                                                <div className="data-item-notes">
                                                    <strong>Ghi chú:</strong> <span>{item.notes || '...'}</span>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )) : (
                                <div className="no-data-placeholder">
                                    <span>Chọn một Thực thể để xem Dữ liệu ID</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
