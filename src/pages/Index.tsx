import React, { useState, useEffect, useRef, useCallback } from 'react';
import Dino from '@/components/Dino';
import Obstacle from '@/components/Obstacle';
import GameOverScreen from '@/components/GameOverScreen';
import LevelUpNotification from '@/components/LevelUpNotification';
import { Gamepad2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const INITIAL_GAME_SPEED = 5;
const OBSTACLE_INTERVAL_MIN = 900;
const OBSTACLE_INTERVAL_MAX = 2200;

const LEVEL_CONFIG = [
    { level: 1, goal: 0, speed: 5, background: 'from-sky-300 to-sky-500' },
    { level: 2, goal: 500, speed: 6, background: 'from-amber-200 to-yellow-400' },
    { level: 3, goal: 1500, speed: 7.5, background: 'from-indigo-500 to-slate-800' },
    { level: 4, goal: 3000, speed: 9, background: 'from-slate-800 to-black' },
    { level: 5, goal: 5000, speed: 11, background: 'from-purple-400 to-pink-500' },
];

type GameState = 'waiting' | 'playing' | 'gameOver';
type ObstacleType = 'cactus-small' | 'cactus-large' | 'bird';

interface ObstacleState {
  id: number;
  type: ObstacleType;
  left: number;
  ref: React.RefObject<HTMLDivElement>;
  top?: number;
}

const Index = () => {
  const [gameState, setGameState] = useState<GameState>('waiting');
  const [isJumping, setIsJumping] = useState(false);
  const [runFrame, setRunFrame] = useState(0);
  const [obstacles, setObstacles] = useState<ObstacleState[]>([]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameSpeed, setGameSpeed] = useState(INITIAL_GAME_SPEED);
  const [level, setLevel] = useState(1);
  const [levelUpInfo, setLevelUpInfo] = useState<{ show: boolean; level: number }>({ show: false, level: 0 });

  const dinoRef = useRef<HTMLDivElement>(null);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const lastTimeRef = useRef<number | null>(null);
  const nextObstacleTimeRef = useRef<number>(0);
  const scoreRef = useRef(0);
  const levelRef = useRef(1);

  useEffect(() => {
    const storedHighScore = localStorage.getItem('dinoHighScore');
    if (storedHighScore) {
      setHighScore(parseInt(storedHighScore, 10));
    }
  }, []);

  const handleStart = () => {
    setGameState('playing');
    setScore(0);
    scoreRef.current = 0;
    setObstacles([]);
    setLevel(1);
    levelRef.current = 1;
    setGameSpeed(LEVEL_CONFIG[0].speed);
    nextObstacleTimeRef.current = OBSTACLE_INTERVAL_MIN;
    lastTimeRef.current = null;
    requestAnimationFrame(gameLoop);
  };

  const handleJump = useCallback(() => {
    if (gameState === 'playing' && !isJumping) {
      setIsJumping(true);
      setTimeout(() => setIsJumping(false), 600);
    } else if (gameState === 'waiting' || gameState === 'gameOver') {
      handleStart();
    }
  }, [gameState, isJumping]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        handleJump();
      }
    };
    
    const handleTouchStart = (e: TouchEvent) => {
        e.preventDefault();
        handleJump();
    }

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('touchstart', handleTouchStart);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('touchstart', handleTouchStart);
    };
  }, [handleJump]);

  const gameLoop = useCallback((time: number) => {
    if (lastTimeRef.current == null || gameState !== 'playing') {
      lastTimeRef.current = time;
      if (gameState === 'playing') requestAnimationFrame(gameLoop);
      return;
    }

    const delta = time - lastTimeRef.current;
    lastTimeRef.current = time;

    // Update score and check for level up
    scoreRef.current += delta * 0.01;
    setScore(scoreRef.current);
    
    const currentLevelIndex = levelRef.current - 1;
    if (LEVEL_CONFIG[currentLevelIndex + 1] && scoreRef.current >= LEVEL_CONFIG[currentLevelIndex + 1].goal) {
        levelRef.current++;
        setLevel(levelRef.current);
        setGameSpeed(LEVEL_CONFIG[levelRef.current - 1].speed);
        setLevelUpInfo({ show: true, level: levelRef.current });
        setTimeout(() => setLevelUpInfo({ show: false, level: 0 }), 2000);
    }

    setRunFrame(prev => (Math.floor(scoreRef.current / 10) % 2));

    // Move and manage obstacles
    let newObstacles = obstacles.map(obs => ({ ...obs, left: obs.left - (gameSpeed * delta) / 10 })).filter(obs => obs.left > -100);

    // Spawn new obstacles
    nextObstacleTimeRef.current -= delta;
    if (nextObstacleTimeRef.current <= 0) {
      let type: ObstacleType;
      const random = Math.random();
      if (levelRef.current > 1 && random < 0.25) {
          type = 'bird';
      } else if (random < 0.65) {
          type = 'cactus-small';
      } else {
          type = 'cactus-large';
      }
      
      const newObstacle: ObstacleState = {
        id: Date.now(),
        type,
        left: gameAreaRef.current?.offsetWidth || window.innerWidth,
        ref: React.createRef<HTMLDivElement>(),
      };

      if (type === 'bird') {
        newObstacle.top = Math.random() > 0.5 ? 20 : 70;
      }

      newObstacles.push(newObstacle);
      nextObstacleTimeRef.current = Math.floor(Math.random() * (OBSTACLE_INTERVAL_MAX - OBSTACLE_INTERVAL_MIN + 1) + OBSTACLE_INTERVAL_MIN) / (gameSpeed / INITIAL_GAME_SPEED);
    }
    
    setObstacles(newObstacles);

    // Check for collisions
    const dinoRect = dinoRef.current?.getBoundingClientRect();
    if (dinoRect) {
      for (const obs of newObstacles) {
        const obsRect = obs.ref.current?.getBoundingClientRect();
        if (obsRect && checkCollision(dinoRect, obsRect)) {
          endGame();
          return;
        }
      }
    }

    requestAnimationFrame(gameLoop);
  }, [obstacles, gameSpeed, gameState]);

  const checkCollision = (rect1: DOMRect, rect2: DOMRect) => {
    const padding = 5; // a little forgiveness
    return (
      rect1.left < rect2.right - padding &&
      rect1.right > rect2.left + padding &&
      rect1.top < rect2.bottom - padding &&
      rect1.bottom > rect2.top + padding
    );
  };

  const endGame = () => {
    setGameState('gameOver');
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('dinoHighScore', Math.floor(score).toString());
    }
  };

  const currentBackground = LEVEL_CONFIG[level - 1]?.background || 'from-gray-400 to-gray-600';

  return (
    <div className="w-full h-screen bg-gray-100 flex flex-col items-center justify-center font-sans p-4">
      <div className="w-full max-w-4xl text-center mb-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-700 to-black bg-clip-text text-transparent">Dino Runner</h1>
        <p className="text-gray-500">Press Space or Tap to Jump</p>
      </div>
      <div
        ref={gameAreaRef}
        className={cn(
            "relative w-full max-w-4xl h-[300px] rounded-2xl overflow-hidden shadow-2xl border-4 border-white transition-all duration-1000",
            `bg-gradient-to-b ${currentBackground}`
        )}
        onClick={handleJump}
      >
        {levelUpInfo.show && <LevelUpNotification level={levelUpInfo.level} />}
        {gameState === 'waiting' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 text-white">
            <Gamepad2 size={64} className="mb-4" />
            <h2 className="text-3xl font-bold">Click or Press Space to Start</h2>
          </div>
        )}
        {gameState === 'gameOver' && <GameOverScreen score={score} highScore={highScore} onRestart={handleStart} />}
        
        <div className="absolute top-4 right-4 text-white text-2xl font-bold text-shadow z-10">
          HI {Math.floor(highScore)} <span className="ml-4">{Math.floor(score)}</span>
        </div>

        <Dino ref={dinoRef} isJumping={isJumping} runFrame={runFrame} />

        {obstacles.map(obs => (
          <Obstacle key={obs.id} ref={obs.ref} type={obs.type} left={obs.left} top={obs.top} />
        ))}

        <div className="absolute bottom-0 left-0 w-full h-8 ground" style={{ animationDuration: `${10 / gameSpeed}s` }} />
      </div>
      <div className="mt-4 text-gray-400 text-sm">
        Made with Applaa
      </div>
    </div>
  );
};

export default Index;