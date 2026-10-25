// src/components/ui/FilePicker.tsx
import { useRef, ChangeEvent, ReactNode } from 'react';
import { AppButton } from './AppButton';

interface FilePickerProps {
  onFileSelected: (file: File) => void;
  accept?: string;
  maxSize?: number;
  children?: ReactNode;
  variant?: 'primary' | 'positive' | 'ghost';
  icon?: ReactNode;
  className?: string;
}

export const FilePicker = ({
  onFileSelected,
  accept = 'image/png, image/jpeg',
  maxSize = 10 * 1024 * 1024,
  children = 'Загрузить',
  variant = 'primary',
  icon,
  className = '',
}: FilePickerProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > maxSize) {
      alert('Файл слишком большой. Максимум 10 МБ.');
      return;
    }

    onFileSelected(file);
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
        className={className}
      >
        {children}
      </AppButton>
    </>
  );
};