import { useState, useEffect, useCallback, useRef } from 'react';
import { useSnackbar } from '../../hooks/Snackbar';
import { FaBolt } from 'react-icons/fa';
import AnaglyphWrapper, { RedEye, CyanEye } from '../games/AnaglyphWrapper';

interface SaccadeTrainingProps {
  onComplete?: (score: number) => void;
}

export default function SaccadeTraining({ onComplete }: SaccadeTrainingProps) {
  const { showMessage } = useSnackbar();
  const [activeSide, setActiveSide] = useState<'left' | 'right'>('left');
  const [targetPositions, setTargetPositions] = useState({
    left: { x: 20, y: 50 },
    right: { x: 80, y: 50 }
  });
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isActive, setIsActive] = useState(false);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const lastSpawnTime = useRef<number>(0);

  const toggleTarget = useCallback(() => {
    setActiveSide(prev => {
      const nextSide = prev === 'left' ? 'right' : 'left';
      
      // Randomize positions for the NEXT time they appear
      setTargetPositions(current => ({
        ...current,
        left: { 
          x: Math.random() * 30 + 10, // 10% to 40%
          y: Math.random() * 60 + 20  // 20% to 80%
        },
        right: { 
          x: Math.random() * 30 + 60, // 60% to 90%
          y: Math.random() * 60 + 20  // 20% to 80%
        }
      }));
      
      return nextSide;
    });
    lastSpawnTime.current = performance.now();
  }, []);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      if (lastSpawnTime.current === 0) lastSpawnTime.current = performance.now();
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && isActive) {
      handleFinish();
    }
  }, [isActive, timeLeft]);

  const handleFinish = async () => {
    setIsActive(false);
    const avgReaction = reactionTimes.length > 0 
      ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length) 
      : 0;
      
    showMessage(`Complete! Avg Reaction: ${avgReaction}ms`, 'success');
    
    try {
      await fetch('/api/save-game-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId: 'saccade-training',
          score,
          durationSeconds: 60,
          date: new Date().toISOString().split('T')[0],
          metadata: { avgReactionMs: avgReaction }
        })
      });
      if (onComplete) onComplete(score);
    } catch (error) {
      console.error('Failed to save score:', error);
    }
  };

  const handleTargetClick = (side: 'left' | 'right') => {
    if (!isActive || side !== activeSide) return;
    const reaction = performance.now() - lastSpawnTime.current;
    setReactionTimes(prev => [...prev, reaction]);
    setScore(prev => prev + 10);
    toggleTarget();
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl">
      <div className="w-full flex justify-between items-center mb-6 px-4">
        <h2 className="text-2xl font-bold text-orange-400 flex items-center gap-2">
          <FaBolt className="text-yellow-500" /> Anaglyph Saccade
        </h2>
        <div className="flex gap-8 text-xl font-bold">
          <span className="text-blue-400">Hits: {score/10}</span>
          <span className="text-orange-400">Time: {timeLeft}s</span>
        </div>
      </div>

      <div className="relative w-full aspect-video bg-black rounded-3xl border-4 border-gray-800 shadow-2xl overflow-hidden">
        {!isActive ? (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm text-white rounded-2xl">
            <h3 className="text-3xl font-black mb-4 uppercase tracking-widest text-center px-4 text-orange-500">Binocular Saccades</h3>
            <p className="mb-8 text-lg max-w-md text-center px-6 opacity-90">
              Put on your red-blue glasses. <br/>
              Jump your eyes to the <span className="text-yellow-400 font-bold">flashing target</span> as fast as you can!
            </p>
            <button 
              onClick={() => { setIsActive(true); setScore(0); setTimeLeft(60); setReactionTimes([]); lastSpawnTime.current = performance.now(); }} 
              className="btn btn-warning btn-lg px-12 rounded-2xl shadow-xl hover:scale-105 transition-transform font-black"
            >
              Start Training
            </button>
          </div>
        ) : (
          <AnaglyphWrapper>
            <div className="w-full h-full relative">
              {/* Center reference point */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-gray-600 rounded-full"></div>
              
              {/* Left Target (Red - Right Eye) */}
              <RedEye className={`absolute z-10 ${activeSide === 'left' ? '' : 'pointer-events-none'}`} style={{ left: `${targetPositions.left.x}%`, top: `${targetPositions.left.y}%`, transform: 'translate(-50%, -50%)' }}>
                <button
                  onClick={() => handleTargetClick('left')}
                  disabled={activeSide !== 'left'}
                  className={`w-28 h-28 rounded-full border-4 flex items-center justify-center transition-all duration-300
                    ${activeSide === 'left' 
                      ? 'bg-red-600 border-red-400 scale-110 shadow-[0_0_30px_rgba(220,38,38,0.5)] animate-pulse cursor-pointer' 
                      : 'bg-red-900/10 border-red-900/20 opacity-20 cursor-default'}
                  `}
                >
                  <div className="w-6 h-6 bg-white rounded-full opacity-50"></div>
                </button>
              </RedEye>

              {/* Right Target (Cyan - Left Eye) */}
              <CyanEye className={`absolute z-10 ${activeSide === 'right' ? '' : 'pointer-events-none'}`} style={{ left: `${targetPositions.right.x}%`, top: `${targetPositions.right.y}%`, transform: 'translate(-50%, -50%)' }}>
                <button
                  onClick={() => handleTargetClick('right')}
                  disabled={activeSide !== 'right'}
                  className={`w-28 h-28 rounded-full border-4 flex items-center justify-center transition-all duration-300
                    ${activeSide === 'right' 
                      ? 'bg-cyan-600 border-cyan-400 scale-110 shadow-[0_0_30px_rgba(8,145,178,0.5)] animate-pulse cursor-pointer' 
                      : 'bg-cyan-900/10 border-cyan-900/20 opacity-20 cursor-default'}
                  `}
                >
                  <div className="w-6 h-6 bg-white rounded-full opacity-50"></div>
                </button>
              </CyanEye>
            </div>
          </AnaglyphWrapper>
        )}
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        <div className="bg-gray-900 p-6 rounded-3xl border border-gray-800">
          <h4 className="font-bold text-orange-400 mb-2">Red-Blue Fusion</h4>
          <p className="text-sm text-gray-400 leading-relaxed">
            By using two permanent targets in different color channels, we force both eyes to stay &quot;on&quot; while jumping between them.
          </p>
        </div>
        <div className="bg-gray-900 p-6 rounded-3xl border border-gray-800">
          <h4 className="font-bold text-blue-400 mb-2">Reduced Strain</h4>
          <p className="text-sm text-gray-400 leading-relaxed">
            Dark background reduces glare and eye fatigue during intense focus sessions. Keep your eyes sharp!
          </p>
        </div>
      </div>
    </div>
  );
}
