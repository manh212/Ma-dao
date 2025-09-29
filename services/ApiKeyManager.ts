/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { GoogleGenAI, GenerateContentParameters, GenerateContentResponse } from "@google/genai";

interface ApiConfig {
    key: string;
    // The provider property is now obsolete and will be ignored if present.
    provider?: 'gemini' | 'other';
}

// The default key is a fallback from environment variables.
const DEFAULT_API_KEY = process.env.API_KEY;

const ApiKeyManager = {
  keys: [] as string[],
  currentIndex: 0,
  isUsingDefault: false,
  
  loadKeys: function() {
    let configs: ApiConfig[] = [];
    const storedConfigs = localStorage.getItem('api_configs');
    
    if (storedConfigs) {
      try {
        // This will correctly parse arrays of {key: string} and also older arrays of {key: string, provider: 'gemini'}
        const parsed = JSON.parse(storedConfigs);
        if(Array.isArray(parsed)) configs = parsed;
      } catch (e) {
        // If parsing fails, try to see if it's the very old format (plain string keys)
        const oldKeys = localStorage.getItem('user_api_keys');
        if (oldKeys) {
            configs = oldKeys.split(/[\n\s,]+/).filter(Boolean).map(k => ({ key: k }));
            // Save in the new format and remove the old one
            localStorage.setItem('api_configs', JSON.stringify(configs));
            localStorage.removeItem('user_api_keys');
        }
      }
    }
    
    const personalKeys = configs
        .map(c => c.key?.trim()) // Safely access key and trim
        .filter((key): key is string => !!key); // Filter out empty or undefined keys
    
    this.currentIndex = 0;

    if (personalKeys.length > 0) {
        this.keys = personalKeys;
        this.isUsingDefault = false;
    } else if (DEFAULT_API_KEY) {
        this.keys = [DEFAULT_API_KEY];
        this.isUsingDefault = true;
    } else {
        this.keys = [];
        this.isUsingDefault = false;
    }
  },
  
  getKey: function(): string | null {
    if (this.keys.length === 0) {
      this.loadKeys(); // Attempt to reload if keys are missing
    }
    return this.keys.length > 0 ? this.keys[this.currentIndex] : null;
  },
  
  rotateKey: function() {
    if (this.keys.length > 1) {
      this.currentIndex = (this.currentIndex + 1) % this.keys.length;
      console.log(`Rotated to Gemini API key index: ${this.currentIndex}`);
    }
  },
  
  getAiClient: function() {
    const key = this.getKey();
    if (!key) {
        throw new Error("Không có API Key nào được cấu hình. Vui lòng thêm key cá nhân hoặc đảm bảo API Key mặc định được thiết lập.");
    }
    return new GoogleGenAI({ apiKey: key });
  },
  
  generateContentWithRetry: async function(
    params: GenerateContentParameters,
    addToast: (message: string, type?: 'info' | 'success' | 'error' | 'warning') => void,
    incrementRequestCount: () => void,
    options?: { safetySettings?: any[] }
  ): Promise<GenerateContentResponse> {
    const maxKeyAttempts = this.keys.length > 0 ? this.keys.length : 1;
    let lastError: any = new Error("Không thể thực hiện yêu cầu API. Vui lòng kiểm tra API Key của bạn.");

    for (let keyAttempt = 0; keyAttempt < maxKeyAttempts; keyAttempt++) {
        const maxRetries = 2; // 1 initial + 2 retries
        let lastRetryError: any = null;

        for (let retryAttempt = 0; retryAttempt <= maxRetries; retryAttempt++) {
            incrementRequestCount();
            
            const currentParams = { ...params };
            if (options?.safetySettings) {
                currentParams.config = { ...currentParams.config, safetySettings: options.safetySettings };
            }

            let isRecoverableError = false;
            if (lastRetryError) {
                const lowerCaseMessage = (lastRetryError.message || '').toLowerCase();
                isRecoverableError = lowerCaseMessage.includes('schema') || lowerCaseMessage.includes('json') || lowerCaseMessage.includes('emptyairesponse') || lowerCaseMessage.includes('blocked');
            }

            if (retryAttempt > 0 && isRecoverableError) {
                const correctionMandate = `**MỆNH LỆNH SỬA LỖI (ƯU TIÊN TUYỆT ĐỐI):** Ở lần thực thi trước, bạn đã trả về lỗi: "${lastRetryError.message}". Đây là một lỗi nghiêm trọng. Lần này, bạn BẮT BUỘC phải kiểm tra kỹ lưỡng và đảm bảo tuân thủ 100% schema và các quy tắc định dạng.`;
                if (typeof currentParams.contents === 'string') {
                    currentParams.contents = `${correctionMandate}\n\n${currentParams.contents}`;
                }
                if (retryAttempt === 2) {
                    currentParams.config = { ...currentParams.config, temperature: 0.4 };
                }
            }
            
            try {
                const ai = this.getAiClient();
                const response = await ai.models.generateContent(currentParams);

                if (!response.text?.trim()) {
                    throw new Error("EmptyAIResponse: AI đã trả về một phản hồi rỗng.");
                }

                return response; // Success
            } catch (error: any) {
                lastError = error;
                lastRetryError = error;
                const lowerCaseMessage = (error.message || '').toLowerCase();

                const isKeySpecificError = lowerCaseMessage.includes('429') ||
                                           lowerCaseMessage.includes('rate limit') ||
                                           lowerCaseMessage.includes('quota') ||
                                           lowerCaseMessage.includes('api key not valid') ||
                                           lowerCaseMessage.includes('permission denied') ||
                                           lowerCaseMessage.includes('billing');
                
                const isTransientError = lowerCaseMessage.includes('500') ||
                                         lowerCaseMessage.includes('503') ||
                                         lowerCaseMessage.includes('server') ||
                                         lowerCaseMessage.includes('network') ||
                                         lowerCaseMessage.includes('timed out');
                
                // If it's a key-specific error, don't waste time on retries. Break to rotate key.
                if (isKeySpecificError) {
                    break;
                }

                if (retryAttempt < maxRetries) {
                    if (isTransientError) {
                        const delay = Math.pow(2, retryAttempt) * 1000;
                        addToast(`Lỗi máy chủ AI. Thử lại sau ${delay / 1000}s...`, 'warning');
                        await new Promise(resolve => setTimeout(resolve, delay));
                    } else if (isRecoverableError) {
                        const message = retryAttempt === 0 ? "AI trả về lỗi có thể phục hồi. Thử lại với mệnh lệnh sửa lỗi..." : "Vẫn thất bại. Thử lại với temperature thấp hơn...";
                        addToast(message, 'warning');
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    } else {
                        // For other fatal errors, break immediately
                        break;
                    }
                }
            }
        } // End retry loop

        // After breaking from the retry loop, check if there are more keys to try.
        if (keyAttempt < maxKeyAttempts - 1) {
            const currentKeyIndex = this.getCurrentIndex();
            addToast(`API Key ${currentKeyIndex + 1}/${maxKeyAttempts} gặp lỗi. Đang thử key tiếp theo...`, 'warning');
            this.rotateKey();
        } else {
            // This was the last key. Throw the last captured error.
            this.rotateKey(); // Rotate for the next user action anyway
            throw lastError;
        }
    }
    
    // This part should not be reachable, but as a safeguard:
    throw lastError;
  },
  
  getCurrentIndex: function(): number {
    return this.keys.length > 0 ? this.currentIndex : -1;
  }
};

ApiKeyManager.loadKeys(); // Load keys on initial script load

export { ApiKeyManager };
