export interface DrawingResponse {
  id: number;
  original_name: string;
  image_url: string; // Бэкенд вернет /uploads/...
  status: string;
  created_at: string;
}

export interface ChatMessageResponse {
  id: number;
  role: 'user' | 'ai';
  text: string;
  created_at: string;
}