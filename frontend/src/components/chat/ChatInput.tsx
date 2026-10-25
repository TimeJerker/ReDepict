// src/components/chat/ChatInput.tsx
import { Paperclip, Send } from 'lucide-react';

export const ChatInput = () => {
  return (
    <div className="p-4 shrink-0">
      <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--color-bg-secondary)]">
        <button
          type="button"
          aria-label="Прикрепить файл"
          className="w-8 h-8 flex items-center justify-center rounded text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors shrink-0"
        >
          <Paperclip size={20} />
        </button>

        <input
          type="text"
          placeholder="Написать сообщение..."
          className="flex-1 min-w-0 bg-transparent outline-none text-sm font-bold text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] placeholder:font-bold"
        />

        <button
          type="button"
          aria-label="Отправить"
          className="w-10 h-10 flex items-center justify-center rounded-full bg-[var(--color-accent-primary)] text-white hover:opacity-90 transition-opacity shrink-0"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};