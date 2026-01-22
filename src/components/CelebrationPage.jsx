import { useState, useRef, useEffect, useCallback } from "react";
import { animate, stagger } from "animejs";
import "./CelebrationPage.css";
import "./RocketFireworks.css";
import MessageCard from "./MessageCard";
import Gallery from "./Gallery";
import RocketLaunchPage from "./RocketLaunchPage";
import { usePerformance } from "../contexts/PerformanceContext";

const CelebrationPage = ({ onNavigate, onGoBack }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showLights, setShowLights] = useState(false);
  const [showDecorations, setShowDecorations] = useState(false);
  const [showBalloons, setShowBalloons] = useState(false);
  const [showCake, setShowCake] = useState(false);
  const [showPhotos, setShowPhotos] = useState(false);
  const [currentView, setCurrentView] = useState("slides"); // slides, buttons, rocketShow, message, gallery
  const [noClickCount, setNoClickCount] = useState(0);

  // Rocket animation states
  const [showRocketAnimation, setShowRocketAnimation] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);
  const [showFireworks, setShowFireworks] = useState(false);
  const [showSurprise, setShowSurprise] = useState(false);
  const [showMessagePopup, setShowMessagePopup] = useState(false);

  // Get performance settings for adaptive animations
  const { settings: perfSettings } = usePerformance();

  const slidesRef = useRef(null);
  const buttonsRef = useRef(null);
  const particlesContainerRef = useRef(null);

  // Slides content with cute animated creatures
  const slides = [
    {
      creature: "star-bunny",
      text: "It's Your Special Day, Tharuma!",
      action: "next",
    },
    {
      creature: "love-bear",
      text: "Do you want to see what I made for you?",
      action: "question",
    },
    {
      creature: "party-cat",
      text: "Get ready for your surprise, my love!",
      action: "enter",
    },
  ];

  // Entrance animation for slides
  useEffect(() => {
    if (slidesRef.current && currentView === "slides") {
      animate(slidesRef.current, {
        scale: [0.9, 1],
        opacity: [0, 1],
        duration: 800,
        easing: 'outElastic(1, .6)'
      });
    }
  }, [currentView]);

  // Entrance animation for buttons container
  useEffect(() => {
    if (buttonsRef.current && currentView === "buttons") {
      // Animate the container
      animate(buttonsRef.current, {
        opacity: [0, 1],
        translateY: [30, 0],
        duration: 600,
        easing: 'outCubic'
      });
    }
  }, [currentView]);

  // Particle burst effect
  const createParticleBurst = useCallback((e) => {
    if (!particlesContainerRef.current) return;

    const container = particlesContainerRef.current;
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const particles = [];
    const colors = ['#FFD700', '#F7DC6F', '#FFE082', '#FFA500', '#FFB6C1', '#E1BEE7'];

    for (let i = 0; i < 25; i++) {
      const particle = document.createElement('div');
      particle.className = 'click-particle';
      const size = Math.random() * 12 + 6;
      particle.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        border-radius: 50%;
        left: ${x}px;
        top: ${y}px;
        pointer-events: none;
        z-index: 100;
      `;
      container.appendChild(particle);
      particles.push(particle);
    }

    animate(particles, {
      translateX: () => (Math.random() - 0.5) * 240,
      translateY: () => (Math.random() - 0.5) * 240,
      scale: [1, 0],
      opacity: [1, 0],
      duration: 1200,
      easing: 'outExpo',
      complete: () => {
        particles.forEach(p => p.remove());
      }
    });
  }, []);

  // Button hover animation
  const handleButtonHover = useCallback((e, isEntering) => {
    animate(e.currentTarget, {
      scale: isEntering ? 1.08 : 1,
      translateY: isEntering ? -5 : 0,
      duration: 300,
      easing: 'outElastic(1, .5)'
    });
  }, []);

  // Slide change animation
  const animateSlideChange = useCallback((direction) => {
    if (slidesRef.current) {
      const content = slidesRef.current.querySelector('.slide-content');
      animate(content, {
        translateX: direction === 'next' ? [-30, 0] : [30, 0],
        opacity: [0, 1],
        duration: 500,
        easing: 'outCubic'
      });
    }
  }, []);

  const handleNext = (e) => {
    createParticleBurst(e);
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
      setTimeout(() => animateSlideChange('next'), 50);
    }
  };

  const handleYes = (e) => {
    createParticleBurst(e);
    setCurrentSlide(currentSlide + 1);
    setTimeout(() => animateSlideChange('next'), 50);
  };

  const handleNo = (e) => {
    // Wiggle animation - don't proceed, force Yes
    const newCount = noClickCount + 1;
    setNoClickCount(newCount);

    animate(e.currentTarget, {
      translateX: [0, -15, 15, -15, 15, -10, 10, 0],
      duration: 600,
      easing: 'inOutSine'
    });

    // Change the no button text based on click count
    const btnText = e.currentTarget;
    if (newCount === 1) {
      btnText.textContent = "Are you sure? 🥺";
    } else if (newCount === 2) {
      btnText.textContent = "Please say yes! 💛";
    } else if (newCount >= 3) {
      btnText.textContent = "Pretty please! 🙏";
      // After 3 attempts, disable the button
      setTimeout(() => {
        btnText.style.opacity = "0.5";
        btnText.style.pointerEvents = "none";
      }, 600);
    }
  };

  const enterCelebration = (e) => {
    createParticleBurst(e);

    // Grand entrance animation
    animate(slidesRef.current, {
      scale: [1, 0.8],
      opacity: [1, 0],
      duration: 400,
      easing: 'inCubic',
      complete: () => {
        setCurrentView("buttons");
      }
    });
  };

  const handleLights = (e) => {
    createParticleBurst(e);
    // Switch to the new interactive rocket launch page
    setCurrentView("rocket-launch");
  };

  // Create realistic fireworks
  const createFireworks = useCallback(() => {
    const colors = ['#FFD700', '#FF69B4', '#87CEEB', '#FF6347', '#9370DB', '#00FA9A', '#FF1493', '#00CED1'];
    const fireworkPositions = [
      { x: 30, y: 25 }, { x: 70, y: 20 }, { x: 50, y: 30 },
      { x: 20, y: 35 }, { x: 80, y: 30 }, { x: 40, y: 22 },
      { x: 60, y: 28 }, { x: 35, y: 40 }, { x: 65, y: 38 }
    ];

    // Use adaptive particle count based on performance
    const particleCount = perfSettings?.fireworkParticles || 40;
    // Reduce firework positions on low performance
    const positionsToUse = perfSettings?.animationComplexity === 'simple'
      ? fireworkPositions.slice(0, 4)
      : fireworkPositions;

    positionsToUse.forEach((pos, idx) => {
      setTimeout(() => {
        const firework = document.createElement('div');
        firework.className = 'firework';
        firework.style.cssText = `left: ${pos.x}%; top: ${pos.y}%;`;

        const color = colors[Math.floor(Math.random() * colors.length)];

        for (let i = 0; i < particleCount; i++) {
          const particle = document.createElement('div');
          particle.className = 'firework-particle';
          const angle = (360 / particleCount) * i;
          const distance = 80 + Math.random() * 60;
          const duration = 1000 + Math.random() * 500;

          particle.style.cssText = `
            background: ${color};
            box-shadow: 0 0 6px ${color}, 0 0 12px ${color};
          `;

          firework.appendChild(particle);

          // Animate particle outward
          animate(particle, {
            translateX: Math.cos(angle * Math.PI / 180) * distance,
            translateY: Math.sin(angle * Math.PI / 180) * distance + 30,
            opacity: [1, 0],
            scale: [1, 0.3],
            duration: duration,
            easing: 'outQuad'
          });
        }

        document.body.appendChild(firework);
        setTimeout(() => firework.remove(), 2000);
      }, idx * 200);
    });
  }, [perfSettings]);

  // Create golden confetti rain
  const createGoldenConfetti = useCallback(() => {
    const shapes = ['star', 'circle', 'square'];
    // Use adaptive confetti count
    const confettiCount = perfSettings?.confettiCount || 80;

    for (let i = 0; i < confettiCount; i++) {
      setTimeout(() => {
        const confetti = document.createElement('div');
        const shape = shapes[Math.floor(Math.random() * shapes.length)];
        confetti.className = `golden-confetti ${shape}`;
        const size = Math.random() * 15 + 8;
        confetti.style.cssText = `
          left: ${Math.random() * 100}%;
          top: -20px;
          width: ${size}px;
          height: ${size}px;
        `;
        document.body.appendChild(confetti);

        animate(confetti, {
          translateY: window.innerHeight + 100,
          translateX: (Math.random() - 0.5) * 200,
          rotate: Math.random() * 1080,
          duration: 3000 + Math.random() * 2000,
          easing: 'inQuad',
          complete: () => confetti.remove()
        });
      }, i * 50);
    }
  }, [perfSettings]);

  const goToMessage = (e) => {
    if (e) createParticleBurst(e);

    // Reset rocket animation states
    setShowRocketAnimation(false);
    setIsLaunching(false);
    setShowFireworks(false);
    setShowSurprise(false);
    setShowMessagePopup(false);

    setCurrentView("message");
  };

  const goToGallery = () => {
    setCurrentView("gallery");
  };

  const goBackToButtons = () => {
    setCurrentView("buttons");
    // Reset animation states
    setShowRocketAnimation(false);
    setIsLaunching(false);
    setShowFireworks(false);
    setShowSurprise(false);
    setShowMessagePopup(false);
    setShowLights(false);
  };

  // Handle back button
  const handleBack = () => {
    if (currentView === "buttons") {
      // Go back to slides
      setCurrentView("slides");
      setCurrentSlide(0);
      setShowLights(false);
      setShowDecorations(false);
      setShowBalloons(false);
      setShowCake(false);
      setShowPhotos(false);
      // Reset rocket states
      setShowRocketAnimation(false);
      setIsLaunching(false);
      setShowFireworks(false);
      setShowSurprise(false);
      setShowMessagePopup(false);
    } else if (onGoBack) {
      onGoBack();
    }
  };

  // Calculate which buttons to show based on lights state
  const showLightsBtn = !showLights;
  const showMessageBtn = showLights;

  // Render based on current view
  if (currentView === "message") {
    return (
      <MessageCard
        onNavigateToGallery={goToGallery}
        onGoBack={goBackToButtons}
      />
    );
  }

  if (currentView === "gallery") {
    return (
      <Gallery
        onGoBack={() => setCurrentView("message")}
      />
    );
  }

  if (currentView === "rocket-launch") {
    return (
      <RocketLaunchPage
        onComplete={() => setCurrentView("message")}
      />
    );
  }

  return (
    <div className={`celebration-page ${showLights ? 'lights-on' : 'lights-off'}`} ref={particlesContainerRef}>
      {/* Back button */}
      <button className="back-btn" onClick={handleBack}>
        ← Back
      </button>

      {/* String Lights - Always visible but only glowing when on */}
      <div className={`string-lights ${showLights ? 'active' : ''}`}>
        <div className="lights-wire"></div>
        {Array.from({ length: 25 }).map((_, i) => (
          <div
            key={i}
            className={`light light-${i % 5}`}
            style={{
              left: `${2 + i * 4}%`,
              animationDelay: `${i * 0.1}s`,
            }}
          />
        ))}
      </div>

      {/* Decorations Container */}
      <div className="decorations-container">
        {/* Hanging Photos */}
        {showPhotos && (
          <div className="hanging-photos">
            <div className="photo-frame photo-1">
              <div className="photo-string"></div>
              <div className="photo-content">
                <span className="photo-emoji">📸</span>
                <span className="photo-label">Our Memories</span>
              </div>
            </div>
            <div className="photo-frame photo-2">
              <div className="photo-string"></div>
              <div className="photo-content">
                <span className="photo-emoji">💕</span>
                <span className="photo-label">Together</span>
              </div>
            </div>
            <div className="photo-frame photo-3">
              <div className="photo-string"></div>
              <div className="photo-content">
                <span className="photo-emoji">🌟</span>
                <span className="photo-label">Forever</span>
              </div>
            </div>
          </div>
        )}

        {/* Bunting Banner */}
        {showDecorations && (
          <div className="bunting">
            <div className="bunting-string">
              {"HAPPY BIRTHDAY".split("").map((letter, i) => (
                <div
                  key={i}
                  className={`bunting-flag flag-${i % 4}`}
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  {letter === " " ? "\u00A0" : letter}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Balloons */}
        {showBalloons && (
          <div className="decoration-balloons">
            {[
              { left: "5%", color: 0, delay: 0 },
              { left: "15%", color: 1, delay: 0.2 },
              { left: "25%", color: 2, delay: 0.4 },
              { left: "75%", color: 0, delay: 0.6 },
              { left: "85%", color: 1, delay: 0.8 },
              { left: "95%", color: 2, delay: 1.0 },
            ].map((balloon, i) => (
              <div
                key={i}
                className={`balloon balloon-${balloon.color}`}
                style={{
                  left: balloon.left,
                  animationDelay: `${balloon.delay}s`,
                }}
              >
                <div className="balloon-body">
                  <div className="balloon-shine"></div>
                </div>
                <div className="balloon-string" />
              </div>
            ))}
          </div>
        )}

        {/* Birthday Cake */}
        {showCake && (
          <div className="cake-container">
            <div className="cake">
              <div className="cake-candles">
                {[1, 2, 3, 4, 5].map((_, i) => (
                  <div key={i} className="candle" style={{ animationDelay: `${i * 0.1}s` }}>
                    <div className="flame">
                      <div className="flame-inner"></div>
                    </div>
                    <div className="wick" />
                  </div>
                ))}
              </div>
              <div className="cake-layer layer-1">
                <div className="cake-frosting"></div>
                <div className="cake-decoration">🎂</div>
              </div>
              <div className="cake-layer layer-2">
                <div className="cake-frosting"></div>
              </div>
              <div className="cake-layer layer-3">
                <div className="cake-frosting"></div>
              </div>
              <div className="cake-plate"></div>
            </div>
          </div>
        )}
      </div>

      {/* Slides or Buttons based on view */}
      {currentView === "slides" ? (
        <div className="slides-container" ref={slidesRef}>
          <div className="slide-content">
            {/* Cute Animated Creature */}
            <div className={`creature-container ${slides[currentSlide].creature}`}>
              {slides[currentSlide].creature === "star-bunny" && (
                <div className="creature star-bunny-creature" onClick={(e) => {
                  e.currentTarget.classList.add('clicked');
                  setTimeout(() => e.currentTarget.classList.remove('clicked'), 600);
                }}>
                  <div className="bunny-ears">
                    <div className="ear left-ear"></div>
                    <div className="ear right-ear"></div>
                  </div>
                  <div className="bunny-head">
                    <div className="bunny-face">
                      <div className="eye left-eye"><div className="pupil"></div></div>
                      <div className="eye right-eye"><div className="pupil"></div></div>
                      <div className="blush left-blush"></div>
                      <div className="blush right-blush"></div>
                      <div className="nose"></div>
                      <div className="mouth"></div>
                    </div>
                  </div>
                  <div className="bunny-body"></div>
                  <div className="star-wand">✨</div>
                  <div className="floating-stars">
                    <span className="star">⭐</span>
                    <span className="star">🌟</span>
                    <span className="star">💫</span>
                  </div>
                </div>
              )}

              {slides[currentSlide].creature === "love-bear" && (
                <div className="creature love-bear-creature" onClick={(e) => {
                  e.currentTarget.classList.add('clicked');
                  setTimeout(() => e.currentTarget.classList.remove('clicked'), 600);
                }}>
                  <div className="bear-ears">
                    <div className="bear-ear left-ear"></div>
                    <div className="bear-ear right-ear"></div>
                  </div>
                  <div className="bear-head">
                    <div className="bear-face">
                      <div className="eye left-eye"><div className="pupil"></div><div className="sparkle"></div></div>
                      <div className="eye right-eye"><div className="pupil"></div><div className="sparkle"></div></div>
                      <div className="bear-snout">
                        <div className="nose"></div>
                        <div className="mouth"></div>
                      </div>
                      <div className="blush left-blush"></div>
                      <div className="blush right-blush"></div>
                    </div>
                  </div>
                  <div className="bear-body">
                    <div className="heart-chest">💛</div>
                  </div>
                  <div className="floating-hearts">
                    <span className="heart">💕</span>
                    <span className="heart">💖</span>
                    <span className="heart">💝</span>
                  </div>
                </div>
              )}

              {slides[currentSlide].creature === "party-cat" && (
                <div className="creature party-cat-creature" onClick={(e) => {
                  e.currentTarget.classList.add('clicked');
                  setTimeout(() => e.currentTarget.classList.remove('clicked'), 600);
                }}>
                  <div className="cat-ears">
                    <div className="cat-ear left-ear"></div>
                    <div className="cat-ear right-ear"></div>
                  </div>
                  <div className="cat-head">
                    <div className="cat-face">
                      <div className="eye left-eye"><div className="pupil cat-pupil"></div></div>
                      <div className="eye right-eye"><div className="pupil cat-pupil"></div></div>
                      <div className="nose"></div>
                      <div className="whiskers left-whiskers">
                        <div className="whisker"></div>
                        <div className="whisker"></div>
                        <div className="whisker"></div>
                      </div>
                      <div className="whiskers right-whiskers">
                        <div className="whisker"></div>
                        <div className="whisker"></div>
                        <div className="whisker"></div>
                      </div>
                      <div className="mouth cat-mouth"></div>
                    </div>
                  </div>
                  <div className="cat-body"></div>
                  <div className="party-hat">🎉</div>
                  <div className="floating-confetti">
                    <span className="confetti">🎊</span>
                    <span className="confetti">🎈</span>
                    <span className="confetti">🎁</span>
                  </div>
                </div>
              )}
            </div>
            <p className="slide-text">{slides[currentSlide].text}</p>

            {slides[currentSlide].action === "next" && (
              <button
                className="next-button"
                onClick={handleNext}
                onMouseEnter={(e) => handleButtonHover(e, true)}
                onMouseLeave={(e) => handleButtonHover(e, false)}
              >
                Next →
              </button>
            )}

            {slides[currentSlide].action === "question" && (
              <div className="question-options">
                <button
                  className="option-button yes-button"
                  onClick={handleYes}
                  onMouseEnter={(e) => handleButtonHover(e, true)}
                  onMouseLeave={(e) => handleButtonHover(e, false)}
                >
                  Yes! 💛
                </button>
                <button
                  className="option-button no-button"
                  onClick={handleNo}
                  onMouseEnter={(e) => handleButtonHover(e, true)}
                  onMouseLeave={(e) => handleButtonHover(e, false)}
                >
                  Maybe later
                </button>
              </div>
            )}

            {slides[currentSlide].action === "enter" && (
              <button
                className="next-button"
                onClick={enterCelebration}
                onMouseEnter={(e) => handleButtonHover(e, true)}
                onMouseLeave={(e) => handleButtonHover(e, false)}
              >
                Let's Go! ✨
              </button>
            )}
          </div>

          {/* Progress dots */}
          <div className="slide-progress">
            {slides.map((_, index) => (
              <div
                key={index}
                className={`progress-dot ${index === currentSlide
                  ? "active"
                  : index < currentSlide
                    ? "completed"
                    : ""
                  }`}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="celebration-buttons" ref={buttonsRef}>
          <h2 className="celebration-title">
            Ready for the Surprise?
          </h2>
          <p className="celebration-subtitle">
            Click the button to launch...
          </p>

          <div className="buttons-grid">
            {showLightsBtn && (
              <button
                className="launch-rocket-btn"
                onClick={handleLights}
                onMouseEnter={(e) => handleButtonHover(e, true)}
                onMouseLeave={(e) => handleButtonHover(e, false)}
              >
                Click to Launch
              </button>
            )}

            {showMessageBtn && (
              <button
                className="action-button message-button glow-button"
                onClick={goToMessage}
                onMouseEnter={(e) => handleButtonHover(e, true)}
                onMouseLeave={(e) => handleButtonHover(e, false)}
              >
                <span className="btn-icon">💌</span>
                <span className="btn-text">Read My Message</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Rocket Animation */}
      {showRocketAnimation && (
        <div className="rocket-animation-container" ref={particlesContainerRef}>
          {/* The Rocket */}
          <div className={`rocket ${isLaunching ? 'launching' : ''}`}>
            <div className="rocket-nose"></div>
            <div className="rocket-body"></div>
            <div className="rocket-fin-left"></div>
            <div className="rocket-fin-right"></div>
            {isLaunching && (
              <div className="rocket-flame">
                <div className="flame-outer"></div>
                <div className="flame-core"></div>
              </div>
            )}
          </div>

          {/* Explosion effect */}
          {showFireworks && (
            <div className="explosion-container">
              <div className="explosion-ring"></div>
            </div>
          )}
        </div>
      )}

      {/* Surprise Reveal */}
      {showSurprise && (
        <div className="surprise-reveal-container">
          <h1 className="surprise-title">Happy 20th Birthday</h1>
          <p className="surprise-subtitle">THARUMA</p>
        </div>
      )}

      {/* Romantic Message Popup */}
      {showMessagePopup && (
        <div className="message-popup-overlay" onClick={(e) => e.target === e.currentTarget && null}>
          <div className="message-popup-card">
            <div className="popup-header">
              <div className="popup-icon">
                <div className="letter-icon"></div>
              </div>
              <h2 className="popup-title">A Message For You</h2>
              <p className="popup-subtitle">Something special awaits...</p>
            </div>
            <button
              className="read-message-btn"
              onClick={goToMessage}
            >
              Read My Message
            </button>
          </div>
        </div>
      )}

      {/* Sparkle stars in background */}
      {showFireworks && (
        <div className="sparkle-stars-container">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="sparkle-star"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CelebrationPage;
