import { useState, useRef, useEffect, useCallback } from "react";
import { animate } from "animejs";
import "./RocketFireworks.css";
import { usePerformance } from "../contexts/PerformanceContext";

const RocketLaunchPage = ({ onComplete }) => {
    const [phase, setPhase] = useState("ready"); // ready, launching, exploding, revealing, complete
    const [revealedLetters, setRevealedLetters] = useState([]);
    const [showPopup, setShowPopup] = useState(false);
    const containerRef = useRef(null);
    const { settings: perfSettings } = usePerformance();

    const surpriseMessage = "Happy Birthday My Love";
    const letters = surpriseMessage.split("");

    // Click rocket to launch
    const handleRocketClick = () => {
        if (phase !== "ready") return;

        setPhase("launching");

        // Rocket flies up
        setTimeout(() => {
            setPhase("exploding");
            createExplosion();
        }, 1500);

        // Start revealing letters
        setTimeout(() => {
            setPhase("revealing");
            revealLettersOneByOne();
        }, 2500);
    };

    // Create explosion with fireworks
    const createExplosion = useCallback(() => {
        const colors = ['#FFD700', '#FF69B4', '#87CEEB', '#FF6347', '#9370DB', '#00FA9A'];
        const particleCount = perfSettings?.fireworkParticles || 30;

        // Create multiple firework bursts
        for (let burst = 0; burst < 5; burst++) {
            setTimeout(() => {
                const centerX = 20 + Math.random() * 60;
                const centerY = 15 + Math.random() * 30;

                for (let i = 0; i < particleCount; i++) {
                    const particle = document.createElement('div');
                    particle.className = 'explosion-particle';
                    const color = colors[Math.floor(Math.random() * colors.length)];
                    particle.style.cssText = `
            position: fixed;
            left: ${centerX}%;
            top: ${centerY}%;
            width: 8px;
            height: 8px;
            background: ${color};
            border-radius: 50%;
            box-shadow: 0 0 10px ${color}, 0 0 20px ${color};
            pointer-events: none;
            z-index: 1000;
          `;
                    document.body.appendChild(particle);

                    const angle = (360 / particleCount) * i;
                    const distance = 100 + Math.random() * 80;

                    animate(particle, {
                        translateX: Math.cos(angle * Math.PI / 180) * distance,
                        translateY: Math.sin(angle * Math.PI / 180) * distance + 50,
                        opacity: [1, 0],
                        scale: [1.5, 0],
                        duration: 1500,
                        easing: 'outQuad',
                        complete: () => particle.remove()
                    });
                }
            }, burst * 300);
        }
    }, [perfSettings]);

    // Reveal letters one by one with particle effects
    const revealLettersOneByOne = useCallback(() => {
        letters.forEach((letter, index) => {
            setTimeout(() => {
                // Create particles that form into the letter
                createLetterParticles(index);
                setRevealedLetters(prev => [...prev, index]);

                // If last letter, show popup after delay
                if (index === letters.length - 1) {
                    setTimeout(() => {
                        setPhase("complete");
                        setShowPopup(true);
                    }, 1500);
                }
            }, index * 150);
        });
    }, [letters]);

    // Create particles that converge to form a letter
    const createLetterParticles = (index) => {
        const colors = ['#FFD700', '#FF69B4', '#FFB6C1'];
        for (let i = 0; i < 8; i++) {
            const particle = document.createElement('div');
            particle.className = 'letter-particle';
            const color = colors[Math.floor(Math.random() * colors.length)];
            particle.style.cssText = `
        position: fixed;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        width: 6px;
        height: 6px;
        background: ${color};
        border-radius: 50%;
        pointer-events: none;
        z-index: 999;
      `;
            document.body.appendChild(particle);

            animate(particle, {
                opacity: [1, 0],
                scale: [1, 0],
                duration: 800,
                easing: 'outQuad',
                complete: () => particle.remove()
            });
        }
    };

    return (
        <div className="rocket-launch-page" ref={containerRef}>
            {/* Starry background */}
            <div className="starry-bg">
                {[...Array(50)].map((_, i) => (
                    <div
                        key={i}
                        className="star"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 3}s`,
                        }}
                    />
                ))}
            </div>

            {/* The Rocket */}
            {(phase === "ready" || phase === "launching") && (
                <div
                    className={`interactive-rocket ${phase === "launching" ? "flying" : "waiting"}`}
                    onClick={handleRocketClick}
                >
                    <div className="rocket-body-main">
                        <div className="rocket-tip"></div>
                        <div className="rocket-middle">
                            <div className="rocket-window"></div>
                        </div>
                        <div className="rocket-fins">
                            <div className="fin left"></div>
                            <div className="fin right"></div>
                        </div>
                    </div>
                    {phase === "launching" && (
                        <div className="rocket-flames">
                            <div className="flame flame-1"></div>
                            <div className="flame flame-2"></div>
                            <div className="flame flame-3"></div>
                        </div>
                    )}
                    {phase === "ready" && (
                        <div className="tap-hint">
                            <span>Tap the rocket!</span>
                        </div>
                    )}
                </div>
            )}

            {/* Letter by letter reveal */}
            {(phase === "revealing" || phase === "complete") && (
                <div className="surprise-message-container">
                    <div className="surprise-letters">
                        {letters.map((letter, index) => (
                            <span
                                key={index}
                                className={`reveal-letter ${revealedLetters.includes(index) ? "visible" : ""} ${letter === " " ? "space" : ""}`}
                                style={{ animationDelay: `${index * 0.05}s` }}
                            >
                                {letter}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Romantic popup */}
            {showPopup && (
                <div className="romantic-popup-overlay">
                    <div className="romantic-popup">
                        <div className="popup-glow"></div>
                        <div className="popup-hearts">
                            {[...Array(6)].map((_, i) => (
                                <span key={i} className="floating-heart" style={{ animationDelay: `${i * 0.3}s` }}>💕</span>
                            ))}
                        </div>
                        <h2 className="popup-heading">For You, My Love</h2>
                        <p className="popup-subtext">I have something special to say...</p>
                        <button
                            className="read-message-button"
                            onClick={onComplete}
                        >
                            <span className="btn-sparkle">✨</span>
                            Read My Message
                            <span className="btn-sparkle">✨</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RocketLaunchPage;
