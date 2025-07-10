import { z } from 'zod';
/**
 * Валидирует данные с помощью Zod схемы
 */
export declare function validateData<T>(schema: z.ZodSchema<T>, data: unknown): T;
/**
 * Нормализует номер телефона к формату +7XXXXXXXXXX
 */
export declare function normalizePhone(phone: string): string;
/**
 * Проверяет, что дата не в прошлом
 */
export declare function validateFutureDate(dateString: string): boolean;
/**
 * Проверяет корректность временного интервала
 */
export declare function validateTimeRange(timeFrom: string, timeTo: string): boolean;
/**
 * Форматирует дату в ISO строку для YClients API
 */
export declare function formatDateTimeForYClients(date: string, time: string): string;
/**
 * Поиск услуги по названию (нечеткое совпадение)
 */
export declare function findServiceByName<T extends {
    id: number;
    title: string;
}>(services: T[], searchName: string): T[];
/**
 * Поиск мастера по имени (нечеткое совпадение)
 */
export declare function findStaffByName<T extends {
    id: number;
    name: string;
}>(staff: T[], searchName: string): T[];
//# sourceMappingURL=validation.d.ts.map