import { useEffect, useState, useCallback, useRef } from "react";
import { animate } from "animejs";
import "./Hearts.css";

const Hearts = () => {
  const [particles, setParticles] = useState([]);
  const particleIdRef = useRef(0);
  const containerRef = useRef(null);
  const hasAnimatedRef = useRef(false);

  const createParticle = useCallback(() => {
    const types = ["heart", "butterfly", "star", "sparkle"];
    const type = types[Math.floor(Math.random() * types.length)];

    const symbols = {
      heart: ["💛", "💖", "🧡", "❤️", "💕", "🤍"],
      butterfly: ["🦋", "✨"],
      star: ["⭐", "🌟", "✨", "💫"],
      sparkle: ["✨", "⭐", "🌟"]
    };

    const symbolArray = symbols[type];
    const symbol = symbolArray[Math.floor(Math.random() * symbolArray.length)];

    return {
      id: particleIdRef.current++,
      type,
      symbol,
      left: Math.random() * 100,
      size: Math.random() * 1.6 + 0.7,
      duration: Math.random() * 10 + 8,
      delay: Math.random() * 3,
      swayAmplitude: Math.random() * 50 + 20,
      rotationSpeed: Math.random() * 2 - 1,
    };
  }, []);

  // Initial entrance animation
  useEffect(() => {
    if (containerRef.current && !hasAnimatedRef.current) {
      hasAnimatedRef.current = true;

      // Fade in the container
      animate(containerRef.current, {
        opacity: [0, 1],
        duration: 1500,
        easing: 'outCubic'
      });
    }
  }, []);

  useEffect(() => {
    // Create initial particles
    const initialParticles = Array.from({ length: 30 }, createParticle);
    setParticles(initialParticles);

    // Continuously add new particles
    const interval = setInterval(() => {
      setParticles((prev) => {
        // Remove old particles and add new ones
        const filtered = prev.filter((p) => {
          const element = document.getElementById(`particle-${p.id}`);
          return element !== null;
        });

        // Keep particle count around 30-40
        if (filtered.length < 30) {
          return [...filtered, createParticle(), createParticle()];
        }
        return [...filtered, createParticle()];
      });
    }, 700);

    return () => clearInterval(interval);
  }, [createParticle]);

  // Clean up old particles
  useEffect(() => {
    const cleanup = setInterval(() => {
      setParticles((prev) => prev.slice(-45));
    }, 12000);
    return () => clearInterval(cleanup);
  }, []);

  return (
    <div className="hearts" aria-hidden="true" ref={containerRef}>
      {/* Glowing orbs in background */}
      <div className="glow-orbs">
        <div className="glow-orb orb-1"></div>
        <div className="glow-orb orb-2"></div>
        <div className="glow-orb orb-3"></div>
      </div>

      {particles.map((particle) => (
        <span
          key={particle.id}
          id={`particle-${particle.id}`}
          className={`${particle.type} floating-particle`}
          style={{
            left: `${particle.left}%`,
            fontSize: `${particle.size}rem`,
            animationDuration: `${particle.duration}s`,
            animationDelay: `${particle.delay}s`,
            '--sway-amplitude': `${particle.swayAmplitude}px`,
            '--rotation-speed': particle.rotationSpeed,
          }}
        >
          {particle.symbol}
        </span>
      ))}

      {/* Shimmer overlay */}
      <div className="shimmer-overlay"></div>
    </div>
  );
};

export default Hearts;
