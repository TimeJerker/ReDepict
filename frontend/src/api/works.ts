import { request } from './clients';
import type { DrawingResponse } from './types';

export const worksApi = {
  upload: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return request<DrawingResponse>('/upload-drawing/', {
      method: 'POST',
      body: form,
    });
  },
  getHistory: () => request<DrawingResponse[]>('/upload-drawing/history/'),
};