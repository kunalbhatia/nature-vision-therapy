import { useState, useEffect, useRef } from 'react';
import { useSnackbar } from '../../hooks/Snackbar';
import { FaEye, FaQuestionCircle, FaInfoCircle } from 'react-icons/fa';

interface BrockStringProps {
  onComplete?: (score: number) => void;
}

export default function BrockString({ onComplete }: BrockStringProps) {
  const { showMessage } = useSnackbar();
  const [activeBead, setActiveBead] = useState<number>(1); // 0: Near, 1: Middle, 2: Far
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const beads = [
    { id: 0, color: 'bg-red-500', label: 'Near', pos: 20 },
    { id: 1, color: 'bg-green-500', label: 'Middle', pos: 50 },
    { id: 2, color: 'bg-yellow-500', label: 'Far', pos: 80 }
  ];

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
    showMessage(`Exercise Complete! Vision Score: ${score}`, 'success');
    try {
      await fetch('/api/save-game-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId: 'brock-string',
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

  const startExercise = () => {
    if (containerRef.current) {
      containerRef.current.requestFullscreen().catch(() => {});
    }
    setIsActive(true);
    setScore(0);
    setTimeLeft(60);
  };

  const handleBeadClick = (id: number) => {
    if (!isActive) return;
    setActiveBead(id);
    setScore(prev => prev + 10);
  };

  // Helper to calculate the "V" or "X" pattern lines
  const getLines = () => {
    const focusPos = beads[activeBead].pos;
    
    // We simulate the two strings crossing at the focus point
    return (
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ filter: 'blur(1px)' }}>
        {/* String 1 (Left eye perspective) */}
        <line 
          x1="0" y1="40%" 
          x2="100%" y2="60%" 
          stroke="white" strokeWidth="2" strokeOpacity="0.6" 
        />
        {/* String 2 (Right eye perspective) */}
        <line 
          x1="0" y1="60%" 
          x2="100%" y2="40%" 
          stroke="white" strokeWidth="2" strokeOpacity="0.6" 
        />
        
        {/* Highlight the crossing point - this is where the brain fuses the image */}
        <circle cx={`${focusPos}%`} cy="50%" r="4" fill="white" className="animate-pulse" />
      </svg>
    );
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl" ref={containerRef}>
      <div className="w-full flex justify-between items-center mb-6 px-4">
        <h2 className="text-2xl font-bold text-indigo-800 flex items-center gap-2">
          <FaEye className="text-indigo-600" /> Virtual Brock String
        </h2>
        <div className="flex gap-8 text-xl font-bold">
          <span className="text-blue-600">Points: {score}</span>
          <span className="text-orange-600">Time: {timeLeft}s</span>
        </div>
      </div>

      <div className="relative w-full aspect-[3/1] bg-gradient-to-b from-gray-900 to-black rounded-3xl border-4 border-indigo-100 shadow-2xl overflow-hidden flex items-center">
        {!isActive && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm text-white rounded-2xl p-6 text-center">
            <h3 className="text-3xl font-black mb-4 uppercase tracking-widest text-indigo-400">Convergence Training</h3>
            <p className="mb-8 text-lg max-w-lg">
              Focus on one bead at a time. Your brain should see two strings crossing exactly at the bead you choose.
            </p>
            <button 
              onClick={startExercise} 
              className="btn btn-primary btn-lg px-12 rounded-2xl shadow-xl hover:scale-105 transition-transform"
            >
              Start Exercise
            </button>
          </div>
        )}

        {/* The String */}
        <div className="absolute w-full h-[2px] bg-white/20 top-1/2 -translate-y-1/2"></div>
        
        {/* Visual Simulation of Diplopia (Double Vision) */}
        {isActive && getLines()}

        {/* The Beads */}
        <div className="relative w-full h-full flex items-center">
          {beads.map((bead) => (
            <div
              key={bead.id}
              onClick={() => handleBeadClick(bead.id)}
              className={`absolute cursor-pointer transition-all duration-500 flex flex-col items-center -translate-x-1/2`}
              style={{ left: `${bead.pos}%` }}
            >
              <div className={`w-12 h-12 rounded-full ${bead.color} shadow-lg border-4 ${activeBead === bead.id ? 'border-white scale-125 ring-4 ring-white/30' : 'border-transparent scale-100 opacity-80'}`}>
                {activeBead === bead.id && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                    </div>
                )}
              </div>
              <span className={`mt-2 text-xs font-bold uppercase tracking-widest ${activeBead === bead.id ? 'text-white' : 'text-gray-500'}`}>
                {bead.label}
              </span>
            </div>
          ))}
        </div>

        {/* Instructions Overlay */}
        {isActive && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-md px-6 py-2 rounded-full border border-white/10 text-white text-sm font-medium flex items-center gap-2">
            <FaInfoCircle className="text-indigo-400" />
            Tap the bead you want to focus on. Look for the "X" pattern!
          </div>
        )}
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100">
          <h4 className="font-bold text-indigo-800 mb-2 flex items-center gap-2">
            <FaQuestionCircle /> How to use
          </h4>
          <p className="text-sm text-indigo-700 leading-relaxed">
            Choose a bead to focus on. If your eyes are working together, the two virtual strings will seem to cross exactly at that bead, forming an <strong>X</strong> shape. If they cross in front or behind, adjust your focus!
          </p>
        </div>
        <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100">
          <h4 className="font-bold text-amber-800 mb-2">Clinical Goal</h4>
          <p className="text-sm text-amber-700 leading-relaxed">
            This exercise trains <strong>convergence</strong> (eyes moving inward) and <strong>divergence</strong> (eyes moving outward). It's essential for treating binocular vision dysfunction.
          </p>
        </div>
      </div>
    </div>
  );
}
