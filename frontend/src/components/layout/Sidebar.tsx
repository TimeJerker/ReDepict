// src/components/layout/Sidebar.tsx
import { FilePicker } from '../ui/FilePicker';

const works = [
  'Работа 12.05',
  'Работа 08.05',
  'Работа 05.05',
  'Работа 04.05',
  'Работа 01.05',
];

interface SidebarProps {
  onUpload?: (file: File) => void;
}

export const Sidebar = ({ onUpload }: SidebarProps) => {
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

      <ul className="flex flex-col gap-1">
        {works.map((title) => (
          <li key={title}>
            <button className="w-full flex items-center gap-2 p-2 rounded-md bg-[var(--color-bg-lite)] hover:opacity-90 transition-opacity text-left">
              <span className="w-2 h-2 rounded-full bg-[var(--color-accent-primary)] shrink-0" />
              <span className="text-sm font-bold text-[var(--color-text-secondary)] truncate">
                {title}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
};