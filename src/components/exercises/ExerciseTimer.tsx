import { useState, useEffect, useCallback } from 'react';
import { FaPlay, FaPause, FaUndo } from 'react-icons/fa';

interface ExerciseTimerProps {
  initialDuration: number; // in seconds
  onComplete: () => void;
  title?: string;
  isActive?: boolean;
  onActiveChange?: (active: boolean) => void;
}

export default function ExerciseTimer({ initialDuration, onComplete, title, isActive: propActive, onActiveChange }: ExerciseTimerProps) {
  const [timeLeft, setTimeLeft] = useState(initialDuration);
  const [internalActive, setInternalActive] = useState(false);

  const isActive = propActive !== undefined ? propActive : internalActive;

  const setIsActive = useCallback((val: boolean) => {
    if (onActiveChange) {
      onActiveChange(val);
    } else {
      setInternalActive(val);
    }
  }, [onActiveChange]);

  const reset = useCallback(() => {
    setTimeLeft(initialDuration);
    setIsActive(false);
  }, [initialDuration, setIsActive]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      onComplete();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, onComplete]);

  const progress = ((initialDuration - timeLeft) / initialDuration) * 100;

  return (
    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl border-2 border-emerald-100 shadow-xl w-full max-w-sm flex flex-col items-center gap-4">
      {title && <h3 className="text-xl font-black text-green-900">{title}</h3>}
      
      <div className="relative w-32 h-32 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90">
          <circle
            cx="64"
            cy="64"
            r="58"
            className="fill-none stroke-gray-200 stroke-[8]"
          />
          <circle
            cx="64"
            cy="64"
            r="58"
            className="fill-none stroke-emerald-500 stroke-[8] transition-all duration-1000"
            strokeDasharray={364}
            strokeDashoffset={364 - (364 * progress) / 100}
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute text-2xl font-black text-emerald-700">
          {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
        </span>
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => setIsActive(!isActive)}
          className={`btn btn-circle btn-lg ${isActive ? 'btn-warning' : 'btn-emerald-500 bg-emerald-500 text-white'}`}
        >
          {isActive ? <FaPause /> : <FaPlay />}
        </button>
        <button
          onClick={reset}
          className="btn btn-circle btn-lg btn-ghost text-gray-400"
        >
          <FaUndo />
        </button>
      </div>
    </div>
  );
}
