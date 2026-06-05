import { useState, useCallback } from 'react';
import { useSnackbar } from './Snackbar';

interface SaveScoreParams {
  gameId: string;
  score: number;
  durationSeconds: number;
}

export const useGameScore = (initialScore = 0) => {
  const [score, setScore] = useState(initialScore);
  const { showMessage } = useSnackbar();

  const incrementScore = useCallback((amount: number) => {
    setScore(prev => prev + amount);
  }, []);

  const resetScore = useCallback(() => {
    setScore(0);
  }, []);

  const saveScore = useCallback(async ({ gameId, score, durationSeconds }: SaveScoreParams) => {
    try {
      const response = await fetch('/api/save-game-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId,
          score,
          durationSeconds,
          date: new Date().toISOString().split('T')[0]
        })
      });

      const data = await response.json();
      if (response.ok) {
        showMessage(`Score saved: ${score}`, 'success');
      } else {
        throw new Error(data.message || 'Failed to save score');
      }
    } catch (error) {
      console.error('Error saving score:', error);
      showMessage('Failed to save score online', 'error');
    }
  }, [showMessage]);

  return {
    score,
    setScore,
    incrementScore,
    resetScore,
    saveScore
  };
};
