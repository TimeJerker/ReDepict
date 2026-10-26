// src/App.tsx
import { useState, useEffect, useRef } from 'react';
import { HomeScreen } from './screens/HomeScreen';
import { AnalysisScreen } from './screens/AnalysisScreen';
import { worksApi } from './api/works';
import { Toast } from './components/ui/Toast';
import type { Screen } from './components/layout/Header';
import type { DrawingResponse } from './api/types';

export interface ActiveWork {
  id: number | string; 
  imageUrl: string;    
  aiFeedback: string | null;
  isUploading: boolean; 
  serverFilePath?: string | null; 
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [activeWork, setActiveWork] = useState<ActiveWork | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [error, setError] = useState<string | null>(null);

  const currentBlobUrl = useRef<string | null>(null);
  
  // Применяем тему к HTML тегу
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Очистка памяти при размонтировании App
  useEffect(() => {
    return () => {
      if (currentBlobUrl.current) {
        URL.revokeObjectURL(currentBlobUrl.current);
      }
    };
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Функция загрузки НОВОГО файла
  const handleFileSelected = async (file: File) => {
    setError(null);

    if (currentBlobUrl.current) {
      URL.revokeObjectURL(currentBlobUrl.current);
    }

    const localUrl = URL.createObjectURL(file);
    currentBlobUrl.current = localUrl;

    setActiveWork({
      id: 'temp',
      imageUrl: localUrl,
      aiFeedback: null,
      isUploading: true,
    });
    setScreen('analysis');

    try {
      const data = await worksApi.upload(file);
      
      setActiveWork({
        id: data.id,
        imageUrl: localUrl,        
        serverFilePath: data.image_url, 
        aiFeedback: data.status === 'analyzed' ? "Анализ готов" : "ИИ анализирует...",
        isUploading: false,
      });
      
    } catch (err: any) {
      console.error('Ошибка загрузки:', err);
      setError(err.message || 'Не удалось загрузить файл. Попробуйте еще раз.');
      setScreen('home');
      setActiveWork(null);
      URL.revokeObjectURL(localUrl);
      currentBlobUrl.current = null;
    }
  };

  // Функция переключения на СТАРУЮ работу из истории
  const handleSelectWork = (work: DrawingResponse) => {
    // Очищаем текущую временную ссылку, если она была
    if (currentBlobUrl.current) {
      URL.revokeObjectURL(currentBlobUrl.current);
      currentBlobUrl.current = null;
    }

    // Обновляем activeWork реальными данными из БД
    setActiveWork({
      id: work.id,
      // Если сервер вернул путь, добавляем слеш в начало (чтобы Vite-прокси перенаправил на бэкенд)
      imageUrl: work.image_url ? `/${work.image_url}` : '', 
      serverFilePath: work.image_url,
      aiFeedback: work.status === 'analyzed' ? "Анализ готов" : "ИИ анализирует...",
      isUploading: false,
    });
  };

  return (
    <>
      {screen === 'home' ? (
        <HomeScreen 
          onNavigate={setScreen} 
          onFileSelected={handleFileSelected} 
          theme={theme} 
          toggleTheme={toggleTheme} 
        />
      ) : (
        <AnalysisScreen 
          activeWork={activeWork}
          onNavigate={setScreen} 
          onFileSelected={handleFileSelected}
          onSelectWork={handleSelectWork} 
          theme={theme} 
          toggleTheme={toggleTheme} 
        />
      )}

      {/* Глобальный Toast для ошибок на уровне App */}
      {error && (
        <Toast 
          message={error} 
          type="error" 
          onClose={() => setError(null)} 
        />
      )}
    </>
  );
}