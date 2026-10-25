export interface SubmissionResponse {
  id: number;
  filename: string;
  file_path: string;
  ai_feedback: string | null;
  created_at: string;
}

export interface ChatMessageResponse {
  id: number;
  role: 'user' | 'ai';
  text: string;
  created_at: string;
}