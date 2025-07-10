import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { YClientsApiClient } from '../yclients-client';
export declare class BookingTools {
    private apiClient;
    constructor(apiClient: YClientsApiClient);
    /**
     * Инструмент для записи клиента на услугу
     */
    getBookAppointmentTool(): Tool;
    /**
     * Обработчик записи клиента
     */
    handleBookAppointment(args: unknown): Promise<string>;
    /**
     * Инструмент для поиска доступного времени
     */
    getFindAvailableTimeTool(): Tool;
    /**
     * Обработчик поиска доступного времени
     */
    handleFindAvailableTime(args: unknown): Promise<string>;
}
//# sourceMappingURL=booking.d.ts.map