import { z } from 'zod';
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { YClientsApiClient } from '../yclients-client';
import {
  BookAppointmentRequest,
  BookAppointmentSchema,
  FindAvailableTimeRequest,
  FindAvailableTimeSchema,
} from '../types';
import {
  validateData,
  normalizePhone,
  validateFutureDate,
  formatDateTimeForYClients,
  findServiceByName,
  findStaffByName,
} from '../utils/validation';
import { formatErrorForUser, logError } from '../utils/errors';

export class BookingTools {
  constructor(private apiClient: YClientsApiClient) {}

  /**
   * Инструмент для записи клиента на услугу
   */
  getBookAppointmentTool(): Tool {
    return {
      name: 'book_appointment',
      description: 'Записать клиента на услугу. Автоматически найдет или создаст клиента, найдет услугу по названию, проверит доступность времени',
      inputSchema: {
        type: 'object',
        properties: {
          client_phone: {
            type: 'string',
            description: 'Телефон клиента в формате +7XXXXXXXXXX'
          },
          client_name: {
            type: 'string',
            description: 'Имя клиента'
          },
          service_name: {
            type: 'string',
            description: 'Название услуги (например: "стрижка", "окрашивание", "маникюр")'
          },
          preferred_date: {
            type: 'string',
            format: 'date',
            description: 'Желаемая дата в формате YYYY-MM-DD'
          },
          preferred_time: {
            type: 'string',
            description: 'Желаемое время в формате HH:MM (например: "15:00")'
          },
          master_name: {
            type: 'string',
            description: 'Имя мастера (опционально)'
          },
          comment: {
            type: 'string',
            description: 'Комментарий к записи'
          }
        },
        required: ['client_phone', 'client_name', 'service_name', 'preferred_date', 'preferred_time']
      }
    };
  }

  /**
   * Обработчик записи клиента
   */
  async handleBookAppointment(args: unknown): Promise<string> {
    try {
      // Валидация входных данных
      const request = validateData(BookAppointmentSchema, args);
      
      // Нормализация телефона
      const normalizedPhone = normalizePhone(request.client_phone);
      
      // Проверка даты
      if (!validateFutureDate(request.preferred_date)) {
        return formatErrorForUser(new Error('Дата должна быть не ранее сегодня'));
      }

      // 1. Поиск или создание клиента
      let client = await this.apiClient.findClientByPhone(normalizedPhone);
      
      if (!client) {
        client = await this.apiClient.createClient({
          name: request.client_name,
          phone: normalizedPhone,
          comment: request.comment,
        });
      }

      // 2. Поиск услуги по названию
      const services = await this.apiClient.getServices();
      const activeServices = services.filter(s => s.active === 1);
      const foundServices = findServiceByName(activeServices, request.service_name);
      
      if (foundServices.length === 0) {
        return `❌ Услуга "${request.service_name}" не найдена. Доступные услуги: ${activeServices.map(s => s.title).join(', ')}`;
      }
      
      if (foundServices.length > 1) {
        return `❌ Найдено несколько услуг по запросу "${request.service_name}": ${foundServices.map(s => s.title).join(', ')}. Уточните название услуги.`;
      }
      
      const service = foundServices[0];

      // 3. Поиск мастера (если указан)
      let selectedStaff = null;
      const allStaff = await this.apiClient.getStaff();
      
      if (request.master_name) {
        const foundStaff = findStaffByName(allStaff, request.master_name);
        
        if (foundStaff.length === 0) {
          return `❌ Мастер "${request.master_name}" не найден. Доступные мастера: ${allStaff.map(s => s.name).join(', ')}`;
        }
        
        if (foundStaff.length > 1) {
          return `❌ Найдено несколько мастеров по запросу "${request.master_name}": ${foundStaff.map(s => s.name).join(', ')}. Уточните имя мастера.`;
        }
        
        selectedStaff = foundStaff[0];
      } else {
        // Находим мастеров, которые могут выполнить эту услугу
        const availableStaff = allStaff.filter(staff => 
          !staff.services || staff.services.includes(service.id)
        );
        
        if (availableStaff.length === 0) {
          return `❌ Нет доступных мастеров для услуги "${service.title}"`;
        }
        
        selectedStaff = availableStaff[0]; // Берем первого доступного
      }

      // 4. Проверка доступности времени
      const datetime = formatDateTimeForYClients(request.preferred_date, request.preferred_time);
      const isAvailable = await this.apiClient.checkTimeAvailability(
        selectedStaff.id,
        service.id,
        datetime
      );
      
      if (!isAvailable) {
        // Предлагаем альтернативное время
        const availableTimeResult = await this.handleFindAvailableTime({
          service_name: request.service_name,
          date_from: request.preferred_date,
          date_to: request.preferred_date,
          master_name: selectedStaff.name,
        });
        
        return `❌ Время ${request.preferred_time} недоступно на ${request.preferred_date}.\n\n${availableTimeResult}`;
      }

      // 5. Создание записи
      const booking = await this.apiClient.createBooking({
        company_id: parseInt(process.env.YCLIENTS_COMPANY_ID || '0'),
        staff_id: selectedStaff.id,
        services: [{
          id: service.id,
          title: service.title,
          cost: service.price_min,
          cost_per_unit: service.price_min,
          first_cost: service.price_min,
          amount: 1,
          discount: 0,
        }],
        client: {
          id: client.id!,
          name: client.name,
          phone: client.phone,
          email: client.email,
        },
        datetime,
        seance_length: service.duration,
        comment: request.comment,
        save_if_busy: false,
      });

      return `✅ Запись создана успешно!
      
📋 Детали записи:
• Клиент: ${client.name} (${client.phone})
• Услуга: ${service.title}
• Мастер: ${selectedStaff.name}
• Дата и время: ${request.preferred_date} ${request.preferred_time}
• Длительность: ${service.duration} минут
• Стоимость: от ${service.price_min} руб.
• ID записи: ${booking.id}
${request.comment ? `• Комментарий: ${request.comment}` : ''}`;

    } catch (error) {
      logError(error, 'BookAppointment');
      return formatErrorForUser(error);
    }
  }

  /**
   * Инструмент для поиска доступного времени
   */
  getFindAvailableTimeTool(): Tool {
    return {
      name: 'find_available_time',
      description: 'Найти свободное время для записи на услугу',
      inputSchema: {
        type: 'object',
        properties: {
          service_name: {
            type: 'string',
            description: 'Название услуги'
          },
          date_from: {
            type: 'string',
            format: 'date',
            description: 'Начальная дата поиска в формате YYYY-MM-DD'
          },
          date_to: {
            type: 'string',
            format: 'date',
            description: 'Конечная дата поиска в формате YYYY-MM-DD'
          },
          master_name: {
            type: 'string',
            description: 'Имя мастера (опционально)'
          }
        },
        required: ['service_name', 'date_from', 'date_to']
      }
    };
  }

  /**
   * Обработчик поиска доступного времени
   */
  async handleFindAvailableTime(args: unknown): Promise<string> {
    try {
      const request = validateData(FindAvailableTimeSchema, args);
      
      // Поиск услуги
      const services = await this.apiClient.getServices();
      const activeServices = services.filter(s => s.active === 1);
      const foundServices = findServiceByName(activeServices, request.service_name);
      
      if (foundServices.length === 0) {
        return `❌ Услуга "${request.service_name}" не найдена`;
      }
      
      const service = foundServices[0];
      
      // Поиск мастеров
      const allStaff = await this.apiClient.getStaff();
      let targetStaff = allStaff;
      
      if (request.master_name) {
        const foundStaff = findStaffByName(allStaff, request.master_name);
        if (foundStaff.length === 0) {
          return `❌ Мастер "${request.master_name}" не найден`;
        }
        targetStaff = foundStaff;
      } else {
        // Фильтруем мастеров, которые могут выполнить услугу
        targetStaff = allStaff.filter(staff => 
          !staff.services || staff.services.includes(service.id)
        );
      }
      
      if (targetStaff.length === 0) {
        return `❌ Нет доступных мастеров для услуги "${service.title}"`;
      }

      // Поиск доступного времени
      const availableSlots: Array<{
        date: string;
        time: string;
        master: string;
      }> = [];

      const startDate = new Date(request.date_from);
      const endDate = new Date(request.date_to);
      
      for (const staff of targetStaff) {
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
          const dateStr = d.toISOString().split('T')[0];
          
          try {
            const schedule = await this.apiClient.getAvailableTime(
              staff.id,
              service.id,
              dateStr
            );
            
            for (const timeSlot of schedule.times) {
              availableSlots.push({
                date: dateStr,
                time: timeSlot.time,
                master: staff.name,
              });
            }
          } catch (error) {
            // Пропускаем дни без доступного времени
            continue;
          }
        }
      }

      if (availableSlots.length === 0) {
        return `❌ Нет свободного времени для услуги "${service.title}" в период с ${request.date_from} по ${request.date_to}`;
      }

      // Группируем по дням
      const slotsByDate = availableSlots.reduce((acc, slot) => {
        if (!acc[slot.date]) {
          acc[slot.date] = [];
        }
        acc[slot.date].push(slot);
        return acc;
      }, {} as Record<string, typeof availableSlots>);

      let result = `📅 Доступное время для услуги "${service.title}":\n\n`;
      
      Object.entries(slotsByDate)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(0, 7) // Показываем максимум 7 дней
        .forEach(([date, slots]) => {
          result += `🗓 ${date}:\n`;
          slots
            .sort((a, b) => a.time.localeCompare(b.time))
            .slice(0, 10) // Показываем максимум 10 слотов на день
            .forEach(slot => {
              result += `   • ${slot.time} - ${slot.master}\n`;
            });
          result += '\n';
        });

      return result;

    } catch (error) {
      logError(error, 'FindAvailableTime');
      return formatErrorForUser(error);
    }
  }
} 