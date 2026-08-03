// Canvas rain/snow particle animation engine

let canvasEl = null;
let rafId = null;
let particles = [];

/**
 * Store canvas reference and attach resize listener.
 * @param {HTMLCanvasElement} canvas
 */
export function initCanvas(canvas) {
  canvasEl = canvas;
  handleResize();
  window.addEventListener('resize', handleResize);
}

/**
 * Resize canvas to match current viewport dimensions.
 */
export function handleResize() {
  if (!canvasEl) return;
  canvasEl.width = window.innerWidth;
  canvasEl.height = window.innerHeight;
}

/**
 * Stop any running animation, spawn new particles for the given mood,
 * then start the requestAnimationFrame loop.
 * @param {Object} mood
 */
export function startAnimation(mood) {
  stopAnimation();

  particles = [];
  const count = mood.particleCount;
  const w = canvasEl ? canvasEl.width : window.innerWidth;
  const h = canvasEl ? canvasEl.height : window.innerHeight;

  for (let i = 0; i < count; i++) {
    const speed = mood.particleSpeed * (0.7 + Math.random() * 0.6);
    const length = mood.isSnow ? 2 + Math.random() * 3 : 10 + Math.random() * 20;
    const opacity = 0.3 + Math.random() * 0.7;
    const dx = mood.isSnow ? (Math.random() - 0.5) * 1.5 : mood.particleSpeed * 0.2;

    particles.push({
      x: Math.random() * w,
      y: Math.random() * h,
      speed,
      length,
      opacity,
      dx
    });
  }

  let ctx = null;
  try {
    ctx = canvasEl.getContext('2d');
  } catch (e) {
    console.error('canvas.js: failed to get 2d context', e);
    if (canvasEl) canvasEl.style.display = 'none';
    return;
  }

  function loop() {
    try {
      updateParticles(particles, mood, canvasEl);
      drawParticles(ctx, particles, mood);
      rafId = requestAnimationFrame(loop);
    } catch (e) {
      console.error('canvas.js: animation loop error', e);
      stopAnimation();
    }
  }

  rafId = requestAnimationFrame(loop);
}

/**
 * Cancel the animation frame loop.
 */
export function stopAnimation() {
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
}

/**
 * Advance each particle by one frame.
 * @param {Array} particleList
 * @param {Object} mood
 * @param {HTMLCanvasElement} canvas
 */
export function updateParticles(particleList, mood, canvas) {
  const w = canvas ? canvas.width : window.innerWidth;
  const h = canvas ? canvas.height : window.innerHeight;

  for (const p of particleList) {
    p.y += p.speed;
    p.x += p.dx;

    // Wrap vertically: reset to top when particle leaves bottom
    if (p.y > h) {
      p.y = -p.length;
      p.x = Math.random() * w;
    }

    // Snow: also wrap horizontally
    if (mood.isSnow) {
      if (p.x > w) p.x = 0;
      if (p.x < 0) p.x = w;
    }
  }
}

/**
 * Clear the canvas and draw all particles.
 * @param {CanvasRenderingContext2D} context
 * @param {Array} particleList
 * @param {Object} mood
 */
export function drawParticles(context, particleList, mood) {
  if (!context) return;
  const canvas = context.canvas;
  context.clearRect(0, 0, canvas.width, canvas.height);

  for (const p of particleList) {
    context.globalAlpha = p.opacity;
    context.strokeStyle = mood.particleColor;
    context.fillStyle = mood.particleColor;

    if (mood.isSnow) {
      // Draw snowflake as a small circle
      context.beginPath();
      context.arc(p.x, p.y, p.length, 0, Math.PI * 2);
      context.fill();
    } else {
      // Draw raindrop as a line
      context.lineWidth = 1.5;
      context.beginPath();
      context.moveTo(p.x, p.y);
      context.lineTo(p.x + p.dx * 2, p.y + p.length);
      context.stroke();
    }
  }

  context.globalAlpha = 1;
}
