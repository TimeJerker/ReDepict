// src/components/ui/Toast.tsx
import { X } from 'lucide-react';

interface ToastProps {
  message: string;
  type?: 'error' | 'success';
  onClose?: () => void; // <-- Добавили необязательный пропс
}

export const Toast = ({ message, type = 'error', onClose }: ToastProps) => {
  return (
    <div className={`fixed bottom-4 right-4 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-white text-sm z-50 transition-all
      ${type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>
      
      <span>{message}</span>
      
      {/* Если передана функция onClose, показываем крестик */}
      {onClose && (
        <button 
          onClick={onClose}
          className="ml-auto opacity-70 hover:opacity-100 transition-opacity"
          aria-label="Закрыть"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};