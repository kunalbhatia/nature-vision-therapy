import { useState, useEffect, useCallback, useRef } from 'react';
import { useGameScore } from '../../hooks/useGameScore';
import AnaglyphWrapper, { RedEye, CyanEye } from './AnaglyphWrapper';
import { FaSearch, FaTrophy, FaClock } from 'react-icons/fa';

interface HiddenObject {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  emoji: string;
  found: boolean;
  type: 'red' | 'cyan';
}

const OBJECTS_POOL = ['🦁', '🐯', '🦒', '🐘', '🦄', '🐲', '🦋', '🐞', '🦉', '🦊', '🐼', '🐨'];

export default function AnaglyphHiddenPicture() {
  const { score, incrementScore, saveScore, resetScore } = useGameScore();
  const [objects, setObjects] = useState<HiddenObject[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [level, setLevel] = useState(1);
  const [isMoving, setIsMoving] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const requestRef = useRef<number | null>(null);
  const previousTimeRef = useRef<number | null>(null);
  const phaseRef = useRef<'moving' | 'paused'>('moving');
  const phaseTimerRef = useRef<number>(0);

  const spawnObjects = useCallback((lvl: number) => {
    const newObjects: HiddenObject[] = [];
    const count = 4 + lvl;
    for (let i = 0; i < count; i++) {
      // Speed should be slow: 6% to 12% of screen dimension per second
      const speedX = (Math.random() * 6 + 6) * (Math.random() < 0.5 ? 1 : -1);
      const speedY = (Math.random() * 6 + 6) * (Math.random() < 0.5 ? 1 : -1);
      newObjects.push({
        id: i,
        x: Math.random() * 80 + 10,
        y: Math.random() * 80 + 10,
        vx: speedX,
        vy: speedY,
        emoji: OBJECTS_POOL[Math.floor(Math.random() * OBJECTS_POOL.length)],
        found: false,
        type: i % 2 === 0 ? 'red' : 'cyan'
      });
    }
    setObjects(newObjects);
  }, []);

  const animate = useCallback((time: number) => {
    if (previousTimeRef.current !== null) {
      const deltaTime = Math.min((time - previousTimeRef.current) / 1000, 0.1);
      
      phaseTimerRef.current += deltaTime;
      
      // Cycle phases: 4 seconds moving, 3 seconds paused
      if (phaseRef.current === 'moving' && phaseTimerRef.current >= 4) {
        phaseRef.current = 'paused';
        phaseTimerRef.current = 0;
        setIsMoving(false);
      } else if (phaseRef.current === 'paused' && phaseTimerRef.current >= 3) {
        phaseRef.current = 'moving';
        phaseTimerRef.current = 0;
        setIsMoving(true);
      }
      
      if (phaseRef.current === 'moving') {
        setObjects(prevObjects =>
          prevObjects.map(obj => {
            if (obj.found) return obj;
            
            let newX = obj.x + obj.vx * deltaTime;
            let newY = obj.y + obj.vy * deltaTime;
            let newVx = obj.vx;
            let newVy = obj.vy;
            
            // Check boundary collisions and bounce (box boundaries: 5% to 90%)
            if (newX <= 5) {
              newX = 5;
              newVx = Math.abs(obj.vx);
            } else if (newX >= 90) {
              newX = 90;
              newVx = -Math.abs(obj.vx);
            }
            
            if (newY <= 5) {
              newY = 5;
              newVy = Math.abs(obj.vy);
            } else if (newY >= 90) {
              newY = 90;
              newVy = -Math.abs(obj.vy);
            }
            
            return {
              ...obj,
              x: newX,
              y: newY,
              vx: newVx,
              vy: newVy
            };
          })
        );
      }
    }
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  }, []);

  const startGame = () => {
    if (containerRef.current) {
      containerRef.current.requestFullscreen().catch(() => {});
    }
    resetScore();
    setTimeLeft(60);
    setLevel(1);
    setIsMoving(true);
    setGameStarted(true);
    spawnObjects(1);
  };

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (gameStarted && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && gameStarted) {
      setGameStarted(false);
      saveScore({ gameId: 'hidden-picture', score, durationSeconds: 60 });
    }
    return () => clearInterval(timer);
  }, [gameStarted, timeLeft, score, saveScore]);

  useEffect(() => {
    if (gameStarted) {
      previousTimeRef.current = null;
      phaseRef.current = 'moving';
      phaseTimerRef.current = 0;
      requestRef.current = requestAnimationFrame(animate);
    } else {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    }
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [gameStarted, animate]);

  const handleObjectClick = (id: number) => {
    setObjects(prev => {
      const updated = prev.map(obj => (obj.id === id ? { ...obj, found: true } : obj));
      if (updated.every(obj => obj.found)) {
        setTimeout(() => {
          const nextLvl = level + 1;
          setLevel(nextLvl);
          spawnObjects(nextLvl);
          incrementScore(50);
        }, 500);
      }
      return updated;
    });
    incrementScore(10);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-5xl" ref={containerRef}>
      <div className="w-full flex justify-between items-center mb-6 bg-white/10 p-4 rounded-2xl backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <h2 className="text-3xl font-black text-emerald-400">Hidden Picture 🕵️</h2>
          <div className="badge badge-lg badge-ghost text-white border-white/20">Level {level}</div>
          {gameStarted && (
            <div className={`badge badge-lg font-bold transition-all duration-300 ${isMoving ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' : 'bg-amber-500/20 text-amber-300 border-amber-500/30 animate-pulse'}`}>
              {isMoving ? '🏃 Objects Moving' : '🎯 Freeze! Tap Now'}
            </div>
          )}
        </div>
        <div className="flex gap-8 items-center">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
              <FaClock /> Time
            </span>
            <span className={`text-2xl font-black leading-none ${timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
              {timeLeft}s
            </span>
          </div>
          <div className="flex flex-col items-end border-l border-white/10 pl-8">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
              <FaTrophy /> Score
            </span>
            <span className="text-2xl font-black text-emerald-400 leading-none">{score}</span>
          </div>
        </div>
      </div>

      <div className="relative w-full aspect-[16/9] bg-gray-900 rounded-3xl border-4 border-gray-800 shadow-2xl overflow-hidden cursor-crosshair">
        {!gameStarted && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md text-white p-8 text-center">
            <div className="flex gap-4 mb-6">
              <div className="w-16 h-16 bg-red-500 rounded-2xl flex items-center justify-center text-4xl shadow-lg shadow-red-500/20">👓</div>
              <FaSearch className="text-6xl text-emerald-400" />
            </div>
            <h3 className="text-4xl font-black mb-4 uppercase tracking-widest">Animal Search Mission</h3>

            <div className="bg-white p-6 rounded-2xl border-2 border-emerald-500 max-w-lg mb-8 text-left shadow-2xl">
              <h4 className="font-black text-black mb-3 uppercase text-sm tracking-widest border-b-2 border-emerald-100 pb-2">
                Mission Rules:
              </h4>
              <ul className="text-sm space-y-3 text-gray-800 font-bold">
                <li className="flex gap-3">
                  <span className="bg-emerald-500 text-white w-6 h-6 rounded-full flex items-center justify-center shrink-0">1</span>
                  <span>Put on **Red-Blue glasses** (Red lens = Right eye).</span>
                </li>
                <li className="flex gap-3">
                  <span className="bg-emerald-500 text-white w-6 h-6 rounded-full flex items-center justify-center shrink-0">2</span>
                  <span>Look for hidden animal emojis scattered in the chaos.</span>
                </li>
                <li className="flex gap-3">
                  <span className="bg-emerald-500 text-white w-6 h-6 rounded-full flex items-center justify-center shrink-0">3</span>
                  <span>
                    **Red animals** are for your right eye, **Blue** for your left. Use **BOTH eyes** to find them all!
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="bg-emerald-500 text-white w-6 h-6 rounded-full flex items-center justify-center shrink-0">4</span>
                  <span>Click an animal to &quot;catch&quot; it. Find everyone to level up!</span>
                </li>
              </ul>
            </div>

            <button
              onClick={startGame}
              className="px-12 py-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xl font-black rounded-3xl shadow-xl transition-all transform hover:scale-105 active:scale-95"
            >
              Start Mission
            </button>
          </div>
        )}

        <AnaglyphWrapper>
          <div className="absolute inset-0 overflow-hidden">
            {/* Chaotic background patterns to hide objects */}
            <div className="absolute inset-0 opacity-10 pointer-events-none select-none text-[8px] leading-[8px] overflow-hidden break-all">
              {Array.from({ length: 100 }).map((_, i) => (
                <div key={i} className="text-gray-500 h-4">
                  {Array.from({ length: 200 }).map(() => Math.random().toString(36).substring(7)).join(' ')}
                </div>
              ))}
            </div>

            {/* Red Channel Objects (Right Eye) */}
            <RedEye className="absolute inset-0 pointer-events-none">
              {objects
                .filter(o => o.type === 'red' && !o.found)
                .map(obj => (
                  <div
                    key={obj.id}
                    role="button"
                    onClick={() => handleObjectClick(obj.id)}
                    className="absolute text-5xl hover:scale-110 active:scale-90 transition-transform duration-200 pointer-events-auto cursor-pointer select-none bg-transparent border-0 outline-none p-0 shadow-none"
                    style={{
                      left: `${obj.x}%`,
                      top: `${obj.y}%`,
                      transform: 'translate(-50%, -50%) translateZ(0)',
                      WebkitFontSmoothing: 'antialiased',
                      background: 'transparent',
                      backgroundColor: 'transparent'
                    }}
                  >
                    {obj.emoji}
                  </div>
                ))}
            </RedEye>

            {/* Cyan Channel Objects (Left Eye) */}
            <CyanEye className="absolute inset-0 pointer-events-none">
              {objects
                .filter(o => o.type === 'cyan' && !o.found)
                .map(obj => (
                  <div
                    key={obj.id}
                    role="button"
                    onClick={() => handleObjectClick(obj.id)}
                    className="absolute text-5xl hover:scale-110 active:scale-90 transition-transform duration-200 pointer-events-auto cursor-pointer select-none bg-transparent border-0 outline-none p-0 shadow-none"
                    style={{
                      left: `${obj.x}%`,
                      top: `${obj.y}%`,
                      transform: 'translate(-50%, -50%) translateZ(0)',
                      WebkitFontSmoothing: 'antialiased',
                      background: 'transparent',
                      backgroundColor: 'transparent'
                    }}
                  >
                    {obj.emoji}
                  </div>
                ))}
            </CyanEye>
          </div>
        </AnaglyphWrapper>
      </div>

      <div className="mt-8 bg-emerald-950/20 p-6 rounded-3xl border border-emerald-900/50 w-full">
        <h4 className="text-emerald-400 font-black mb-2 uppercase text-xs tracking-widest">Therapy Note</h4>
        <p className="text-sm text-green-100/70">
          This game uses **Binocular Fusion**. Your brain must merge the red channel (right eye) and the blue channel (left eye) to locate all targets. This prevents the brain from suppressing the weaker eye.
        </p>
      </div>
    </div>
  );
}
