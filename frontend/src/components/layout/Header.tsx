// src/components/layout/Header.tsx
import { Avatar } from '../ui/Avatar';
import { Sun, Moon } from 'lucide-react'; // Импортируем иконки
import logo from '../../assets/logo.png'; 

export type Screen = 'home' | 'analysis';

interface HeaderProps {
  active?: Screen;
  onNavigate?: (screen: Screen) => void;
  theme?: 'light' | 'dark';          // Добавили пропсы для темы
  toggleTheme?: () => void;          // Добавили функцию переключения
}

const navItems: { id: Screen; label: string }[] = [
  { id: 'home', label: 'Загрузить' },
  { id: 'analysis', label: 'История' },
];

export const Header = ({ active, onNavigate, theme, toggleTheme }: HeaderProps) => {
  return (
    <header className="flex items-center justify-between h-[72px] px-6 bg-[var(--color-bg-primary)] shrink-0 transition-colors duration-300">
      
      <button onClick={() => onNavigate?.('home')} className="w-[60px] h-[60px] flex items-center justify-center">
        <img src={logo} alt="Логотип" className="w-full h-full object-contain" />
      </button>

      <nav className="flex items-center gap-[50px]">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate?.(item.id)}
            className={`text-2xl font-bold transition-colors hover:opacity-70 ${
              active === item.id
                ? 'text-[var(--color-text-primary)]'
                : 'text-[var(--color-text-secondary)]'
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {/* Блок с переключателем темы и аватаром */}
      <div className="flex items-center gap-4">
        {toggleTheme && (
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-[var(--color-bg-secondary)] transition-colors text-[var(--color-text-primary)]"
            aria-label="Переключить тему"
          >
            {theme === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
          </button>
        )}
        <Avatar size={60} />
      </div>
    </header>
  );
};