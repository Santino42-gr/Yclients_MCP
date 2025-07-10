"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationError = exports.YClientsApiError = exports.FindAvailableTimeSchema = exports.BookAppointmentSchema = exports.ScheduleSchema = exports.BookingSchema = exports.StaffSchema = exports.ServiceSchema = exports.ClientSchema = void 0;
const zod_1 = require("zod");
// Клиент
exports.ClientSchema = zod_1.z.object({
    id: zod_1.z.number().optional(),
    name: zod_1.z.string(),
    phone: zod_1.z.string(),
    email: zod_1.z.string().optional(),
    birth_date: zod_1.z.string().optional(),
    sex_id: zod_1.z.number().optional(), // 1 - мужской, 2 - женский
    discount: zod_1.z.number().optional(),
    comment: zod_1.z.string().optional(),
});
// Услуга
exports.ServiceSchema = zod_1.z.object({
    id: zod_1.z.number(),
    title: zod_1.z.string(),
    category_id: zod_1.z.number(),
    price_min: zod_1.z.number(),
    price_max: zod_1.z.number(),
    duration: zod_1.z.number(), // в минутах
    active: zod_1.z.number(), // 1 - активна, 0 - неактивна
    staff: zod_1.z.array(zod_1.z.number()).optional(), // ID мастеров
});
// Мастер (сотрудник)
exports.StaffSchema = zod_1.z.object({
    id: zod_1.z.number(),
    name: zod_1.z.string(),
    specialization: zod_1.z.string().optional(),
    avatar: zod_1.z.string().optional(),
    position: zod_1.z.object({
        id: zod_1.z.number(),
        title: zod_1.z.string(),
    }).optional(),
    services: zod_1.z.array(zod_1.z.number()).optional(), // ID услуг
});
// Запись
exports.BookingSchema = zod_1.z.object({
    id: zod_1.z.number().optional(),
    company_id: zod_1.z.number(),
    staff_id: zod_1.z.number(),
    services: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.number(),
        title: zod_1.z.string(),
        cost: zod_1.z.number(),
        manual_cost: zod_1.z.number().optional(),
        cost_per_unit: zod_1.z.number(),
        first_cost: zod_1.z.number(),
        amount: zod_1.z.number(),
        discount: zod_1.z.number(),
    })),
    client: zod_1.z.object({
        id: zod_1.z.number(),
        name: zod_1.z.string(),
        phone: zod_1.z.string(),
        email: zod_1.z.string().optional(),
    }),
    datetime: zod_1.z.string(), // ISO формат
    seance_length: zod_1.z.number(), // длительность в минутах
    comment: zod_1.z.string().optional(),
    save_if_busy: zod_1.z.boolean().optional(),
    attendance: zod_1.z.number().optional(), // 0 - не пришел, 1 - пришел, 2 - отмена
});
// Расписание мастера
exports.ScheduleSchema = zod_1.z.object({
    staff_id: zod_1.z.number(),
    date: zod_1.z.string(), // YYYY-MM-DD
    times: zod_1.z.array(zod_1.z.object({
        time: zod_1.z.string(), // HH:MM
        seance_length: zod_1.z.number(),
        datetime: zod_1.z.string(), // ISO формат
    })),
});
// Схемы валидации для MCP инструментов
exports.BookAppointmentSchema = zod_1.z.object({
    client_phone: zod_1.z.string().regex(/^\+7\d{10}$/, "Телефон должен быть в формате +7XXXXXXXXXX"),
    client_name: zod_1.z.string().min(1, "Имя клиента обязательно"),
    service_name: zod_1.z.string().min(1, "Название услуги обязательно"),
    preferred_date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Дата должна быть в формате YYYY-MM-DD"),
    preferred_time: zod_1.z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Время должно быть в формате HH:MM"),
    master_name: zod_1.z.string().optional(),
    comment: zod_1.z.string().optional(),
});
exports.FindAvailableTimeSchema = zod_1.z.object({
    service_name: zod_1.z.string().min(1, "Название услуги обязательно"),
    date_from: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Дата должна быть в формате YYYY-MM-DD"),
    date_to: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Дата должна быть в формате YYYY-MM-DD"),
    master_name: zod_1.z.string().optional(),
});
// Ошибки
class YClientsApiError extends Error {
    message;
    statusCode;
    response;
    constructor(message, statusCode, response) {
        super(message);
        this.message = message;
        this.statusCode = statusCode;
        this.response = response;
        this.name = 'YClientsApiError';
    }
}
exports.YClientsApiError = YClientsApiError;
class ValidationError extends Error {
    message;
    field;
    constructor(message, field) {
        super(message);
        this.message = message;
        this.field = field;
        this.name = 'ValidationError';
    }
}
exports.ValidationError = ValidationError;
//# sourceMappingURL=types.js.map