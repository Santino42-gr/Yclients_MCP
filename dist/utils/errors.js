"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleYClientsError = handleYClientsError;
exports.formatErrorForUser = formatErrorForUser;
exports.logError = logError;
const types_1 = require("../types");
const axios_1 = require("axios");
/**
 * Обрабатывает ошибки от YClients API
 */
function handleYClientsError(error) {
    if (error instanceof axios_1.AxiosError) {
        const status = error.response?.status;
        const data = error.response?.data;
        let message = 'Ошибка при обращении к YClients API';
        switch (status) {
            case 401:
                message = 'Ошибка авторизации. Проверьте Bearer token';
                break;
            case 403:
                message = 'Недостаточно прав доступа';
                break;
            case 404:
                message = 'Ресурс не найден';
                break;
            case 429:
                message = 'Превышен лимит запросов. Попробуйте позже';
                break;
            case 500:
                message = 'Внутренняя ошибка сервера YClients';
                break;
            default:
                if (data?.meta?.message) {
                    message = data.meta.message;
                }
        }
        throw new types_1.YClientsApiError(message, status, data);
    }
    if (error instanceof types_1.ValidationError) {
        throw error;
    }
    throw new types_1.YClientsApiError(error.message || 'Неизвестная ошибка при работе с YClients API');
}
/**
 * Создает описание ошибки для пользователя
 */
function formatErrorForUser(error) {
    if (error instanceof types_1.ValidationError) {
        return `❌ Ошибка валидации: ${error.message}`;
    }
    if (error instanceof types_1.YClientsApiError) {
        return `❌ Ошибка API: ${error.message}`;
    }
    return `❌ Произошла ошибка: ${error.message || 'Неизвестная ошибка'}`;
}
/**
 * Логирует ошибку с подробностями
 */
function logError(error, context) {
    const timestamp = new Date().toISOString();
    const contextStr = context ? `[${context}] ` : '';
    console.error(`${timestamp} ${contextStr}ERROR:`, {
        name: error.name,
        message: error.message,
        statusCode: error.statusCode,
        stack: error.stack,
    });
    if (error.response) {
        console.error('Response data:', error.response);
    }
}
//# sourceMappingURL=errors.js.map