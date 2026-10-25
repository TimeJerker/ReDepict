// src/screens/AnalysisScreen.tsx
import { Header, type Screen } from '../components/layout/Header';
import { Sidebar } from '../components/layout/Sidebar';
import { ChatArea } from '../components/chat/ChatArea';
import { ChatInput } from '../components/chat/ChatInput';
import type { ChatMessage } from '../components/chat/MessageBubble';
import type { ActiveWork } from '../App'; // Импортируем тип из App.tsx

interface AnalysisScreenProps {
  activeWork: ActiveWork | null;
  onNavigate: (screen: Screen) => void;
  onFileSelected: (file: File) => void;
  theme?: 'light' | 'dark';
  toggleTheme?: () => void;
}

export const AnalysisScreen = ({ activeWork, onNavigate, onFileSelected, theme, toggleTheme }: AnalysisScreenProps) => {
  // Защита на случай, если экран открылся без данных
  if (!activeWork) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[var(--color-bg-primary)]">
        <p className="text-lg text-[var(--color-text-secondary)] mb-4">Нет активной работы</p>
        <button 
          onClick={() => onNavigate('home')}
          className="text-[var(--color-accent-primary)] hover:underline font-bold"
        >
          Вернуться на главную
        </button>
      </div>
    );
  }

  // Формируем массив сообщений на основе данных от бэкенда (или временных данных)
  const messages: ChatMessage[] = [
    {
      id: '1',
      role: 'user',
      text: 'Оцени композицию и подскажи, что улучшить в тенях',
      imageUrl: activeWork.imageUrl, // Здесь будет либо blob:..., либо /uploads/...
    },
  ];

  // Если бэкенд уже ответил (isUploading === false) и есть текст ответа, добавляем пузырь ИИ
  if (!activeWork.isUploading && activeWork.aiFeedback) {
    messages.push({
      id: '2',
      role: 'ai',
      text: activeWork.aiFeedback,
    });
  }

  // Временная заглушка для отправки сообщений (пока на бэке нет ручки для чата)
  const handleSendMessage = (text: string) => {
    alert(`Бэкенд для чата еще не готов!\nВы пытались отправить: "${text}"`);
  };

  return (
    <div className="h-screen flex flex-col bg-[var(--color-bg-primary)]">
      <Header active="analysis" onNavigate={onNavigate} theme={theme} toggleTheme={toggleTheme} />

      <div className="flex flex-1 min-h-0">
        {/* Сайдбар (пока с моковыми данными истории) */}
        <Sidebar onUpload={onFileSelected} />

        <main className="flex-1 flex flex-col min-h-0 min-w-0">
          {/* Область чата. Передаем isLoading, чтобы показать "ИИ печатает..." */}
          <ChatArea 
            messages={messages} 
            isLoading={activeWork.isUploading} 
          />
          
          {/* Поле ввода временно заблокировано (disabled) */}
          <ChatInput 
            onSend={handleSendMessage} 
            onFileSelected={onFileSelected}
            disabled={activeWork.isUploading} 
          />
        </main>
      </div>
    </div>
  );
};