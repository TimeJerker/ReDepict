// src/api/client.ts

// Базовый URL. В vite.config.ts мы настроили прокси на /api, 
// поэтому все запросы будут уходить на http://localhost:8000
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
  
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...init.headers,
    },
  });

  if (!res.ok) {
    // Пытаемся достать текст ошибки из ответа FastAPI
    const errorData = await res.json().catch(() => null);
    throw new ApiError(
      res.status,
      errorData?.detail || `Ошибка сети: ${res.status}`,
      errorData
    );
  }

  // Если статус 204 (No Content), возвращаем пустой объект
  if (res.status === 204) return {} as T;

  return (await res.json()) as T;
}