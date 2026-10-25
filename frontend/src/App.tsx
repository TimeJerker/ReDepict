// src/App.tsx
import { useState, useEffect } from 'react';
import { HomeScreen } from './screens/HomeScreen';
import { AnalysisScreen } from './screens/AnalysisScreen';
import type { Screen } from './components/layout/Header';

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Эффект для применения темы к документу
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return screen === 'home' ? (
    <HomeScreen onNavigate={setScreen} theme={theme} toggleTheme={toggleTheme} />
  ) : (
    <AnalysisScreen onNavigate={setScreen} theme={theme} toggleTheme={toggleTheme} />
  );
}