/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';

interface NoInfoPlaceholderProps {
    text?: string;
}

export const NoInfoPlaceholder = ({ text = "Không có thông tin." }: NoInfoPlaceholderProps) => (
    <p className="no-info-placeholder">{text}</p>
);