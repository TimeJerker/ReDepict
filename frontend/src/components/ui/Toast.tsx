// src/components/ui/Toast.tsx
export const Toast = ({ message, type = 'error' }: { message: string; type?: 'error' | 'success' }) => {
  return (
    <div className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-lg text-white text-sm
      ${type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>
      {message}
    </div>
  );
};