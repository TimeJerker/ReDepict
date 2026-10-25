// src/components/chat/MessageBubble.tsx
import { ImageIcon } from 'lucide-react';

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  text: string;
  imageUrl?: string; 
}

interface MessageBubbleProps {
  message: ChatMessage;
}

export const MessageBubble = ({ message }: MessageBubbleProps) => {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div className="self-end flex flex-col gap-2.5 p-4 rounded-xl bg-[var(--color-bg-lite)] w-[272px] max-w-full">
        {/* Если есть ссылка на картинку, рендерим её */}
        {message.imageUrl ? (
          <img
            src={message.imageUrl}
            alt="Загруженный рисунок"
            className="w-full aspect-[4/3] object-cover rounded-lg border border-[var(--color-border-default)]"
          />
        ) : (
          // Заглушка, если картинки нет (на всякий случай)
          <div className="w-full aspect-[4/3] rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border-default)] flex items-center justify-center">
            <ImageIcon size={32} className="text-[var(--color-text-secondary)]" />
          </div>
        )}
        
        <p className="text-sm font-bold text-[var(--color-text-secondary)] whitespace-pre-line">
          {message.text}
        </p>
      </div>
    );
  }

  return (
    <div className="self-start w-[600px] max-w-full p-4 rounded-xl bg-[var(--color-bg-secondary)]">
      <div className="p-2.5">
        <p className="text-sm font-bold text-[var(--color-text-primary)] whitespace-pre-line">
          {message.text}
        </p>
      </div>
    </div>
  );
};