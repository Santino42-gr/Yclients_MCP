#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { YClientsApiClient } from './yclients-client.js';
import { BookingTools } from './tools/booking.js';
import { ClientTools } from './tools/clients.js';
import { ServiceTools } from './tools/services.js';
import { YClientsConfig } from './types.js';
import { logError } from './utils/errors.js';
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';

// Загружаем переменные окружения
dotenv.config();

// Конфигурация
const config: YClientsConfig = {
  baseUrl: process.env.YCLIENTS_BASE_URL || 'https://api.yclients.com/api/v1',
  bearerToken: process.env.YCLIENTS_BEARER_TOKEN || '',
  companyId: parseInt(process.env.YCLIENTS_COMPANY_ID || '0'),
  rateLimitPerMinute: parseInt(process.env.RATE_LIMIT_REQUESTS_PER_MINUTE || '60'),
};

// Конфигурация транспорта
const TRANSPORT = process.env.MCP_TRANSPORT || 'stdio';
const PORT = parseInt(process.env.PORT || process.env.MCP_PORT || '3000');

// Проверяем обязательные переменные
if (!config.bearerToken) {
  console.error('❌ Ошибка: YCLIENTS_BEARER_TOKEN не установлен');
  process.exit(1);
}

if (!config.companyId) {
  console.error('❌ Ошибка: YCLIENTS_COMPANY_ID не установлен');
  process.exit(1);
}

// Создаем клиент API и инструменты
const apiClient = new YClientsApiClient(config);
const bookingTools = new BookingTools(apiClient);
const clientTools = new ClientTools(apiClient);
const serviceTools = new ServiceTools(apiClient);

// Создаем MCP сервер
const server = new Server(
  {
    name: process.env.MCP_SERVER_NAME || 'yclients-booking',
    version: process.env.MCP_SERVER_VERSION || '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Регистрируем обработчики

/**
 * Обработчик получения списка инструментов
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      // Инструменты записи
      bookingTools.getBookAppointmentTool(),
      bookingTools.getFindAvailableTimeTool(),
      
      // Инструменты клиентов
      clientTools.getFindClientTool(),
      clientTools.getClientBookingsTool(),
      clientTools.getCancelBookingTool(),
      
      // Инструменты услуг и мастеров
      serviceTools.getServicesListTool(),
      serviceTools.getStaffListTool(),
    ],
  };
});

/**
 * Обработчик вызова инструментов
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      // Инструменты записи
      case 'book_appointment':
        return {
          content: [
            {
              type: 'text',
              text: await bookingTools.handleBookAppointment(args),
            },
          ],
        };

      case 'find_available_time':
        return {
          content: [
            {
              type: 'text',
              text: await bookingTools.handleFindAvailableTime(args),
            },
          ],
        };

      // Инструменты клиентов
      case 'find_client':
        return {
          content: [
            {
              type: 'text',
              text: await clientTools.handleFindClient(args),
            },
          ],
        };

      case 'get_client_bookings':
        return {
          content: [
            {
              type: 'text',
              text: await clientTools.handleGetClientBookings(args),
            },
          ],
        };

      case 'cancel_booking':
        return {
          content: [
            {
              type: 'text',
              text: await clientTools.handleCancelBooking(args),
            },
          ],
        };

      // Инструменты услуг и мастеров
      case 'get_services_list':
        return {
          content: [
            {
              type: 'text',
              text: await serviceTools.handleGetServicesList(),
            },
          ],
        };

      case 'get_staff_list':
        return {
          content: [
            {
              type: 'text',
              text: await serviceTools.handleGetStaffList(),
            },
          ],
        };

      default:
        throw new Error(`Неизвестный инструмент: ${name}`);
    }
  } catch (error) {
    logError(error, `CallTool:${name}`);
    return {
      content: [
        {
          type: 'text',
          text: `❌ Ошибка при выполнении инструмента ${name}: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`,
        },
      ],
      isError: true,
    };
  }
});

/**
 * Обработчик ошибок сервера
 */
server.onerror = (error) => {
  logError(error, 'MCPServer');
};

/**
 * Запуск SSE сервера для n8n MCP Client
 */
async function startSSEServer(mcpServer: Server, port: number) {
  const app = express();
  
  app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control'],
  }));
  
  // Health check endpoint для Railway
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'yclients-mcp-server', endpoint: `/sse` });
  });
  
  // Информация о сервере
  app.get('/', (req, res) => {
    res.json({
      name: 'YClients MCP Server',
      version: process.env.MCP_SERVER_VERSION || '1.0.0',
      endpoints: {
        sse: '/sse',
        messages: '/messages',
        health: '/health'
      },
      tools: [
        'book_appointment',
        'find_available_time', 
        'find_client',
        'get_client_bookings',
        'cancel_booking',
        'get_services_list',
        'get_staff_list'
      ]
    });
  });

  // Хранилище транспортов по sessionId
  const transports: { [sessionId: string]: SSEServerTransport } = {};
  
  // SSE endpoint для подключения клиентов (n8n)
  app.get('/sse', async (req, res) => {
    console.error('📡 Новое SSE подключение');
    
    // Создаем SSE транспорт для этого подключения
    const transport = new SSEServerTransport('/messages', res);
    
    // Сохраняем транспорт
    if (transport.sessionId) {
      transports[transport.sessionId] = transport;
    }
    
    // Очистка при закрытии соединения
    res.on("close", () => {
      console.error('📴 SSE соединение закрыто');
      if (transport.sessionId && transports[transport.sessionId]) {
        delete transports[transport.sessionId];
      }
    });
    
    // Подключаем MCP сервер к транспорту
    await mcpServer.connect(transport);
  });
  
  // Messages endpoint для обработки POST запросов от клиентов
  app.post('/messages', express.json(), async (req, res) => {
    try {
      const sessionId = req.query.sessionId as string;
      console.error(`📨 Получено сообщение для сессии: ${sessionId}`);
      
      const transport = transports[sessionId];
      if (transport) {
        await transport.handlePostMessage(req, res, req.body);
      } else {
        console.error(`❌ Транспорт не найден для сессии: ${sessionId}`);
        res.status(400).json({ error: 'No transport found for sessionId' });
      }
    } catch (error) {
      console.error('❌ Ошибка обработки сообщения:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  return new Promise<void>((resolve) => {
    app.listen(port, () => {
      resolve();
    });
  });
}

/**
 * Запуск сервера
 */
async function main() {
  try {
    console.error(`🚀 Запуск YClients MCP сервера v${process.env.MCP_SERVER_VERSION || '1.0.0'}`);
    console.error(`📡 Подключение к YClients API: ${config.baseUrl}`);
    console.error(`🏢 ID компании: ${config.companyId}`);
    console.error(`🌐 Транспорт: ${TRANSPORT}`);
    
    if (TRANSPORT === 'sse') {
      // Для n8n используем SSE сервер
      console.error(`🔗 Запуск SSE сервера на порту ${PORT}`);
      await startSSEServer(server, PORT);
      console.error(`✅ MCP сервер запущен: http://localhost:${PORT}/sse`);
      console.error(`🏥 Health check: http://localhost:${PORT}/health`);
    } else {
      console.error(`📡 Запуск STDIO транспорта`);
      const transport = new StdioServerTransport();
      await server.connect(transport);
      console.error('✅ MCP сервер успешно запущен');
    }
  } catch (error) {
    logError(error, 'MCPServerStartup');
    console.error('❌ Ошибка запуска MCP сервера:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.error('📴 Получен сигнал SIGINT, останавливаем сервер...');
  await server.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.error('📴 Получен сигнал SIGTERM, останавливаем сервер...');
  await server.close();
  process.exit(0);
});

// Запускаем сервер только если файл запущен напрямую
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    logError(error, 'Main');
    process.exit(1);
  });
} 