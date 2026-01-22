import { useState, useRef, useEffect, useCallback } from "react";
import { animate } from "animejs";
import "./RocketFireworks.css";
import { usePerformance } from "../contexts/PerformanceContext";

const RocketLaunchPage = ({ onComplete }) => {
    const [phase, setPhase] = useState("ready"); // ready, launching, flying, exploding, revealing, lovemsg, complete
    const [revealedLetters, setRevealedLetters] = useState([]);
    const [revealedLoveLetters, setRevealedLoveLetters] = useState([]);
    const [showPopup, setShowPopup] = useState(false);
    const [rocketPosition, setRocketPosition] = useState({ x: 50, y: 75 });
    const [rocketRotation, setRocketRotation] = useState(0);
    const containerRef = useRef(null);
    const rocketRef = useRef(null);
    const { settings: perfSettings } = usePerformance();

    const surpriseMessage = "Happy Birthday";
    const loveMessage = "My Dearest Tharuma";
    const subMessage = "You are my everything 💕";
    const letters = surpriseMessage.split("");
    const loveLetters = loveMessage.split("");

    // Click rocket to launch
    const handleRocketClick = () => {
        if (phase !== "ready") return;

        setPhase("launching");
        
        // Create initial launch particles
        createLaunchBurst();

        // Phase 1: Rocket shakes then smoothly lifts off
        setTimeout(() => {
            setPhase("flying");
            flyRocketSmooth();
        }, 1200);
    };

    // Create burst effect on launch
    const createLaunchBurst = () => {
        const colors = ['#FFD700', '#FF4500', '#FF6347', '#FFA500', '#FF69B4'];
        for (let i = 0; i < 30; i++) {
            const particle = document.createElement('div');
            const color = colors[Math.floor(Math.random() * colors.length)];
            const size = Math.random() * 10 + 5;
            particle.style.cssText = `
                position: fixed;
                left: 50%;
                top: 75%;
                width: ${size}px;
                height: ${size}px;
                background: ${color};
                border-radius: 50%;
                pointer-events: none;
                z-index: 800;
                box-shadow: 0 0 15px ${color}, 0 0 30px ${color};
            `;
            document.body.appendChild(particle);

            const angle = (360 / 30) * i;
            const distance = 80 + Math.random() * 60;

            animate(particle, {
                translateX: Math.cos(angle * Math.PI / 180) * distance,
                translateY: Math.sin(angle * Math.PI / 180) * distance,
                opacity: [1, 0],
                scale: [1.5, 0],
                duration: 1000,
                easing: 'outExpo',
                complete: () => particle.remove()
            });
        }
    };

    // Smooth curved flight path
    const flyRocketSmooth = useCallback(() => {
        const flightPath = [
            { x: 50, y: 65, rot: 0, duration: 500 },      // Lift off
            { x: 50, y: 50, rot: 0, duration: 400 },      // Up
            { x: 35, y: 40, rot: -20, duration: 500 },    // Curve left
            { x: 20, y: 35, rot: -30, duration: 400 },    // More left
            { x: 30, y: 25, rot: -10, duration: 500 },    // Up-right
            { x: 50, y: 20, rot: 0, duration: 400 },      // Center top
            { x: 70, y: 25, rot: 15, duration: 500 },     // Right
            { x: 80, y: 35, rot: 25, duration: 400 },     // More right
            { x: 65, y: 30, rot: 10, duration: 500 },     // Back toward center
            { x: 50, y: 18, rot: 0, duration: 600 },      // Final center before explosion
        ];

        let posIndex = 0;
        
        const animateToPosition = () => {
            if (posIndex < flightPath.length) {
                const target = flightPath[posIndex];
                setRocketPosition({ x: target.x, y: target.y });
                setRocketRotation(target.rot);
                createTrailParticles({ x: target.x, y: target.y });
                posIndex++;
                setTimeout(animateToPosition, target.duration);
            } else {
                // Rocket explodes at final position
                setPhase("exploding");
                createMegaExplosion();
                
                // Start text reveal after explosion
                setTimeout(() => {
                    setPhase("revealing");
                    revealMainText();
                }, 1800);
            }
        };
        
        animateToPosition();
    }, []);

    // Create trail particles as rocket flies
    const createTrailParticles = (pos) => {
        const colors = ['#FFD700', '#FF69B4', '#FFA500', '#FF6347', '#FF4500'];
        for (let i = 0; i < 8; i++) {
            const particle = document.createElement('div');
            particle.className = 'trail-particle';
            const color = colors[Math.floor(Math.random() * colors.length)];
            const size = Math.random() * 8 + 4;
            particle.style.cssText = `
                position: fixed;
                left: ${pos.x}%;
                top: ${pos.y + 5}%;
                width: ${size}px;
                height: ${size}px;
                background: ${color};
                border-radius: 50%;
                pointer-events: none;
                z-index: 900;
                box-shadow: 0 0 ${size * 2}px ${color}, 0 0 ${size * 4}px ${color};
            `;
            document.body.appendChild(particle);

            animate(particle, {
                translateX: (Math.random() - 0.5) * 80,
                translateY: Math.random() * 60 + 30,
                opacity: [1, 0],
                scale: [1.2, 0],
                duration: 1000 + Math.random() * 500,
                easing: 'outQuad',
                complete: () => particle.remove()
            });
        }
    };

    // Create mega explosion with crackers
    const createMegaExplosion = useCallback(() => {
        const colors = ['#FFD700', '#FF69B4', '#87CEEB', '#FF6347', '#9370DB', '#00FA9A', '#FF1493', '#00CED1'];
        const particleCount = perfSettings?.fireworkParticles || 40;

        // Multiple explosion bursts from center
        for (let burst = 0; burst < 8; burst++) {
            setTimeout(() => {
                const centerX = 40 + Math.random() * 20;
                const centerY = 10 + Math.random() * 20;

                // Cracker-style particles
                for (let i = 0; i < particleCount; i++) {
                    const particle = document.createElement('div');
                    particle.className = 'explosion-particle cracker';
                    const color = colors[Math.floor(Math.random() * colors.length)];
                    const size = Math.random() * 8 + 4;
                    particle.style.cssText = `
                        position: fixed;
                        left: ${centerX}%;
                        top: ${centerY}%;
                        width: ${size}px;
                        height: ${size}px;
                        background: ${color};
                        border-radius: 50%;
                        box-shadow: 0 0 15px ${color}, 0 0 30px ${color};
                        pointer-events: none;
                        z-index: 1000;
                    `;
                    document.body.appendChild(particle);

                    const angle = (360 / particleCount) * i + Math.random() * 20;
                    const distance = 150 + Math.random() * 100;

                    animate(particle, {
                        translateX: Math.cos(angle * Math.PI / 180) * distance,
                        translateY: Math.sin(angle * Math.PI / 180) * distance + 80,
                        opacity: [1, 0],
                        scale: [2, 0],
                        duration: 2000 + Math.random() * 500,
                        easing: 'outQuad',
                        complete: () => particle.remove()
                    });
                }

                // Add sparkle emojis
                const emojis = ['✨', '💫', '⭐', '🌟', '💥', '🎇', '🎆'];
                for (let e = 0; e < 5; e++) {
                    const emoji = document.createElement('div');
                    emoji.className = 'explosion-emoji';
                    emoji.textContent = emojis[Math.floor(Math.random() * emojis.length)];
                    emoji.style.cssText = `
                        position: fixed;
                        left: ${centerX}%;
                        top: ${centerY}%;
                        font-size: 2rem;
                        pointer-events: none;
                        z-index: 1001;
                    `;
                    document.body.appendChild(emoji);

                    animate(emoji, {
                        translateX: (Math.random() - 0.5) * 200,
                        translateY: (Math.random() - 0.5) * 200,
                        opacity: [1, 0],
                        scale: [1.5, 0],
                        rotate: Math.random() * 360,
                        duration: 1500,
                        easing: 'outQuad',
                        complete: () => emoji.remove()
                    });
                }
            }, burst * 200);
        }
    }, [perfSettings]);

    // Reveal main text letter by letter
    const revealMainText = useCallback(() => {
        letters.forEach((letter, index) => {
            setTimeout(() => {
                createLetterSparkles(index, letters.length);
                setRevealedLetters(prev => [...prev, index]);

                // After main text, show love message
                if (index === letters.length - 1) {
                    setTimeout(() => {
                        setPhase("lovemsg");
                        revealLoveMessage();
                    }, 1000);
                }
            }, index * 120);
        });
    }, [letters]);

    // Reveal love message
    const revealLoveMessage = useCallback(() => {
        loveLetters.forEach((letter, index) => {
            setTimeout(() => {
                setRevealedLoveLetters(prev => [...prev, index]);

                // After love message, show popup
                if (index === loveLetters.length - 1) {
                    setTimeout(() => {
                        setPhase("complete");
                        setShowPopup(true);
                    }, 1500);
                }
            }, index * 100);
        });
    }, [loveLetters]);

    // Create sparkles for each letter reveal
    const createLetterSparkles = (index, total) => {
        const colors = ['#FFD700', '#FF69B4', '#FFB6C1', '#FF1493'];
        const startX = 50 - (total * 2);
        const letterX = startX + (index * 4);

        for (let i = 0; i < 10; i++) {
            const particle = document.createElement('div');
            particle.className = 'letter-sparkle';
            const color = colors[Math.floor(Math.random() * colors.length)];
            particle.style.cssText = `
                position: fixed;
                left: ${letterX + Math.random() * 10}%;
                top: ${35 + Math.random() * 10}%;
                width: 5px;
                height: 5px;
                background: ${color};
                border-radius: 50%;
                pointer-events: none;
                z-index: 999;
                box-shadow: 0 0 8px ${color};
            `;
            document.body.appendChild(particle);

            animate(particle, {
                translateX: (Math.random() - 0.5) * 60,
                translateY: (Math.random() - 0.5) * 60,
                opacity: [1, 0],
                scale: [1.5, 0],
                duration: 600,
                easing: 'outQuad',
                complete: () => particle.remove()
            });
        }
    };

    return (
        <div className="rocket-launch-page" ref={containerRef}>
            {/* Starry background */}
            <div className="starry-bg">
                {[...Array(80)].map((_, i) => (
                    <div
                        key={i}
                        className="star"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 3}s`,
                            width: `${Math.random() * 3 + 1}px`,
                            height: `${Math.random() * 3 + 1}px`,
                        }}
                    />
                ))}
            </div>

            {/* The Rocket - Animated flying */}
            {(phase === "ready" || phase === "launching" || phase === "flying") && (
                <div
                    ref={rocketRef}
                    className={`interactive-rocket ${phase}`}
                    onClick={handleRocketClick}
                    style={{
                        left: `${rocketPosition.x}%`,
                        top: `${rocketPosition.y}%`,
                        transform: `translate(-50%, -50%) rotate(${rocketRotation}deg)`,
                        transition: phase === "flying" ? 'left 0.5s cubic-bezier(0.25, 0.1, 0.25, 1), top 0.5s cubic-bezier(0.25, 0.1, 0.25, 1), transform 0.3s ease-out' : 'none'
                    }}
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
                    {(phase === "launching" || phase === "flying") && (
                        <div className="rocket-flames mega-flames">
                            <div className="flame flame-1"></div>
                            <div className="flame flame-2"></div>
                            <div className="flame flame-3"></div>
                            <div className="flame-trail"></div>
                        </div>
                    )}
                    {phase === "ready" && (
                        <div className="tap-hint pulse-hint">
                            <span className="hint-text">Tap the Rocket!</span>
                            <span className="hint-emoji">👆</span>
                        </div>
                    )}
                </div>
            )}

            {/* Text reveal - Happy Birthday */}
            {(phase === "revealing" || phase === "lovemsg" || phase === "complete") && (
                <div className="surprise-message-container">
                    <div className="surprise-letters main-text">
                        {letters.map((letter, index) => (
                            <span
                                key={index}
                                className={`reveal-letter ${revealedLetters.includes(index) ? "visible" : ""} ${letter === " " ? "space" : ""}`}
                            >
                                {letter}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Love message - My Dearest Tharuma */}
            {(phase === "lovemsg" || phase === "complete") && (
                <div className="love-message-container">
                    <div className="love-letters">
                        {loveLetters.map((letter, index) => (
                            <span
                                key={index}
                                className={`love-letter ${revealedLoveLetters.includes(index) ? "visible" : ""} ${letter === " " ? "space" : ""}`}
                            >
                                {letter}
                            </span>
                        ))}
                    </div>
                    {phase === "complete" && (
                        <p className="sub-love-message">{subMessage}</p>
                    )}
                </div>
            )}

            {/* Romantic popup */}
            {showPopup && (
                <div className="romantic-popup-overlay">
                    <div className="romantic-popup enhanced">
                        <div className="popup-glow"></div>
                        <div className="popup-hearts">
                            {[...Array(10)].map((_, i) => (
                                <span key={i} className="floating-heart" style={{ 
                                    animationDelay: `${i * 0.3}s`,
                                    left: `${10 + Math.random() * 80}%`,
                                    top: `${Math.random() * 100}%`
                                }}>💕</span>
                            ))}
                        </div>
                        <div className="popup-sparkles">
                            {[...Array(8)].map((_, i) => (
                                <span key={i} className="popup-sparkle" style={{ animationDelay: `${i * 0.2}s` }}>✨</span>
                            ))}
                        </div>
                        <h2 className="popup-heading">For You, Tharuma 💝</h2>
                        <p className="popup-subtext">I have written something special from my heart...</p>
                        <button
                            className="read-message-button stunning"
                            onClick={onComplete}
                        >
                            <span className="btn-heart">💌</span>
                            <span>Read My Love Letter</span>
                            <span className="btn-heart">💕</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RocketLaunchPage;
