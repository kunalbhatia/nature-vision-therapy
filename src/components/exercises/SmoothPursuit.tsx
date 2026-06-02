import { useState, useEffect, useRef, useCallback } from 'react';
import { useSnackbar } from '../../hooks/Snackbar';
import { FaWind } from 'react-icons/fa';

interface SmoothPursuitProps {
  onComplete?: (score: number) => void;
}

export default function SmoothPursuit({ onComplete }: SmoothPursuitProps) {
  const { showMessage } = useSnackbar();
  const [target, setTarget] = useState({ x: 50, y: 50 });
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [speed, setSpeed] = useState(1);
  
  const startTimeRef = useRef<number>(0);
  const requestRef = useRef<number>(null);

  const animate = useCallback((time: number) => {
    if (!startTimeRef.current) startTimeRef.current = time;
    const elapsed = (time - startTimeRef.current) / 1000;
    
    // Complex pursuit path: Lissajous curve
    const x = 50 + 40 * Math.sin(elapsed * 0.5 * speed);
    const y = 50 + 35 * Math.cos(elapsed * 0.3 * speed + Math.PI/4);
    
    setTarget({ x, y });
    requestRef.current = requestAnimationFrame(animate);
  }, [speed]);

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
    showMessage("Tracking Exercise Complete!", 'success');
    try {
      await fetch('/api/save-game-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId: 'smooth-pursuit',
          score: 100,
          durationSeconds: 60,
          date: new Date().toISOString().split('T')[0]
        })
      });
      if (onComplete) onComplete(100);
    } catch (error) {
      console.error('Failed to save score:', error);
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl">
      <div className="w-full flex justify-between items-center mb-6 px-4">
        <h2 className="text-2xl font-bold text-blue-800 flex items-center gap-2">
          <FaWind className="text-blue-400" /> Smooth Pursuit
        </h2>
        <div className="flex gap-4 items-center">
          <span className="text-sm font-bold text-gray-400 uppercase">Speed</span>
          <input 
            type="range" min="0.5" max="3" step="0.5" value={speed} 
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
            className="range range-xs range-primary w-24"
          />
          <span className="text-xl font-bold text-orange-600 ml-4">Time: {timeLeft}s</span>
        </div>
      </div>

      <div className="relative w-full aspect-video bg-sky-50 rounded-3xl border-4 border-blue-100 shadow-inner overflow-hidden cursor-none">
        {!isActive && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm text-white rounded-2xl">
            <h3 className="text-3xl font-black mb-4">Tracking Training</h3>
            <p className="mb-8 text-lg max-w-md text-center">
              Follow the butterfly with your eyes. <br/>
              <span className="font-bold text-yellow-300">Smooth movements only!</span>
            </p>
            <button 
              onClick={() => { setIsActive(true); setTimeLeft(60); startTimeRef.current = 0; }} 
              className="btn btn-info btn-lg px-12 rounded-2xl shadow-xl hover:scale-105 transition-transform text-white"
            >
              Start Tracking
            </button>
          </div>
        )}

        {/* The Target (Butterfly-like) */}
        <div 
          className="absolute w-16 h-16 transition-transform duration-75"
          style={{ 
            left: `${target.x}%`, 
            top: `${target.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div className="relative w-full h-full flex items-center justify-center animate-bounce">
            <div className="w-8 h-10 bg-orange-400 rounded-full rotate-45 absolute left-2 top-2 shadow-sm"></div>
            <div className="w-8 h-10 bg-orange-400 rounded-full -rotate-45 absolute right-2 top-2 shadow-sm"></div>
            <div className="w-2 h-12 bg-black rounded-full z-10"></div>
          </div>
        </div>

        {/* Clouds for depth */}
        <div className="absolute top-10 left-10 text-4xl opacity-20">☁️</div>
        <div className="absolute bottom-20 right-20 text-5xl opacity-20">☁️</div>
        <div className="absolute top-40 right-40 text-3xl opacity-20">☁️</div>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100">
          <h4 className="font-bold text-blue-800 mb-2">Tracking Ability</h4>
          <p className="text-sm text-blue-700 leading-relaxed">
            Smooth pursuit is the ability of the eyes to follow a moving object. This is essential for sports and reading.
          </p>
        </div>
        <div className="bg-orange-50 p-6 rounded-3xl border border-orange-100">
          <h4 className="font-bold text-orange-800 mb-2">Pro Tip</h4>
          <p className="text-sm text-orange-700 leading-relaxed">
            Try to keep your eyes locked on the butterfly's body. If it gets too fast, lower the speed using the slider above.
          </p>
        </div>
      </div>
    </div>
  );
}
