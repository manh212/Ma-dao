/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { GenerateContentParameters, Type } from "@google/genai";

// Recursive function to check for empty OBJECT types, which are invalid in the Gemini API.
function hasEmptyObject(schema: any): boolean {
    if (typeof schema !== 'object' || schema === null) {
        return false;
    }

    if (schema.type === Type.OBJECT) {
        // An OBJECT is empty if it has no 'properties' object, or if its 'properties' object is empty.
        // This is based on the API error "properties: should be non-empty for OBJECT type".
        if (!schema.properties || Object.keys(schema.properties).length === 0) {
            return true;
        }
        // If it has properties, recurse through them to check for nested empty objects.
        for (const key in schema.properties) {
            if (hasEmptyObject(schema.properties[key])) {
                return true;
            }
        }
    }

    // If the schema is an array, check its items' schema.
    if (schema.type === Type.ARRAY && schema.items) {
        return hasEmptyObject(schema.items);
    }

    return false;
}

/**
 * Validates the parameters for a `generateContent` call against common issues.
 * @param params The `GenerateContentParameters` to validate.
 * @returns An object indicating if the parameters are valid and an error message if not.
 */
export function validateRequestParameters(params: GenerateContentParameters): { isValid: boolean; error?: string } {
    // 1. Validate `contents`
    if (!params.contents) {
        return { isValid: false, error: "Lỗi xác thực: Thiếu trường 'contents'." };
    }
    if (typeof params.contents === 'string' && params.contents.trim() === '') {
        return { isValid: false, error: "Lỗi xác thực: Chuỗi 'contents' rỗng." };
    }
    if (typeof params.contents === 'object' && !Array.isArray(params.contents)) {
        if (!params.contents.parts || params.contents.parts.length === 0) {
            return { isValid: false, error: "Lỗi xác thực: Đối tượng 'contents' phải có một mảng 'parts' không rỗng." };
        }
    }

    // 2. Validate `responseSchema` for empty objects
    if (params.config?.responseSchema) {
        if (hasEmptyObject(params.config.responseSchema)) {
            return { isValid: false, error: "Lỗi xác thực: 'responseSchema' chứa một kiểu OBJECT trống, điều này không được phép." };
        }
    }
    
    // 3. Check for conflicting tools (e.g., googleSearch with responseSchema)
    if (params.config?.tools?.some(t => t.googleSearch)) {
        if (params.config.responseMimeType || params.config.responseSchema) {
             return { isValid: false, error: "Lỗi xác thực: Không thể sử dụng 'responseMimeType' hoặc 'responseSchema' cùng với công cụ 'googleSearch'." };
        }
    }

    // All checks passed
    return { isValid: true };
}