# 🔌 Настройка n8n MCP Client с YClients сервером

## ⚡ Быстрая настройка (5 минут)

### 1. **После деплоя на Railway**

Ваш MCP сервер будет доступен по адресу:
```
https://your-project-name.up.railway.app
```

**Важные endpoints:**
- 🏥 Health check: `/health`
- 📡 **SSE для n8n**: `/sse` ← **это главный endpoint!**
- 📄 Информация: `/`

### 2. **Добавление MCP Client в n8n**

В вашем n8n workflow:

1. **Добавьте узел "MCP Client"**
2. **Настройте параметры:**

```
🔗 SSE Endpoint: https://your-project-name.up.railway.app/sse
🔐 Authentication: None
🛠️ Tools to Include: All
```

### 3. **Проверка подключения**

После настройки MCP Client должен показать **✅ Connected**

Если есть ошибки:
- Проверьте что сервер запущен: `curl https://your-url/health`
- Убедитесь что URL заканчивается на `/sse`
- Посмотрите логи в Railway dashboard

## 🛠️ Использование инструментов

### Доступные инструменты:

| Инструмент | Что делает | Аргументы |
|------------|------------|-----------|
| `book_appointment` | Запись клиента | `client_phone`, `client_name`, `service_name`, `preferred_date`, `preferred_time` |
| `find_available_time` | Поиск свободного времени | `service_name`, `date`, `duration_minutes` |
| `get_services_list` | Список услуг салона | нет |
| `get_staff_list` | Список мастеров | нет |
| `find_client` | Поиск клиента | `phone` или `name` |
| `get_client_bookings` | Записи клиента | `client_phone` |
| `cancel_booking` | Отмена записи | `booking_id` |

### Пример workflow для Telegram бота:

```
1. [Webhook] ← получение сообщения от Telegram
     ↓
2. [Switch] ← определение команды (/запись, /отмена и т.д.)
     ↓
3. [MCP Client] ← подключение к YClients серверу
     ↓
4. [Call Tool: book_appointment] ← запись клиента
     ↓
5. [HTTP Request] ← отправка ответа в Telegram
```

### Настройка инструмента записи:

**Tool**: `book_appointment`

**Arguments**:
```json
{
  "client_phone": "{{ $json.body.message.from.phone_number || '+79123456789' }}",
  "client_name": "{{ $json.body.message.from.first_name }} {{ $json.body.message.from.last_name }}",
  "service_name": "{{ $json.parsed_message.service }}",
  "preferred_date": "{{ $json.parsed_message.date }}",
  "preferred_time": "{{ $json.parsed_message.time }}"
}
```

### Обработка результатов:

MCP инструменты возвращают данные в формате:
```json
{
  "content": [
    {
      "type": "text", 
      "text": "✅ Клиент Анна Иванова записан на стрижку 25.12.2024 в 15:00"
    }
  ]
}
```

Используйте `{{ $json.content[0].text }}` для получения текста ответа.

## 🔄 Продвинутые сценарии

### 1. **Умная запись с проверкой времени**

```
[MCP: find_available_time] → проверка доступности
     ↓ (если время занято)
[MCP: find_available_time] → поиск альтернатив
     ↓ (если найдено)
[MCP: book_appointment] → запись на свободное время
```

### 2. **Поиск постоянного клиента**

```
[MCP: find_client] → поиск по телефону
     ↓ (если найден)
[MCP: get_client_bookings] → показ истории записей
     ↓
[MCP: book_appointment] → новая запись (автозаполнение данных)
```

### 3. **Обработка отмены**

```
[MCP: find_client] → поиск клиента
     ↓
[MCP: get_client_bookings] → список активных записей
     ↓ (выбор записи)
[MCP: cancel_booking] → отмена выбранной записи
```

## 📊 Мониторинг и отладка

### Health check:
```bash
curl https://your-project.up.railway.app/health
# Ответ: {"status":"ok","service":"yclients-mcp-server","endpoint":"/sse"}
```

### Информация о сервере:
```bash
curl https://your-project.up.railway.app/
# Покажет доступные endpoints и инструменты
```

### Логи Railway:
1. Railway Dashboard → ваш проект
2. **Deployments** → **View Logs**
3. Ищите сообщения:
   - `📡 Новое SSE подключение` ← n8n подключился
   - `📨 Получено сообщение для сессии` ← вызов инструмента
   - `❌ Ошибка` ← проблемы

## 🚨 Troubleshooting

**n8n не может подключиться:**
- ✅ Проверьте URL: должен заканчиваться на `/sse`
- ✅ Убедитесь что сервер запущен (health check)
- ✅ Проверьте переменные окружения в Railway

**Инструменты не работают:**
- ✅ Проверьте YClients токен и права доступа
- ✅ Убедитесь что Company ID правильный
- ✅ Посмотрите логи Railway для деталей ошибок

**Медленная работа:**
- ✅ Проверьте rate limits YClients API
- ✅ Используйте кэширование списков услуг/мастеров
- ✅ Оптимизируйте workflow для минимума вызовов API

## ✅ Готово!

После настройки у вас будет полностью автоматизированная система записи клиентов через Telegram бот с использованием YClients API! 🎉 