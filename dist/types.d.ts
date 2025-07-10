import { z } from 'zod';
export interface YClientsApiResponse<T = any> {
    success: boolean;
    data: T;
    meta?: {
        message?: string;
        code?: number;
    };
}
export declare const ClientSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodNumber>;
    name: z.ZodString;
    phone: z.ZodString;
    email: z.ZodOptional<z.ZodString>;
    birth_date: z.ZodOptional<z.ZodString>;
    sex_id: z.ZodOptional<z.ZodNumber>;
    discount: z.ZodOptional<z.ZodNumber>;
    comment: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    phone: string;
    id?: number | undefined;
    email?: string | undefined;
    birth_date?: string | undefined;
    sex_id?: number | undefined;
    discount?: number | undefined;
    comment?: string | undefined;
}, {
    name: string;
    phone: string;
    id?: number | undefined;
    email?: string | undefined;
    birth_date?: string | undefined;
    sex_id?: number | undefined;
    discount?: number | undefined;
    comment?: string | undefined;
}>;
export type Client = z.infer<typeof ClientSchema>;
export declare const ServiceSchema: z.ZodObject<{
    id: z.ZodNumber;
    title: z.ZodString;
    category_id: z.ZodNumber;
    price_min: z.ZodNumber;
    price_max: z.ZodNumber;
    duration: z.ZodNumber;
    active: z.ZodNumber;
    staff: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
}, "strip", z.ZodTypeAny, {
    id: number;
    title: string;
    category_id: number;
    price_min: number;
    price_max: number;
    duration: number;
    active: number;
    staff?: number[] | undefined;
}, {
    id: number;
    title: string;
    category_id: number;
    price_min: number;
    price_max: number;
    duration: number;
    active: number;
    staff?: number[] | undefined;
}>;
export type Service = z.infer<typeof ServiceSchema>;
export declare const StaffSchema: z.ZodObject<{
    id: z.ZodNumber;
    name: z.ZodString;
    specialization: z.ZodOptional<z.ZodString>;
    avatar: z.ZodOptional<z.ZodString>;
    position: z.ZodOptional<z.ZodObject<{
        id: z.ZodNumber;
        title: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: number;
        title: string;
    }, {
        id: number;
        title: string;
    }>>;
    services: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
}, "strip", z.ZodTypeAny, {
    id: number;
    name: string;
    specialization?: string | undefined;
    avatar?: string | undefined;
    position?: {
        id: number;
        title: string;
    } | undefined;
    services?: number[] | undefined;
}, {
    id: number;
    name: string;
    specialization?: string | undefined;
    avatar?: string | undefined;
    position?: {
        id: number;
        title: string;
    } | undefined;
    services?: number[] | undefined;
}>;
export type Staff = z.infer<typeof StaffSchema>;
export declare const BookingSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodNumber>;
    company_id: z.ZodNumber;
    staff_id: z.ZodNumber;
    services: z.ZodArray<z.ZodObject<{
        id: z.ZodNumber;
        title: z.ZodString;
        cost: z.ZodNumber;
        manual_cost: z.ZodOptional<z.ZodNumber>;
        cost_per_unit: z.ZodNumber;
        first_cost: z.ZodNumber;
        amount: z.ZodNumber;
        discount: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        id: number;
        discount: number;
        title: string;
        cost: number;
        cost_per_unit: number;
        first_cost: number;
        amount: number;
        manual_cost?: number | undefined;
    }, {
        id: number;
        discount: number;
        title: string;
        cost: number;
        cost_per_unit: number;
        first_cost: number;
        amount: number;
        manual_cost?: number | undefined;
    }>, "many">;
    client: z.ZodObject<{
        id: z.ZodNumber;
        name: z.ZodString;
        phone: z.ZodString;
        email: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: number;
        name: string;
        phone: string;
        email?: string | undefined;
    }, {
        id: number;
        name: string;
        phone: string;
        email?: string | undefined;
    }>;
    datetime: z.ZodString;
    seance_length: z.ZodNumber;
    comment: z.ZodOptional<z.ZodString>;
    save_if_busy: z.ZodOptional<z.ZodBoolean>;
    attendance: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    services: {
        id: number;
        discount: number;
        title: string;
        cost: number;
        cost_per_unit: number;
        first_cost: number;
        amount: number;
        manual_cost?: number | undefined;
    }[];
    company_id: number;
    staff_id: number;
    client: {
        id: number;
        name: string;
        phone: string;
        email?: string | undefined;
    };
    datetime: string;
    seance_length: number;
    id?: number | undefined;
    comment?: string | undefined;
    save_if_busy?: boolean | undefined;
    attendance?: number | undefined;
}, {
    services: {
        id: number;
        discount: number;
        title: string;
        cost: number;
        cost_per_unit: number;
        first_cost: number;
        amount: number;
        manual_cost?: number | undefined;
    }[];
    company_id: number;
    staff_id: number;
    client: {
        id: number;
        name: string;
        phone: string;
        email?: string | undefined;
    };
    datetime: string;
    seance_length: number;
    id?: number | undefined;
    comment?: string | undefined;
    save_if_busy?: boolean | undefined;
    attendance?: number | undefined;
}>;
export type Booking = z.infer<typeof BookingSchema>;
export declare const ScheduleSchema: z.ZodObject<{
    staff_id: z.ZodNumber;
    date: z.ZodString;
    times: z.ZodArray<z.ZodObject<{
        time: z.ZodString;
        seance_length: z.ZodNumber;
        datetime: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        datetime: string;
        seance_length: number;
        time: string;
    }, {
        datetime: string;
        seance_length: number;
        time: string;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    staff_id: number;
    date: string;
    times: {
        datetime: string;
        seance_length: number;
        time: string;
    }[];
}, {
    staff_id: number;
    date: string;
    times: {
        datetime: string;
        seance_length: number;
        time: string;
    }[];
}>;
export type Schedule = z.infer<typeof ScheduleSchema>;
export declare const BookAppointmentSchema: z.ZodObject<{
    client_phone: z.ZodString;
    client_name: z.ZodString;
    service_name: z.ZodString;
    preferred_date: z.ZodString;
    preferred_time: z.ZodString;
    master_name: z.ZodOptional<z.ZodString>;
    comment: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    client_phone: string;
    client_name: string;
    service_name: string;
    preferred_date: string;
    preferred_time: string;
    comment?: string | undefined;
    master_name?: string | undefined;
}, {
    client_phone: string;
    client_name: string;
    service_name: string;
    preferred_date: string;
    preferred_time: string;
    comment?: string | undefined;
    master_name?: string | undefined;
}>;
export type BookAppointmentRequest = z.infer<typeof BookAppointmentSchema>;
export declare const FindAvailableTimeSchema: z.ZodObject<{
    service_name: z.ZodString;
    date_from: z.ZodString;
    date_to: z.ZodString;
    master_name: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    service_name: string;
    date_from: string;
    date_to: string;
    master_name?: string | undefined;
}, {
    service_name: string;
    date_from: string;
    date_to: string;
    master_name?: string | undefined;
}>;
export type FindAvailableTimeRequest = z.infer<typeof FindAvailableTimeSchema>;
export interface YClientsConfig {
    baseUrl: string;
    bearerToken: string;
    companyId: number;
    rateLimitPerMinute?: number;
}
export declare class YClientsApiError extends Error {
    message: string;
    statusCode?: number | undefined;
    response?: any | undefined;
    constructor(message: string, statusCode?: number | undefined, response?: any | undefined);
}
export declare class ValidationError extends Error {
    message: string;
    field?: string | undefined;
    constructor(message: string, field?: string | undefined);
}
//# sourceMappingURL=types.d.ts.map