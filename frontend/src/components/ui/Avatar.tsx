// src/components/ui/Avatar.tsx
import { User } from 'lucide-react'; // Или любая иконка

interface AvatarProps {
  src?: string;
  size?: number;
}

export const Avatar = ({ src, size = 40 }: AvatarProps) => {
  return (
    <div 
      className="rounded-full bg-gray-200 flex items-center justify-center overflow-hidden cursor-pointer hover:ring-2 ring-gray-300 transition-all"
      style={{ width: size, height: size }}
    >
      {src ? (
        <img src={src} alt="avatar" className="w-full h-full object-cover" />
      ) : (
        <User size={size * 0.6} className="text-gray-400" />
      )}
    </div>
  );
};