import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { YClientsApiClient } from '../yclients-client';
export declare class ServiceTools {
    private apiClient;
    constructor(apiClient: YClientsApiClient);
    /**
     * Инструмент для получения списка услуг
     */
    getServicesListTool(): Tool;
    /**
     * Обработчик получения списка услуг
     */
    handleGetServicesList(): Promise<string>;
    /**
     * Инструмент для получения списка мастеров
     */
    getStaffListTool(): Tool;
    /**
     * Обработчик получения списка мастеров
     */
    handleGetStaffList(): Promise<string>;
}
//# sourceMappingURL=services.d.ts.map