/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
// FIX: Import React to bring the 'React' namespace into scope for types like React.RefObject.
import React, { useEffect, useRef } from 'react';

const FOCUSABLE_SELECTORS = 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
const MAIN_CONTENT_ID = 'main-content';

export const useModalAccessibility = (isOpen: boolean, modalRef: React.RefObject<HTMLElement>) => {
    const triggerElementRef = useRef<Element | null>(null);

    useEffect(() => {
        if (!isOpen) return;

        // Store the element that was focused before the modal opened
        triggerElementRef.current = document.activeElement;

        const mainContent = document.getElementById(MAIN_CONTENT_ID);
        if (mainContent) {
            mainContent.setAttribute('aria-hidden', 'true');
        }

        const focusableElements = modalRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS);
        if (!focusableElements || focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        // Move focus into the modal
        // Use a timeout to ensure the element is focusable after rendering
        const focusTimeout = setTimeout(() => {
            firstElement?.focus();
        }, 100);

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key !== 'Tab') return;

            if (event.shiftKey) { // Shift + Tab
                if (document.activeElement === firstElement) {
                    event.preventDefault();
                    lastElement.focus();
                }
            } else { // Tab
                if (document.activeElement === lastElement) {
                    event.preventDefault();
                    firstElement.focus();
                }
            }
        };

        const modalNode = modalRef.current;
        modalNode?.addEventListener('keydown', handleKeyDown);

        return () => {
            clearTimeout(focusTimeout);
            modalNode?.removeEventListener('keydown', handleKeyDown);

            if (mainContent) {
                mainContent.removeAttribute('aria-hidden');
            }

            // Restore focus to the trigger element
            (triggerElementRef.current as HTMLElement)?.focus();
        };
    }, [isOpen, modalRef]);
};