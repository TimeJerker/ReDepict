// src/screens/AnalysisScreen.tsx
import { Header, type Screen } from '../components/layout/Header';
import { Sidebar } from '../components/layout/Sidebar';
import { ChatArea } from '../components/chat/ChatArea';
import { ChatInput } from '../components/chat/ChatInput';
import type { ChatMessage } from '../components/chat/MessageBubble';
import type { ActiveWork } from '../App';
import type { DrawingResponse } from '../api/types';

interface AnalysisScreenProps {
  activeWork: ActiveWork | null;
  onNavigate: (screen: Screen) => void;
  onFileSelected: (file: File) => void;
  onSelectWork: (work: DrawingResponse) => void;
  theme?: 'light' | 'dark';
  toggleTheme?: () => void;
}

export const AnalysisScreen = ({ 
  activeWork, 
  onNavigate, 
  onFileSelected, 
  onSelectWork,
  theme, 
  toggleTheme 
}: AnalysisScreenProps) => {
  
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

  // --- ВОТ ЗДЕСЬ МЫ СОБИРАЕМ МАССИВ СООБЩЕНИЙ ---
  const messages: ChatMessage[] = [
    {
      id: '1',
      role: 'user',
      text: 'Оцени композицию и подскажи, что улучшить в тенях',
      imageUrl: activeWork.imageUrl, // Передаем картинку (локальную или серверную)
    },
  ];

  // Если загрузка завершена и есть ответ, добавляем сообщение от ИИ
  if (!activeWork.isUploading && activeWork.aiFeedback) {
    messages.push({
      id: '2',
      role: 'ai',
      text: activeWork.aiFeedback,
    });
  }
  // ------------------------------------------------

  return (
    <div className="h-screen flex flex-col bg-[var(--color-bg-primary)]">
      <Header active="analysis" onNavigate={onNavigate} theme={theme} toggleTheme={toggleTheme} />
      
      <div className="flex flex-1 min-h-0">
        {/* Передаем функцию и ID в сайдбар */}
        <Sidebar 
          onUpload={onFileSelected} 
          onSelectWork={onSelectWork} 
          activeWorkId={activeWork.id} 
        />
        
        <main className="flex-1 flex flex-col min-h-0 min-w-0">
          <ChatArea messages={messages} isLoading={activeWork.isUploading} />
          
          <ChatInput 
            onSend={(text) => alert(text)} 
            onFileSelected={onFileSelected}
            disabled={activeWork.isUploading} 
          />
        </main>
      </div>
    </div>
  );
};