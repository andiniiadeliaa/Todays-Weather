# Implementation Plan: Cozy Rain Mood Generator

## Overview

The implementation follows a data-driven scene architecture. We build the mood data registry first, then each visual module (canvas, mist, glow, quote), then wire everything together in `app.js`, and finally layer on micro-interactions, parallax, and ambient sound. Property-based tests (fast-check) validate universal invariants; example tests (Vitest) cover specific scenarios. All code targets HTML5 + Tailwind CSS CDN + Vanilla JavaScript — no runtime frameworks.

---

## Tasks

- [ ] 1. Set up project structure and base HTML shell
  - Create `assets/js/`, `assets/css/`, `assets/svg/` directories.
  - Write the base `index.html` with Tailwind CDN link, Google Fonts (Poppins), a `<main>` container, placeholder `<div>` targets for the glassmorphism card, glow orb, canvas, mist container, mood label, quote, Mood_Button, and Sound_Toggle.
  - Add Vitest (or Jest) and fast-check as dev dependencies in a `package.json` (or as CDN script tags in a test runner HTML page) for running tests.
  - Link `assets/css/custom.css` and all `assets/js/*.js` modules via `<script type="module">`.
  - _Requirements: 1.1, 11.1, 11.2, 11.3, 12.1, 12.2, 12.3, 12.4, 12.5_

- [ ] 2. Implement mood data registry
  - [ ] 2.1 Create `assets/js/moods.js` with the `MOODS` array
    - Define all 8 mood objects with every required field: `id`, `name`, `emoji`, `backgroundGradient`, `particleColor`, `particleCount`, `particleSpeed`, `mistOpacity`, `glowColor`, `windowTint`, `quote`, `isSnow`.
    - Export `MOODS` as a named ES module export.
    - _Requirements: 3.3, 15.1, 15.2_

  - [ ]* 2.2 Write example test: MOODS array has exactly 8 entries with required fields
    - Assert `MOODS.length === 8`.
    - Assert each entry has all 11 required keys and no key is null/undefined/empty.
    - _Requirements: 3.3, 15.1, 15.2_

  - [ ]* 2.3 Write property test for mood data completeness (Property 2)
    - **Property 2: Mood Data Completeness**
    - **Validates: Requirements 15.1, 15.2, 15.3**
    - Use fast-check `fc.constantFrom(...MOODS)` arbitrary; for each sampled mood assert all required fields are present and non-empty strings/numbers.
    - Tag: `// Feature: cozy-rain-mood-generator, Property 2: For any mood in MOODS, all required fields are present and non-empty`

- [ ] 3. Implement scene background and glow
  - [ ] 3.1 Create `setBackground(gradient)` in `app.js`
    - Apply the gradient string to `document.body.style.background` with a 1.5s CSS transition.
    - _Requirements: 4.1_

  - [ ] 3.2 Create `setGlow(color)` in `app.js`
    - Apply the color to the Glow_Orb `<div>` background with a 1s CSS transition.
    - _Requirements: 4.4_

  - [ ] 3.3 Create `setWindowTint(filter)` in `app.js`
    - Apply the CSS filter string to the Window_Illustration SVG element with a 0.8s transition.
    - _Requirements: 4.5_

- [ ] 4. Implement canvas rain/snow animation
  - [ ] 4.1 Create `assets/js/canvas.js` with `initCanvas`, `startAnimation`, `stopAnimation`, `handleResize`, and particle update/draw functions
    - Implement `initCanvas(canvasEl)`: store ref, attach `window.addEventListener('resize', handleResize)`.
    - Implement `handleResize()`: set `canvas.width = window.innerWidth`, `canvas.height = window.innerHeight`.
    - Implement `startAnimation(mood)`: cancel any active rAF loop, spawn `mood.particleCount` particles, start rAF loop.
    - Implement `updateParticles(particles, mood, canvas)`: advance each particle; if `particle.y > canvas.height` reset to `y ≤ 0`; for snow apply `dx` drift and wrap horizontally.
    - Implement `drawParticles(ctx, particles, mood)`: clear canvas, render drops (lines) or flakes (circles) per `mood.isSnow`.
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

  - [ ]* 4.2 Write property test for canvas viewport coverage (Property 4)
    - **Property 4: Canvas Covers Full Viewport**
    - **Validates: Requirements 5.1, 5.2**
    - Use fast-check `fc.integer({min:320, max:3840})` for width and height; mock `window.innerWidth/Height`; call `handleResize()`; assert `canvas.width` and `canvas.height` match.
    - Tag: `// Feature: cozy-rain-mood-generator, Property 4: For any viewport dimensions, canvas matches after handleResize`

  - [ ]* 4.3 Write property test for particle vertical wrap (Property 5)
    - **Property 5: Particle Vertical Wrap Invariant**
    - **Validates: Requirements 5.4**
    - Use fast-check to generate a particle with arbitrary `y > canvasHeight`; call `updateParticles`; assert `particle.y <= 0`.
    - Tag: `// Feature: cozy-rain-mood-generator, Property 5: For any particle with y > canvas.height, after update particle.y <= 0`

  - [ ]* 4.4 Write example test: Snowy Evening particles have non-zero dx (horizontal drift)
    - Spawn particles for Snowy Evening mood; assert every particle has `dx !== 0`.
    - _Requirements: 5.5_

- [ ] 5. Implement mist particles
  - [ ] 5.1 Create `setMist(mood)` in `app.js`
    - Remove all existing `.mist-particle` divs from the mist container.
    - Generate 8–12 new `<div class="mist-particle">` elements with randomized `width`, `height`, `left`, `animation-duration`, and `opacity` (using `mood.mistOpacity` as the base).
    - Apply `position: absolute`, `border-radius: 50%`, and a white-to-transparent radial gradient via inline style.
    - _Requirements: 4.3_

- [ ] 6. Checkpoint — Core scene modules complete
  - Ensure all tests pass, ask the user if questions arise.
  - Verify that manually changing `applyMood` with each of the 8 mood objects applies background, glow, tint, mist, and canvas animation correctly in the browser.

- [ ] 7. Implement mood selection logic and quote display
  - [ ] 7.1 Create `selectMood(currentId)` in `app.js`
    - Filter `MOODS` to exclude the entry whose `id === currentId`.
    - Return a random entry from the filtered array.
    - If the array is unexpectedly empty (edge case), return the Light Rain fallback object.
    - _Requirements: 3.1, 3.2_

  - [ ]* 7.2 Write property test for mood selection (Property 1)
    - **Property 1: Mood Selection Always Returns a Valid Mood**
    - **Validates: Requirements 3.1, 3.2**
    - Use fast-check `fc.constantFrom(...MOODS.map(m => m.id))` arbitrary for currentId; assert `selectMood(currentId).id ∈ MOODS ids` AND `selectMood(currentId).id !== currentId`.
    - Tag: `// Feature: cozy-rain-mood-generator, Property 1: For any currentId, selectMood returns a valid different mood`

  - [ ] 7.3 Create `setQuote(text)` in `app.js`
    - Set quote element opacity to 0 over 0.3s, update `textContent`, then set opacity to 1 over 0.4s.
    - _Requirements: 4.6_

  - [ ] 7.4 Create `setMoodLabel(emoji, name)` in `app.js`
    - Update the mood label element with emoji + name; apply a 0.5s fade-in animation class.
    - _Requirements: 10.2, 10.5_

  - [ ]* 7.5 Write property test for scene activation reflecting mood data (Property 3)
    - **Property 3: Scene Activation Reflects Mood Data**
    - **Validates: Requirements 3.4, 4.1, 4.6, 15.3**
    - Use fast-check `fc.constantFrom(...MOODS)` arbitrary; call `applyMood(mood)` with a mocked DOM; assert body background, glow color, window tint filter, and quote text content each match the mood object's corresponding field.
    - Tag: `// Feature: cozy-rain-mood-generator, Property 3: For any mood, applyMood sets all scene properties to mood's data values`

- [ ] 8. Implement ambient sound (Web Audio API)
  - [ ] 8.1 Create `assets/js/audio.js` with `initAudio`, `toggleSound`, `buildAudioGraph`, `tearDownAudioGraph`, `saveSoundPref`, `restoreSoundPref`
    - Implement `buildAudioGraph(ctx)`: create a `AudioBuffer` of white noise, connect through a `BiquadFilterNode` (type `lowpass`, frequency 400 Hz) and a `GainNode` to `ctx.destination`.
    - Implement `toggleSound(enable)`: on enable, call `initAudio()` lazily then `buildAudioGraph`; on disable, call `tearDownAudioGraph`.
    - Implement `saveSoundPref(state)`: wrap `localStorage.setItem('cozyRain_sound', state)` in try/catch.
    - Implement `restoreSoundPref()`: read `localStorage.getItem('cozyRain_sound')`; default to `"off"` if null or error.
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6_

  - [ ]* 8.2 Write example test: sound toggle persists to localStorage
    - Mock `localStorage`; call `saveSoundPref('on')`; assert key equals `"on"`; call `saveSoundPref('off')`; assert key equals `"off"`.
    - _Requirements: 13.4_

  - [ ]* 8.3 Write property test for sound preference round-trip (Property 6)
    - **Property 6: Sound Preference Round-Trip**
    - **Validates: Requirements 13.4, 13.5**
    - Use fast-check `fc.constantFrom('on', 'off')` arbitrary; write to localStorage via `saveSoundPref`; call `restoreSoundPref()`; assert returned state matches the written value.
    - Tag: `// Feature: cozy-rain-mood-generator, Property 6: For any sound state, saveSoundPref then restoreSoundPref returns the same state`

- [ ] 9. Implement mouse parallax
  - [ ] 9.1 Create `assets/js/parallax.js` with `initParallax` and `handleMouseMove`
    - Attach `mousemove` listener on `document`.
    - Calculate `offsetX/Y` from viewport center; clamp to ±20px.
    - Apply `transform: translate(${offsetX}px, ${offsetY}px)` to Glow_Orb and `translate(${-offsetX * 0.5}px, ${-offsetY * 0.5}px)` to Window_Illustration.
    - Use `requestAnimationFrame` throttling to prevent layout thrash.
    - _Requirements: 7.1, 7.2, 7.3_

- [ ] 10. Implement micro-interactions and animations
  - [ ] 10.1 Create `handleRipple(event)` in `app.js`
    - On Mood_Button click: compute click position relative to button, create a `<span>` absolutely positioned at that point, add a CSS ripple keyframe class, remove the span after the animation ends (`animationend` event).
    - Add scale-down (0.95) active state via CSS `:active` pseudo-class.
    - _Requirements: 8.1, 8.2_

  - [ ] 10.2 Add sway and hover animations in `assets/css/custom.css`
    - Define `@keyframes sway` (subtle rotate ±1.5deg) with a 6s infinite ease-in-out cycle applied to `.window-illustration`.
    - Define `@keyframes ripple` for the ripple span (scale 0→4, opacity 1→0 over 0.6s).
    - Define hover brightness/shadow increase for `.mood-btn` (transition 0.2s).
    - _Requirements: 8.3, 8.4_

- [ ] 11. Wire all modules in `app.js` and complete `index.html`
  - [ ] 11.1 Implement `initApp()` in `app.js`
    - Import all modules.
    - Call `initCanvas(canvasEl)`, `initParallax(glowEl, windowEl)`.
    - Call `applyMood(MOODS.find(m => m.id === 'light-rain'))` to set default scene.
    - Call `restoreSoundPref()` and set Sound_Toggle icon accordingly.
    - Attach click handlers: Mood_Button → `selectMood` then `applyMood` + `handleRipple`; Sound_Toggle → `toggleSound` + `saveSoundPref`.
    - _Requirements: 3.5, 9.4, 14.1, 14.2, 14.3_

  - [ ] 11.2 Complete `index.html` with full Tailwind classes and inline SVG
    - Apply glassmorphism card classes: `backdrop-blur-md bg-white/10 border border-white/20 rounded-3xl`.
    - Embed or link the Window_Illustration SVG with candle flame, steam, and decorative rain-drop paths.
    - Place the Glow_Orb `<div>` behind the card with `position: absolute`, large border-radius, and `filter: blur(80px)`.
    - Ensure responsive scaling: `max-w-sm md:max-w-md` on the card; `min-h-screen flex items-center justify-center` on the body wrapper.
    - Add `aria-label` to Mood_Button (`"Generate a new mood"`) and Sound_Toggle (`"Toggle ambient sound"`).
    - _Requirements: 6.1, 6.2, 9.2, 9.3, 10.1, 10.3, 10.4_

- [ ] 12. Final checkpoint — All features integrated
  - Ensure all tests pass, ask the user if questions arise.
  - Manually verify each of the 8 moods renders correctly.
  - Run Lighthouse in DevTools; confirm Performance ≥ 80 and no critical accessibility violations.
  - Confirm Sound_Toggle persists correctly across browser tab close/reopen.

---

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP build.
- Each task references specific requirements for traceability; consult `requirements.md` for full acceptance criteria text.
- Consult `design.md` for component interfaces, data shapes, and parallax offset formulas — do not re-derive them during implementation.
- The `MOODS` array is the single source of truth; never hard-code mood colors or counts in rendering functions.
- For audio: lazily initialize `AudioContext` only after the first user gesture to comply with browser autoplay policies.
- Property tests use **fast-check**; example/unit tests use **Vitest** (or Jest). Both can be added as devDependencies via npm or loaded via CDN in a test HTML runner.

---

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["2.1"] },
    { "id": 1, "tasks": ["2.2", "2.3", "3.1", "3.2", "3.3", "4.1", "5.1", "7.3", "7.4"] },
    { "id": 2, "tasks": ["4.2", "4.3", "4.4", "7.1"] },
    { "id": 3, "tasks": ["7.2", "7.5", "8.1", "9.1"] },
    { "id": 4, "tasks": ["8.2", "8.3", "10.1", "10.2"] },
    { "id": 5, "tasks": ["11.1", "11.2"] }
  ]
}
```
