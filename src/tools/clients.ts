import { z } from 'zod';
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { YClientsApiClient } from '../yclients-client';
import { validateData, normalizePhone } from '../utils/validation';
import { formatErrorForUser, logError } from '../utils/errors';

export class ClientTools {
  constructor(private apiClient: YClientsApiClient) {}

  /**
   * Инструмент для поиска клиента
   */
  getFindClientTool(): Tool {
    return {
      name: 'find_client',
      description: 'Найти клиента по телефону',
      inputSchema: {
        type: 'object',
        properties: {
          phone: {
            type: 'string',
            description: 'Телефон клиента'
          }
        },
        required: ['phone']
      }
    };
  }

  /**
   * Обработчик поиска клиента
   */
  async handleFindClient(args: unknown): Promise<string> {
    try {
      const schema = z.object({
        phone: z.string(),
      });
      
      const request = validateData(schema, args);
      const normalizedPhone = normalizePhone(request.phone);
      
      const client = await this.apiClient.findClientByPhone(normalizedPhone);
      
      if (!client) {
        return `❌ Клиент с телефоном ${normalizedPhone} не найден`;
      }

      return `👤 Найден клиент:
• Имя: ${client.name}
• Телефон: ${client.phone}
• Email: ${client.email || 'не указан'}
• ID: ${client.id}
${client.comment ? `• Комментарий: ${client.comment}` : ''}`;

    } catch (error) {
      logError(error, 'FindClient');
      return formatErrorForUser(error);
    }
  }

  /**
   * Инструмент для получения записей клиента
   */
  getClientBookingsTool(): Tool {
    return {
      name: 'get_client_bookings',
      description: 'Получить записи клиента по телефону',
      inputSchema: {
        type: 'object',
        properties: {
          phone: {
            type: 'string',
            description: 'Телефон клиента'
          },
          date_from: {
            type: 'string',
            format: 'date',
            description: 'Начальная дата поиска (необязательно)'
          },
          date_to: {
            type: 'string',
            format: 'date',
            description: 'Конечная дата поиска (необязательно)'
          }
        },
        required: ['phone']
      }
    };
  }

  /**
   * Обработчик получения записей клиента
   */
  async handleGetClientBookings(args: unknown): Promise<string> {
    try {
      const schema = z.object({
        phone: z.string(),
        date_from: z.string().optional(),
        date_to: z.string().optional(),
      });
      
      const request = validateData(schema, args);
      const normalizedPhone = normalizePhone(request.phone);
      
      // Сначала найдем клиента
      const client = await this.apiClient.findClientByPhone(normalizedPhone);
      
      if (!client) {
        return `❌ Клиент с телефоном ${normalizedPhone} не найден`;
      }

      // Получим записи клиента
      const bookings = await this.apiClient.getClientBookings(
        client.id!,
        request.date_from,
        request.date_to
      );

      if (bookings.length === 0) {
        return `📅 У клиента ${client.name} (${client.phone}) нет записей в указанном периоде`;
      }

      let result = `📅 Записи клиента ${client.name} (${client.phone}):\n\n`;
      
      bookings
        .sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime())
        .forEach((booking, index) => {
          const date = new Date(booking.datetime);
          const formattedDate = date.toLocaleDateString('ru-RU');
          const formattedTime = date.toLocaleTimeString('ru-RU', { 
            hour: '2-digit', 
            minute: '2-digit' 
          });
          
          const status = booking.attendance === 1 ? '✅ Выполнено' 
                      : booking.attendance === 2 ? '❌ Отменено'
                      : '⏳ Запланировано';

          result += `${index + 1}. ${formattedDate} ${formattedTime}\n`;
          result += `   📋 Услуги: ${booking.services.map(s => s.title).join(', ')}\n`;
          result += `   💰 Стоимость: ${booking.services.reduce((sum, s) => sum + s.cost, 0)} руб.\n`;
          result += `   ⏱ Длительность: ${booking.seance_length} мин.\n`;
          result += `   📊 Статус: ${status}\n`;
          result += `   🆔 ID записи: ${booking.id}\n`;
          if (booking.comment) {
            result += `   💬 Комментарий: ${booking.comment}\n`;
          }
          result += '\n';
        });

      return result;

    } catch (error) {
      logError(error, 'GetClientBookings');
      return formatErrorForUser(error);
    }
  }

  /**
   * Инструмент для отмены записи
   */
  getCancelBookingTool(): Tool {
    return {
      name: 'cancel_booking',
      description: 'Отменить запись клиента',
      inputSchema: {
        type: 'object',
        properties: {
          booking_id: {
            type: 'number',
            description: 'ID записи для отмены'
          }
        },
        required: ['booking_id']
      }
    };
  }

  /**
   * Обработчик отмены записи
   */
  async handleCancelBooking(args: unknown): Promise<string> {
    try {
      const schema = z.object({
        booking_id: z.number(),
      });
      
      const request = validateData(schema, args);
      
      // Сначала получим информацию о записи
      const booking = await this.apiClient.getBooking(request.booking_id);
      
      // Отменим запись
      await this.apiClient.cancelBooking(request.booking_id);
      
      const date = new Date(booking.datetime);
      const formattedDate = date.toLocaleDateString('ru-RU');
      const formattedTime = date.toLocaleTimeString('ru-RU', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });

      return `✅ Запись отменена успешно!

📋 Отмененная запись:
• Клиент: ${booking.client.name} (${booking.client.phone})
• Дата и время: ${formattedDate} ${formattedTime}
• Услуги: ${booking.services.map(s => s.title).join(', ')}
• ID записи: ${booking.id}`;

    } catch (error) {
      logError(error, 'CancelBooking');
      return formatErrorForUser(error);
    }
  }
} 