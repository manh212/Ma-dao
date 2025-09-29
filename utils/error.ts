/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

/**
 * Parses a generic error object and returns a user-friendly Vietnamese error message.
 * @param error The error object, can be of any type.
 * @param context A string describing the context where the error occurred (e.g., "xử lý lượt chơi").
 * @returns A user-friendly error string.
 */
export const getApiErrorMessage = (error: unknown, context: string): string => {
    console.error(`Lỗi khi ${context}:`, error);
    const originalErrorMessage = error instanceof Error ? error.message : String(error);
    const lowerCaseErrorMessage = originalErrorMessage.toLowerCase();
    let userFriendlyError = `Lỗi khi ${context}: `;

    if (lowerCaseErrorMessage.includes('token') && (lowerCaseErrorMessage.includes('exceeds') || lowerCaseErrorMessage.includes('limit'))) {
        return userFriendlyError + "Bối cảnh câu chuyện đã vượt quá giới hạn token của AI. Mặc dù hệ thống đã cố gắng tự động tóm tắt, yêu cầu vẫn quá lớn. Điều này có thể xảy ra trong các màn chơi rất dài hoặc phức tạp. Hãy thử một hành động đơn giản hơn để tiếp tục.";
    }
    if (lowerCaseErrorMessage.includes('[safety]') || lowerCaseErrorMessage.includes('blocked')) {
        return userFriendlyError + "Nội dung bị chặn do chính sách an toàn của AI. Vui lòng điều chỉnh hành động và thử lại.";
    }
    if (lowerCaseErrorMessage.includes('429') || lowerCaseErrorMessage.includes('rate limit')) {
        return userFriendlyError + "Bạn đã gửi quá nhiều yêu cầu. Vui lòng chờ một lát rồi thử lại.";
    }
    if (lowerCaseErrorMessage.includes('invalidturnstructure')) {
        return userFriendlyError + "AI không cung cấp đủ diễn biến truyện hoặc hành động tiếp theo. Điều này có thể do yêu cầu quá phức tạp. Vui lòng thử một hành động khác đơn giản hơn.";
    }
    if (lowerCaseErrorMessage.includes('emptyairesponse') || lowerCaseErrorMessage.includes('empty or invalid response') || lowerCaseErrorMessage.includes('empty response') || lowerCaseErrorMessage.includes('invalid string length')) {
        return userFriendlyError + "AI đã trả về một phản hồi rỗng hoặc không hợp lệ. Điều này có thể do lỗi mạng tạm thời, lỗi máy chủ AI, hoặc yêu cầu quá phức tạp. Vui lòng thử lại.";
    }
    if (lowerCaseErrorMessage.includes('json') || lowerCaseErrorMessage.includes('unexpected token')) {
        return userFriendlyError + "AI đã trả về dữ liệu không đúng định dạng. Hãy thử thay đổi hành động của bạn hoặc thử lại.";
    }
    if (lowerCaseErrorMessage.includes('schema') || lowerCaseErrorMessage.includes('field is required')) {
        return userFriendlyError + "AI đã trả về dữ liệu không tuân thủ cấu trúc yêu cầu (lỗi schema). Vui lòng thử lại hành động.";
    }
    if (lowerCaseErrorMessage.includes('api key') || lowerCaseErrorMessage.includes('permission')) {
        return userFriendlyError + "Lỗi xác thực API Key. Hệ thống đã tự động thử một key khác (nếu có). Vui lòng thử lại.";
    }
    if (lowerCaseErrorMessage.includes('timed out') || lowerCaseErrorMessage.includes('network')) {
        return userFriendlyError + "Lỗi kết nối mạng hoặc máy chủ AI không phản hồi. Vui lòng thử lại.";
    }
    if (lowerCaseErrorMessage.includes('500') || lowerCaseErrorMessage.includes('503') || lowerCaseErrorMessage.includes('server')) {
        return userFriendlyError + "Lỗi máy chủ AI. Vui lòng thử lại sau giây lát.";
    }
    
    return userFriendlyError + `Đã xảy ra lỗi không xác định: ${originalErrorMessage}. Vui lòng thử lại.`;
};