import axios, { AxiosInstance } from 'axios';
import {
  YClientsConfig,
  YClientsApiResponse,
  Client,
  Service,
  Staff,
  Booking,
  Schedule,
} from './types';
import { handleYClientsError, logError } from './utils/errors';

export class YClientsApiClient {
  private client: AxiosInstance;
  private config: YClientsConfig;

  constructor(config: YClientsConfig) {
    this.config = config;
    this.client = axios.create({
      baseURL: config.baseUrl,
      headers: {
        'Authorization': `Bearer ${config.bearerToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.yclients.v2+json',
      },
      timeout: 30000,
    });

    // Добавляем интерсептор для логирования ошибок
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        logError(error, 'YClientsApiClient');
        return Promise.reject(error);
      }
    );
  }

  /**
   * Получить список всех услуг
   */
  async getServices(): Promise<Service[]> {
    try {
      const response = await this.client.get<YClientsApiResponse<Service[]>>(
        `/company/${this.config.companyId}/services/`
      );
      return response.data.data;
    } catch (error) {
      handleYClientsError(error);
    }
  }

  /**
   * Получить список всех мастеров
   */
  async getStaff(): Promise<Staff[]> {
    try {
      const response = await this.client.get<YClientsApiResponse<Staff[]>>(
        `/company/${this.config.companyId}/staff/`
      );
      return response.data.data;
    } catch (error) {
      handleYClientsError(error);
    }
  }

  /**
   * Найти клиента по телефону
   */
  async findClientByPhone(phone: string): Promise<Client | null> {
    try {
      const response = await this.client.get<YClientsApiResponse<Client[]>>(
        `/company/${this.config.companyId}/clients/`,
        {
          params: { phone }
        }
      );
      
      const clients = response.data.data;
      return clients.length > 0 ? clients[0] : null;
    } catch (error) {
      handleYClientsError(error);
    }
  }

  /**
   * Создать нового клиента
   */
  async createClient(clientData: Omit<Client, 'id'>): Promise<Client> {
    try {
      const response = await this.client.post<YClientsApiResponse<Client>>(
        `/company/${this.config.companyId}/clients/`,
        clientData
      );
      return response.data.data;
    } catch (error) {
      handleYClientsError(error);
    }
  }

  /**
   * Получить доступное время для записи
   */
  async getAvailableTime(
    staffId: number,
    serviceId: number,
    date: string
  ): Promise<Schedule> {
    try {
      const response = await this.client.get<YClientsApiResponse<Schedule>>(
        `/company/${this.config.companyId}/staff/${staffId}/schedule/${date}`,
        {
          params: {
            service_id: serviceId
          }
        }
      );
      return response.data.data;
    } catch (error) {
      handleYClientsError(error);
    }
  }

  /**
   * Создать запись
   */
  async createBooking(bookingData: Omit<Booking, 'id'>): Promise<Booking> {
    try {
      const response = await this.client.post<YClientsApiResponse<Booking>>(
        `/company/${this.config.companyId}/book/`,
        bookingData
      );
      return response.data.data;
    } catch (error) {
      handleYClientsError(error);
    }
  }

  /**
   * Получить информацию о записи
   */
  async getBooking(bookingId: number): Promise<Booking> {
    try {
      const response = await this.client.get<YClientsApiResponse<Booking>>(
        `/company/${this.config.companyId}/records/${bookingId}`
      );
      return response.data.data;
    } catch (error) {
      handleYClientsError(error);
    }
  }

  /**
   * Отменить запись
   */
  async cancelBooking(bookingId: number): Promise<void> {
    try {
      await this.client.delete(
        `/company/${this.config.companyId}/records/${bookingId}`
      );
    } catch (error) {
      handleYClientsError(error);
    }
  }

  /**
   * Получить записи клиента
   */
  async getClientBookings(
    clientId: number,
    dateFrom?: string,
    dateTo?: string
  ): Promise<Booking[]> {
    try {
      const params: any = {};
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;

      const response = await this.client.get<YClientsApiResponse<Booking[]>>(
        `/company/${this.config.companyId}/records/`,
        {
          params: {
            client_id: clientId,
            ...params
          }
        }
      );
      return response.data.data;
    } catch (error) {
      handleYClientsError(error);
    }
  }

  /**
   * Проверить доступность времени для конкретного мастера и услуги
   */
  async checkTimeAvailability(
    staffId: number,
    serviceId: number,
    datetime: string
  ): Promise<boolean> {
    try {
      const date = datetime.split('T')[0];
      const schedule = await this.getAvailableTime(staffId, serviceId, date);
      
      return schedule.times.some(time => time.datetime === datetime);
    } catch (error) {
      // Если произошла ошибка при получении расписания, считаем что время недоступно
      return false;
    }
  }
} 