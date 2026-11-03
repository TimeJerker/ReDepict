// src/api/types.ts
export interface DrawingResponse {
  id: number;
  user_id: number;
  bucket: string;
  object_key: string;
  image_url: string | null;
  original_name: string;
  mime_type: string;
  size_bytes: number;
  technique: string | null;
  level: string | null;
  status: string;
  created_at: string;
}

export interface ChatMessageResponse {
  id: number;
  role: 'user' | 'ai';
  text: string;
  created_at: string;
}