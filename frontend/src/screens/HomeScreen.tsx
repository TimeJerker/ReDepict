// src/screens/HomeScreen.tsx
import { Header, type Screen } from '../components/layout/Header';
import { FilePicker } from '../components/ui/FilePicker';

interface HomeScreenProps {
  onNavigate: (screen: Screen) => void;
  theme?: 'light' | 'dark';          // <-- Добавили
  toggleTheme?: () => void;          // <-- Добавили
}

const steps = [
  { number: '1', title: 'Загрузите фото', text: 'PNG или JPG, до 10 МБ' },
  { number: '2', title: 'ИИ анализирует', text: 'Разбор займёт несколько секунд' },
  { number: '3', title: 'Получите советы', text: 'Что улучшить и как именно' },
];

export const HomeScreen = ({ onNavigate, theme, toggleTheme }: HomeScreenProps) => {
  const handleFile = (_file: File) => {
    onNavigate('analysis');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg-primary)]">
      <Header 
        active="home" 
        onNavigate={onNavigate} 
        theme={theme} 
        toggleTheme={toggleTheme} 
      />

      <main className="flex-1 flex flex-col">
        {/* Hero */}
        <section className="flex flex-col items-center justify-center gap-6 px-20 py-20 min-h-[580px] text-center">
          <h1 className="text-[48px] leading-[1.15] font-bold text-[var(--color-text-primary)] max-w-[952px]">
            Получите разбор своего рисунка от ИИ
          </h1>
          <p className="text-xl text-[var(--color-text-secondary)] max-w-[743px]">
            Загрузите фото — нейросеть укажет на ошибки и подскажет, как улучшить
          </p>
          <FilePicker
            onFileSelected={handleFile}
            variant="positive"
            className="w-[280px] h-14 text-xl font-bold mt-2"
          >
            Загрузить рисунок
          </FilePicker>
        </section>

        {/* How it works */}
        <section className="flex flex-col items-center gap-12 p-20">
          <h2 className="text-[32px] font-bold text-[var(--color-text-primary)]">
            Как это работает
          </h2>

          <div className="flex flex-wrap justify-center gap-6">
            {steps.map((step) => (
              <div
                key={step.number}
                className="w-[400px] max-w-full flex flex-col items-center gap-3 p-6 text-center"
              >
                <span className="text-5xl font-bold leading-none text-[var(--color-green-text-primary)]">
                  {step.number}
                </span>
                <h3 className="text-xl font-bold text-[var(--color-green-text-secondary)]">
                  {step.title}
                </h3>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};