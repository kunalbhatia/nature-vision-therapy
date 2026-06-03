import { useState, useEffect, useRef } from 'react';
import { useSnackbar } from '../../hooks/Snackbar';

interface NearFarFocusProps {
  onComplete?: (score: number) => void;
}

export default function NearFarFocus({ onComplete }: NearFarFocusProps) {
  const { showMessage } = useSnackbar();
  const [size, setSize] = useState(10);
  const [direction, setDirection] = useState<'near' | 'far'>('far');
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const words = ['VISION', 'POWER', 'EYES', 'FOCUS', 'SUPER', 'HEALTH', 'BRAVE', 'NATURE'];
  const [currentWord, setCurrentWord] = useState(words[0]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setSize(prev => {
          if (direction === 'far') {
            if (prev <= 1) {
              setDirection('near');
              setCurrentWord(words[Math.floor(Math.random() * words.length)]);
              return 1;
            }
            return prev - 0.2;
          } else {
            if (prev >= 15) {
              setDirection('far');
              setCurrentWord(words[Math.floor(Math.random() * words.length)]);
              return 15;
            }
            return prev + 0.2;
          }
        });
      }, 50);

      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => {
        clearInterval(interval);
        clearInterval(timer);
      };
    } else if (timeLeft === 0 && isActive) {
      handleFinish();
    }
  }, [isActive, timeLeft, direction]);

  const handleFinish = async () => {
    setIsActive(false);
    showMessage("Exercise Complete!", 'success');
    try {
      await fetch('/api/save-game-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId: 'near-far',
          score: 100, // Fixed score for completion
          durationSeconds: 60,
          date: new Date().toISOString().split('T')[0]
        })
      });
      if (onComplete) onComplete(100);
    } catch (error) {
      console.error('Failed to save score:', error);
    }
  };

  const startExercise = () => {
    if (containerRef.current) {
      containerRef.current.requestFullscreen().catch(() => {});
    }
    setIsActive(true);
    setTimeLeft(60);
    setSize(10);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl" ref={containerRef}>
      <div className="w-full flex justify-between items-center mb-6 px-4">
        <h2 className="text-2xl font-bold text-blue-800">Near-Far Focus</h2>
        <span className="text-xl font-bold text-orange-600">Time: {timeLeft}s</span>
      </div>

      <div className="relative w-full aspect-video bg-white rounded-3xl border-4 border-blue-100 shadow-inner overflow-hidden flex items-center justify-center">
        {!isActive && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm text-white rounded-2xl">
            <h3 className="text-3xl font-black mb-4 uppercase tracking-widest">Acommodation Training</h3>
            <p className="mb-8 text-lg max-w-md text-center">
              Watch the word as it grows and shrinks. <br/>
              <span className="font-bold text-yellow-400">Keep it in clear focus!</span>
            </p>
            <button 
              onClick={startExercise} 
              className="btn btn-primary btn-lg px-12 rounded-2xl shadow-xl hover:scale-105 transition-transform"
            >
              Start Exercise
            </button>
          </div>
        )}

        <div 
          className="font-black text-blue-900 transition-all duration-75 select-none"
          style={{ fontSize: `${size}rem` }}
        >
          {currentWord}
        </div>

        <div className="absolute bottom-8 text-lg font-bold text-gray-400 uppercase tracking-[1rem]">
          {direction === 'far' ? 'Moving Away...' : 'Coming Closer...'}
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100">
          <h4 className="font-bold text-blue-800 mb-2">How it works</h4>
          <p className="text-sm text-blue-700 leading-relaxed">
            This trains your eye&apos;s focusing muscle (accommodation) to quickly adjust between near and far objects.
          </p>
        </div>
        <div className="bg-green-50 p-6 rounded-3xl border border-green-100">
          <h4 className="font-bold text-green-800 mb-2">Instructions</h4>
          <p className="text-sm text-green-700 leading-relaxed">
            Try to keep the letters sharp. If they become blurry, blink and try to &quot;push&quot; your focus until they are clear again.
          </p>
        </div>
      </div>
    </div>
  );
}
