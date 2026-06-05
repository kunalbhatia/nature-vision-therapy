import { useState, useCallback, useRef } from 'react';
import { useSnackbar } from '../../hooks/Snackbar';
import AnaglyphWrapper, { RedEye, CyanEye } from '../games/AnaglyphWrapper';
import ExerciseTimer from './ExerciseTimer';
import DeviceRestriction from '../DeviceRestriction';

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
          durationSeconds: 120,
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

  const startExercise = async () => {
    if (containerRef.current) {
      try {
        await containerRef.current.requestFullscreen();
      } catch (err) {
        console.warn("Fullscreen request failed:", err);
      }
    }
    setScore(0);
    setIsActive(true);
    generateGrid();
  };

  return (
    <DeviceRestriction>
      <div className="flex flex-col items-center w-full h-full p-2 bg-purple-50/30 overflow-hidden" ref={containerRef}>
        {!isActive ? (
          <div className="flex-1 flex flex-col items-center justify-center w-full">
            <div className="bg-white p-10 rounded-[3rem] shadow-2xl border-4 border-purple-100 text-center max-w-xl animate-in zoom-in duration-500">
              <h3 className="text-4xl font-black mb-4 uppercase tracking-widest text-purple-900">Character Hunt</h3>
              <p className="mb-8 text-lg text-gray-700 text-center px-6">
                Put on your **Red-Blue glasses**! <br/>
                Find the target character in the grid as fast as you can.
              </p>
              <button 
                onClick={startExercise} 
                className="px-16 py-4 bg-purple-600 hover:bg-purple-500 text-white text-xl font-black rounded-3xl shadow-xl transition-all transform hover:scale-105 active:scale-95"
              >
                Start Mission
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center gap-4 relative py-4">
            <div className="flex justify-between w-full max-w-6xl items-center px-8">
              <div className="flex flex-col bg-white px-4 py-2 rounded-2xl border-2 border-purple-200 shadow-md">
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Find Target</span>
                <span className="text-4xl font-black text-purple-900 leading-none">{targetChar}</span>
              </div>
              <div className="flex items-center gap-6">
                <div className="bg-white px-6 py-2 rounded-2xl border-2 border-purple-200 shadow-md">
                  <span className="text-xl font-black text-blue-600 uppercase tracking-tighter">XP: {score}</span>
                </div>
                <div className="scale-75 origin-right">
                  <ExerciseTimer initialDuration={120} onComplete={handleFinish} />
                </div>
              </div>
            </div>

            <div className="relative w-full flex-1 max-w-6xl bg-white rounded-[3rem] border-8 border-purple-100 shadow-2xl overflow-hidden mx-4">
              <AnaglyphWrapper>
                <div className="grid grid-cols-6 md:grid-cols-8 gap-4 p-8 h-full items-stretch">
                  {grid.map((item, i) => {
                    const Button = (
                      <button
                        onClick={() => handleCharClick(item.char)}
                        className={`w-full h-full flex items-center justify-center text-4xl font-black rounded-[2rem] border-4 transition-all active:scale-90 shadow-lg
                          ${item.eye === 'red' 
                            ? 'bg-red-500 border-red-700 text-black shadow-red-200' 
                            : 'bg-cyan-500 border-cyan-700 text-black shadow-cyan-200'}
                        `}
                      >
                        {item.char}
                      </button>
                    );

                    return item.eye === 'red' ? (
                      <RedEye key={i} className="h-full">{Button}</RedEye>
                    ) : (
                      <CyanEye key={i} className="h-full">{Button}</CyanEye>
                    );
                  })}
                </div>
              </AnaglyphWrapper>
            </div>

            <div className="bg-white px-8 py-3 rounded-2xl border-2 border-purple-100 max-w-lg text-center shadow-lg">
              <p className="text-black text-xs font-black uppercase tracking-widest">
                Red = Right Eye | Blue = Left Eye. Use both to hunt!
              </p>
            </div>
          </div>
        )}
      </div>
    </DeviceRestriction>
  );
}
