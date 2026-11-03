
// src/screens/LoginScreen.tsx
import { useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { request } from '../api/clients';
import { Modal } from '../components/ui/Modal';

const logo = new URL('../assets/logo.png', import.meta.url).href;
interface LoginScreenProps {
  onLoginSuccess: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export const LoginScreen = ({ onLoginSuccess, theme, toggleTheme }: LoginScreenProps) => {
  // --- Состояния для входа ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // --- Состояния для модалки регистрации ---
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Обработка входа
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const data = await request<{ access_token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      localStorage.setItem('access_token', data.access_token);
      onLoginSuccess();
    } catch (err: any) {
      setError(err.payload?.detail || err.message || 'Неверный email или пароль');
    } finally {
      setIsLoading(false);
    }
  };

  // Обработка регистрации
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (regPassword !== regConfirm) {
      setError("Пароли не совпадают");
      return;
    }
    if (regPassword.length < 6) {
      setError("Пароль должен быть минимум 6 символов");
      return;
    }

    setIsLoading(true);
    try {
      await request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ 
          username: regName,
          email: regEmail, 
          password: regPassword 
        }),
      });
      
      setIsRegisterModalOpen(false);
      setRegName(''); setRegEmail(''); setRegPassword(''); setRegConfirm('');
      
      // Автоматический вход после регистрации
      const loginData = await request<{ access_token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: regEmail, password: regPassword }),
      });
      localStorage.setItem('access_token', loginData.access_token);
      onLoginSuccess();

    } catch (err: any) {
      const errorMessage = err.payload?.detail?.[0]?.msg || err.payload?.detail || err.message;
      setError(errorMessage || 'Ошибка при регистрации');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // relative нужен для абсолютного позиционирования кнопки темы
    <div className="relative min-h-screen flex items-center justify-center bg-[var(--color-bg-secondary)] p-4">
      
      {/* Кнопка переключения темы */}
      <button 
        onClick={toggleTheme}
        className="absolute top-6 right-6 p-2 rounded-full hover:bg-[var(--color-bg-primary)] transition-colors text-[var(--color-text-primary)]"
        aria-label="Переключить тему"
      >
        {theme === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
      </button>

      {/* === КАРТОЧКА ВХОДА === */}
      <div className="w-full max-w-[400px] p-8 bg-[var(--color-bg-primary)] rounded-2xl shadow-sm border border-[var(--color-border-default)] flex flex-col items-center">
        
        <img src={logo} alt="Logo" className="w-16 h-16 object-contain mb-4" />
        
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-6 text-center">
          Вход в приложение
        </h1>
        
        {error && (
          <div className="w-full mb-4 p-3 rounded-lg text-sm text-center bg-red-500/10 text-red-500">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="w-full flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[var(--color-text-secondary)]">Email</label>
            <input
              type="email"
              placeholder="you@mail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-[var(--color-bg-primary)] border border-[var(--color-border-default)] rounded-lg outline-none text-sm text-[var(--color-text-primary)] focus:border-[var(--color-accent-primary)] transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[var(--color-text-secondary)]">Пароль</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-[var(--color-bg-primary)] border border-[var(--color-border-default)] rounded-lg outline-none text-sm text-[var(--color-text-primary)] focus:border-[var(--color-accent-primary)] transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 mt-2 bg-[var(--color-bg-positive)] text-[var(--color-text-primary)] rounded-lg font-bold text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {isLoading ? 'Загрузка...' : 'Войти'}
          </button>
          
          <button
            type="button"
            onClick={() => setIsRegisterModalOpen(true)}
            className="w-full py-3 bg-transparent border border-[var(--color-border-default)] text-[var(--color-text-primary)] rounded-lg font-bold text-sm hover:bg-[var(--color-bg-secondary)] transition-colors"
          >
            Регистрация
          </button>
        </form>
      </div>

      {/* === МОДАЛЬНОЕ ОКНО РЕГИСТРАЦИИ === */}
      <Modal isOpen={isRegisterModalOpen} onClose={() => setIsRegisterModalOpen(false)}>
        <div className="w-full flex flex-col gap-4">
          
          <h2 className="text-2xl font-bold text-[var(--color-text-primary)] text-center mb-2">
            Регистрация
          </h2>

          {error && (
            <div className="w-full p-3 rounded-lg text-sm text-center bg-red-500/10 text-red-500">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[var(--color-text-secondary)]">Имя</label>
              <input
                type="text"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                required
                className="w-full px-4 py-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border-default)] rounded-lg outline-none text-sm text-[var(--color-text-primary)]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[var(--color-text-secondary)]">Email</label>
              <input
                type="email"
                placeholder="you@mail.com"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                required
                className="w-full px-4 py-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border-default)] rounded-lg outline-none text-sm text-[var(--color-text-primary)]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[var(--color-text-secondary)]">Пароль</label>
              <input
                type="password"
                placeholder="Минимум 6 символов"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border-default)] rounded-lg outline-none text-sm text-[var(--color-text-primary)]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[var(--color-text-secondary)]">Повторите пароль</label>
              <input
                type="password"
                value={regConfirm}
                onChange={(e) => setRegConfirm(e.target.value)}
                required
                className="w-full px-4 py-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border-default)] rounded-lg outline-none text-sm text-[var(--color-text-primary)]"
              />
            </div>

            <div className="flex gap-3 mt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-2.5 bg-[var(--color-accent-primary)] text-white rounded-lg font-bold text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {isLoading ? 'Загрузка...' : 'Создать аккаунт'}
              </button>
              
              <button
                type="button"
                onClick={() => setIsRegisterModalOpen(false)}
                className="flex-1 py-2.5 bg-[var(--color-bg-secondary)] border border-[var(--color-border-default)] text-[var(--color-text-primary)] rounded-lg font-bold text-sm hover:opacity-90 transition-opacity"
              >
                Отмена
              </button>
            </div>
          </form>
        </div>
      </Modal>

    </div>
  );
};