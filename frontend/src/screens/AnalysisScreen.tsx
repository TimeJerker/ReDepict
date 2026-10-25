// src/screens/AnalysisScreen.tsx
import { Header, type Screen } from '../components/layout/Header';
import { Sidebar } from '../components/layout/Sidebar';
import { ChatArea } from '../components/chat/ChatArea';
import { ChatInput } from '../components/chat/ChatInput';

interface AnalysisScreenProps {
  onNavigate: (screen: Screen) => void;
  theme?: 'light' | 'dark';          // <-- Добавили
  toggleTheme?: () => void;          // <-- Добавили
}

export const AnalysisScreen = ({ onNavigate, theme, toggleTheme }: AnalysisScreenProps) => {
  return (
    <div className="h-screen flex flex-col bg-[var(--color-bg-primary)]">
      <Header 
        active="analysis" 
        onNavigate={onNavigate} 
        theme={theme} 
        toggleTheme={toggleTheme} 
      />

      <div className="flex flex-1 min-h-0">
        <Sidebar />

        <main className="flex-1 flex flex-col min-h-0 min-w-0">
          <ChatArea />
          <ChatInput />
        </main>
      </div>
    </div>
  );
};