import React from 'react';
import { Button } from '@/components/ui/button';
import { RotateCw } from 'lucide-react';

interface GameOverScreenProps {
  score: number;
  highScore: number;
  onRestart: () => void;
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({ score, highScore, onRestart }) => {
  return (
    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-20">
      <div className="bg-white/90 p-8 rounded-2xl shadow-2xl text-center border border-gray-200">
        <h2 className="text-5xl font-bold text-gray-800 mb-2">Game Over</h2>
        <p className="text-xl text-gray-600 mb-4">You ran into something pointy!</p>
        <div className="flex justify-center space-x-8 my-6">
          <div>
            <p className="text-lg text-gray-500">Score</p>
            <p className="text-4xl font-bold bg-gradient-to-r from-gray-600 to-gray-800 bg-clip-text text-transparent">{Math.floor(score)}</p>
          </div>
          <div>
            <p className="text-lg text-gray-500">High Score</p>
            <p className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">{Math.floor(highScore)}</p>
          </div>
        </div>
        <Button onClick={onRestart} size="lg" className="mt-4 text-lg">
          <RotateCw className="mr-2 h-5 w-5" />
          Play Again
        </Button>
      </div>
    </div>
  );
};

export default GameOverScreen;