import { z } from 'zod';
import { ValidationError } from '../types';

/**
 * Валидирует данные с помощью Zod схемы
 */
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      throw new ValidationError(
        `Ошибка валидации: ${firstError.message}`,
        firstError.path.join('.')
      );
    }
    throw error;
  }
}

/**
 * Нормализует номер телефона к формату +7XXXXXXXXXX
 */
export function normalizePhone(phone: string): string {
  // Удаляем все кроме цифр
  const digits = phone.replace(/\D/g, '');
  
  // Если начинается с 8, заменяем на 7
  if (digits.startsWith('8') && digits.length === 11) {
    return '+7' + digits.slice(1);
  }
  
  // Если начинается с 7, добавляем +
  if (digits.startsWith('7') && digits.length === 11) {
    return '+' + digits;
  }
  
  // Если 10 цифр без кода страны, добавляем +7
  if (digits.length === 10) {
    return '+7' + digits;
  }
  
  throw new ValidationError(`Некорректный формат телефона: ${phone}`);
}

/**
 * Проверяет, что дата не в прошлом
 */
export function validateFutureDate(dateString: string): boolean {
  const date = new Date(dateString);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  
  return date >= now;
}

/**
 * Проверяет корректность временного интервала
 */
export function validateTimeRange(timeFrom: string, timeTo: string): boolean {
  const [hoursFrom, minutesFrom] = timeFrom.split(':').map(Number);
  const [hoursTo, minutesTo] = timeTo.split(':').map(Number);
  
  const minutesFromStart = hoursFrom * 60 + minutesFrom;
  const minutesToStart = hoursTo * 60 + minutesTo;
  
  return minutesToStart > minutesFromStart;
}

/**
 * Форматирует дату в ISO строку для YClients API
 */
export function formatDateTimeForYClients(date: string, time: string): string {
  return `${date}T${time}:00`;
}

/**
 * Поиск услуги по названию (нечеткое совпадение)
 */
export function findServiceByName<T extends {id: number, title: string}>(services: T[], searchName: string): T[] {
  const normalizedSearch = searchName.toLowerCase().trim();
  
  // Точное совпадение
  const exact = services.filter(s => s.title.toLowerCase() === normalizedSearch);
  if (exact.length > 0) return exact;
  
  // Частичное совпадение
  const partial = services.filter(s => 
    s.title.toLowerCase().includes(normalizedSearch) ||
    normalizedSearch.includes(s.title.toLowerCase())
  );
  
  return partial;
}

/**
 * Поиск мастера по имени (нечеткое совпадение)
 */
export function findStaffByName<T extends {id: number, name: string}>(staff: T[], searchName: string): T[] {
  const normalizedSearch = searchName.toLowerCase().trim();
  
  // Точное совпадение
  const exact = staff.filter(s => s.name.toLowerCase() === normalizedSearch);
  if (exact.length > 0) return exact;
  
  // Частичное совпадение по имени или фамилии
  const partial = staff.filter(s => {
    const nameParts = s.name.toLowerCase().split(' ');
    const searchParts = normalizedSearch.split(' ');
    
    return searchParts.some(searchPart => 
      nameParts.some(namePart => 
        namePart.includes(searchPart) || searchPart.includes(namePart)
      )
    );
  });
  
  return partial;
} 