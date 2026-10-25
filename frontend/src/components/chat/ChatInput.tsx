// src/components/chat/ChatInput.tsx
import { useState, KeyboardEvent, useRef, ChangeEvent } from 'react';
import { Paperclip, Send } from 'lucide-react';

interface ChatInputProps {
  onSend: (text: string) => void;
  onFileSelected: (file: File) => void; // <-- ДОБАВИЛИ: коллбэк для скрепки
  disabled?: boolean;
}

export const ChatInput = ({ onSend, onFileSelected, disabled }: ChatInputProps) => {
  const [text, setText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Обработка выбора файла
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Вызываем функцию из App.tsx
    onFileSelected(file);
    
    // Очищаем инпут, чтобы можно было выбрать тот же файл снова
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-4 shrink-0">
      <div className={`flex items-center gap-3 p-3 rounded-xl bg-[var(--color-bg-secondary)] transition-opacity ${disabled ? 'opacity-50' : ''}`}>
        
        {/* Скрытый инпут для выбора файла */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/png, image/jpeg, image/webp"
          className="hidden"
          disabled={disabled}
        />

        {/* Кнопка-скрепка */}
        <button
          type="button"
          aria-label="Прикрепить файл"
          onClick={() => fileInputRef.current?.click()} // <-- Открываем окно выбора файла
          disabled={disabled}
          className="w-8 h-8 flex items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors shrink-0 disabled:cursor-not-allowed"
        >
          <Paperclip size={20} />
        </button>

        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={disabled ? "Дождитесь ответа ИИ..." : "Написать сообщение..."}
          className="flex-1 min-w-0 bg-transparent outline-none text-sm font-bold text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] placeholder:font-bold disabled:cursor-not-allowed"
        />

        <button
          type="button"
          onClick={handleSend}
          disabled={disabled || !text.trim()}
          aria-label="Отправить"
          className="w-10 h-10 flex items-center justify-center rounded-full bg-[var(--color-accent-primary)] text-white hover:opacity-90 transition-opacity disabled:opacity-40 shrink-0"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};