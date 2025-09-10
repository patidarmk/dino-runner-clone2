import React from 'react';
import { Star } from 'lucide-react';

interface LevelUpNotificationProps {
  level: number;
}

const LevelUpNotification: React.FC<LevelUpNotificationProps> = ({ level }) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
      <div className="level-up-notification bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-2xl text-center border border-yellow-300">
        <Star className="mx-auto h-12 w-12 text-yellow-400 mb-2" />
        <h2 className="text-4xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
          Level {level}
        </h2>
        <p className="text-gray-600">The challenge increases!</p>
      </div>
    </div>
  );
};

export default LevelUpNotification;