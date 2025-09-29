/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { createContext, useState, useContext, useCallback, ReactNode } from 'react';
import { generateUniqueId } from '../../utils/id';

export interface DebugPrompt {
    id: string;
    timestamp: string;
    purpose: string;
    content: string;
}

interface DebugContextType {
    prompts: DebugPrompt[];
    addDebugPrompt: (content: string, purpose: string) => void;
    clearDebugPrompts: () => void;
}

const DebugContext = createContext<DebugContextType | undefined>(undefined);

export const DebugProvider = ({ children }: { children?: ReactNode }) => {
    const [prompts, setPrompts] = useState<DebugPrompt[]>([]);

    const addDebugPrompt = useCallback((content: string, purpose: string) => {
        const newPrompt: DebugPrompt = {
            id: generateUniqueId('prompt'),
            timestamp: new Date().toISOString(),
            purpose,
            content,
        };
        setPrompts(prev => [...prev, newPrompt]);
    }, []);

    const clearDebugPrompts = useCallback(() => {
        setPrompts([]);
    }, []);

    return (
        <DebugContext.Provider value={{ prompts, addDebugPrompt, clearDebugPrompts }}>
            {children}
        </DebugContext.Provider>
    );
};

export const useDebugContext = () => {
    const context = useContext(DebugContext);
    if (!context) {
        throw new Error('useDebugContext must be used within a DebugProvider');
    }
    return context;
};