// src/App.tsx
import { useState, useEffect, useRef } from 'react';
import { HomeScreen } from './screens/HomeScreen';
import { AnalysisScreen } from './screens/AnalysisScreen';
import { LoginScreen } from './screens/LoginScreen'; // <-- Импорт экрана логина
import { worksApi } from './api/works';
import { Toast } from './components/ui/Toast';
import type { Screen } from './components/layout/Header';

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

  // Проверяем, есть ли токен при загрузке страницы
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    !!localStorage.getItem('access_token')
  );

  const currentBlobUrl = useRef<string | null>(null);
  
  // Применяем тему
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Очистка памяти при размонтировании
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

  // Загрузка файла
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
      setError(err.message || 'Не удалось загрузить файл.');
      setScreen('home');
      setActiveWork(null);
      URL.revokeObjectURL(localUrl);
      currentBlobUrl.current = null;
    }
  };
  
  // Если пользователь не авторизован — показываем экран логина
  if (!isAuthenticated) {
    return (
      <LoginScreen 
        onLoginSuccess={() => setIsAuthenticated(true)} 
        theme={theme} 
        toggleTheme={toggleTheme} 
      />
    );
  }

  // Если авторизован — показываем приложение
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
          theme={theme} 
          toggleTheme={toggleTheme} 
        />
      )}

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