/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import JSZip from 'jszip';
import type React from 'react';
import { removeAccents } from './text';
import * as db from '../services/db';
import type { SaveFile } from '../types';

type ToastFn = (message: string, type?: 'info' | 'success' | 'error' | 'warning') => void;

/**
 * Creates a zip file from a save file object and initiates a download.
 * @param saveFile The save file to download.
 * @param addToast A function to show toast notifications.
 */
export const downloadSaveFile = async (
    saveFile: SaveFile,
    addToast: ToastFn
): Promise<void> => {
    try {
        const zip = new JSZip();
        
        const saveObject = {
            ...saveFile,
            gameState: { ...saveFile.gameState, history: [] }, // Strip history for smaller file size
        };

        zip.file("saveFile.json", JSON.stringify(saveObject, null, 2));

        const blob = await zip.generateAsync({ type: "blob" });

        const unaccentedTitle = removeAccents(saveFile.name);
        const sanitizedTitle = unaccentedTitle.replace(/\s+/g, '_').replace(/[^a-z0-9_]/gi, '').toLowerCase();
        const timestampStr = new Date(saveFile.timestamp).toISOString().slice(0, 10);
        const fileName = `${sanitizedTitle}_${timestampStr}.zip`;

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        addToast(`Đã tải tệp lưu "${fileName}" thành công!`, 'success');

    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("Lỗi khi tải tệp lưu .zip:", error);
        addToast(`Không thể tải tệp. Lỗi: ${message}`, 'error');
    }
};


/**
 * Processes uploaded save files (.zip), confirms overwrites, and merges them into the database.
 * @param event The file input change event.
 * @param existingSaves The current list of save files to check for overwrites.
 * @param addToast A function to show toast notifications.
 * @returns The updated list of all save files after processing, or null if the operation was cancelled.
 */
export const uploadAndProcessSaveFiles = async (
    event: React.ChangeEvent<HTMLInputElement>,
    existingSaves: SaveFile[],
    addToast: ToastFn
): Promise<SaveFile[] | null> => {
    const files = event.target.files;
    if (!files || files.length === 0) return null;

    const errors: string[] = [];
    const allSavesToProcess: SaveFile[] = [];

    for (const file of Array.from(files)) {
        try {
            if (!file.name.toLowerCase().endsWith('.zip')) {
                errors.push(`Tệp ${file.name} có định dạng không được hỗ trợ. Chỉ chấp nhận tệp .zip.`);
                continue;
            }

            const zip = await JSZip.loadAsync(file);
            const saveFileEntry = zip.file("saveFile.json");
            if (!saveFileEntry) {
                throw new Error(`Tệp ${file.name} không chứa saveFile.json.`);
            }
        
            const saveFileContent = await saveFileEntry.async("string");
            const saveFile: SaveFile = JSON.parse(saveFileContent);
            if (!saveFile || !saveFile.id) {
                throw new Error(`saveFile.json trong ${file.name} không hợp lệ.`);
            }
            
            allSavesToProcess.push(saveFile);

        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            errors.push(`Lỗi xử lý tệp ${file.name}: ${message}`);
        }
    }
    
    if (errors.length > 0) {
        console.error("Không thể tải một số tệp:", errors);
        addToast(`Không thể tải ${errors.length} tệp. Kiểm tra console để biết chi tiết.`, 'error');
    }
    
    if (allSavesToProcess.length === 0) {
        if (event.target) event.target.value = '';
        return null;
    }

    const existingSaveIds = new Set(existingSaves.map(s => s.id));
    const overwritingSaves = allSavesToProcess.filter(s => existingSaveIds.has(s.id));

    if (overwritingSaves.length > 0) {
        const confirmed = window.confirm(
            `Bạn sắp ghi đè ${overwritingSaves.length} tệp lưu đã tồn tại:\n\n` +
            `${overwritingSaves.map(s => s.name).join('\n')}\n\n` +
            `Bạn có muốn tiếp tục không?`
        );
        if (!confirmed) {
            if (event.target) event.target.value = '';
            addToast('Đã hủy thao tác tải lên.', 'info');
            return null;
        }
    }

    try {
        await Promise.all(allSavesToProcess.map(save => db.addOrUpdateSave(save)));
        
        const allSaves = await db.getAllSaves();
        addToast(`Đã tải lên và hợp nhất thành công ${allSavesToProcess.length} tệp lưu.`, 'success');
        return allSaves;

    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("Lỗi khi hợp nhất các tệp lưu vào DB:", error);
        addToast(`Đã xảy ra lỗi khi hợp nhất các tệp lưu: ${message}`, 'error');
        return null;
    } finally {
        if (event.target) {
            event.target.value = '';
        }
    }
};