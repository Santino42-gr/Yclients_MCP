# Быстрая настройка YClients MCP Server

## 1. Установка зависимостей
```bash
npm install
```

## 2. Настройка API ключей

### Получение Bearer токена YClients:
1. Войдите в [личный кабинет YClients](https://yclients.com/)
2. Перейдите в **Настройки** → **API**
3. Создайте новый токен с правами:
   - Чтение клиентов и записей
   - Создание записей
   - Управление записями
4. Скопируйте Bearer токен

### Получение Company ID:
1. В личном кабинете YClients откройте URL
2. Company ID будет в адресной строке: `https://yclients.com/business/{COMPANY_ID}`

## 3. Настройка переменных окружения

Отредактируйте файл `.env`:
```bash
YCLIENTS_BEARER_TOKEN=ваш_bearer_токен_здесь
YCLIENTS_COMPANY_ID=ваш_company_id_здесь
```

## 4. Сборка и запуск
```bash
npm run build
npm start
```

## 5. Проверка работы

Проверить работу сервера (в отдельном терминале):
```bash
echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/list", "params": {}}' | npm start
```

## Готово! 🎉

Сервер готов к использованию с Telegram ботом в n8n или другими MCP клиентами.

### Основные инструменты:
- `book_appointment` - Запись клиента
- `find_available_time` - Поиск свободного времени  
- `get_services_list` - Список услуг
- `get_staff_list` - Список мастеров
- `find_client` - Поиск клиента
- `get_client_bookings` - Записи клиента
- `cancel_booking` - Отмена записи 