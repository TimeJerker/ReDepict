// src/components/chat/ChatArea.tsx
import { MessageBubble, type ChatMessage } from './MessageBubble';

const messages: ChatMessage[] = [
  {
    id: '1',
    role: 'user',
    hasImage: true,
    text: 'Оцени композицию и подскажи, что улучшить в тенях',
  },
  {
    id: '2',
    role: 'ai',
    text:
      'Разбираю вашу работу.\n' +
      '• Композиция: объект слишком близко к левому краю — попробуйте сместить ближе к центру.\n' +
      '• Тени: слишком мягкие. Добавьте более тёмный тон под объектом — это усилит контраст.',
  },
  {
    id: '3',
    role: 'user',
    text: 'А как именно затемнить?',
  },
  {
    id: '4',
    role: 'ai',
    text:
      'Возьмите мягкую кисть и наложите тёмный тон в 2 слоя под объектом. ' +
      'Начните с самого тёмного и постепенно растушуйте к краям.',
  },
];

export const ChatArea = () => {
  return (
    <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-4 p-8">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
    </div>
  );
};