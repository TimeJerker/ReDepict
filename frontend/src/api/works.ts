// src/api/works.ts
import { request } from './clients';
import type { DrawingResponse } from './types';

export const worksApi = {
  upload: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    // Внимание: теперь путь /upload-drawing/upload-drawing
    return request<DrawingResponse>('/upload-drawing/upload-drawing', {
      method: 'POST',
      body: form,
    });
  },
};