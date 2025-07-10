import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { YClientsApiClient } from '../yclients-client';
export declare class ClientTools {
    private apiClient;
    constructor(apiClient: YClientsApiClient);
    /**
     * Инструмент для поиска клиента
     */
    getFindClientTool(): Tool;
    /**
     * Обработчик поиска клиента
     */
    handleFindClient(args: unknown): Promise<string>;
    /**
     * Инструмент для получения записей клиента
     */
    getClientBookingsTool(): Tool;
    /**
     * Обработчик получения записей клиента
     */
    handleGetClientBookings(args: unknown): Promise<string>;
    /**
     * Инструмент для отмены записи
     */
    getCancelBookingTool(): Tool;
    /**
     * Обработчик отмены записи
     */
    handleCancelBooking(args: unknown): Promise<string>;
}
//# sourceMappingURL=clients.d.ts.map