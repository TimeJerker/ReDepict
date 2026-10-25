import { request } from './clients';
import type { SubmissionResponse } from './types';

export const worksApi = {
  upload: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return request<SubmissionResponse>('/upload-drawing/', {
      method: 'POST',
      body: form,
    });
  },
  // Получение истории (когда бэкенд будет готов)
  getHistory: () => request<SubmissionResponse[]>('/history/'),
};