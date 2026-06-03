import { useState, useEffect, useCallback, useRef } from 'react';
import { useSnackbar } from '../../hooks/Snackbar';
import AnaglyphWrapper, { RedEye, CyanEye } from '../games/AnaglyphWrapper';

interface CharacterHuntProps {
  onComplete?: (score: number) => void;
}

interface GridItem {
  char: string;
  eye: 'red' | 'cyan';
}

export default function CharacterHunt({ onComplete }: CharacterHuntProps) {
  const { showMessage } = useSnackbar();
  const [grid, setGrid] = useState<GridItem[]>([]);
  const [targetChar, setTargetChar] = useState('');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isActive, setIsActive] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  const generateGrid = useCallback(() => {
    const newTarget = chars[Math.floor(Math.random() * chars.length)];
    setTargetChar(newTarget);
    
    const newGrid: GridItem[] = Array.from({ length: 48 }, () => {
      const isTarget = Math.random() < 0.1;
      return {
        char: isTarget ? newTarget : chars[Math.floor(Math.random() * chars.length)],
        eye: Math.random() < 0.5 ? 'red' : 'cyan'
      };
    });
    
    // Ensure at least one target exists
    if (!newGrid.some(item => item.char === newTarget)) {
      newGrid[Math.floor(Math.random() * 48)] = {
        char: newTarget,
        eye: Math.random() < 0.5 ? 'red' : 'cyan'
      };
    }
    
    setGrid(newGrid);
  }, []);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && isActive) {
      handleFinish();
    }
  }, [isActive, timeLeft]);

  const handleFinish = async () => {
    setIsActive(false);
    showMessage(`Exercise Complete! Score: ${score}`, 'success');
    try {
      await fetch('/api/save-game-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId: 'character-hunt',
          score,
          durationSeconds: 60,
          date: new Date().toISOString().split('T')[0]
        })
      });
      if (onComplete) onComplete(score);
    } catch (error) {
      console.error('Failed to save score:', error);
    }
  };

  const handleCharClick = (char: string) => {
    if (char === targetChar) {
      setScore(prev => prev + 10);
      generateGrid();
    } else {
      setScore(prev => Math.max(0, prev - 5));
    }
  };

  const startExercise = () => {
    if (containerRef.current) {
      containerRef.current.requestFullscreen().catch(() => {});
    }
    setScore(0);
    setTimeLeft(60);
    setIsActive(true);
    generateGrid();
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl" ref={containerRef}>
      <div className="w-full flex justify-between items-center mb-6 px-4">
        <h2 className="text-2xl font-bold text-purple-800">Anaglyph Character Hunt</h2>
        <div className="flex gap-8 text-xl font-bold">
          <span className="text-blue-600">Score: {score}</span>
          <span className="text-orange-600">Time: {timeLeft}s</span>
        </div>
      </div>

      <div className="relative w-full bg-white rounded-3xl border-4 border-purple-100 shadow-xl p-8 min-h-[500px] flex items-center justify-center">
        {!isActive ? (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm text-white rounded-2xl">
            <h3 className="text-3xl font-black mb-4 uppercase tracking-widest text-center">Binocular Acuity Training</h3>
            <p className="mb-8 text-lg max-w-md text-center px-6">
              Put on your red-blue glasses! <br/>
              Find the target character. Some are red, some are blue!
            </p>
            <button 
              onClick={startExercise} 
              className="btn btn-primary btn-lg px-12 rounded-2xl shadow-xl hover:scale-105 transition-transform"
            >
              Start Exercise
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center w-full">
            <div className="mb-8 p-6 bg-purple-50 rounded-2xl border-2 border-purple-200 text-center">
              <span className="text-gray-500 font-bold uppercase text-xs tracking-widest mb-1 block">Find this target:</span>
              <span className="text-6xl font-black text-purple-900">{targetChar}</span>
            </div>
            
            <div className="w-full max-w-3xl min-h-[400px]">
              <AnaglyphWrapper>
                <div className="grid grid-cols-6 md:grid-cols-8 gap-3 p-6">
                  {grid.map((item, i) => {
                    const Button = (
                      <button
                        onClick={() => handleCharClick(item.char)}
                        className={`w-full aspect-square flex items-center justify-center text-3xl font-black rounded-xl border-2 transition-all active:scale-95 shadow-sm
                          ${item.eye === 'red' ? 'bg-red-500/20 border-red-500 text-red-600' : 'bg-cyan-500/20 border-cyan-500 text-cyan-600'}
                        `}
                      >
                        {item.char}
                      </button>
                    );

                    return item.eye === 'red' ? (
                      <RedEye key={i}>{Button}</RedEye>
                    ) : (
                      <CyanEye key={i}>{Button}</CyanEye>
                    );
                  })}
                </div>
              </AnaglyphWrapper>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        <div className="bg-purple-50 p-6 rounded-3xl border border-purple-100">
          <h4 className="font-bold text-purple-800 mb-2">How it works</h4>
          <p className="text-sm text-purple-700 leading-relaxed">
            By making characters visible to only one eye at a time, we force your brain to use both eyes simultaneously to scan the grid. This treats suppression and builds binocular vision.
          </p>
        </div>
        <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100">
          <h4 className="font-bold text-blue-800 mb-2">Instructions</h4>
          <p className="text-sm text-blue-700 leading-relaxed">
            Put on your red-blue glasses. Scan the grid and tap the target. Some will appear darker through one lens and disappear through the other!
          </p>
        </div>
      </div>
    </div>
  );
}
