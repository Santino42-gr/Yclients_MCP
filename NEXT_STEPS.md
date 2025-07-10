# 🎯 Следующие шаги для деплоя MCP сервера

## ✅ Что готово:
- ✅ MCP сервер с HTTP поддержкой
- ✅ Конфигурация для Railway
- ✅ Docker поддержка  
- ✅ Автоматическая сборка
- ✅ Health checks

## 📋 План действий:

### 1. **Получите YClients API токены** ⚡ (15 мин)

1. Зайдите в [личный кабинет YClients](https://yclients.com/)
2. **Настройки** → **API** → **Создать токен**
3. Права токена: ✅ Чтение клиентов ✅ Создание записей ✅ Управление записями
4. Скопируйте Bearer token
5. Найдите Company ID в URL: `yclients.com/business/{COMPANY_ID}`

### 2. **Загрузите код в GitHub** ⚡ (10 мин)

```bash
git init
git add .
git commit -m "YClients MCP Server для Railway"

# Создайте репозиторий на GitHub
git remote add origin https://github.com/USERNAME/yclients-mcp-server.git
git push -u origin main
```

### 3. **Деплой на Railway** ⚡ (5 мин)

1. [Railway.app](https://railway.app/) → **Start New Project** → **Deploy from GitHub**
2. Выберите ваш репозиторий
3. **Variables** → добавьте:
   ```
   YCLIENTS_BEARER_TOKEN=ваш_токен
   YCLIENTS_COMPANY_ID=ваш_id
   ```
4. Railway автоматически развернет проект

### 4. **Проверьте работу** ⚡ (5 мин)

Railway даст URL: `https://project-name.up.railway.app`

```bash
# Health check
curl https://ваш-url.up.railway.app/health

# Список инструментов
curl -X POST https://ваш-url.up.railway.app/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc": "2.0", "id": 1, "method": "tools/list", "params": {}}'
```

### 5. **Подключите к n8n** ⚡ (10 мин)

В вашем n8n workflow:

**Добавьте MCP Client узел:**
- **SSE Endpoint**: `https://ваш-url.up.railway.app/sse`
- **Authentication**: None  
- **Tools to Include**: All

**Используйте инструменты в workflow:**
1. Добавьте узлы после MCP Client
2. Выберите нужный инструмент (например, `book_appointment`)
3. Настройте аргументы:
   ```
   client_phone: {{ $json.phone }}
   client_name: {{ $json.name }}
   service_name: {{ $json.service }}
   preferred_date: {{ $json.date }}
   preferred_time: {{ $json.time }}
   ```

## 🛠️ Доступные инструменты:

| Инструмент | Описание | Использование |
|------------|----------|---------------|
| `book_appointment` | Умная запись клиента | Основная функция бота |
| `find_available_time` | Поиск свободного времени | Когда нужное время занято |
| `get_services_list` | Список услуг | Показать что предлагаем |
| `get_staff_list` | Список мастеров | Выбор мастера |
| `find_client` | Поиск клиента | Для постоянных клиентов |
| `get_client_bookings` | Записи клиента | История и активные записи |
| `cancel_booking` | Отмена записи | Отмена через бота |

## 💡 Рекомендации:

**Для Telegram бота:**
1. Используйте `get_services_list` для показа меню услуг
2. `find_available_time` когда клиент спрашивает "когда можно?"
3. `book_appointment` как основную функцию
4. Добавьте обработку ошибок и понятные сообщения

**Безопасность:**
- Никогда не коммитьте токены в код
- Используйте только переменные окружения Railway
- Мониторьте логи на предмет ошибок

## 🎉 Готово!

После этих шагов у вас будет:
- ✅ Работающий MCP сервер на Railway
- ✅ HTTP API для интеграции с n8n
- ✅ Автоматические обновления при изменениях кода
- ✅ Мониторинг и логи в Railway dashboard

**Время на весь процесс: ~45 минут** 