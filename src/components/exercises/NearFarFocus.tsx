import { useState, useCallback, useRef, useEffect } from 'react';
import { useSnackbar } from '../../hooks/Snackbar';
import ExerciseTimer from './ExerciseTimer';
import { FaEye, FaSearchPlus, FaSearchMinus } from 'react-icons/fa';

interface NearFarFocusProps {
  onComplete?: (score: number) => void;
}

export default function NearFarFocus({ onComplete }: NearFarFocusProps) {
  const { showMessage } = useSnackbar();
  const [sessionActive, setSessionActive] = useState(false);
  const [timerActive, setTimerActive] = useState(false);
  const [isNear, setIsNear] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const setFocus = useCallback((near: boolean) => {
    setIsNear(near);
    setTimerActive(true);
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!sessionActive) return;
      if (e.key === 'ArrowUp') setFocus(true);
      if (e.key === 'ArrowDown') setFocus(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sessionActive, setFocus]);

  const handleSessionComplete = async () => {
    setSessionActive(false);
    setTimerActive(false);
    showMessage('Pencil Pushup Mission Complete!', 'success');
    
    try {
      await fetch('/api/save-game-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId: 'near-far',
          score: 100,
          durationSeconds: 120,
          date: new Date().toISOString().split('T')[0]
        })
      });
      if (onComplete) onComplete(100);
    } catch (error) {
      console.error('Failed to save score:', error);
    }
  };

  const startSession = () => {
    if (containerRef.current) {
      containerRef.current.requestFullscreen().catch(() => {});
    }
    setSessionActive(true);
    setTimerActive(false);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-5xl h-full p-2 sm:p-4" ref={containerRef}>
      {!sessionActive ? (
        <div className="bg-white/90 backdrop-blur-md p-10 rounded-[3rem] shadow-2xl border-4 border-emerald-100 text-center max-w-xl animate-in zoom-in duration-500">
          <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaEye className="text-5xl text-emerald-600" />
          </div>
          <h2 className="text-4xl font-black text-green-900 mb-4 tracking-tight">Virtual Pencil Pushup</h2>
          <p className="text-green-800/70 mb-8 text-lg leading-relaxed">
            Focus on the tip of the pencil as it moves. Try to keep it as a single, clear image. This trains your eyes to work together and focus accurately.
          </p>
          <button 
            onClick={startSession}
            className="px-16 py-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xl font-black rounded-3xl shadow-xl transition-all transform hover:scale-105 active:scale-95"
          >
            Start Mission
          </button>
        </div>
      ) : (
        <div className="w-full h-full flex flex-col items-center gap-4 relative">
          {/* Header Controls - Now more compact */}
          <div className="flex justify-between w-full max-w-4xl items-center px-4">
             <div className="flex flex-col bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-white/40 shadow-sm">
                <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Target</span>
                <span className={`text-sm font-black ${isNear ? 'text-emerald-600' : 'text-blue-600'}`}>
                  {isNear ? 'NEAR' : 'FAR'}
                </span>
             </div>
              {/* Small fixed timer at the top */}
              <div className="scale-50 origin-right -mr-4">
                 <ExerciseTimer 
                   initialDuration={120} 
                   onComplete={handleSessionComplete} 
                   isActive={timerActive}
                   onActiveChange={setTimerActive}
                 />
              </div>
          </div>

          {/* Main Exercise Viewport */}
          <div className="relative w-full flex-1 min-h-[400px] aspect-video bg-emerald-50/50 rounded-[2.5rem] border-4 border-white shadow-inner flex items-center justify-center overflow-hidden">
            
            {/* Instruction Label - Top Right, Static */}
            <div className="absolute top-4 right-4 px-4 py-1.5 bg-white rounded-full border-2 border-gray-200 shadow-lg z-30">
              <span className="text-[12px] font-black text-black tracking-tight uppercase">Focus on Tip</span>
            </div>

            {/* Focal Point (Pencil Tip) - Anchored at the Tip */}
            <div 
              className={`transition-all duration-[4000ms] ease-in-out flex flex-col items-center origin-top
                ${isNear ? 'scale-[3.0] translate-y-[100px]' : 'scale-[0.6] opacity-40 -translate-y-[40px]'}
              `}
            >
              {/* Virtual Pencil Visual - Exact 40px alignment */}
              <div className="relative flex flex-col items-center">
                {/* Tip at Top - Total Width 40px (20+20) */}
                <div className="relative z-10 w-0 h-0 border-l-[20px] border-r-[20px] border-b-[44px] border-l-transparent border-r-transparent border-b-orange-200" />
                {/* Graphite - Width 16px (8+8) */}
                <div className="absolute top-0 z-20 w-0 h-0 border-l-[8px] border-r-[8px] border-b-[18px] border-l-transparent border-r-transparent border-b-gray-800" />
                
                {/* Body - Width 36px + 4px borders = 40px */}
                <div className="w-9 h-48 bg-yellow-400 border-x-2 border-yellow-600 shadow-sm relative -mt-[1px]">
                   {/* Ferrules and Eraser at Bottom - Width 40px total */}
                   <div className="absolute bottom-0 left-[-2px] w-[40px] flex flex-col items-center">
                     <div className="w-full h-2 bg-gray-400 border-x-2 border-gray-500" />
                     <div className="w-full h-8 bg-pink-400 rounded-b-lg border-x-2 border-b-2 border-pink-600 shadow-inner" />
                   </div>
                </div>
              </div>
            </div>

            {/* Manual Controls - Re-positioned inside the container */}
            <div className="absolute bottom-4 right-4 flex flex-col gap-2">
              <button 
                onClick={() => setFocus(true)}
                className={`btn btn-circle btn-md shadow-lg transition-all ${isNear ? 'bg-emerald-600 text-white' : 'bg-white text-emerald-600'}`}
                title="Near Focus (Arrow Up)"
              >
                <FaSearchPlus />
              </button>
              <button 
                onClick={() => setFocus(false)}
                className={`btn btn-circle btn-md shadow-lg transition-all ${!isNear ? 'bg-blue-600 text-white' : 'bg-white text-blue-600'}`}
                title="Far Focus (Arrow Down)"
              >
                <FaSearchMinus />
              </button>
            </div>
          </div>

          <div className="bg-white px-4 py-2 rounded-xl border border-gray-200 max-w-lg text-center shadow-sm">
             <p className="text-black text-[10px] sm:text-xs font-bold">
               Use <kbd className="kbd kbd-xs bg-gray-100 text-black border-gray-300">↑</kbd> and <kbd className="kbd kbd-xs bg-gray-100 text-black border-gray-300">↓</kbd> or the buttons to focus.
             </p>
          </div>
        </div>
      )}
    </div>
  );
}
