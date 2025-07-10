import { YClientsConfig, Client, Service, Staff, Booking, Schedule } from './types';
export declare class YClientsApiClient {
    private client;
    private config;
    constructor(config: YClientsConfig);
    /**
     * Получить список всех услуг
     */
    getServices(): Promise<Service[]>;
    /**
     * Получить список всех мастеров
     */
    getStaff(): Promise<Staff[]>;
    /**
     * Найти клиента по телефону
     */
    findClientByPhone(phone: string): Promise<Client | null>;
    /**
     * Создать нового клиента
     */
    createClient(clientData: Omit<Client, 'id'>): Promise<Client>;
    /**
     * Получить доступное время для записи
     */
    getAvailableTime(staffId: number, serviceId: number, date: string): Promise<Schedule>;
    /**
     * Создать запись
     */
    createBooking(bookingData: Omit<Booking, 'id'>): Promise<Booking>;
    /**
     * Получить информацию о записи
     */
    getBooking(bookingId: number): Promise<Booking>;
    /**
     * Отменить запись
     */
    cancelBooking(bookingId: number): Promise<void>;
    /**
     * Получить записи клиента
     */
    getClientBookings(clientId: number, dateFrom?: string, dateTo?: string): Promise<Booking[]>;
    /**
     * Проверить доступность времени для конкретного мастера и услуги
     */
    checkTimeAvailability(staffId: number, serviceId: number, datetime: string): Promise<boolean>;
}
//# sourceMappingURL=yclients-client.d.ts.map