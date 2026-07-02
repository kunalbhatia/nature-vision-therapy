import { useState, useEffect, useCallback, useRef } from 'react';
import { useSnackbar } from '../../hooks/Snackbar';
import { useGameScore } from '../../hooks/useGameScore';
import AnaglyphWrapper, { RedEye, CyanEye } from './AnaglyphWrapper';
import { FaPlay, FaVolumeUp, FaVolumeMute, FaRobot, FaUsers } from 'react-icons/fa';

// Grid coordinates for Ludo track (52 cells) starting from Red player's starting cell [6, 1]
const TRACK_COORDINATES: [number, number][] = [
  [6, 1], [6, 2], [6, 3], [6, 4], [6, 5],
  [5, 6], [4, 6], [3, 6], [2, 6], [1, 6], [0, 6],
  [0, 7],
  [0, 8], [1, 8], [2, 8], [3, 8], [4, 8], [5, 8],
  [6, 9], [6, 10], [6, 11], [6, 12], [6, 13], [6, 14],
  [7, 14],
  [8, 14], [8, 13], [8, 12], [8, 11], [8, 10], [8, 9],
  [9, 8], [10, 8], [11, 8], [12, 8], [13, 8], [14, 8],
  [14, 7],
  [14, 6], [13, 6], [12, 6], [11, 6], [10, 6], [9, 6],
  [8, 5], [8, 4], [8, 3], [8, 2], [8, 1], [8, 0],
  [7, 0],
  [6, 0]
];

// Red home row coordinates (5 steps + goal)
const RED_HOME_ROW: [number, number][] = [
  [7, 1], [7, 2], [7, 3], [7, 4], [7, 5], [7, 6]
];

// Cyan home row coordinates (5 steps + goal)
const CYAN_HOME_ROW: [number, number][] = [
  [7, 13], [7, 12], [7, 11], [7, 10], [7, 9], [7, 8]
];

// Base position coordinates for Red tokens
const RED_BASE_COORDINATES: [number, number][] = [
  [2, 2], [2, 3], [3, 2], [3, 3]
];

// Base position coordinates for Cyan tokens
const CYAN_BASE_COORDINATES: [number, number][] = [
  [11, 11], [11, 12], [12, 11], [12, 12]
];

interface Token {
  id: number;
  player: 'red' | 'cyan';
  // position state: 'base' | 'track' | 'homeRow' | 'goal'
  state: 'base' | 'track' | 'homeRow' | 'goal';
  positionIndex: number; // index in TRACK_COORDINATES or RED_HOME_ROW/CYAN_HOME_ROW
}

export default function AnaglyphLudo() {
  const { showMessage } = useSnackbar();
  const { score, setScore, incrementScore, saveScore } = useGameScore();
  
  // Game setup states
  const [gameStarted, setGameStarted] = useState(false);
  const [vsComputer, setVsComputer] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [sumVerification] = useState(true);
  
  // Game loop states
  const [turn, setTurn] = useState<'red' | 'cyan'>('red');
  const [redDice, setRedDice] = useState<number | null>(null);
  const [cyanDice, setCyanDice] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [diceSumResult, setDiceSumResult] = useState<number | null>(null);
  const [sumOptions, setSumOptions] = useState<number[]>([]);
  const [diceUnlocked, setDiceUnlocked] = useState(false);
  const [hasRolledThisTurn, setHasRolledThisTurn] = useState(false);
  
  // Token states
  const isHumanTurn = turn === 'red' || !vsComputer;
  const [tokens, setTokens] = useState<Token[]>([
    // Red Team Tokens
    { id: 0, player: 'red', state: 'base', positionIndex: 0 },
    { id: 1, player: 'red', state: 'base', positionIndex: 1 },
    { id: 2, player: 'red', state: 'base', positionIndex: 2 },
    { id: 3, player: 'red', state: 'base', positionIndex: 3 },
    // Cyan Team Tokens
    { id: 4, player: 'cyan', state: 'base', positionIndex: 0 },
    { id: 5, player: 'cyan', state: 'base', positionIndex: 1 },
    { id: 6, player: 'cyan', state: 'base', positionIndex: 2 },
    { id: 7, player: 'cyan', state: 'base', positionIndex: 3 },
  ]);

  const containerRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize Web Audio for pleasant nature sound effects
  const playSound = useCallback((type: 'roll' | 'move' | 'capture' | 'home' | 'win' | 'error') => {
    if (!soundEnabled) return;
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'roll') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } else if (type === 'move') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.setValueAtTime(450, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } else if (type === 'capture') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.5);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      } else if (type === 'home') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      } else if (type === 'error') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      } else if (type === 'win') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.6);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.8);
        osc.start();
        osc.stop(ctx.currentTime + 0.8);
      }
    } catch (e) {
      console.warn('Audio feedback failed to initialize:', e);
    }
  }, [soundEnabled]);

  // Start the Ludo Session
  const startGame = () => {
    if (containerRef.current) {
      containerRef.current.requestFullscreen().catch(() => {});
    }
    setTokens([
      { id: 0, player: 'red', state: 'base', positionIndex: 0 },
      { id: 1, player: 'red', state: 'base', positionIndex: 1 },
      { id: 2, player: 'red', state: 'base', positionIndex: 2 },
      { id: 3, player: 'red', state: 'base', positionIndex: 3 },
      { id: 4, player: 'cyan', state: 'base', positionIndex: 0 },
      { id: 5, player: 'cyan', state: 'base', positionIndex: 1 },
      { id: 6, player: 'cyan', state: 'base', positionIndex: 2 },
      { id: 7, player: 'cyan', state: 'base', positionIndex: 3 },
    ]);
    setScore(0);
    setTurn('red');
    setRedDice(null);
    setCyanDice(null);
    setIsRolling(false);
    setDiceSumResult(null);
    setDiceUnlocked(false);
    setHasRolledThisTurn(false);
    setGameStarted(true);
  };

  // Roll the Red and Cyan Fusion Dice
  const rollDice = () => {
    if (isRolling || hasRolledThisTurn) return;
    setIsRolling(true);
    playSound('roll');
    
    // Simulate dice rolling animation with longer, high-quality rolling steps
    let count = 0;
    const interval = setInterval(() => {
      setRedDice(Math.floor(Math.random() * 7)); // 0 to 6
      setCyanDice(Math.floor(Math.random() * 7)); // 0 to 6
      count++;
      if (count > 12) {
        clearInterval(interval);
        
        let finalRed = Math.floor(Math.random() * 7);
        let finalCyan = Math.floor(Math.random() * 7);
        while (finalRed === 0 && finalCyan === 0) {
          finalRed = Math.floor(Math.random() * 7);
          finalCyan = Math.floor(Math.random() * 7);
        }
        setRedDice(finalRed);
        setCyanDice(finalCyan);
        setIsRolling(false);
        setHasRolledThisTurn(true);

        const sum = finalRed + finalCyan;
        setDiceSumResult(sum);

        if (sumVerification && isHumanTurn) {
          // Generate multiple choice options for verification
          const options = new Set<number>();
          options.add(sum);
          while (options.size < 3) {
            options.add(Math.floor(Math.random() * 12) + 1); // random options between 1 and 12
          }
          setSumOptions(Array.from(options).sort((a, b) => a - b));
          setDiceUnlocked(false);
        } else {
          setDiceUnlocked(true);
        }
      }
    }, 100);
  };

  // Check sum selection (anti-suppression verification)
  const verifySum = (selected: number) => {
    if (selected === diceSumResult) {
      showMessage('Correct! Move your token.', 'success');
      setDiceUnlocked(true);
      playSound('move');
    } else {
      showMessage('Oops! Look closely through both lenses and sum the red & cyan dots.', 'error');
      playSound('error');
    }
  };

  // Auto-pass turn helper
  const passTurn = useCallback(() => {
    setTurn(prev => prev === 'red' ? 'cyan' : 'red');
    setRedDice(null);
    setCyanDice(null);
    setDiceSumResult(null);
    setDiceUnlocked(false);
    setHasRolledThisTurn(false);
  }, []);

  // Check if any tokens have valid moves
  const getMoveableTokens = useCallback((player: 'red' | 'cyan', steps: number): Token[] => {
    if (steps === 0) return [];
    return tokens.filter(t => {
      if (t.player !== player) return false;
      if (t.state === 'goal') return false;
      
      // Rule: to get out of base, the roll sum must be 6 or 12
      if (t.state === 'base') {
        const canGetOut = steps === 6 || steps === 12;
        return canGetOut;
      }
      
      if (t.state === 'track') {
        return true; // standard track tokens can always move
      }
      
      if (t.state === 'homeRow') {
        // Must land exactly on the goal
        return t.positionIndex + steps <= RED_HOME_ROW.length;
      }
      
      return false;
    });
  }, [tokens, redDice, cyanDice]);

  // Execute actual move with step-by-step animation
  const moveToken = async (token: Token) => {
    if (!diceUnlocked || isRolling || diceSumResult === null) return;
    
    // Lock dice/move controls while animating
    setDiceUnlocked(false);
    
    const steps = diceSumResult;
    let currentState = token.state;
    let currentIndex = token.positionIndex;

    // Step through cells sequentially with a slight delay
    for (let i = 1; i <= steps; i++) {
      await new Promise(resolve => setTimeout(resolve, 220));
      
      if (currentState === 'base') {
        currentState = 'track';
        currentIndex = token.player === 'red' ? 0 : 26;
      } else if (currentState === 'track') {
        if (token.player === 'red') {
          if (currentIndex === 50) {
            currentState = 'homeRow';
            currentIndex = 0;
          } else {
            currentIndex = (currentIndex + 1) % 52;
          }
        } else {
          // Cyan starts at track 26. Enters homestretch at index 24.
          if (currentIndex === 24) {
            currentState = 'homeRow';
            currentIndex = 0;
          } else {
            currentIndex = (currentIndex + 1) % 52;
          }
        }
      } else if (currentState === 'homeRow') {
        currentIndex += 1;
        if (currentIndex === RED_HOME_ROW.length - 1) {
          currentState = 'goal';
        }
      }

      // Update token position at current step
      setTokens(prev => prev.map(t => t.id === token.id ? { ...t, state: currentState, positionIndex: currentIndex } : t));
      playSound('move');
    }

    // Small delay before applying capture logic at final landing cell
    await new Promise(resolve => setTimeout(resolve, 150));

    let capturedOpponent = false;
    const updatedTokens = tokens.map((t): Token => {
      // The current token is already at the end coordinates in state
      if (t.id === token.id) {
        return { ...t, state: currentState, positionIndex: currentIndex };
      }
      
      // Check if this cell contains an opponent token to capture
      if (currentState === 'track' && t.player !== token.player && t.state === 'track' && t.positionIndex === currentIndex) {
        const targetCoord = TRACK_COORDINATES[currentIndex];
        const isSafeZone = (targetCoord[0] === 6 && targetCoord[1] === 1) ||
                           (targetCoord[0] === 1 && targetCoord[1] === 8) ||
                           (targetCoord[0] === 8 && targetCoord[1] === 13) ||
                           (targetCoord[0] === 13 && targetCoord[1] === 6);
                           
        if (!isSafeZone) {
          capturedOpponent = true;
          return { ...t, state: 'base', positionIndex: 0 };
        }
      }
      return t;
    });

    setTokens(updatedTokens);

    if (capturedOpponent) {
      playSound('capture');
      incrementScore(15);
      showMessage('Captured opponent! Extra points!', 'success');
    } else if (currentState === 'goal') {
      playSound('home');
      incrementScore(30);
      showMessage('Token reached sanctuary! Perfect!', 'success');
    }

    // Check Win Condition
    const won = updatedTokens.filter(t => t.player === token.player && t.state === 'goal').length === 4;
    if (won) {
      playSound('win');
      showMessage(`${token.player.toUpperCase()} team wins the game!`, 'success');
      setGameStarted(false);
      saveScore({
        gameId: 'anaglyph-ludo',
        score: score + 100,
        durationSeconds: 0
      });
      return;
    }

    // Pass Turn
    passTurn();
  };

  // Computer AI turn handler
  useEffect(() => {
    if (!gameStarted || turn === 'red' || !vsComputer) return;

    // AI Delay sequence
    const rollTimer = setTimeout(() => {
      rollDice();
    }, 1000);

    return () => clearTimeout(rollTimer);
  }, [turn, gameStarted, vsComputer]);

  // AI execution sequence after dice rolled
  useEffect(() => {
    if (!gameStarted || turn === 'red' || !vsComputer || !hasRolledThisTurn || diceSumResult === null) return;

    const moveTimer = setTimeout(() => {
      const moveable = getMoveableTokens('cyan', diceSumResult);
      if (moveable.length > 0) {
        // Simple AI Strategy: prioritize tokens closest to goal or getting out of base
        const sorted = [...moveable].sort((a, b) => {
          if (a.state === 'homeRow' && b.state !== 'homeRow') return -1;
          if (a.state === 'track' && b.state === 'base') return -1;
          return b.positionIndex - a.positionIndex;
        });
        
        // Auto-verify for AI
        setDiceUnlocked(true);
        moveToken(sorted[0]);
      } else {
        // No moves
        showMessage('AI has no valid moves. Pass!', 'info');
        passTurn();
      }
    }, 1200);

    return () => clearTimeout(moveTimer);
  }, [hasRolledThisTurn, diceSumResult, turn, gameStarted, vsComputer]);

  // Red Player No-Moves auto check
  useEffect(() => {
    if (!gameStarted || turn === 'cyan' || !hasRolledThisTurn || diceSumResult === null || !diceUnlocked) return;

    const moveable = getMoveableTokens('red', diceSumResult);
    if (moveable.length === 0) {
      const timer = setTimeout(() => {
        showMessage('No valid moves for Red. Pass!', 'info');
        passTurn();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [diceUnlocked, hasRolledThisTurn, diceSumResult, turn, gameStarted]);

  // Cyan Player No-Moves auto check (Pass & Play)
  useEffect(() => {
    if (!gameStarted || turn === 'red' || vsComputer || !hasRolledThisTurn || diceSumResult === null || !diceUnlocked) return;

    const moveable = getMoveableTokens('cyan', diceSumResult);
    if (moveable.length === 0) {
      const timer = setTimeout(() => {
        showMessage('No valid moves for Cyan. Pass!', 'info');
        passTurn();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [diceUnlocked, hasRolledThisTurn, diceSumResult, turn, gameStarted, vsComputer]);

  // Human Player auto-move when only one token is moveable
  useEffect(() => {
    if (!gameStarted || !hasRolledThisTurn || diceSumResult === null || !diceUnlocked) return;
    
    if (turn === 'red') {
      const moveable = getMoveableTokens('red', diceSumResult);
      if (moveable.length === 1) {
        const timer = setTimeout(() => {
          moveToken(moveable[0]);
        }, 1000);
        return () => clearTimeout(timer);
      }
    } else if (turn === 'cyan' && !vsComputer) {
      const moveable = getMoveableTokens('cyan', diceSumResult);
      if (moveable.length === 1) {
        const timer = setTimeout(() => {
          moveToken(moveable[0]);
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [diceUnlocked, hasRolledThisTurn, diceSumResult, turn, gameStarted, vsComputer]);

  const getCellClasses = (r: number, c: number) => {
    // Check if cell is adjacent to RED_BASE_COORDINATES
    if (r >= 1 && r <= 4 && c >= 1 && c <= 4 && !(r >= 2 && r <= 3 && c >= 2 && c <= 3)) {
      return 'bg-purple-950 border-purple-800 border-2';
    }
    // Check if cell is adjacent to CYAN_BASE_COORDINATES
    if (r >= 10 && r <= 13 && c >= 10 && c <= 13 && !(r >= 11 && r <= 12 && c >= 11 && c <= 12)) {
      return 'bg-blue-950 border-blue-600 border-2';
    }
    // Check if cell is adjacent to Top-Right non-functional base slots (Yellow base, Green border)
    if (r >= 1 && r <= 4 && c >= 10 && c <= 13 && !(r >= 2 && r <= 3 && c >= 11 && c <= 12)) {
      return 'bg-emerald-950 border-emerald-800 border-2';
    }
    // Check if cell is adjacent to Bottom-Left non-functional base slots (Green base, Yellow border)
    if (r >= 10 && r <= 13 && c >= 1 && c <= 4 && !(r >= 11 && r <= 12 && c >= 2 && c <= 3)) {
      return 'bg-yellow-955 bg-yellow-950 border-yellow-800 border-2';
    }

    // Red Base Area
    if (r < 6 && c < 6) return 'bg-red-500/10 border-red-500/30';
    // Top-Right Base Area (Yellow disabled)
    if (r < 6 && c >= 9) return 'bg-yellow-500/10 border-yellow-500/20';
    // Bottom-Left Base Area (Green disabled)
    if (r >= 9 && c < 6) return 'bg-emerald-500/10 border-emerald-500/20';
    // Cyan Base Area
    if (r >= 9 && c >= 9) return 'bg-cyan-500/10 border-cyan-500/30';

    // Safe zones checks
    if (r === 6 && c === 1) return 'bg-red-500/30 border-red-500/50';
    if (r === 8 && c === 13) return 'bg-cyan-500/30 border-cyan-500/50';
    if (r === 1 && c === 8) return 'bg-yellow-500/30 border-yellow-500/50';
    if (r === 13 && c === 6) return 'bg-emerald-500/30 border-emerald-500/50';
    
    // Home paths
    if (r === 7 && c >= 1 && c <= 5) return 'bg-red-500/20 border-red-500/40';
    if (r === 7 && c >= 9 && c <= 13) return 'bg-cyan-500/20 border-cyan-500/40';
    if (c === 7 && r >= 1 && r <= 5) return 'bg-yellow-500/20 border-yellow-500/40';
    if (c === 7 && r >= 9 && r <= 13) return 'bg-emerald-500/20 border-emerald-500/40';

    // Center Triangles/Sanctuary
    if (r >= 6 && r <= 8 && c >= 6 && c <= 8) {
      if (r === 7 && c === 6) return 'bg-red-600/50 border-red-600';
      if (r === 7 && c === 8) return 'bg-cyan-600/50 border-cyan-600';
      if (r === 6 && c === 7) return 'bg-yellow-600/50 border-yellow-600';
      if (r === 8 && c === 7) return 'bg-emerald-600/50 border-emerald-600';
      return 'bg-amber-800/20 border-amber-800/40';
    }

    return 'bg-orange-50/25 border-amber-900/20';
  };

  const getCellToken = (r: number, c: number) => {
    // Find if a token is sitting on this coordinate
    return tokens.find(t => {
      if (t.state === 'goal') return false;
      if (t.state === 'base') {
        const coords = t.player === 'red' ? RED_BASE_COORDINATES[t.positionIndex] : CYAN_BASE_COORDINATES[t.positionIndex];
        return coords[0] === r && coords[1] === c;
      }
      if (t.state === 'track') {
        const coords = TRACK_COORDINATES[t.positionIndex];
        return coords[0] === r && coords[1] === c;
      }
      if (t.state === 'homeRow') {
        const coords = t.player === 'red' ? RED_HOME_ROW[t.positionIndex] : CYAN_HOME_ROW[t.positionIndex];
        return coords[0] === r && coords[1] === c;
      }
      return false;
    });
  };

  // Draw dice dot overlays based on dice value
  const renderDiceDots = (value: number | null) => {
    if (!value) return null;
    const dotsMap: Record<number, number[]> = {
      1: [4],
      2: [0, 8],
      3: [0, 4, 8],
      4: [0, 2, 6, 8],
      5: [0, 2, 4, 6, 8],
      6: [0, 2, 3, 5, 6, 8]
    };
    const activeDots = dotsMap[value] || [];
    return (
      <div className="grid grid-cols-3 grid-rows-3 w-8 h-8 gap-0.5 p-1 bg-white/5 rounded-md">
        {Array.from({ length: 9 }).map((_, i) => (
          <div 
            key={i} 
            className={`rounded-full transition-all duration-300 ${activeDots.includes(i) ? 'bg-current' : 'opacity-0'}`} 
          />
        ))}
      </div>
    );
  };

  const moveableRedTokens = getMoveableTokens('red', diceSumResult || 0);
  const moveableCyanTokens = getMoveableTokens('cyan', diceSumResult || 0);

  return (
    <div className="flex flex-col items-center w-full max-w-5xl" ref={containerRef}>
      {/* Top dashboard control panel */}
      <div className="w-full flex justify-between items-center mb-4 px-4 bg-black/40 p-4 rounded-2xl border border-white/5">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-black text-white">Nature Fusion Ludo 🌿</h2>
            <button 
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`btn btn-circle btn-sm ${soundEnabled ? 'btn-primary' : 'btn-ghost text-white/50'}`}
              title="Toggle Sound"
            >
              {soundEnabled ? <FaVolumeUp /> : <FaVolumeMute />}
            </button>
          </div>

          {/* Player Mode Selectors */}
          <div className="flex items-center bg-white/10 rounded-xl p-1 gap-1">
            <button 
              onClick={() => setVsComputer(true)} 
              disabled={gameStarted}
              className={`px-3 py-1 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all ${vsComputer ? 'bg-emerald-500 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
            >
              <FaRobot /> VS Bot
            </button>
            <button 
              onClick={() => setVsComputer(false)} 
              disabled={gameStarted}
              className={`px-3 py-1 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all ${!vsComputer ? 'bg-emerald-500 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
            >
              <FaUsers /> Pass & Play
            </button>
          </div>
        </div>

        {/* Dynamic Game Score & Streak */}
        <div className="flex gap-8">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Therapy score</span>
            <span className="text-2xl font-black text-emerald-400 leading-none">{score}</span>
          </div>
        </div>
      </div>

      {/* Main Game Interface */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* Left Side: Game State & Dice controls */}
        <div className="bg-emerald-950/20 rounded-3xl border border-emerald-900/50 p-6 flex flex-col justify-between items-center text-center relative overflow-hidden">
          {!gameStarted ? (
            <div className="my-auto flex flex-col items-center">
              <h3 className="text-2xl font-black text-green-100 mb-2">Ready to Train Both Eyes?</h3>
              <p className="text-sm text-green-200/70 mb-6 max-w-sm">
                Wear your Red-Cyan glasses! Both eyes must work together to read the dice sum and navigate tokens to the Nature Sanctuary.
              </p>
              <button 
                onClick={startGame} 
                className="px-10 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl shadow-lg hover:shadow-emerald-500/20 transition-all flex items-center gap-2"
              >
                <FaPlay /> Start Mission
              </button>
            </div>
          ) : (
            <div className="w-full flex flex-col items-center h-full justify-between gap-6">
              
              {/* Turn display */}
              <div className="w-full">
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1">Current Turn</span>
                <div className={`text-2xl font-black uppercase tracking-wider ${turn === 'red' ? 'text-red-500' : 'text-cyan-400'}`}>
                  {turn === 'red' ? '🔴 Red Team (You)' : '🔵 Cyan Team'}
                </div>
              </div>

              {/* Fusion Dice Area */}
              <div className="flex flex-col items-center gap-4 bg-black/30 p-6 rounded-2xl border border-white/5 w-full">
                <span className="text-xs text-gray-400 font-bold">FUSION DICE</span>
                
                <AnaglyphWrapper>
                  <div className="flex justify-center gap-6 w-full py-4 min-h-[5rem]">
                    {/* Red eye dice - dark background for high contrast under filter */}
                    <RedEye className={`w-20 h-20 bg-slate-950 rounded-2xl shadow-[0_0_15px_rgba(220,38,38,0.4)] flex flex-col items-center justify-center text-red-500 border-2 border-red-500/80 ${isRolling ? 'animate-bounce' : 'transition-transform'}`}>
                      {redDice !== null ? (
                        <>
                          <span className="text-2xl font-black mb-1">{redDice}</span>
                          {renderDiceDots(redDice)}
                        </>
                      ) : (
                        <span className="text-sm opacity-50">?</span>
                      )}
                    </RedEye>

                    {/* Cyan eye dice - dark background for high contrast under filter */}
                    <CyanEye className={`w-20 h-20 bg-slate-950 rounded-2xl shadow-[0_0_15px_rgba(6,182,212,0.4)] flex flex-col items-center justify-center text-cyan-400 border-2 border-cyan-500/80 ${isRolling ? 'animate-bounce' : 'transition-transform'}`}>
                      {cyanDice !== null ? (
                        <>
                          <span className="text-2xl font-black mb-1">{cyanDice}</span>
                          {renderDiceDots(cyanDice)}
                        </>
                      ) : (
                        <span className="text-sm opacity-50">?</span>
                      )}
                    </CyanEye>
                  </div>
                </AnaglyphWrapper>

                {/* Roll Trigger Button */}
                {isHumanTurn && !hasRolledThisTurn && (
                  <button 
                    onClick={rollDice} 
                    disabled={isRolling}
                    className="w-full py-3 bg-green-700 hover:bg-green-600 text-white font-black rounded-xl transition-all shadow-md active:scale-95"
                  >
                    {isRolling ? 'Rolling...' : 'Roll Fusion Dice'}
                  </button>
                )}
              </div>

              {/* Sum verification puzzle */}
              {isHumanTurn && hasRolledThisTurn && !diceUnlocked && sumVerification && (
                <div className="w-full bg-white/5 rounded-2xl p-4 border border-white/10 flex flex-col items-center gap-3">
                  <span className="text-sm text-green-200 font-black">Verify Roll Sum:</span>
                  <div className="flex gap-3 justify-center w-full">
                    {sumOptions.map(option => (
                      <button
                        key={option}
                        onClick={() => verifySum(option)}
                        className="w-12 h-12 bg-emerald-600/80 hover:bg-emerald-500 text-white text-lg font-black rounded-xl shadow-md transition-all transform hover:scale-105"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Status and Action Hints */}
              <div className="w-full">
                {turn === 'red' && diceUnlocked && (
                  <div className="text-sm text-green-200/90 font-medium">
                    {moveableRedTokens.length > 0 ? (
                      <span className="animate-pulse">Click any pulsing Red Token on the board to move!</span>
                    ) : (
                      <span>No valid moves! Turn automatically passing...</span>
                    )}
                  </div>
                )}
                {turn === 'cyan' && !vsComputer && diceUnlocked && (
                  <div className="text-sm text-cyan-200/90 font-medium">
                    {moveableCyanTokens.length > 0 ? (
                      <span className="animate-pulse">Click any pulsing Cyan Token on the board to move!</span>
                    ) : (
                      <span>No valid moves! Turn automatically passing...</span>
                    )}
                  </div>
                )}
                {turn === 'cyan' && vsComputer && (
                  <div className="text-sm text-cyan-200/80 flex items-center justify-center gap-2">
                    <span className="loading loading-dots loading-sm"></span>
                    <span>AI is calculating best move...</span>
                  </div>
                )}
              </div>

            </div>
          )}
        </div>

        {/* Center: Ludo Board Grid */}
        <div className="lg:col-span-2 aspect-square max-w-[720px] w-full bg-amber-950/20 rounded-3xl border-4 border-amber-900/60 p-4 shadow-2xl flex items-center justify-center mx-auto">
          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(15, minmax(0, 1fr))',
              gridTemplateRows: 'repeat(15, minmax(0, 1fr))',
            }}
            className="gap-[2px] w-full h-full bg-amber-950/40 rounded-xl overflow-hidden relative"
          >
            {Array.from({ length: 15 }).map((_, r) => (
              Array.from({ length: 15 }).map((_, c) => {
                const cellToken = getCellToken(r, c);
                const isRedHomeGoal = r === 7 && c === 6;
                const isCyanHomeGoal = r === 7 && c === 8;
                const isYellowHomeGoal = r === 6 && c === 7;
                const isGreenHomeGoal = r === 8 && c === 7;
                
                // Track cells that Red can move
                const isMoveableRed = cellToken && cellToken.player === 'red' && turn === 'red' && diceUnlocked && moveableRedTokens.some(t => t.id === cellToken.id);
                // Track cells that Cyan can move (Pass & Play)
                const isMoveableCyan = cellToken && cellToken.player === 'cyan' && turn === 'cyan' && diceUnlocked && moveableCyanTokens.some(t => t.id === cellToken.id);

                return (
                  <div 
                    key={`${r}-${c}`}
                    className={`relative border flex items-center justify-center transition-all ${getCellClasses(r, c)}`}
                  >
                    {/* Goal Sanctuary labels */}
                    {isRedHomeGoal && <span className="absolute text-[8px] font-black text-red-100 z-0">RED</span>}
                    {isCyanHomeGoal && <span className="absolute text-[8px] font-black text-cyan-100 z-0">CYAN</span>}
                    {isYellowHomeGoal && <span className="absolute text-[8px] font-black text-yellow-100 z-0">YELLOW</span>}
                    {isGreenHomeGoal && <span className="absolute text-[8px] font-black text-emerald-100 z-0">GREEN</span>}

                    {/* Safezone Star indicator */}
                    {!cellToken && ((r === 6 && c === 1) || (r === 1 && c === 8) || (r === 8 && c === 13) || (r === 13 && c === 6)) && (
                      <span className="absolute text-sm font-black text-amber-500/60 select-none">★</span>
                    )}

                    {/* Rendering Tokens using anaglyph layers */}
                    {cellToken && (
                      cellToken.player === 'red' ? (
                        <RedEye className="absolute z-10 w-[80%] h-[80%]">
                          <button
                            disabled={!isMoveableRed}
                            onClick={() => moveToken(cellToken)}
                            className={`w-full h-full rounded-full bg-red-500 border-2 border-white shadow-lg flex items-center justify-center
                              ${isMoveableRed ? 'animate-bounce cursor-pointer shadow-red-500/50 ring-4 ring-white' : 'cursor-not-allowed opacity-80'}
                            `}
                          >
                            <span className="text-[10px] font-black text-white">R</span>
                          </button>
                        </RedEye>
                      ) : (
                        <CyanEye className="absolute z-10 w-[80%] h-[80%]">
                          <button
                            disabled={!isMoveableCyan}
                            onClick={() => moveToken(cellToken)}
                            className={`w-full h-full rounded-full bg-cyan-500 border-2 border-white shadow-lg flex items-center justify-center
                              ${isMoveableCyan ? 'animate-bounce cursor-pointer shadow-cyan-500/50 ring-4 ring-white' : 'cursor-not-allowed opacity-80'}
                            `}
                          >
                            <span className="text-[10px] font-black text-white">C</span>
                          </button>
                        </CyanEye>
                      )
                    )}

                    {/* Base labels/visual hints */}
                    {!cellToken && RED_BASE_COORDINATES.some(coord => coord[0] === r && coord[1] === c) && <div className="w-2.5 h-2.5 rounded-full bg-red-500/30" />}
                    {!cellToken && CYAN_BASE_COORDINATES.some(coord => coord[0] === r && coord[1] === c) && <div className="w-2.5 h-2.5 rounded-full bg-cyan-500/30" />}
                    {!cellToken && [ [2, 11], [2, 12], [3, 11], [3, 12] ].some(coord => coord[0] === r && coord[1] === c) && <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/30" />}
                    {!cellToken && [ [11, 2], [11, 3], [12, 2], [12, 3] ].some(coord => coord[0] === r && coord[1] === c) && <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/30" />}
                  </div>
                );
              })
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
