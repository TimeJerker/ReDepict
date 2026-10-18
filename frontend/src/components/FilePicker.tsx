// src/components/ui/FilePicker.tsx
import { useRef, ChangeEvent, ReactNode } from 'react';
import { AppButton } from './AppButton';// переиспользуем кнопку

interface FilePickerProps {
  onFileSelected: (file: File) => void;
  accept?: string;
  maxSize?: number; // в байтах
  children?: ReactNode;
  variant?: 'primary' | 'ghost';
  icon?: ReactNode;
}

export const FilePicker = ({
  onFileSelected,
  accept = 'image/png, image/jpeg',
  maxSize = 10 * 1024 * 1024, // 10MB
  children = 'Загрузить',
  variant = 'primary',
  icon,
}: FilePickerProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Проверка размера
    if (file.size > maxSize) {
      alert('Файл слишком большой. Максимум 10 МБ.'); // В будущем заменить на Toast
      return;
    }

    onFileSelected(file);
    
    // Очищаем инпут, чтобы можно было выбрать тот же файл снова
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={accept}
        className="hidden"
      />
      <AppButton
        variant={variant}
        icon={icon}
        onClick={() => fileInputRef.current?.click()}
      >
        {children}
      </AppButton>
    </>
  );
};