import { useState, useEffect, useRef } from 'react';
import { useSnackbar } from '../../hooks/Snackbar';
import { FaEye, FaQuestionCircle, FaInfoCircle } from 'react-icons/fa';
import AnaglyphWrapper, { RedEye, CyanEye, BothEyes } from '../games/AnaglyphWrapper';

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

  // Helper to calculate the disparity (separation) for a bead based on focus
  const getDisparity = (beadPos: number) => {
    if (!isActive) return 0;
    const focusPos = beads[activeBead].pos;
    // Disparity factor: distance from focus. Positive = further (uncrossed), Negative = nearer (crossed)
    return (beadPos - focusPos) * 0.15; // Adjusted multiplier for comfortable 3D effect
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl" ref={containerRef}>
      <div className="w-full flex justify-between items-center mb-6 px-4">
        <h2 className="text-2xl font-bold text-indigo-800 flex items-center gap-2">
          <FaEye className="text-indigo-600" /> Virtual Brock String (3D)
        </h2>
        <div className="flex gap-8 text-xl font-bold">
          <span className="text-blue-600">Points: {score}</span>
          <span className="text-orange-600">Time: {timeLeft}s</span>
        </div>
      </div>

      <div className="relative w-full aspect-[3/1] bg-black rounded-3xl border-4 border-indigo-100 shadow-2xl overflow-hidden flex items-center">
        {!isActive && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md text-white rounded-2xl p-6 text-center">
            <h3 className="text-3xl font-black mb-4 uppercase tracking-widest text-indigo-400">3D Anaglyph Mode</h3>
            <p className="mb-8 text-lg max-w-lg">
              Put on your <span className="text-red-500">Red</span>-<span className="text-cyan-400">Cyan</span> glasses! 
              Focus on one bead to see the strings cross exactly there. The other beads should appear double.
            </p>
            <button 
              onClick={startExercise} 
              className="btn btn-primary btn-lg px-12 rounded-2xl shadow-xl hover:scale-105 transition-transform"
            >
              Start Exercise
            </button>
          </div>
        )}

        <AnaglyphWrapper>
          <div className="relative w-full h-full flex items-center">
            {/* The String - Separated for Red and Cyan eyes */}
            {isActive && (
              <>
                <RedEye className="absolute inset-0 pointer-events-none">
                  <svg className="w-full h-full opacity-80" style={{ filter: 'blur(0.5px)' }}>
                    <line x1="0" y1="40%" x2="100%" y2="60%" stroke="white" strokeWidth="2" />
                  </svg>
                </RedEye>
                <CyanEye className="absolute inset-0 pointer-events-none">
                  <svg className="w-full h-full opacity-80" style={{ filter: 'blur(0.5px)' }}>
                    <line x1="0" y1="60%" x2="100%" y2="40%" stroke="white" strokeWidth="2" />
                  </svg>
                </CyanEye>
                {/* Fusion Point Highlight */}
                <BothEyes className="absolute inset-0 pointer-events-none">
                  <svg className="w-full h-full pointer-events-none">
                    <circle cx={`${beads[activeBead].pos}%`} cy="50%" r="4" fill="white" className="animate-pulse shadow-[0_0_10px_white]" />
                  </svg>
                </BothEyes>
              </>
            )}

            {!isActive && <div className="absolute w-full h-[2px] bg-white/20 top-1/2 -translate-y-1/2 pointer-events-none"></div>}

            {/* The Beads Container */}
            <div className="relative w-full h-full flex items-center">
              {beads.map((bead) => {
                const disparity = getDisparity(bead.pos);
                return (
                  <div 
                    key={bead.id} 
                    className="absolute h-full cursor-pointer group" 
                    style={{ left: `${bead.pos}%`, width: '80px', transform: 'translateX(-50%)', zIndex: 30 }}
                    onClick={() => handleBeadClick(bead.id)}
                  >
                    {/* Red Eye Version of the Bead */}
                    <RedEye 
                      className="absolute transition-all duration-300 flex flex-col items-center pointer-events-none"
                      style={{ 
                        top: '50%',
                        left: '50%',
                        transform: `translate(calc(-50% - ${disparity}px), -50%)`,
                        opacity: activeBead === bead.id ? 1 : 0.6
                      }}
                    >
                      <div className={`w-12 h-12 rounded-full ${bead.color} shadow-lg border-4 ${activeBead === bead.id ? 'border-white scale-125' : 'border-transparent scale-100 group-hover:scale-110'}`} />
                    </RedEye>

                    {/* Cyan Eye Version of the Bead */}
                    <CyanEye 
                      className="absolute transition-all duration-300 flex flex-col items-center pointer-events-none"
                      style={{ 
                        top: '50%',
                        left: '50%',
                        transform: `translate(calc(-50% + ${disparity}px), -50%)`,
                        opacity: activeBead === bead.id ? 1 : 0.6
                      }}
                    >
                      <div className={`w-12 h-12 rounded-full ${bead.color} shadow-lg border-4 ${activeBead === bead.id ? 'border-white scale-125' : 'border-transparent scale-100 group-hover:scale-110'}`} />
                    </CyanEye>

                    {/* Label (Visible to both) */}
                    <BothEyes className="absolute top-[65%] left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none">
                      <span className={`mt-2 text-xs font-bold uppercase tracking-widest ${activeBead === bead.id ? 'text-white' : 'text-gray-500'}`}>
                        {bead.label}
                      </span>
                    </BothEyes>
                  </div>
                );
              })}
            </div>
          </div>
        </AnaglyphWrapper>

        {/* Instructions Overlay */}
        {isActive && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-md px-6 py-2 rounded-full border border-white/10 text-white text-sm font-medium flex items-center gap-2">
            <FaInfoCircle className="text-indigo-400" />
            Look for the &quot;X&quot; crossing exactly at the bead!
          </div>
        )}
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100">
          <h4 className="font-bold text-indigo-800 mb-2 flex items-center gap-2">
            <FaQuestionCircle /> Why use glasses?
          </h4>
          <p className="text-sm text-indigo-700 leading-relaxed">
            Without glasses, both eyes see the same image. With <span className="text-red-600 font-bold">Red</span>-<span className="text-cyan-600 font-bold">Cyan</span> glasses, your brain is forced to combine two different perspectives, creating real depth and physiological diplopia (seeing double).
          </p>
        </div>
        <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100">
          <h4 className="font-bold text-amber-800 mb-2">Clinical Goal</h4>
          <p className="text-sm text-amber-700 leading-relaxed">
            This exercise trains <strong>convergence</strong> and <strong>divergence</strong>. If you see two strings forming an &quot;X&quot; at the bead, your eyes are perfectly aligned!
          </p>
        </div>
      </div>
    </div>
  );
}
