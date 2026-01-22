import { animate, stagger } from 'animejs';

/**
 * Staggered text reveal animation
 * @param {string|NodeList} selector - CSS selector for text elements
 * @param {object} options - Animation options
 */
export function staggerReveal(selector, options = {}) {
    const defaults = {
        translateY: [40, 0],
        opacity: [0, 1],
        duration: 800,
        delay: stagger(100, { start: 200 }),
        easing: 'outExpo'
    };

    return animate(selector, { ...defaults, ...options });
}

/**
 * Button pop effect on hover/click
 * @param {HTMLElement} element - Button element
 * @param {string} type - 'hover' or 'click'
 */
export function buttonPop(element, type = 'hover') {
    if (type === 'hover') {
        return animate(element, {
            scale: [1, 1.08],
            duration: 300,
            easing: 'outElastic(1, .5)'
        });
    }

    return animate(element, {
        scale: [1, 0.95, 1.1, 1],
        duration: 400,
        easing: 'inOutQuad'
    });
}

/**
 * Button reset after hover
 * @param {HTMLElement} element - Button element
 */
export function buttonReset(element) {
    return animate(element, {
        scale: 1,
        duration: 200,
        easing: 'outQuad'
    });
}

/**
 * Particle burst effect
 * @param {HTMLElement} container - Container element for particles
 * @param {object} options - Particle options
 */
export function particleBurst(container, options = {}) {
    const {
        count = 20,
        colors = ['#FFD700', '#F7DC6F', '#FFE082', '#FFA500', '#FFB6C1'],
        duration = 1500
    } = options;

    const particles = [];
    const rect = container.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.className = 'burst-particle';
        particle.style.cssText = `
      position: absolute;
      width: ${Math.random() * 10 + 5}px;
      height: ${Math.random() * 10 + 5}px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      border-radius: 50%;
      left: ${centerX}px;
      top: ${centerY}px;
      pointer-events: none;
      z-index: 100;
    `;
        container.appendChild(particle);
        particles.push(particle);
    }

    animate(particles, {
        translateX: () => (Math.random() - 0.5) * 300,
        translateY: () => (Math.random() - 0.5) * 300,
        scale: [1, 0],
        opacity: [1, 0],
        duration: duration,
        easing: 'outExpo',
        complete: () => {
            particles.forEach(p => p.remove());
        }
    });
}

/**
 * Smooth floating animation
 * @param {string|NodeList} selector - CSS selector for elements
 * @param {object} options - Animation options
 */
export function floatAnimation(selector, options = {}) {
    const { amplitude = 15, duration = 3000 } = options;

    return animate(selector, {
        translateY: [-amplitude, amplitude],
        duration: duration,
        direction: 'alternate',
        loop: true,
        easing: 'inOutSine'
    });
}

/**
 * Pulsing glow effect
 * @param {string|NodeList} selector - CSS selector for elements
 */
export function pulseGlow(selector, options = {}) {
    const {
        glowColor = 'rgba(255, 215, 0, 0.6)',
        duration = 2000
    } = options;

    return animate(selector, {
        boxShadow: [
            `0 0 20px ${glowColor}`,
            `0 0 40px ${glowColor}`,
            `0 0 20px ${glowColor}`
        ],
        duration: duration,
        loop: true,
        easing: 'inOutSine'
    });
}

/**
 * Entrance animation with scale and fade
 * @param {string|NodeList} selector - CSS selector for elements
 */
export function entranceAnimation(selector, options = {}) {
    const { delay = 0 } = options;

    return animate(selector, {
        scale: [0.8, 1],
        opacity: [0, 1],
        translateY: [30, 0],
        duration: 1000,
        delay: delay,
        easing: 'outElastic(1, .6)'
    });
}

/**
 * Countdown flip animation
 * @param {HTMLElement} element - Timer element
 */
export function countdownFlip(element) {
    return animate(element, {
        rotateX: [0, -90, 0],
        duration: 600,
        easing: 'outCubic'
    });
}

/**
 * Sparkle trail effect
 * @param {HTMLElement} container - Container element
 * @param {object} position - { x, y } position
 */
export function sparkleTrail(container, position) {
    const sparkle = document.createElement('div');
    sparkle.className = 'sparkle-trail';
    sparkle.innerHTML = '✨';
    sparkle.style.cssText = `
    position: absolute;
    left: ${position.x}px;
    top: ${position.y}px;
    font-size: 20px;
    pointer-events: none;
    z-index: 100;
  `;
    container.appendChild(sparkle);

    animate(sparkle, {
        translateY: -50,
        opacity: [1, 0],
        scale: [1, 0.5],
        duration: 800,
        easing: 'outExpo',
        complete: () => sparkle.remove()
    });
}

/**
 * Confetti rain animation
 * @param {HTMLElement} container - Container element
 */
export function confettiRain(container, options = {}) {
    const {
        count = 50,
        duration = 3000,
        colors = ['#FFD700', '#F7DC6F', '#FFE082', '#FFB6C1', '#E1BEE7']
    } = options;

    const confetti = [];

    for (let i = 0; i < count; i++) {
        const piece = document.createElement('div');
        piece.className = 'confetti-piece';
        const size = Math.random() * 10 + 5;
        piece.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      left: ${Math.random() * 100}%;
      top: -20px;
      opacity: 0;
      border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
      pointer-events: none;
      z-index: 100;
    `;
        container.appendChild(piece);
        confetti.push(piece);
    }

    animate(confetti, {
        translateY: [0, window.innerHeight + 50],
        translateX: () => (Math.random() - 0.5) * 200,
        rotate: () => Math.random() * 360,
        opacity: [1, 1, 0],
        duration: duration,
        delay: stagger(50),
        easing: 'inQuad',
        complete: () => {
            confetti.forEach(c => c.remove());
        }
    });
}

/**
 * Slide transition animation
 * @param {HTMLElement} element - Element to animate
 * @param {string} direction - 'left', 'right', 'up', 'down'
 */
export function slideTransition(element, direction = 'left', entering = true) {
    const translations = {
        left: entering ? ['100%', '0%'] : ['0%', '-100%'],
        right: entering ? ['-100%', '0%'] : ['0%', '100%'],
        up: entering ? ['100%', '0%'] : ['0%', '-100%'],
        down: entering ? ['-100%', '0%'] : ['0%', '100%']
    };

    const isHorizontal = direction === 'left' || direction === 'right';

    return animate(element, {
        [isHorizontal ? 'translateX' : 'translateY']: translations[direction],
        opacity: entering ? [0, 1] : [1, 0],
        duration: 600,
        easing: 'outCubic'
    });
}

/**
 * Curtain open animation
 * @param {HTMLElement} leftCurtain - Left curtain element
 * @param {HTMLElement} rightCurtain - Right curtain element
 */
export function curtainOpen(leftCurtain, rightCurtain) {
    animate(leftCurtain, {
        translateX: '-100%',
        duration: 1200,
        easing: 'outExpo'
    });

    return animate(rightCurtain, {
        translateX: '100%',
        duration: 1200,
        easing: 'outExpo'
    });
}

export default {
    staggerReveal,
    buttonPop,
    buttonReset,
    particleBurst,
    floatAnimation,
    pulseGlow,
    entranceAnimation,
    countdownFlip,
    sparkleTrail,
    confettiRain,
    slideTransition,
    curtainOpen
};
