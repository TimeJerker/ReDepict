// src/api/client.ts
const BASE_URL = '/api';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public payload?: unknown,
  ) {
    super(message);
  }
}

export async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const isFormData = init.body instanceof FormData;
  
  // Достаем токен из памяти браузера
  const token = localStorage.getItem('access_token');

  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      // Если токен есть, прикрепляем его к заголовку
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });

  if (!res.ok) {
    // Если бэкенд говорит 401 (Unauthorized), разлогиниваем
    if (res.status === 401) {
      localStorage.removeItem('access_token');
      window.location.reload(); 
    }

    const errorData = await res.json().catch(() => null);
    throw new ApiError(
      res.status,
      errorData?.detail || `Ошибка сети: ${res.status}`,
      errorData
    );
  }

  if (res.status === 204) return {} as T;
  return (await res.json()) as T;
}