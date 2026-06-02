import { useState, useEffect, useRef, useCallback } from 'react';
import { useSnackbar } from '../../hooks/Snackbar';

interface DotTracingProps {
  onComplete?: (score: number) => void;
}

export default function DotTracing({ onComplete }: DotTracingProps) {
  const { showMessage } = useSnackbar();
  const [target, setTarget] = useState({ x: 50, y: 50 });
  const [score, setScore] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>(null);
  const startTimeRef = useRef<number>(0);

  const animate = useCallback((time: number) => {
    if (!startTimeRef.current) startTimeRef.current = time;
    const elapsed = time - startTimeRef.current;
    
    // Create a figure-8 pattern
    const x = 50 + 35 * Math.sin(elapsed / 1000);
    const y = 50 + 25 * Math.sin((elapsed / 1000) * 2);
    
    setTarget({ x, y });
    requestRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      requestRef.current = requestAnimationFrame(animate);
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => {
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
        clearInterval(timer);
      };
    } else if (timeLeft === 0 && isActive) {
      handleFinish();
    }
  }, [isActive, timeLeft, animate]);

  const handleFinish = async () => {
    setIsActive(false);
    showMessage(`Exercise Complete! Score: ${score}`, 'success');
    
    try {
      await fetch('/api/save-game-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId: 'dot-tracing',
          score,
          durationSeconds: 60,
          date: new Date().toISOString().split('T')[0]
        })
      });
      if (onComplete) onComplete(score);
    } catch (error) {
      console.error('Failed to save exercise score:', error);
    }
  };

  const handleTargetClick = () => {
    if (!isActive) return;
    setScore(prev => prev + 10);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl">
      <div className="w-full flex justify-between items-center mb-6 px-4">
        <h2 className="text-2xl font-bold text-green-800">Dot Tracing</h2>
        <div className="flex gap-8 text-xl font-bold">
          <span className="text-blue-600">Score: {score}</span>
          <span className="text-orange-600">Time: {timeLeft}s</span>
        </div>
      </div>

      <div 
        ref={containerRef}
        className="relative w-full aspect-video bg-white rounded-3xl border-4 border-green-100 shadow-inner overflow-hidden cursor-none"
      >
        {!isActive && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm text-white rounded-2xl">
            <h3 className="text-3xl font-black mb-4 uppercase tracking-widest">Focus Exercise</h3>
            <p className="mb-8 text-lg max-w-md text-center">
              Follow the moving dot with your eyes. <br/>
              <span className="font-bold text-yellow-400">Keep your head still!</span>
            </p>
            <button 
              onClick={() => { setIsActive(true); setScore(0); setTimeLeft(60); startTimeRef.current = 0; }} 
              className="btn btn-primary btn-lg px-12 rounded-2xl shadow-xl hover:scale-105 transition-transform"
            >
              Start Exercise
            </button>
          </div>
        )}

        {/* The Target Dot */}
        <div 
          onClick={handleTargetClick}
          className="absolute w-12 h-12 bg-red-600 rounded-full shadow-lg border-4 border-white transition-transform duration-75 active:scale-150"
          style={{ 
            left: `${target.x}%`, 
            top: `${target.y}%`,
            transform: 'translate(-50%, -50%)',
            boxShadow: '0 0 20px rgba(220, 38, 38, 0.4)'
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        </div>

        {/* Custom cursor to help the child focus */}
        {isActive && (
          <div className="absolute pointer-events-none w-20 h-20 border-2 border-dashed border-green-300 rounded-full animate-spin-slow"
               style={{ left: `${target.x}%`, top: `${target.y}%`, transform: 'translate(-50%, -50%)' }}>
          </div>
        )}
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        <div className="bg-green-50 p-4 rounded-2xl border border-green-100">
          <h4 className="font-bold text-green-800 text-sm mb-1">Eye Control</h4>
          <p className="text-xs text-green-700">Trains smooth pursuit movements and muscle coordination.</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
          <h4 className="font-bold text-blue-800 text-sm mb-1">No Head Movement</h4>
          <p className="text-xs text-blue-700">Ensure only the eyes are moving to follow the target.</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-2xl border border-yellow-100">
          <h4 className="font-bold text-yellow-800 text-sm mb-1">Focus Mode</h4>
          <p className="text-xs text-yellow-700">Try to keep the red dot in the center of your vision.</p>
        </div>
      </div>
    </div>
  );
}
