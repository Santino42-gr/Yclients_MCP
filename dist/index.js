#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const sse_js_1 = require("@modelcontextprotocol/sdk/server/sse.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const yclients_client_js_1 = require("./yclients-client.js");
const booking_js_1 = require("./tools/booking.js");
const clients_js_1 = require("./tools/clients.js");
const services_js_1 = require("./tools/services.js");
const errors_js_1 = require("./utils/errors.js");
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
// Загружаем переменные окружения
dotenv_1.default.config();
// Конфигурация
const config = {
    baseUrl: process.env.YCLIENTS_BASE_URL || 'https://api.yclients.com/api/v1',
    partnerToken: process.env.YCLIENTS_PARTNER_TOKEN || '',
    userToken: process.env.YCLIENTS_USER_TOKEN || '',
    companyId: parseInt(process.env.YCLIENTS_COMPANY_ID || '0'),
    rateLimitPerMinute: parseInt(process.env.RATE_LIMIT_REQUESTS_PER_MINUTE || '60'),
};
// Конфигурация транспорта
const TRANSPORT = process.env.MCP_TRANSPORT || 'stdio';
const PORT = parseInt(process.env.PORT || process.env.MCP_PORT || '3000');
// Проверяем обязательные переменные
if (!config.partnerToken) {
    console.error('❌ Ошибка: YCLIENTS_PARTNER_TOKEN не установлен');
    process.exit(1);
}
if (!config.userToken) {
    console.error('❌ Ошибка: YCLIENTS_USER_TOKEN не установлен');
    process.exit(1);
}
if (!config.companyId) {
    console.error('❌ Ошибка: YCLIENTS_COMPANY_ID не установлен');
    process.exit(1);
}
// Создаем клиент API и инструменты
const apiClient = new yclients_client_js_1.YClientsApiClient(config);
const bookingTools = new booking_js_1.BookingTools(apiClient);
const clientTools = new clients_js_1.ClientTools(apiClient);
const serviceTools = new services_js_1.ServiceTools(apiClient);
// Создаем MCP сервер
const server = new index_js_1.Server({
    name: process.env.MCP_SERVER_NAME || 'yclients-booking',
    version: process.env.MCP_SERVER_VERSION || '1.0.0',
}, {
    capabilities: {
        tools: {},
    },
});
// Регистрируем обработчики
/**
 * Обработчик получения списка инструментов
 */
server.setRequestHandler(types_js_1.ListToolsRequestSchema, async () => {
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
server.setRequestHandler(types_js_1.CallToolRequestSchema, async (request) => {
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
    }
    catch (error) {
        (0, errors_js_1.logError)(error, `CallTool:${name}`);
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
    (0, errors_js_1.logError)(error, 'MCPServer');
};
/**
 * Запуск SSE сервера для n8n MCP Client
 */
async function startSSEServer(mcpServer, port) {
    const app = (0, express_1.default)();
    app.use((0, cors_1.default)({
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
    const transports = {};
    // SSE endpoint для подключения клиентов (n8n)
    app.get('/sse', async (req, res) => {
        console.error('📡 Новое SSE подключение');
        // Создаем SSE транспорт для этого подключения
        const transport = new sse_js_1.SSEServerTransport('/messages', res);
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
    app.post('/messages', express_1.default.json(), async (req, res) => {
        try {
            const sessionId = req.query.sessionId;
            console.error(`📨 Получено сообщение для сессии: ${sessionId}`);
            const transport = transports[sessionId];
            if (transport) {
                await transport.handlePostMessage(req, res, req.body);
            }
            else {
                console.error(`❌ Транспорт не найден для сессии: ${sessionId}`);
                res.status(400).json({ error: 'No transport found for sessionId' });
            }
        }
        catch (error) {
            console.error('❌ Ошибка обработки сообщения:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
    return new Promise((resolve) => {
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
        }
        else {
            console.error(`📡 Запуск STDIO транспорта`);
            const transport = new stdio_js_1.StdioServerTransport();
            await server.connect(transport);
            console.error('✅ MCP сервер успешно запущен');
        }
    }
    catch (error) {
        (0, errors_js_1.logError)(error, 'MCPServerStartup');
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
if (require.main === module) {
    main().catch((error) => {
        (0, errors_js_1.logError)(error, 'Main');
        process.exit(1);
    });
}
//# sourceMappingURL=index.js.map