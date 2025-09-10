import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface DinoProps {
  isJumping: boolean;
  runFrame: number;
}

const Dino = forwardRef<HTMLDivElement, DinoProps>(({ isJumping, runFrame }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'absolute bottom-0 left-8 w-16 h-20 bg-gray-700 rounded-t-lg transition-transform duration-100',
        isJumping && 'dino-jump',
        `dino-run-${runFrame}`
      )}
      style={{ transformOrigin: 'bottom' }}
    >
      {/* Dino Eye */}
      <div className="absolute top-4 right-4 w-3 h-3 bg-white rounded-full">
        <div className="w-1 h-1 bg-black rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
      </div>
    </div>
  );
});

Dino.displayName = 'Dino';

export default Dino;