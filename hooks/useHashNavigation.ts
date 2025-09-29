/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { useState, useEffect } from 'react';

export const useHashNavigation = () => {
    const [hash, setHash] = useState(window.location.hash.substring(1) || 'menu');

    useEffect(() => {
        const handleHashChange = () => { setHash(window.location.hash.substring(1) || 'menu'); };
        window.addEventListener('hashchange', handleHashChange, false);
        return () => window.removeEventListener('hashchange', handleHashChange, false);
    }, []);
    
    return hash;
};
