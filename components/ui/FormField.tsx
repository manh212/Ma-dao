/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';

interface FormFieldProps {
    label: string;
    children: React.ReactNode;
    htmlFor: string;
}

export const FormField = ({ label, children, htmlFor }: FormFieldProps) => (
    <div className="form-field">
        <label htmlFor={htmlFor}>{label}</label>
        {children}
    </div>
);