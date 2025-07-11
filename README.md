# YClients MCP Server

🤖 **MCP сервер для автоматизации записи клиентов в салон красоты через YClients API**

## 🚀 Что это?

Этот сервер позволяет автоматизировать работу с YClients через n8n workflows:
- 📋 Получение списка услуг салона
- 👨‍💼 Работа с мастерами  
- 👤 Поиск и управление клиентами
- 📅 Создание и отмена записей

## ⚙️ Быстрый старт

### 1. Настройка переменных окружения
```bash
YCLIENTS_PARTNER_TOKEN=your_partner_token
YCLIENTS_USER_TOKEN=your_user_token  
YCLIENTS_COMPANY_ID=your_company_id
MCP_TRANSPORT=sse
```

### 2. Запуск локально
```bash
npm install
npm run dev
```

### 3. Подключение к n8n
- **SSE URL**: `https://your-app.up.railway.app/sse`
- **Health check**: `https://your-app.up.railway.app/health`

## 🛠️ Доступные MCP инструменты

- `get_services_list` - Список услуг
- `get_staff_list` - Список мастеров
- `find_client` - Поиск клиента по телефону
- `book_appointment` - Запись клиента
- `find_available_time` - Поиск свободного времени
- `get_client_bookings` - Записи клиента
- `cancel_booking` - Отмена записи

## 🏗️ Технологии

- **TypeScript** + **Node.js**
- **Express** (веб-сервер)
- **MCP SDK** (Model Context Protocol)
- **Railway** (хостинг)
- **YClients API** (интеграция с салоном)

## 📞 Поддержка

Если что-то не работает:
1. Проверьте переменные окружения
2. Убедитесь, что токены YClients актуальны
3. Проверьте права доступа в YClients панели

---
*Создано для автоматизации салона красоты* ✨ 