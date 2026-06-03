import { useState, useEffect, useCallback, useRef } from 'react';
import AnaglyphWrapper, { RedEye, CyanEye, BothEyes } from './AnaglyphWrapper';
import { useSnackbar } from '../../hooks/Snackbar';

interface Bubble {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  type: 'red' | 'cyan' | 'golden';
}

export default function AnaglyphBubblePop() {
  const { showMessage } = useSnackbar();
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  
  const requestRef = useRef<number>(null);
  const lastSpawnTime = useRef<number>(0);
  const nextId = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const spawnBubble = useCallback(() => {
    const types: ('red' | 'cyan' | 'golden')[] = ['red', 'cyan', 'red', 'cyan', 'golden'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    const newBubble: Bubble = {
      id: nextId.current++,
      x: Math.random() * 90 + 5, // 5% to 95%
      y: -10,
      size: Math.random() * 40 + 40, // 40px to 80px
      speed: Math.random() * 0.1 + 0.05, // Speed factor
      type
    };
    
    setBubbles(prev => [...prev, newBubble]);
  }, []);

  const updateGame = useCallback((time: number) => {
    if (!gameStarted) return;

    if (time - lastSpawnTime.current > 1500) {
      spawnBubble();
      lastSpawnTime.current = time;
    }

    setBubbles(prev => {
      const nextBubbles = prev
        .map(b => ({ ...b, y: b.y + b.speed * 20 })) // Arbitrary gravity
        .filter(b => b.y < 110); // Remove bubbles off screen
      return nextBubbles;
    });

    requestRef.current = requestAnimationFrame(updateGame);
  }, [gameStarted, spawnBubble]);

  useEffect(() => {
    if (gameStarted && timeLeft > 0) {
      requestRef.current = requestAnimationFrame(updateGame);
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => {
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
        clearInterval(timer);
      };
    } else if (timeLeft === 0 && gameStarted) {
      setGameStarted(false);
      saveScore(score);
    }
  }, [gameStarted, timeLeft, updateGame, score]);

  const saveScore = async (finalScore: number) => {
    showMessage(`Game Over! Score: ${finalScore}`, 'success');
    try {
      await fetch('/api/save-game-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId: 'bubble-pop',
          score: finalScore,
          durationSeconds: 60,
          date: new Date().toISOString().split('T')[0]
        })
      });
    } catch (error) {
      console.error('Failed to save score:', error);
    }
  };

  const handlePop = (id: number, type: 'red' | 'cyan' | 'golden') => {
    setBubbles(prev => prev.filter(b => b.id !== id));
    setScore(prev => prev + (type === 'golden' ? 5 : 1));
  };

  const startGame = () => {
    if (containerRef.current) {
      containerRef.current.requestFullscreen().catch(() => {});
    }
    setScore(0);
    setTimeLeft(60);
    setBubbles([]);
    setGameStarted(true);
    lastSpawnTime.current = performance.now();
  };

  return (
    <div className="w-full max-w-4xl flex flex-col items-center" ref={containerRef}>
      <div className="w-full flex justify-between items-center mb-4 px-4">
        <div className="text-2xl font-bold text-green-800">Score: {score}</div>
        <div className="text-2xl font-bold text-blue-800">Time: {timeLeft}s</div>
      </div>

      <div className="w-full aspect-video relative rounded-xl border-4 border-gray-800 bg-gray-900 overflow-hidden shadow-2xl">
        {!gameStarted && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/70 text-white p-8 text-center">
            <h2 className="text-4xl font-bold mb-4">Anaglyph Bubble Pop</h2>
            <p className="mb-8 text-xl max-w-md">
              Put on your red-blue glasses! Pop the bubbles to earn points. 
              Golden bubbles are worth 5x points!
            </p>
            <button onClick={startGame} className="btn btn-primary btn-lg px-12 text-2xl">
              {timeLeft === 0 ? 'Play Again' : 'Start Game'}
            </button>
          </div>
        )}

        <AnaglyphWrapper>
          {bubbles.map(bubble => {
            const BubbleContent = (
              <div 
                key={bubble.id}
                onClick={() => handlePop(bubble.id, bubble.type)}
                className={`absolute cursor-pointer rounded-full transition-transform active:scale-150 flex items-center justify-center
                  ${bubble.type === 'red' ? 'bg-red-500' : ''}
                  ${bubble.type === 'cyan' ? 'bg-cyan-500' : ''}
                  ${bubble.type === 'golden' ? 'bg-yellow-400 border-4 border-white animate-pulse' : ''}
                `}
                style={{ 
                  left: `${bubble.x}%`, 
                  top: `${bubble.y}%`, 
                  width: `${bubble.size}px`, 
                  height: `${bubble.size}px`,
                  boxShadow: 'inset -5px -5px 10px rgba(0,0,0,0.3), inset 5px 5px 10px rgba(255,255,255,0.5)'
                }}
              >
                {bubble.type === 'golden' && <span className="text-2xl">⭐</span>}
              </div>
            );

            if (bubble.type === 'red') return <RedEye key={bubble.id}>{BubbleContent}</RedEye>;
            if (bubble.type === 'cyan') return <CyanEye key={bubble.id}>{BubbleContent}</CyanEye>;
            return <BothEyes key={bubble.id}>{BubbleContent}</BothEyes>;
          })}
        </AnaglyphWrapper>
      </div>
      
      <div className="mt-6 p-4 bg-green-50 rounded-xl border border-green-200 text-sm text-green-800 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded-full"></div> Right Eye only
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-cyan-500 rounded-full"></div> Left Eye only
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-400 rounded-full border border-yellow-600"></div> Both Eyes (Target!)
        </div>
      </div>
    </div>
  );
}
