import { useState, useEffect, useCallback, useRef } from "react";
import { animate, stagger } from "animejs";
import "./Countdown.css";

const Countdown = () => {
  // THARA'S 20TH BIRTHDAY - January 23, 2026
  const targetDate = new Date("2026-01-23T00:00:00");
  const countdownRef = useRef(null);
  const hasAnimated = useRef(false);

  const calculateTimeLeft = useCallback(() => {
    const now = new Date();
    const difference = targetDate - now;

    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isComplete: true };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
      isComplete: false,
    };
  }, []);

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft);
  const [flipping, setFlipping] = useState({
    days: false,
    hours: false,
    minutes: false,
    seconds: false,
  });
  const prevTimeRef = useRef(timeLeft);

  // Entrance animation
  useEffect(() => {
    if (countdownRef.current && !hasAnimated.current) {
      hasAnimated.current = true;

      // Stagger animate the countdown cards
      animate(countdownRef.current.querySelectorAll('.digit'), {
        translateY: [60, 0],
        opacity: [0, 1],
        scale: [0.8, 1],
        duration: 1000,
        delay: stagger(150, { start: 300 }),
        easing: 'outElastic(1, .6)'
      });
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      const newTime = calculateTimeLeft();

      // Trigger flip animations for changed values
      const newFlipping = {
        days: prevTimeRef.current.days !== newTime.days,
        hours: prevTimeRef.current.hours !== newTime.hours,
        minutes: prevTimeRef.current.minutes !== newTime.minutes,
        seconds: prevTimeRef.current.seconds !== newTime.seconds,
      };

      setFlipping(newFlipping);

      // Add animate flip effect for changed digits
      Object.entries(newFlipping).forEach(([key, isFlipping]) => {
        if (isFlipping && countdownRef.current) {
          const card = countdownRef.current.querySelector(`.digit-${key} .card`);
          if (card) {
            animate(card, {
              rotateX: [0, -10, 0],
              scale: [1, 1.05, 1],
              duration: 500,
              easing: 'outElastic(1, .5)'
            });
          }
        }
      });

      prevTimeRef.current = newTime;
      setTimeLeft(newTime);

      // Reset flip state after animation
      setTimeout(() => {
        setFlipping({ days: false, hours: false, minutes: false, seconds: false });
      }, 600);
    }, 1000);

    return () => clearInterval(timer);
  }, [calculateTimeLeft]);

  const formatNumber = (num) => String(num).padStart(2, "0");

  // Show celebration message if countdown is complete
  if (timeLeft.isComplete) {
    return (
      <div className="countdown celebration-complete" ref={countdownRef}>
        <div className="birthday-celebration animate-pulse-glow-gold">
          <span className="celebration-emoji animate-heartbeat">🎂</span>
          <span className="celebration-text animate-shimmer">Happy 21st Birthday, THARUMA!</span>
          <span className="celebration-emoji animate-heartbeat">🎂</span>
        </div>
        <p className="celebration-sub">
          <span className="animate-sparkle">💛</span> January 23, 2026 - A Day to Celebrate You! <span className="animate-sparkle">💛</span>
        </p>
        <div className="celebration-particles">
          {[...Array(20)].map((_, i) => (
            <span
              key={i}
              className="floating-particle"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            >
              {['✨', '💛', '🌟', '⭐'][Math.floor(Math.random() * 4)]}
            </span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="countdown" ref={countdownRef}>
      <div className="flip-timer">
        <div className="digit digit-days">
          <div className={`card ${flipping.days ? "flip" : ""}`}>
            <span className="text">{formatNumber(timeLeft.days)}</span>
            <div className="card-glow"></div>
          </div>
          <span className="label">Days</span>
        </div>
        <div className="timer-separator">
          <span className="separator-dot animate-pulse-glow">•</span>
          <span className="separator-dot animate-pulse-glow">•</span>
        </div>
        <div className="digit digit-hours">
          <div className={`card ${flipping.hours ? "flip" : ""}`}>
            <span className="text">{formatNumber(timeLeft.hours)}</span>
            <div className="card-glow"></div>
          </div>
          <span className="label">Hours</span>
        </div>
        <div className="timer-separator">
          <span className="separator-dot animate-pulse-glow">•</span>
          <span className="separator-dot animate-pulse-glow">•</span>
        </div>
        <div className="digit digit-minutes">
          <div className={`card ${flipping.minutes ? "flip" : ""}`}>
            <span className="text">{formatNumber(timeLeft.minutes)}</span>
            <div className="card-glow"></div>
          </div>
          <span className="label">Minutes</span>
        </div>
        <div className="timer-separator">
          <span className="separator-dot animate-pulse-glow">•</span>
          <span className="separator-dot animate-pulse-glow">•</span>
        </div>
        <div className="digit digit-seconds">
          <div className={`card ${flipping.seconds ? "flip" : ""}`}>
            <span className="text">{formatNumber(timeLeft.seconds)}</span>
            <div className="card-glow"></div>
          </div>
          <span className="label">Seconds</span>
        </div>
      </div>
    </div>
  );
};

export default Countdown;
