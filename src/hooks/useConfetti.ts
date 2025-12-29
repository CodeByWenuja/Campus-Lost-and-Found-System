import { useCallback } from 'react';
import confetti from 'canvas-confetti';

export function useConfetti() {
  const fireConfetti = useCallback((duration: number = 2000) => {
    const end = Date.now() + duration;

    const colors = ['#0ea5e9', '#38bdf8', '#7dd3fc', '#bae6fd'];

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  }, []);

  const fireSingleBurst = useCallback(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#0ea5e9', '#38bdf8', '#7dd3fc']
    });
  }, []);

  return { fireConfetti, fireSingleBurst };
}
