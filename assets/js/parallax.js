// Mouse parallax handler — shifts glow orb and window illustration in opposite directions

let glowElement = null;
let windowElement = null;
let ticking = false;
let lastEvent = null;

/**
 * Store element refs and attach the mousemove listener.
 * @param {HTMLElement} glowEl   — the glow orb element
 * @param {HTMLElement} windowEl — the window illustration element
 */
export function initParallax(glowEl, windowEl) {
  glowElement = glowEl;
  windowElement = windowEl;
  document.addEventListener('mousemove', onMouseMove);
}

/**
 * Apply parallax transform based on mouse position.
 * Offset range: −20px to +20px derived from (clientPos / innerSize - 0.5) * 40.
 * @param {MouseEvent} event
 */
export function handleMouseMove(event) {
  const offsetX = (event.clientX / window.innerWidth - 0.5) * 40;
  const offsetY = (event.clientY / window.innerHeight - 0.5) * 40;

  if (glowElement) {
    glowElement.style.transform = `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px))`;
  }
  if (windowElement) {
    windowElement.style.transform = `translate(${-offsetX * 0.5}px, ${-offsetY * 0.5}px)`;
  }
}

// --- internal ---

function onMouseMove(event) {
  lastEvent = event;
  if (!ticking) {
    ticking = true;
    requestAnimationFrame(applyParallax);
  }
}

function applyParallax() {
  ticking = false;
  if (lastEvent) {
    handleMouseMove(lastEvent);
  }
}
