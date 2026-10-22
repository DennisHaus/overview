'use strict';

/* A water level drawn over time: a seasonal cycle with shorter waves on top,
   whose mean slowly drifts. Static when reduced motion is requested. */
(() => {
  const line = document.getElementById('water-line');
  const fill = document.getElementById('water-fill');
  if (!line || !fill) return;

  const W = 1200;
  const H = 200;
  const STEP = 6;

  function level(x, t) {
    const u = x / W;
    const drift = 14 * Math.sin(t * 0.05);                       // slow shift of the mean
    const season = 34 * Math.sin(u * Math.PI * 4 - t * 0.35);     // the yearly cycle
    const waves = 7 * Math.sin(u * Math.PI * 23 - t * 1.1)        // shorter events
                + 3 * Math.sin(u * Math.PI * 57 + t * 0.7);
    return H / 2 + drift + season + waves;
  }

  function draw(t) {
    let d = '';
    for (let x = 0; x <= W; x += STEP) {
      d += `${x === 0 ? 'M' : 'L'}${x} ${level(x, t).toFixed(1)}`;
    }
    line.setAttribute('d', d);
    fill.setAttribute('d', `${d}L${W} ${H}L0 ${H}Z`);
  }

  const still = matchMedia('(prefers-reduced-motion: reduce)');
  let start = null;

  function frame(now) {
    if (start === null) start = now;
    draw((now - start) / 1000);
    if (!still.matches) requestAnimationFrame(frame);
  }

  draw(0);
  if (!still.matches) requestAnimationFrame(frame);
  still.addEventListener?.('change', () => { if (!still.matches) { start = null; requestAnimationFrame(frame); } });
})();
