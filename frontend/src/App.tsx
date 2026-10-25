// src/App.tsx
import { useState, useEffect, useRef } from 'react';
import { HomeScreen } from './screens/HomeScreen';
import { AnalysisScreen } from './screens/AnalysisScreen';
import { worksApi } from './api/works';
import { Toast } from './components/ui/Toast';
import type { Screen } from './components/layout/Header';

// Тип для текущей работы
// Мы используем его, чтобы хранить как временные (локальные), так и реальные данные с бэка
export interface ActiveWork {
  id: number | string; // string, пока бэк не ответил (например, 'temp')
  imageUrl: string;    
  aiFeedback: string | null;
  isUploading: boolean; // Флаг, чтобы показать в чате "ИИ печатает..."
  serverFilePath?: string;  // Сохраняем путь с сервера отдельно (на будущее)
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [activeWork, setActiveWork] = useState<ActiveWork | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [error, setError] = useState<string | null>(null);

  // Используем useRef, чтобы помнить текущую временную ссылку и удалять её при смене фото
  const currentBlobUrl = useRef<string | null>(null);
  
  // Применяем тему к HTML тегу
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Очистка памяти при размонтировании App (например, при закрытии вкладки)
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

  // Функция, которая вызывается, когда пользователь выбрал файл в HomeScreen
  const handleFileSelected = async (file: File) => {
    setError(null);

    // 1. Удаляем старую локальную ссылку из памяти, если она была
    if (currentBlobUrl.current) {
      URL.revokeObjectURL(currentBlobUrl.current);
    }

    // 2. Создаем новую временную локальную ссылку
    const localUrl = URL.createObjectURL(file);
    currentBlobUrl.current = localUrl;


    // 3. Мгновенно переключаем экран и показываем локальную картинку
    setActiveWork({
      id: 'temp',
      imageUrl: localUrl,
      aiFeedback: null,
      isUploading: true,
    });
    setScreen('analysis');

    //ИМИТАЦИЯ ОТВЕТА БЭКЕНДА (задержка 3 секунды)
    setTimeout(() => {
      setActiveWork({
        id: 1, // Фейковый ID
        imageUrl: localUrl,
        serverFilePath: 'mock/path.jpg',
        aiFeedback: "Это тестовый ответ от ИИ (мок).\n• Композиция: объект слишком близко к левому краю — попробуйте сместить ближе к центру.\n• Тени: слишком мягкие. Добавьте более тёмный тон под объектом — это усилит контраст.",
        isUploading: false, // Выключает лоадер, показывает ответ
      });
    }, 3000); 

    /*
    //  РЕАЛЬНЫЙ ЗАПРОС (раскомментировать, когда бэкенд будет готов)
    // 4. В фоне отправляем файл на бэкенд
    try {
      const data = await worksApi.upload(file);
      
      // 5. Бэк ответил успешно. 
      // ВАЖНО: imageUrl оставляем прежним (localUrl), чтобы картинка не мигала!
      setActiveWork({
        id: data.id,
        imageUrl: localUrl,        // <--- ОСТАВЛЯЕМ ЛОКАЛЬНУЮ ССЫЛКУ
        serverFilePath: data.file_path, // Сохраняем путь с сервера, если понадобится
        aiFeedback: data.ai_feedback,
        isUploading: false,
      });

  
      
    } catch (err: any) {
      // Если произошла ошибка (например, бэк упал или файл не прошел валидацию)
      console.error('Ошибка загрузки:', err);
      
      // Показываем ошибку
      setError(err.message || 'Не удалось загрузить файл. Попробуйте еще раз.');
      
      // Возвращаем пользователя на главный экран
      setScreen('home');
      setActiveWork(null);
      
      // Очищаем память
      URL.revokeObjectURL(localUrl);
      currentBlobUrl.current = null;
    }*/
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