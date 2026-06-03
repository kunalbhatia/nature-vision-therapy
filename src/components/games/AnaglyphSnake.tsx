import { useState, useEffect, useCallback, useRef } from 'react';
import { useSnackbar } from '../../hooks/Snackbar';
import { FaArrowUp, FaArrowDown, FaArrowLeft, FaArrowRight, FaMobileAlt, FaTrophy } from 'react-icons/fa';
import AnaglyphWrapper, { RedEye, CyanEye, BothEyes } from './AnaglyphWrapper';

const GRID_SIZE_X = 30;
const GRID_SIZE_Y = 20;
const INITIAL_SNAKE = [{ x: 15, y: 10 }, { x: 15, y: 11 }, { x: 15, y: 12 }];
const INITIAL_DIRECTION = { x: 0, y: -1 };
const BASE_SPEED = 250;
const SPEED_INCREMENT = 50;
const MIN_SPEED = 50;

interface Food {
  x: number;
  y: number;
  type: 'red' | 'cyan';
}

export default function AnaglyphSnake() {
  const { showMessage } = useSnackbar();
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [foods, setFoods] = useState<Food[]>([]);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [highestLevel, setHighestLevel] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [showTouchControls, setShowTouchControls] = useState(false);
  
  const gameLoopRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch highest level on mount
  useEffect(() => {
    fetch('/api/get-progress-summary')
      .then(res => res.json())
      .then(data => {
        if (data.highestSnakeLevel) setHighestLevel(data.highestSnakeLevel);
      })
      .catch(err => console.error('Error fetching highest level:', err));
  }, []);

  const spawnFoods = useCallback((count: number) => {
    const newFoods: Food[] = [];
    for (let i = 0; i < count; i++) {
      let x, y;
      // Simple collision check for food spawning
      do {
        x = Math.floor(Math.random() * GRID_SIZE_X);
        y = Math.floor(Math.random() * GRID_SIZE_Y);
      } while (newFoods.some(f => f.x === x && f.y === y));
      
      newFoods.push({
        x,
        y,
        type: Math.random() > 0.5 ? 'red' : 'cyan'
      });
    }
    setFoods(newFoods);
  }, []);

  const persistLevel = async (lvl: number) => {
    try {
      await fetch('/api/update-snake-level', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level: lvl })
      });
    } catch (error) {
      console.error('Failed to persist level:', error);
    }
  };

  const moveSnake = useCallback(() => {
    setSnake(prevSnake => {
      const head = prevSnake[0];
      const newHead = {
        x: head.x + direction.x,
        y: head.y + direction.y
      };

      // Check wall collision
      if (newHead.x < 0 || newHead.x >= GRID_SIZE_X || newHead.y < 0 || newHead.y >= GRID_SIZE_Y) {
        handleGameOver();
        return prevSnake;
      }

      // Check self collision
      if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
        handleGameOver();
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      // Check food collision
      const foodIndex = foods.findIndex(f => f.x === newHead.x && f.y === newHead.y);
      if (foodIndex !== -1) {
        setScore(s => s + 10);
        const remainingFoods = foods.filter((_, i) => i !== foodIndex);
        setFoods(remainingFoods);
        
        // Check if level complete
        if (remainingFoods.length === 0) {
          handleLevelComplete();
        }
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [direction, foods]);

  const handleLevelComplete = useCallback(() => {
    const nextLvl = level + 1;
    setLevel(nextLvl);
    if (nextLvl > highestLevel) {
      setHighestLevel(nextLvl);
      persistLevel(nextLvl);
    }
    showMessage(`Level ${level} Complete! Getting faster...`, 'success');
    spawnFoods(Math.min(3 + nextLvl, 10)); // More food each level
  }, [level, highestLevel, spawnFoods, showMessage]);

  const handleDirectionChange = useCallback((newDir: { x: number, y: number }) => {
    setDirection(current => {
      if (newDir.x !== 0 && current.x === 0) return newDir;
      if (newDir.y !== 0 && current.y === 0) return newDir;
      return current;
    });
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp': handleDirectionChange({ x: 0, y: -1 }); break;
        case 'ArrowDown': handleDirectionChange({ x: 0, y: 1 }); break;
        case 'ArrowLeft': handleDirectionChange({ x: -1, y: 0 }); break;
        case 'ArrowRight': handleDirectionChange({ x: 1, y: 0 }); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDirectionChange]);

  useEffect(() => {
    if (gameStarted && !gameOver) {
      const currentSpeed = Math.max(BASE_SPEED - (level - 1) * SPEED_INCREMENT, MIN_SPEED);
      gameLoopRef.current = setInterval(moveSnake, currentSpeed);
      return () => {
        if (gameLoopRef.current) clearInterval(gameLoopRef.current);
      };
    }
  }, [gameStarted, gameOver, moveSnake, level]);

  const handleGameOver = async () => {
    setGameOver(true);
    setGameStarted(false);
    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    
    showMessage(`Game Over! Final Score: ${score}`, 'error');

    try {
      await fetch('/api/save-game-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId: 'snake',
          score,
          durationSeconds: 0,
          date: new Date().toISOString().split('T')[0]
        })
      });
    } catch (error) {
      console.error('Failed to save score:', error);
    }
  };

  const startGame = () => {
    if (containerRef.current) {
      containerRef.current.requestFullscreen().catch(() => {});
    }
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setScore(0);
    setGameOver(false);
    setGameStarted(true);
    spawnFoods(Math.min(3 + level, 10));
  };

  const getSnakeEyesStyle = (dir: { x: number, y: number }) => {
    if (dir.x === 1) return "flex-row justify-end items-center pr-1 gap-1"; // Right
    if (dir.x === -1) return "flex-row justify-start items-center pl-1 gap-1"; // Left
    if (dir.y === 1) return "flex-col justify-end items-center pb-1 gap-1"; // Down
    return "flex-col justify-start items-center pt-1 gap-1"; // Up
  };

  return (
    <div className="flex flex-col items-center w-full max-w-5xl" ref={containerRef}>
      <div className="w-full flex justify-between items-center mb-6 px-4 bg-black/40 p-4 rounded-2xl">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-black text-white">Snake 🐍</h2>
            <button 
              onClick={() => setShowTouchControls(!showTouchControls)}
              className={`btn btn-circle btn-sm ${showTouchControls ? 'btn-primary' : 'btn-ghost text-white/50'}`}
            >
              <FaMobileAlt />
            </button>
          </div>
          
          <div className="flex items-center bg-white/10 rounded-xl px-4 py-1 gap-4">
            <div className="text-sm font-bold text-gray-400">LEVEL</div>
            <div className="flex gap-2">
              {Array.from({ length: highestLevel }).map((_, i) => (
                <button
                  key={i}
                  disabled={gameStarted}
                  onClick={() => setLevel(i + 1)}
                  className={`w-8 h-8 rounded-lg font-black transition-all ${level === i + 1 ? 'bg-emerald-500 text-white scale-110 shadow-lg shadow-emerald-500/40' : 'bg-white/5 text-gray-400 hover:bg-white/20'}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex gap-8">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Score</span>
            <span className="text-2xl font-black text-emerald-400 leading-none">{score}</span>
          </div>
          <div className="flex flex-col items-end border-l border-white/10 pl-8">
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Record</span>
            <span className="text-2xl font-black text-yellow-400 leading-none flex items-center gap-2">
              <FaTrophy className="text-sm" /> Lvl {highestLevel}
            </span>
          </div>
        </div>
      </div>

      <div className="relative w-full aspect-[3/2] bg-black rounded-3xl border-4 border-gray-800 shadow-2xl overflow-hidden">
        {!gameStarted && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm text-white p-8 text-center">
            <h3 className="text-5xl font-black mb-4 uppercase tracking-widest text-emerald-400">
              {gameOver ? 'Game Over' : `Level ${level}`}
            </h3>
            <p className="mb-8 text-xl opacity-80 max-w-sm">
              Eat all the <span className="text-red-500 font-bold">Red</span> and <span className="text-cyan-400 font-bold">Blue</span> snacks to level up!
            </p>
            <button 
              onClick={startGame} 
              className="px-16 py-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xl font-black rounded-3xl shadow-xl transition-all transform hover:scale-105 active:scale-95"
            >
              {gameOver ? 'Try Again' : 'Start Mission'}
            </button>
          </div>
        )}

        <AnaglyphWrapper>
          <div className="relative w-full h-full">
            {/* The Snake */}
            <BothEyes>
              {snake.map((segment, i) => (
                <div 
                  key={i}
                  className={`absolute bg-white transition-all duration-75 flex ${i === 0 ? getSnakeEyesStyle(direction) : ''}`}
                  style={{
                    left: `${(segment.x / GRID_SIZE_X) * 100}%`,
                    top: `${(segment.y / GRID_SIZE_Y) * 100}%`,
                    width: `${100 / GRID_SIZE_X}%`,
                    height: `${100 / GRID_SIZE_Y}%`,
                    boxShadow: i === 0 ? '0 0 15px rgba(255,255,255,0.6)' : 'none',
                    zIndex: i === 0 ? 20 : 10,
                    borderRadius: i === 0 ? '40%' : '2px'
                  }}
                >
                  {/* Eyes on the head */}
                  {i === 0 && (
                    <>
                      <div className="w-1 h-1 bg-black rounded-full" />
                      <div className="w-1 h-1 bg-black rounded-full" />
                    </>
                  )}
                </div>
              ))}
            </BothEyes>

            {/* The Foods */}
            {foods.map((f, i) => (
              f.type === 'red' ? (
                <RedEye key={`food-${i}`} style={{
                  position: 'absolute',
                  left: `${(f.x / GRID_SIZE_X) * 100}%`,
                  top: `${(f.y / GRID_SIZE_Y) * 100}%`,
                  width: `${100 / GRID_SIZE_X}%`,
                  height: `${100 / GRID_SIZE_Y}%`,
                }}>
                  <div className="w-full h-full bg-red-600 rounded-full animate-pulse shadow-[0_0_20px_rgba(220,38,38,0.9)]" />
                </RedEye>
              ) : (
                <CyanEye key={`food-${i}`} style={{
                  position: 'absolute',
                  left: `${(f.x / GRID_SIZE_X) * 100}%`,
                  top: `${(f.y / GRID_SIZE_Y) * 100}%`,
                  width: `${100 / GRID_SIZE_X}%`,
                  height: `${100 / GRID_SIZE_Y}%`,
                }}>
                  <div className="w-full h-full bg-cyan-500 rounded-full animate-pulse shadow-[0_0_20px_rgba(6,182,212,0.9)]" />
                </CyanEye>
              )
            ))}

            {/* Touch Controls Overlay */}
            {showTouchControls && gameStarted && (
              <div className="absolute bottom-8 right-8 z-50 grid grid-cols-3 gap-2 opacity-40 hover:opacity-100 transition-opacity">
                <div />
                <button onClick={() => handleDirectionChange({ x: 0, y: -1 })} className="btn btn-circle btn-lg bg-white/20 border-white/40 text-white"><FaArrowUp /></button>
                <div />
                <button onClick={() => handleDirectionChange({ x: -1, y: 0 })} className="btn btn-circle btn-lg bg-white/20 border-white/40 text-white"><FaArrowLeft /></button>
                <button onClick={() => handleDirectionChange({ x: 0, y: 1 })} className="btn btn-circle btn-lg bg-white/20 border-white/40 text-white"><FaArrowDown /></button>
                <button onClick={() => handleDirectionChange({ x: 1, y: 0 })} className="btn btn-circle btn-lg bg-white/20 border-white/40 text-white"><FaArrowRight /></button>
              </div>
            )}
          </div>
        </AnaglyphWrapper>
      </div>

      <div className="mt-8 flex flex-col md:flex-row gap-6 w-full">
        <div className="flex-1 bg-emerald-950/20 p-6 rounded-3xl border border-emerald-900/50">
          <h4 className="text-emerald-400 font-bold mb-2 flex items-center gap-2 uppercase text-xs tracking-tighter">
            Target Mission
          </h4>
          <p className="text-sm text-green-100/70 leading-relaxed">
            Eat all particles to clear the level. 
            Level 1 is easy, but each new mission gets **50ms faster**. 
            How far can you go?
          </p>
        </div>
        <div className="md:w-64 bg-gray-900/40 p-6 rounded-3xl border border-gray-800 flex flex-col justify-center text-center">
           <span className="text-xs text-gray-500 uppercase font-black tracking-widest mb-2">Expert Controls</span>
           <p className="text-sm text-gray-300">
             ⌨️ Arrow Keys <br/>
             📱 On-screen buttons
           </p>
        </div>
      </div>
    </div>
  );
}

