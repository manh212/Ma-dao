/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export const generateUniqueId = (() => {
    let counter = 0;
    return (prefix = 'id') => {
        counter += 1;
        return `${prefix}-${Date.now()}-${counter}`;
    };
})();
