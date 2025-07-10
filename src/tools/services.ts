import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { YClientsApiClient } from '../yclients-client';
import { formatErrorForUser, logError } from '../utils/errors';

export class ServiceTools {
  constructor(private apiClient: YClientsApiClient) {}

  /**
   * Инструмент для получения списка услуг
   */
  getServicesListTool(): Tool {
    return {
      name: 'get_services_list',
      description: 'Получить список всех доступных услуг салона',
      inputSchema: {
        type: 'object',
        properties: {},
        required: []
      }
    };
  }

  /**
   * Обработчик получения списка услуг
   */
  async handleGetServicesList(): Promise<string> {
    try {
      const services = await this.apiClient.getServices();
      const activeServices = services.filter(s => s.active === 1);
      
      if (activeServices.length === 0) {
        return '❌ Нет доступных услуг';
      }

      let result = '📋 Список услуг салона:\n\n';
      
      // Группируем по категориям если есть информация
      const servicesByCategory = activeServices.reduce((acc, service) => {
        const categoryId = service.category_id || 0;
        if (!acc[categoryId]) {
          acc[categoryId] = [];
        }
        acc[categoryId].push(service);
        return acc;
      }, {} as Record<number, typeof activeServices>);

      Object.entries(servicesByCategory).forEach(([categoryId, categoryServices]) => {
        if (categoryId !== '0') {
          result += `📁 Категория ${categoryId}:\n`;
        }
        
        categoryServices
          .sort((a, b) => a.title.localeCompare(b.title))
          .forEach(service => {
            result += `• ${service.title}\n`;
            result += `  💰 Цена: ${service.price_min === service.price_max 
              ? `${service.price_min} руб.` 
              : `от ${service.price_min} до ${service.price_max} руб.`}\n`;
            result += `  ⏱ Длительность: ${service.duration} мин.\n`;
            result += `  🆔 ID: ${service.id}\n\n`;
          });
      });

      return result;

    } catch (error) {
      logError(error, 'GetServicesList');
      return formatErrorForUser(error);
    }
  }

  /**
   * Инструмент для получения списка мастеров
   */
  getStaffListTool(): Tool {
    return {
      name: 'get_staff_list',
      description: 'Получить список всех мастеров салона',
      inputSchema: {
        type: 'object',
        properties: {},
        required: []
      }
    };
  }

  /**
   * Обработчик получения списка мастеров
   */
  async handleGetStaffList(): Promise<string> {
    try {
      const staff = await this.apiClient.getStaff();
      
      if (staff.length === 0) {
        return '❌ Нет доступных мастеров';
      }

      let result = '👥 Список мастеров салона:\n\n';
      
      staff
        .sort((a, b) => a.name.localeCompare(b.name))
        .forEach((master, index) => {
          result += `${index + 1}. ${master.name}\n`;
          if (master.specialization) {
            result += `   🎯 Специализация: ${master.specialization}\n`;
          }
          if (master.position?.title) {
            result += `   💼 Должность: ${master.position.title}\n`;
          }
          result += `   🆔 ID: ${master.id}\n`;
          if (master.services && master.services.length > 0) {
            result += `   🛠 Услуги: ${master.services.length} услуг\n`;
          }
          result += '\n';
        });

      return result;

    } catch (error) {
      logError(error, 'GetStaffList');
      return formatErrorForUser(error);
    }
  }
} 