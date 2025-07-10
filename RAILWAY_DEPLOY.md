# Деплой на Railway

## 🚀 Пошаговая инструкция

### 1. Подготовка репозитория

Загрузите код в GitHub репозиторий:

```bash
# Инициализируем git (если еще не сделано)
git init
git add .
git commit -m "Initial YClients MCP Server"

# Создайте репозиторий на GitHub и загрузите код
git remote add origin https://github.com/YOUR_USERNAME/yclients-mcp-server.git
git push -u origin main
```

### 2. Создание проекта на Railway

1. Зайдите на [Railway.app](https://railway.app/)
2. Нажмите **"Start a New Project"**
3. Выберите **"Deploy from GitHub repo"**
4. Выберите ваш репозиторий `yclients-mcp-server`

### 3. Настройка переменных окружения

В Railway добавьте переменные окружения:

**Обязательные:**
```
YCLIENTS_BEARER_TOKEN=your_bearer_token_here
YCLIENTS_COMPANY_ID=your_company_id_here
```

**Опциональные:**
```
MCP_TRANSPORT=sse
PORT=3000
MCP_SERVER_NAME=yclients-booking
MCP_SERVER_VERSION=1.0.0
LOG_LEVEL=info
RATE_LIMIT_REQUESTS_PER_MINUTE=60
```

### 4. Настройка деплоя

Railway автоматически:
- Обнаружит Node.js проект
- Выполнит `npm run railway:build`
- Запустит `npm run railway:start`
- Присвоит публичный URL

### 5. Получение URL

После деплоя Railway предоставит URL вида:
```
https://your-project-name-production.up.railway.app
```

**MCP SSE endpoint будет доступен по адресу:**
```
https://your-project-name-production.up.railway.app/sse
```

### 6. Проверка работы

Проверьте деплой:

```bash
# Health check
curl https://your-project-name-production.up.railway.app/health

# Информация о сервере
curl https://your-project-name-production.up.railway.app/

# SSE endpoint для n8n MCP Client
# https://your-project-name-production.up.railway.app/sse
```

## ⚙️ Настройка n8n

### Подключение к n8n на Railway

В вашем n8n workflow добавьте **MCP Client узел**:

**Настройки MCP Client:**
- **SSE Endpoint**: `https://your-project-name-production.up.railway.app/sse`
- **Authentication**: None
- **Tools to Include**: All

**Пример использования в n8n:**
1. **MCP Client узел** → подключается к вашему серверу
2. Вызывайте инструменты через другие узлы в workflow
3. Например, для записи клиента:
   - Tool: `book_appointment`
   - Arguments:
     ```json
     {
       "client_phone": "+79123456789",
       "client_name": "Анна Иванова", 
       "service_name": "стрижка",
       "preferred_date": "2024-12-25",
       "preferred_time": "15:00"
     }
     ```

## 🔄 Автоматические обновления

Railway автоматически обновляет деплой при push в основную ветку GitHub.

## 📊 Мониторинг

В Railway dashboard доступны:
- Логи приложения
- Метрики использования
- Health checks
- Статистика запросов

## 🚨 Troubleshooting

**Сервер не запускается:**
1. Проверьте переменные окружения
2. Посмотрите логи в Railway dashboard
3. Убедитесь что Bearer token валидный

**MCP не отвечает:**
1. Проверьте health endpoint
2. Убедитесь что PORT = 3000 (или тот что назначил Railway)
3. Проверьте что MCP_TRANSPORT=sse

**Ошибки в n8n MCP Client:**
1. Проверьте SSE Endpoint URL (должен заканчиваться на /sse)
2. Убедитесь что сервер доступен (проверьте /health)
3. Посмотрите логи Railway для диагностики 