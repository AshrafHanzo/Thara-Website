import { useState, useRef, useEffect, useCallback } from "react";
import { animate, stagger } from "animejs";
import "./CelebrationPage.css";
import MessageCard from "./MessageCard";
import Gallery from "./Gallery";

const CelebrationPage = ({ onNavigate, onGoBack }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showLights, setShowLights] = useState(false);
  const [showDecorations, setShowDecorations] = useState(false);
  const [showBalloons, setShowBalloons] = useState(false);
  const [showCake, setShowCake] = useState(false);
  const [showPhotos, setShowPhotos] = useState(false);
  const [currentView, setCurrentView] = useState("slides"); // slides, buttons, message, gallery
  const [noClickCount, setNoClickCount] = useState(0);

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

    // Start the romantic light sequence - lights turn on one by one
    setShowLights(true);

    // Add sequential light turn-on class
    const stringLights = document.querySelector('.string-lights');
    if (stringLights) {
      stringLights.classList.add('turning-on');

      // After all lights are on (about 3 seconds), show decorations
      setTimeout(() => {
        stringLights.classList.remove('turning-on');
        stringLights.classList.add('active');

        // Now show all the decorations with a romantic sequence
        setShowDecorations(true);

        setTimeout(() => setShowBalloons(true), 300);
        setTimeout(() => setShowCake(true), 600);
        setTimeout(() => setShowPhotos(true), 900);

        // Create a burst of confetti after everything is ready
        const confettiColors = ['#FFD700', '#FF69B4', '#FFB6C1', '#F7DC6F', '#87CEEB', '#DDA0DD'];
        for (let i = 0; i < 50; i++) {
          setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti-piece';
            confetti.style.cssText = `
              position: fixed;
              left: ${Math.random() * 100}%;
              top: -20px;
              width: ${Math.random() * 12 + 6}px;
              height: ${Math.random() * 12 + 6}px;
              background: ${confettiColors[Math.floor(Math.random() * confettiColors.length)]};
              border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
              pointer-events: none;
              z-index: 200;
            `;
            document.body.appendChild(confetti);

            animate(confetti, {
              translateY: window.innerHeight + 100,
              translateX: (Math.random() - 0.5) * 200,
              rotate: Math.random() * 720,
              duration: 3000 + Math.random() * 2000,
              easing: 'inQuad',
              complete: () => confetti.remove()
            });
          }, i * 30);
        }
      }, 3000);
    }
  };

  const goToMessage = (e) => {
    createParticleBurst(e);

    animate(buttonsRef.current, {
      scale: [1, 0.9],
      opacity: [1, 0],
      duration: 400,
      easing: 'inCubic',
      complete: () => {
        setCurrentView("message");
      }
    });
  };

  const goToGallery = () => {
    setCurrentView("gallery");
  };

  const goBackToButtons = () => {
    setCurrentView("buttons");
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
            {showLights ? "🎉 SURPRISE! 🎉" : "Ready for Magic?"}
          </h2>
          <p className="celebration-subtitle">
            {showLights ? "Happy 21st Birthday, THARUMA! 💛" : "Click to reveal your surprise..."}
          </p>

          <div className="buttons-grid">
            {showLightsBtn && (
              <button
                className="action-button lights-button glow-button"
                onClick={handleLights}
                onMouseEnter={(e) => handleButtonHover(e, true)}
                onMouseLeave={(e) => handleButtonHover(e, false)}
              >
                <span className="btn-icon">💡</span>
                <span className="btn-text">Turn On the Lights!</span>
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

      {/* Romantic sparkles when lights are on */}
      {showLights && (
        <div className="romantic-sparkles">
          {[...Array(30)].map((_, i) => (
            <span
              key={i}
              className="sparkle-star"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            >
              ✨
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default CelebrationPage;
