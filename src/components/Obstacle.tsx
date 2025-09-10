import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface ObstacleProps {
  type: 'cactus-small' | 'cactus-large' | 'bird';
  left: number;
  top?: number;
}

const Obstacle = forwardRef<HTMLDivElement, ObstacleProps>(({ type, left, top }, ref) => {
  const styles = {
    'cactus-small': 'w-8 h-16 bg-green-600 rounded-t-md',
    'cactus-large': 'w-12 h-24 bg-green-700 rounded-t-md',
    'bird': 'w-12 h-8 bg-cyan-500 rounded-full',
  };

  const positionStyle = top !== undefined ? { top: `${top}px` } : { bottom: 0 };
  const isBird = type === 'bird';

  return (
    <div
      ref={ref}
      className={cn('absolute', styles[type], isBird && 'bird-fly')}
      style={{ left: `${left}px`, ...positionStyle }}
    />
  );
});

Obstacle.displayName = 'Obstacle';

export default Obstacle;