/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';

interface ToggleSwitchProps {
    label: string;
    description: string;
    name: string;
    checked: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    id: string;
}

export const ToggleSwitch = ({ label, description, name, checked, onChange, id }: ToggleSwitchProps) => (
    <div className="toggle-switch-wrapper">
        <label className="toggle-switch" htmlFor={id}>
            <input
                type="checkbox"
                name={name}
                checked={checked}
                onChange={onChange}
                id={id}
                aria-labelledby={`${id}-label`}
                aria-describedby={`${id}-desc`}
            />
            <span className="slider"></span>
        </label>
        <div className="toggle-label">
            <strong id={`${id}-label`}>{label}</strong>
            <span id={`${id}-desc`}>{description}</span>
        </div>
    </div>
);