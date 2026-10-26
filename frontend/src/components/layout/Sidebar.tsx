// src/components/layout/Sidebar.tsx
import { useEffect, useState } from 'react';
import { FilePicker } from '../ui/FilePicker';
import { worksApi } from '../../api/works';
import type { DrawingResponse } from '../../api/types';

interface SidebarProps {
  onUpload?: (file: File) => void;
  onSelectWork?: (work: DrawingResponse) => void; // <-- Добавили
  activeWorkId?: number | string; // <-- Добавили для подсветки
}

export const Sidebar = ({ onUpload, onSelectWork, activeWorkId }: SidebarProps) => {
  const [works, setWorks] = useState<DrawingResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Загружаем историю при монтировании
    worksApi.getHistory()
      .then(setWorks)
      .catch(err => console.error("Не удалось загрузить историю", err))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <aside className="w-[300px] shrink-0 flex flex-col gap-4 p-6 bg-[var(--color-bg-secondary)] overflow-y-auto">
      <FilePicker
        onFileSelected={(file) => onUpload?.(file)}
        variant="primary"
        className="w-full h-12 text-base font-bold"
      >
        + Загрузить
      </FilePicker>

      <div className="h-px w-full bg-[var(--color-border-default)]" />
      <h2 className="text-xl font-bold text-[var(--color-text-secondary)]">
        История
      </h2>

      {isLoading ? (
        <p className="text-sm text-[var(--color-text-secondary)]">Загрузка...</p>
      ) : (
        <ul className="flex flex-col gap-1">
          {works.map((work) => {
            const isActive = work.id === activeWorkId;
            return (
              <li key={work.id}>
                <button 
                  onClick={() => onSelectWork?.(work)} // <-- Вызываем при клике
                  className={`w-full flex items-center gap-2 p-2 rounded-md transition-opacity text-left ${
                    isActive ? 'bg-[var(--color-bg-positive)]' : 'bg-[var(--color-bg-lite)] hover:opacity-90'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-[var(--color-accent-primary)] shrink-0" />
                  <span className="text-sm font-bold text-[var(--color-text-secondary)] truncate">
                    {work.original_name || 'Без названия'}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
};