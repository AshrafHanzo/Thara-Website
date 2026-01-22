import { useState, useRef, useEffect, useCallback } from "react";
import { animate, stagger } from "animejs";
import "./MessageCard.css";

const MessageCard = ({ onNavigateToGallery, onGoBack }) => {
  const [curtainsOpen, setCurtainsOpen] = useState(false);
  const containerRef = useRef(null);
  const messageRef = useRef(null);
  const leftCurtainRef = useRef(null);
  const rightCurtainRef = useRef(null);

  // Entrance animation
  useEffect(() => {
    if (containerRef.current) {
      animate(containerRef.current, {
        opacity: [0, 1],
        translateY: [30, 0],
        duration: 800,
        easing: 'outCubic'
      });
    }
  }, []);

  const openCurtains = useCallback(() => {
    if (curtainsOpen) return;

    setCurtainsOpen(true);

    // Animate curtains opening
    if (leftCurtainRef.current) {
      animate(leftCurtainRef.current, {
        translateX: '-105%',
        duration: 1200,
        easing: 'outExpo'
      });
    }

    if (rightCurtainRef.current) {
      animate(rightCurtainRef.current, {
        translateX: '105%',
        duration: 1200,
        easing: 'outExpo'
      });
    }

    // After curtains open, animate message content
    setTimeout(() => {
      if (messageRef.current) {
        const elements = messageRef.current.querySelectorAll('.message-greeting, .message-text, .message-signature');
        if (elements.length > 0) {
          animate(elements, {
            translateY: [40, 0],
            opacity: [0, 1],
            duration: 1000,
            delay: stagger(300),
            easing: 'outCubic'
          });
        }

        const hearts = messageRef.current.querySelectorAll('.message-hearts');
        if (hearts.length > 0) {
          animate(hearts, {
            scale: [0, 1],
            opacity: [0, 0.8],
            duration: 800,
            delay: stagger(150, { start: 500 }),
            easing: 'outElastic(1, .5)'
          });
        }
      }
    }, 800);
  }, [curtainsOpen]);

  // Particle effect on click
  const createSparkles = useCallback((e) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const sparkles = [];
    for (let i = 0; i < 15; i++) {
      const sparkle = document.createElement('div');
      sparkle.innerHTML = '✨';
      sparkle.style.cssText = `
        position: absolute;
        left: ${x}px;
        top: ${y}px;
        font-size: 24px;
        pointer-events: none;
        z-index: 100;
      `;
      containerRef.current.appendChild(sparkle);
      sparkles.push(sparkle);
    }

    animate(sparkles, {
      translateX: () => (Math.random() - 0.5) * 200,
      translateY: () => (Math.random() - 0.5) * 200,
      scale: [1, 0],
      opacity: [1, 0],
      duration: 1000,
      easing: 'outExpo',
      complete: () => sparkles.forEach(s => s.remove())
    });
  }, []);

  // Handle back button
  const handleBack = () => {
    if (onGoBack) {
      onGoBack();
    }
  };

  return (
    <div className="message-page" ref={containerRef}>
      {/* Back button */}
      <button className="back-btn" onClick={handleBack}>
        ← Back
      </button>

      {/* Header */}
      <div className="message-header">
        <h1 className="message-title">
          <span className="title-heart">💛</span>
          <span className="title-text">A Message From My Heart</span>
          <span className="title-heart">💛</span>
        </h1>
      </div>

      {/* Curtain Container */}
      <div className="curtain-container">
        {/* Curtain Rod */}
        <div className="curtain-rod">
          <div className="rod-end rod-left"></div>
          <div className="rod-end rod-right"></div>
        </div>

        {/* Curtains */}
        <div className={`curtains ${curtainsOpen ? "open" : ""}`}>
          {/* Left Curtain */}
          <div className="curtain curtain-left" ref={leftCurtainRef}>
            <div className="curtain-fold"></div>
            <div className="curtain-fold"></div>
            <div className="curtain-fold"></div>
          </div>

          {/* Right Curtain */}
          <div className="curtain curtain-right" ref={rightCurtainRef}>
            <div className="curtain-fold"></div>
            <div className="curtain-fold"></div>
            <div className="curtain-fold"></div>
          </div>

          {/* Open Button */}
          {!curtainsOpen && (
            <button
              className="curtain-open-btn"
              onClick={(e) => {
                createSparkles(e);
                openCurtains();
              }}
            >
              <span className="btn-sparkle">✨</span>
              <span>Click to Open</span>
              <span className="btn-sparkle">✨</span>
            </button>
          )}

          {/* Message Content (behind curtains) */}
          <div className="message-content" ref={messageRef}>
            {/* Decorative hearts */}
            <span className="message-hearts heart-1">💛</span>
            <span className="message-hearts heart-2">💛</span>
            <span className="message-hearts heart-3">💛</span>
            <span className="message-hearts heart-4">💛</span>

            {/* Message */}
            <p className="message-greeting">Dear Thara,</p>

            <p className="message-text">
              On this special day, I want you to know how much you mean to me.
              Every moment with you is a treasure, every smile of yours lights up my world.
              <br /><br />
              <span className="highlight-text">Happy 20th Birthday, my love! 🎂</span>
              <br /><br />
              May this year bring you all the happiness, success, and love you deserve.
              I'm so grateful to have you in my life, and I can't wait to create more
              beautiful memories together.
            </p>

            <p className="message-signature">
              Forever Yours <span className="signature-heart">💛</span>
            </p>
          </div>
        </div>
      </div>

      {/* Navigate to Gallery */}
      {curtainsOpen && (
        <button
          className="view-gallery-btn"
          onClick={onNavigateToGallery}
        >
          <span className="btn-icon">📸</span>
          <span>View Our Memories</span>
        </button>
      )}
    </div>
  );
};

export default MessageCard;
