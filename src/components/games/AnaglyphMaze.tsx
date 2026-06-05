import { useState, useEffect, useCallback, useRef } from 'react';
import { useGameScore } from '../../hooks/useGameScore';
import AnaglyphWrapper, { RedEye, CyanEye, BothEyes } from './AnaglyphWrapper';
import { FaCompass, FaMapMarkedAlt, FaArrowUp, FaArrowDown, FaArrowLeft, FaArrowRight } from 'react-icons/fa';

const COLS = 15;
const ROWS = 10;

// Simple maze generator (Recursive Backtracking)
function generateMaze(cols: number, rows: number) {
  const maze = Array.from({ length: rows }, () => Array(cols).fill(1));
  const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
  const wallColors = Array.from({ length: rows }, () => Array(cols).fill(null));

  function walk(x: number, y: number) {
    visited[y][x] = true;
    maze[y][x] = 0;

    const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]].sort(() => Math.random() - 0.5);
    for (const [dx, dy] of dirs) {
      const nx = x + dx * 2, ny = y + dy * 2;
      if (nx >= 0 && nx < cols && ny >= 0 && ny < rows && !visited[ny][nx]) {
        maze[y + dy][x + dx] = 0;
        walk(nx, ny);
      }
    }
  }

  walk(0, 0);
  maze[rows - 1][cols - 1] = 0; // Ensure exit

  // Assign random colors to walls
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (maze[y][x] === 1) {
        wallColors[y][x] = Math.random() > 0.5 ? 'red' : 'cyan';
      }
    }
  }

  return { maze, wallColors };
}

export default function AnaglyphMaze() {
  const { score, incrementScore, resetScore } = useGameScore();
  const [maze, setMaze] = useState<number[][]>([]);
  const [wallColors, setWallColors] = useState<('red' | 'cyan' | null)[][]>([]);
  const [player, setPlayer] = useState({ x: 0, y: 0 });
  const [gameStarted, setGameStarted] = useState(false);
  const [level, setLevel] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  const initLevel = useCallback(() => {
    const { maze: newMaze, wallColors: newColors } = generateMaze(COLS, ROWS);
    setMaze(newMaze);
    setWallColors(newColors);
    setPlayer({ x: 0, y: 0 });
  }, []);

  const startGame = () => {
    if (containerRef.current) {
      containerRef.current.requestFullscreen().catch(() => {});
    }
    resetScore();
    setLevel(1);
    setGameStarted(true);
    initLevel();
  };

  const movePlayer = useCallback((dx: number, dy: number) => {
    setPlayer(prev => {
      const nx = prev.x + dx;
      const ny = prev.y + dy;
      if (nx >= 0 && nx < COLS && ny >= 0 && ny < ROWS && maze[ny][nx] === 0) {
        if (nx === COLS - 1 && ny === ROWS - 1) {
          setTimeout(() => {
            const nextLvl = level + 1;
            setLevel(nextLvl);
            initLevel();
            incrementScore(100);
          }, 300);
        }
        return { x: nx, y: ny };
      }
      return prev;
    });
  }, [maze, level, initLevel, incrementScore]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!gameStarted) return;
      if (e.key === 'ArrowUp') movePlayer(0, -1);
      if (e.key === 'ArrowDown') movePlayer(0, 1);
      if (e.key === 'ArrowLeft') movePlayer(-1, 0);
      if (e.key === 'ArrowRight') movePlayer(1, 0);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [gameStarted, movePlayer]);

  return (
    <div className="flex flex-col items-center w-full max-w-5xl" ref={containerRef}>
      <div className="w-full flex justify-between items-center mb-6 bg-black/40 p-4 rounded-2xl border border-white/10">
        <div className="flex items-center gap-4">
          <h2 className="text-3xl font-black text-blue-400 flex items-center gap-2"><FaMapMarkedAlt /> Ghost Maze</h2>
          <div className="badge badge-lg bg-blue-500/20 text-blue-300 border-blue-500/30">Level {level}</div>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">XP Earned</span>
          <span className="text-2xl font-black text-emerald-400 leading-none">{score}</span>
        </div>
      </div>

      <div className="relative w-full aspect-[3/2] bg-black rounded-3xl border-4 border-gray-800 shadow-2xl overflow-hidden">
        {!gameStarted && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm text-white p-8 text-center">
            <FaCompass className="text-7xl text-blue-400 mb-6 animate-pulse" />
            <h3 className="text-4xl font-black mb-4 uppercase tracking-widest text-blue-300">Ghost Maze Mission</h3>
            <p className="mb-8 text-xl opacity-80 max-w-md leading-relaxed">
              "The walls are invisible to your Left eye, and the player is invisible to your Right eye. Merge your vision to escape!"
            </p>
            <button 
              onClick={startGame} 
              className="px-12 py-4 bg-blue-600 hover:bg-blue-500 text-white text-xl font-black rounded-3xl shadow-xl transition-all transform hover:scale-105 active:scale-95"
            >
              Enter Maze
            </button>
          </div>
        )}

        <AnaglyphWrapper>
          <div className="w-full h-full relative grid" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)`, gridTemplateRows: `repeat(${ROWS}, 1fr)` }}>
            
            {/* Red Walls (Right Eye) */}
            <RedEye className="absolute inset-0 grid pointer-events-none" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)`, gridTemplateRows: `repeat(${ROWS}, 1fr)` }}>
              {wallColors.map((row, y) => row.map((color, x) => (
                <div 
                  key={`red-${x}-${y}`} 
                  className={`transition-colors duration-500 ${color === 'red' ? 'bg-red-600/80 border border-red-900/50' : ''}`}
                />
              )))}
            </RedEye>

            {/* Cyan Walls (Left Eye) */}
            <CyanEye className="absolute inset-0 grid pointer-events-none" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)`, gridTemplateRows: `repeat(${ROWS}, 1fr)` }}>
              {wallColors.map((row, y) => row.map((color, x) => (
                <div 
                  key={`cyan-${x}-${y}`} 
                  className={`transition-colors duration-500 ${color === 'cyan' ? 'bg-cyan-600/80 border border-cyan-900/50' : ''}`}
                />
              )))}
            </CyanEye>

            {/* The Exit - Both Eyes */}
            <BothEyes className="absolute inset-0 grid pointer-events-none" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)`, gridTemplateRows: `repeat(${ROWS}, 1fr)` }}>
              <div 
                className="flex items-center justify-center text-3xl animate-bounce"
                style={{ gridColumnStart: COLS, gridRowStart: ROWS }}
              >
                🌀
              </div>
            </BothEyes>

            {/* The Player - Cyan Channel (Left Eye) */}
            <CyanEye className="absolute inset-0 grid pointer-events-none" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)`, gridTemplateRows: `repeat(${ROWS}, 1fr)` }}>
              <div 
                className="bg-cyan-400 rounded-full m-2 shadow-[0_0_20px_rgba(34,211,238,0.8)] transition-all duration-150 relative"
                style={{ gridColumnStart: player.x + 1, gridRowStart: player.y + 1 }}
              >
                <div className="absolute inset-0 flex items-center justify-center text-xs font-black text-cyan-900">ME</div>
              </div>
            </CyanEye>
          </div>
        </AnaglyphWrapper>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        <div className="bg-blue-950/20 p-6 rounded-3xl border border-blue-900/50">
          <h4 className="text-blue-400 font-black mb-2 uppercase text-xs tracking-widest">Clinical Goal</h4>
          <p className="text-sm text-blue-100/70 leading-relaxed">
            This exercise forces **Simultaneous Perception**. If you only use one eye, you either see the walls but no player, or the player but no walls. You must use both eyes simultaneously to navigate.
          </p>
        </div>
        <div className="flex flex-col items-center justify-center p-4 bg-gray-900/40 rounded-3xl border border-gray-800">
           <div className="grid grid-cols-3 gap-2">
              <div/>
              <button onClick={() => movePlayer(0, -1)} className="btn btn-circle bg-white/10 text-white border-none"><FaArrowUp/></button>
              <div/>
              <button onClick={() => movePlayer(-1, 0)} className="btn btn-circle bg-white/10 text-white border-none"><FaArrowLeft/></button>
              <button onClick={() => movePlayer(0, 1)} className="btn btn-circle bg-white/10 text-white border-none"><FaArrowDown/></button>
              <button onClick={() => movePlayer(1, 0)} className="btn btn-circle bg-white/10 text-white border-none"><FaArrowRight/></button>
           </div>
           <span className="text-[10px] font-black text-gray-500 uppercase mt-4 tracking-widest">Move Player</span>
        </div>
      </div>
    </div>
  );
}
