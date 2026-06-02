import { useState, useEffect, useRef } from 'react';
import { FaPlay, FaPause, FaStop, FaHistory, FaClock } from 'react-icons/fa';
import { useSnackbar } from '../../hooks/Snackbar';

interface PatchingTimerProps {
  onComplete?: (minutes: number) => void;
}

export default function PatchingTimer({ onComplete }: PatchingTimerProps) {
  const { showMessage } = useSnackbar();
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [goalMinutes, setGoalMinutes] = useState(60);
  const [showCustomGoal, setShowCustomGoal] = useState(false);
  
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => setIsRunning(true);
  const handlePause = () => setIsRunning(false);
  
  const handleStop = async () => {
    setIsRunning(false);
    const minutesCompleted = Math.floor(seconds / 60);
    
    if (minutesCompleted > 0) {
      try {
        const response = await fetch('/api/save-patching-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            durationMinutes: minutesCompleted,
            date: new Date().toISOString().split('T')[0],
            completed: minutesCompleted >= goalMinutes
          })
        });

        if (response.ok) {
          showMessage(`Great job! Saved ${minutesCompleted} minutes.`, 'success');
          if (onComplete) onComplete(minutesCompleted);
        } else {
          showMessage('Failed to save session.', 'error');
        }
      } catch (error) {
        console.error('Error saving session:', error);
        showMessage('Error saving session.', 'error');
      }
    }
    
    setSeconds(0);
  };

  const progress = Math.min((seconds / (goalMinutes * 60)) * 100, 100);

  return (
    <div className="flex flex-col items-center w-full max-w-md p-8 bg-white rounded-3xl shadow-2xl border-4 border-green-100">
      <h2 className="text-3xl font-bold text-green-800 mb-6 flex items-center gap-2">
        <FaClock /> Patching Timer
      </h2>

      {/* Progress Circle (Simplified for now with DaisyUI radial progress) */}
      <div 
        className="radial-progress text-green-500 mb-8 border-4 border-green-50" 
        style={{ 
          "--value": progress, 
          "--size": "12rem", 
          "--thickness": "1rem" 
        } as React.CSSProperties}
        role="progressbar"
      >
        <span className="text-4xl font-mono text-gray-800">{formatTime(seconds)}</span>
      </div>

      <div className="flex gap-4 mb-8">
        {!isRunning ? (
          <button onClick={handleStart} className="btn btn-circle btn-lg btn-primary shadow-lg hover:scale-105 transition-transform">
            <FaPlay className="ml-1" />
          </button>
        ) : (
          <button onClick={handlePause} className="btn btn-circle btn-lg btn-warning shadow-lg hover:scale-105 transition-transform">
            <FaPause />
          </button>
        )}
        <button onClick={handleStop} className="btn btn-circle btn-lg btn-error shadow-lg hover:scale-105 transition-transform" disabled={seconds === 0}>
          <FaStop />
        </button>
      </div>

      <div className="w-full space-y-4">
        <div className="flex justify-between items-center text-sm font-semibold text-gray-500 px-1">
          <span>Goal: {goalMinutes} min</span>
          <button 
            onClick={() => setShowCustomGoal(!showCustomGoal)}
            className="text-green-600 hover:underline flex items-center gap-1"
          >
            Change Goal
          </button>
        </div>

        {showCustomGoal && (
          <div className="flex gap-2 p-3 bg-green-50 rounded-xl animate-in fade-in slide-in-from-top-2 duration-300">
            {[30, 60, 120].map(m => (
              <button 
                key={m} 
                onClick={() => { setGoalMinutes(m); setShowCustomGoal(false); }}
                className={`btn btn-sm flex-1 ${goalMinutes === m ? 'btn-primary' : 'btn-outline btn-primary'}`}
              >
                {m/60}h
              </button>
            ))}
            <input 
              type="number" 
              placeholder="Min" 
              className="input input-sm input-bordered w-20"
              onChange={(e) => setGoalMinutes(parseInt(e.target.value) || 0)}
            />
          </div>
        )}

        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
          <p className="text-sm text-gray-600 flex items-center gap-2">
            <FaHistory className="text-green-500" />
            Keep it up! Daily patching is the secret to super vision.
          </p>
        </div>
      </div>
    </div>
  );
}
