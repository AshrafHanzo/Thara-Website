import { useEffect, useState, useRef, useCallback } from "react";
import "./Confetti.css";

const Confetti = ({ trigger = false, duration = 5000 }) => {
  const [confetti, setConfetti] = useState([]);
  const confettiIdRef = useRef(0);

  const createConfettiPiece = useCallback(() => {
    const shapes = ["circle", "square", "star", "heart"];
    const shape = shapes[Math.floor(Math.random() * shapes.length)];

    const symbolMap = {
      star: ["⭐", "🌟", "✨"][Math.floor(Math.random() * 3)],
      heart: ["💛", "💖", "🧡"][Math.floor(Math.random() * 3)],
    };

    return {
      id: confettiIdRef.current++,
      left: Math.random() * 100,
      size: Math.random() * 8 + 8,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 0.5,
      shape,
      symbol: symbolMap[shape] || null,
    };
  }, []);

  useEffect(() => {
    if (trigger) {
      // Create burst of confetti
      const newConfetti = Array.from({ length: 60 }, createConfettiPiece);
      setConfetti(newConfetti);

      // Add more confetti in waves
      const wave1 = setTimeout(() => {
        setConfetti(prev => [...prev, ...Array.from({ length: 30 }, createConfettiPiece)]);
      }, 500);

      const wave2 = setTimeout(() => {
        setConfetti(prev => [...prev, ...Array.from({ length: 20 }, createConfettiPiece)]);
      }, 1000);

      // Clear after duration
      const clear = setTimeout(() => {
        setConfetti([]);
      }, duration);

      return () => {
        clearTimeout(wave1);
        clearTimeout(wave2);
        clearTimeout(clear);
      };
    }
  }, [trigger, duration, createConfettiPiece]);

  if (confetti.length === 0) return null;

  return (
    <div className="confetti-container" aria-hidden="true">
      {confetti.map((piece) => (
        <div
          key={piece.id}
          className={`confetti ${piece.shape}`}
          style={{
            left: `${piece.left}%`,
            width: piece.symbol ? "auto" : `${piece.size}px`,
            height: piece.symbol ? "auto" : `${piece.size}px`,
            animationDuration: `${piece.duration}s`,
            animationDelay: `${piece.delay}s`,
            fontSize: piece.symbol ? `${piece.size * 1.5}px` : undefined,
          }}
        >
          {piece.symbol}
        </div>
      ))}
    </div>
  );
};

export default Confetti;
