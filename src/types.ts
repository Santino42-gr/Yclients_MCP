import { z } from 'zod';

// Базовые типы YClients API
export interface YClientsApiResponse<T = any> {
  success: boolean;
  data: T;
  meta?: {
    message?: string;
    code?: number;
  };
}

// Клиент
export const ClientSchema = z.object({
  id: z.number().optional(),
  name: z.string(),
  phone: z.string(),
  email: z.string().optional(),
  birth_date: z.string().optional(),
  sex_id: z.number().optional(), // 1 - мужской, 2 - женский
  discount: z.number().optional(),
  comment: z.string().optional(),
});

export type Client = z.infer<typeof ClientSchema>;

// Услуга
export const ServiceSchema = z.object({
  id: z.number(),
  title: z.string(),
  category_id: z.number(),
  price_min: z.number(),
  price_max: z.number(),
  duration: z.number(), // в минутах
  active: z.number(), // 1 - активна, 0 - неактивна
  staff: z.array(z.number()).optional(), // ID мастеров
});

export type Service = z.infer<typeof ServiceSchema>;

// Мастер (сотрудник)
export const StaffSchema = z.object({
  id: z.number(),
  name: z.string(),
  specialization: z.string().optional(),
  avatar: z.string().optional(),
  position: z.object({
    id: z.number(),
    title: z.string(),
  }).optional(),
  services: z.array(z.number()).optional(), // ID услуг
});

export type Staff = z.infer<typeof StaffSchema>;

// Запись
export const BookingSchema = z.object({
  id: z.number().optional(),
  company_id: z.number(),
  staff_id: z.number(),
  services: z.array(z.object({
    id: z.number(),
    title: z.string(),
    cost: z.number(),
    manual_cost: z.number().optional(),
    cost_per_unit: z.number(),
    first_cost: z.number(),
    amount: z.number(),
    discount: z.number(),
  })),
  client: z.object({
    id: z.number(),
    name: z.string(),
    phone: z.string(),
    email: z.string().optional(),
  }),
  datetime: z.string(), // ISO формат
  seance_length: z.number(), // длительность в минутах
  comment: z.string().optional(),
  save_if_busy: z.boolean().optional(),
  attendance: z.number().optional(), // 0 - не пришел, 1 - пришел, 2 - отмена
});

export type Booking = z.infer<typeof BookingSchema>;

// Расписание мастера
export const ScheduleSchema = z.object({
  staff_id: z.number(),
  date: z.string(), // YYYY-MM-DD
  times: z.array(z.object({
    time: z.string(), // HH:MM
    seance_length: z.number(),
    datetime: z.string(), // ISO формат
  })),
});

export type Schedule = z.infer<typeof ScheduleSchema>;

// Схемы валидации для MCP инструментов
export const BookAppointmentSchema = z.object({
  client_phone: z.string().regex(/^\+7\d{10}$/, "Телефон должен быть в формате +7XXXXXXXXXX"),
  client_name: z.string().min(1, "Имя клиента обязательно"),
  service_name: z.string().min(1, "Название услуги обязательно"),
  preferred_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Дата должна быть в формате YYYY-MM-DD"),
  preferred_time: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Время должно быть в формате HH:MM"),
  master_name: z.string().optional(),
  comment: z.string().optional(),
});

export type BookAppointmentRequest = z.infer<typeof BookAppointmentSchema>;

export const FindAvailableTimeSchema = z.object({
  service_name: z.string().min(1, "Название услуги обязательно"),
  date_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Дата должна быть в формате YYYY-MM-DD"),
  date_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Дата должна быть в формате YYYY-MM-DD"),
  master_name: z.string().optional(),
});

export type FindAvailableTimeRequest = z.infer<typeof FindAvailableTimeSchema>;

// Конфигурация
export interface YClientsConfig {
  baseUrl: string;
  bearerToken: string;
  companyId: number;
  rateLimitPerMinute?: number;
}

// Ошибки
export class YClientsApiError extends Error {
  constructor(
    public message: string,
    public statusCode?: number,
    public response?: any
  ) {
    super(message);
    this.name = 'YClientsApiError';
  }
}

export class ValidationError extends Error {
  constructor(public message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
} 