// src/components/chat/ChatArea.tsx
import { useEffect, useRef } from 'react';
import { MessageBubble, type ChatMessage } from './MessageBubble';

interface ChatAreaProps {
  messages: ChatMessage[];
  isLoading?: boolean;
}

export const ChatArea = ({ messages, isLoading }: ChatAreaProps) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Автоскролл вниз при добавлении новых сообщений
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, messages.at(-1)?.text, isLoading]);

  return (
    <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-4 p-8">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
      
      {/* Индикатор загрузки / "ИИ печатает..." */}
      {isLoading && (
        <div className="self-start w-[600px] max-w-full p-4 rounded-xl bg-[var(--color-bg-secondary)]">
          <div className="p-2.5">
            <p className="text-sm font-bold text-[var(--color-text-secondary)] animate-pulse">
              ИИ анализирует вашу работу...
            </p>
          </div>
        </div>
      )}
      
      {/* Невидимый элемент для автоскролла */}
      <div ref={bottomRef} />
    </div>
  );
};