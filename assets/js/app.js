// Main orchestrator — event wiring and scene management

import { MOODS } from './moods.js';
import { initCanvas, startAnimation } from './canvas.js';
import { initParallax } from './parallax.js';
import { toggleSound, saveSoundPref, restoreSoundPref } from './audio.js';

// Module-level state
let currentMoodId = 'light-rain';

// DOM references (populated in initApp)
let glowOrb = null;
let windowSvg = null;
let quoteEl = null;
let moodEmoji = null;
let moodName = null;
let mistContainer = null;

// ---------------------------------------------------------------------------
// Scene update helpers
// ---------------------------------------------------------------------------

/**
 * Apply a CSS gradient to the page background.
 * @param {string} gradient
 */
export function setBackground(gradient) {
  document.body.style.background = gradient;
}

/**
 * Transition the glow orb to a new color.
 * @param {string} color
 */
export function setGlow(color) {
  if (!glowOrb) return;
  glowOrb.style.transition = 'background 1s ease';
  glowOrb.style.background = `radial-gradient(circle, ${color} 0%, transparent 70%)`;
}

/**
 * Transition the window illustration's CSS filter tint.
 * @param {string} filter
 */
export function setWindowTint(filter) {
  if (!windowSvg) return;
  windowSvg.style.transition = 'filter 0.8s ease';
  windowSvg.style.filter = filter;
}

/**
 * Fade out the quote, swap text, then fade it back in.
 * @param {string} text
 */
export function setQuote(text) {
  if (!quoteEl) return;
  quoteEl.style.transition = 'opacity 0.3s ease';
  quoteEl.style.opacity = '0';
  setTimeout(() => {
    quoteEl.textContent = text;
    quoteEl.style.transition = 'opacity 0.4s ease';
    quoteEl.style.opacity = '1';
  }, 320);
}

/**
 * Update the mood label with emoji and name, then trigger the fade-in animation.
 * @param {string} emoji
 * @param {string} name
 */
export function setMoodLabel(emoji, name) {
  if (!moodEmoji || !moodName) return;
  moodEmoji.textContent = emoji;
  moodName.textContent = name;

  // Restart the CSS animation by removing and re-adding the class
  const el = moodName.parentElement || moodName;
  el.classList.remove('mood-label-animate');
  void el.offsetWidth; // force reflow
  el.classList.add('mood-label-animate');
  setTimeout(() => el.classList.remove('mood-label-animate'), 500);
}

/**
 * Clear existing mist particles and generate new ones for the given mood.
 * @param {Object} mood
 */
export function setMist(mood) {
  if (!mistContainer) return;

  // Remove existing mist particles
  mistContainer.querySelectorAll('.mist-particle').forEach(el => el.remove());

  const count = 8 + Math.floor(Math.random() * 5); // 8–12 particles
  for (let i = 0; i < count; i++) {
    const size = 80 + Math.random() * 160; // 80–240px
    const div = document.createElement('div');
    div.className = 'mist-particle';

    const duration = 10 + Math.random() * 8; // 10–18s
    div.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${Math.random() * 100}%;
      top: ${20 + Math.random() * 70}%;
      animation-delay: ${Math.random() * 8}s;
      --mist-opacity: ${mood.mistOpacity};
      --mist-duration: ${duration}s;
      opacity: ${mood.mistOpacity};
    `;

    mistContainer.appendChild(div);
  }
}

// ---------------------------------------------------------------------------
// Mood orchestration
// ---------------------------------------------------------------------------

/**
 * Apply all scene properties for the given mood object.
 * @param {Object} mood
 */
export function applyMood(mood) {
  setBackground(mood.backgroundGradient);
  setGlow(mood.glowColor);
  setWindowTint(mood.windowTint);
  setQuote(mood.quote);
  setMoodLabel(mood.emoji, mood.name);
  setMist(mood);
  startAnimation(mood);
}

/**
 * Select a random mood that differs from the current one.
 * @param {string} currentId
 * @returns {Object} mood
 */
export function selectMood(currentId) {
  const pool = MOODS.filter(m => m.id !== currentId);
  if (pool.length === 0) return MOODS[0];
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Create a ripple animation at the click location on the button.
 * @param {MouseEvent} event
 */
export function handleRipple(event) {
  const btn = event.currentTarget;
  const rect = btn.getBoundingClientRect();
  const span = document.createElement('span');
  span.className = 'ripple-span';
  span.style.left = `${event.clientX - rect.left}px`;
  span.style.top = `${event.clientY - rect.top}px`;
  btn.appendChild(span);
  span.addEventListener('animationend', () => span.remove(), { once: true });
}

// ---------------------------------------------------------------------------
// Initialisation
// ---------------------------------------------------------------------------

/**
 * Bootstrap the app — called on DOMContentLoaded.
 */
export function initApp() {
  // Query DOM elements
  const canvasEl = document.getElementById('rain-canvas');
  glowOrb = document.getElementById('glow-orb');
  windowSvg = document.getElementById('window-illustration');
  quoteEl = document.getElementById('quote-text');
  moodEmoji = document.getElementById('mood-emoji');
  moodName = document.getElementById('mood-name');
  mistContainer = document.getElementById('mist-container');
  const moodBtn = document.getElementById('mood-btn');
  const soundBtn = document.getElementById('sound-toggle');
  const soundIcon = document.getElementById('sound-icon');

  // Initialise canvas and parallax
  if (canvasEl) initCanvas(canvasEl);
  if (glowOrb && windowSvg) initParallax(glowOrb, windowSvg);

  // Apply default mood
  const defaultMood = MOODS.find(m => m.id === 'light-rain') || MOODS[0];
  currentMoodId = defaultMood.id;
  applyMood(defaultMood);

  // Restore sound preference
  const savedPref = restoreSoundPref();
  if (savedPref === 'on' && soundIcon && soundBtn) {
    soundIcon.textContent = '🔊';
    soundBtn.setAttribute('aria-pressed', 'true');
  }

  // Mood button click handler
  if (moodBtn) {
    moodBtn.addEventListener('click', function (e) {
      handleRipple(e);
      const next = selectMood(currentMoodId);
      currentMoodId = next.id;
      applyMood(next);
    });
  }

  // Sound toggle click handler
  if (soundBtn && soundIcon) {
    soundBtn.addEventListener('click', function () {
      const isOn = soundBtn.getAttribute('aria-pressed') === 'true';
      const newState = !isOn;
      toggleSound(newState);
      saveSoundPref(newState ? 'on' : 'off');
      soundIcon.textContent = newState ? '🔊' : '🔇';
      soundBtn.setAttribute('aria-pressed', String(newState));
    });
  }
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', initApp);
