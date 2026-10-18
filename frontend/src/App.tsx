import { useState } from 'react';
import { AppButton} from './components/AppButton';
import { Input } from './components/Input';
import { FilePicker } from './components/FilePicker';
import { Modal } from './components/Modal';
import { Card } from './components/Card';
import { Avatar } from './components/Avatar';
import { Toast } from './components/Toast';

export default function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const handleFile = (file: File) => {
    setToastMessage(`Файл ${file.name} выбран!`);
    setTimeout(() => setToastMessage(''), 3000);
  };

  return (
    <div className="p-10 max-w-2xl mx-auto flex flex-col gap-8">
      <h1 className="text-3xl font-bold">Тест UI-кита</h1>

      <Card>
        <h2 className="text-xl font-semibold mb-4">Кнопки</h2>
        <div className="flex gap-4">
          <AppButton variant="primary">Загрузить</AppButton>
          <AppButton variant="ghost">История</AppButton>
          <AppButton variant="danger">Выход</AppButton>
          <AppButton variant="primary" loading>Загрузка...</AppButton>
        </div>
      </Card>

      <Card>
        <h2 className="text-xl font-semibold mb-4">Поля и Аватар</h2>
        <div className="flex flex-col gap-4">
          <Input label="Email" placeholder="you@mail.com" />
          <Input label="Пароль" type="password" error="Неверный пароль" />
          <div className="flex items-center gap-4">
            <span>Аватар:</span>
            <Avatar />
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="text-xl font-semibold mb-4">Действия</h2>
        <div className="flex gap-4">
          <FilePicker 
            onFileSelected={handleFile} 
            icon={<span>📎</span>} 
          />
          <AppButton onClick={() => setIsModalOpen(true)}>
            Открыть модалку
          </AppButton>
        </div>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <h2 className="text-2xl font-bold mb-4">Регистрация</h2>
        <div className="flex flex-col gap-4">
          <Input label="Имя" placeholder="Иван" />
          <Input label="Email" placeholder="ivan@mail.com" />
          <AppButton className="mt-2">Создать аккаунт</AppButton>
        </div>
      </Modal>

      {toastMessage && <Toast message={toastMessage} type="success" />}
    </div>
  );
}