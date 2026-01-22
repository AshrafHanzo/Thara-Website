import { useState, useRef, useEffect, useCallback } from "react";
import { animate, stagger } from "animejs";
import "./MessageCard.css";

const MessageCard = ({ onNavigateToGallery, onGoBack }) => {
  const [curtainsOpen, setCurtainsOpen] = useState(false);
  const [showComingSoon, setShowComingSoon] = useState(false);
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

  // Create butterflies that fly around
  const createButterflies = useCallback(() => {
    const butterflies = ['🦋', '🦋', '🦋', '🦋', '🦋', '🦋', '🦋', '🦋'];
    const colors = ['#FF69B4', '#FFD700', '#87CEEB', '#DDA0DD', '#98FB98', '#FFA07A'];
    
    butterflies.forEach((_, index) => {
      const butterfly = document.createElement('div');
      butterfly.innerHTML = '🦋';
      butterfly.className = 'flying-butterfly';
      const startX = Math.random() * window.innerWidth;
      const startY = window.innerHeight + 50;
      const hue = Math.random() * 60 - 30;
      
      butterfly.style.cssText = `
        position: fixed;
        left: ${startX}px;
        top: ${startY}px;
        font-size: ${2 + Math.random() * 1.5}rem;
        pointer-events: none;
        z-index: 1000;
        filter: hue-rotate(${hue}deg) drop-shadow(0 0 10px ${colors[index % colors.length]});
        transform-origin: center;
      `;
      document.body.appendChild(butterfly);

      // Create flying path
      const pathX = (Math.random() - 0.5) * window.innerWidth * 0.8;
      const pathY = -window.innerHeight - 100;
      const duration = 4000 + Math.random() * 3000;
      const delay = index * 300;

      setTimeout(() => {
        animate(butterfly, {
          translateX: [
            0,
            pathX * 0.3,
            pathX * 0.6,
            pathX * 0.4,
            pathX
          ],
          translateY: [
            0,
            pathY * 0.3,
            pathY * 0.6,
            pathY * 0.8,
            pathY
          ],
          rotate: [0, 20, -20, 15, -15, 0],
          scale: [0.5, 1.2, 1, 1.1, 0.8, 0],
          opacity: [0, 1, 1, 1, 0.8, 0],
          duration: duration,
          easing: 'easeInOutSine',
          complete: () => butterfly.remove()
        });
      }, delay);
    });
  }, []);

  const openCurtains = useCallback(() => {
    if (curtainsOpen) return;

    setCurtainsOpen(true);
    
    // Create butterflies
    createButterflies();

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
        const elements = messageRef.current.querySelectorAll('.message-greeting, .message-section, .message-signature');
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
  }, [curtainsOpen, createButterflies]);

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

  // Handle View Memories - Show Coming Soon
  const handleViewMemories = () => {
    setShowComingSoon(true);
    
    // Auto close after 3 seconds
    setTimeout(() => {
      setShowComingSoon(false);
    }, 4000);
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

          {/* Message Content (behind curtains) - Scrollable */}
          <div className="message-content" ref={messageRef}>
            {/* Decorative hearts */}
            <span className="message-hearts heart-1">💛</span>
            <span className="message-hearts heart-2">💛</span>
            <span className="message-hearts heart-3">💕</span>
            <span className="message-hearts heart-4">💕</span>

            {/* Scrollable Message Area */}
            <div className="message-scroll-area">
              {/* Greeting */}
              <p className="message-greeting">My Dearest Tharuma, My Chello 💕</p>

              {/* Section 1 - How much she means */}
              <div className="message-section">
                <p className="message-text">
                  💛 From the moment you came into my life, everything changed. You are not just my love, 
                  you are my best friend, my soulmate, my everything. Every single day with you feels like 
                  a beautiful dream that I never want to wake up from.
                </p>
              </div>

              {/* Section 2 - Birthday wish */}
              <div className="message-section highlight-section">
                <p className="highlight-text">🎂 Happy 20th Birthday, My Love! 🎂</p>
                <p className="message-text">
                  Today marks the beginning of a new chapter in your life, and I feel so blessed to be 
                  a part of your journey. You deserve all the happiness in this world and beyond.
                </p>
              </div>

              {/* Section 3 - Future together */}
              <div className="message-section">
                <p className="message-text">
                  💕 I dream of our future together — waking up next to you every morning, building our 
                  life together, creating countless memories, traveling the world hand in hand, and growing 
                  old together. You are my forever, Tharuma.
                </p>
              </div>

              {/* Section 4 - Promises */}
              <div className="message-section">
                <p className="message-text">
                  💛 I promise to love you endlessly, to support your dreams, to be your strength when 
                  you're weak, and to make you smile every single day. You are the most precious gift 
                  life has given me, my Chello.
                </p>
              </div>

              {/* Section 5 - Special words */}
              <div className="message-section special-section">
                <p className="message-text love-declaration">
                  ❤️ You are the reason I believe in love. ❤️
                  <br />
                  You make my heart skip a beat, my world brighter, and my life complete.
                  <br />
                  <span className="eternal-love">I love you more than words could ever express.</span>
                </p>
              </div>

              {/* Signature */}
              <p className="message-signature">
                Forever & Always Yours 💕
                <br />
                <span className="signature-name">With All My Love 💛</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigate to Gallery */}
      {curtainsOpen && (
        <button
          className="view-gallery-btn stunning-memories-btn"
          onClick={handleViewMemories}
        >
          <span className="btn-icon">📸</span>
          <span>View Our Memories</span>
          <span className="btn-hearts">💕</span>
        </button>
      )}

      {/* Coming Soon Modal */}
      {showComingSoon && (
        <div className="coming-soon-overlay" onClick={() => setShowComingSoon(false)}>
          <div className="coming-soon-modal">
            <div className="modal-hearts">
              {[...Array(6)].map((_, i) => (
                <span key={i} className="floating-modal-heart" style={{ animationDelay: `${i * 0.3}s` }}>💕</span>
              ))}
            </div>
            <span className="coming-soon-icon">🦋</span>
            <h2 className="coming-soon-title">Coming Soon, My Love</h2>
            <p className="coming-soon-text">Our beautiful memories together will be here soon 💕</p>
            <span className="coming-soon-emoji">✨💛✨</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageCard;
