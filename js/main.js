/**
 * Main entry point — cursor, scroll reveal, and initialization.
 */

document.addEventListener('DOMContentLoaded', function() {
  // Cursor
  const cursor = document.getElementById('cursor');
  if (cursor) {
    let mx = -200, my = -200, cx = -200, cy = -200;
    document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
    document.querySelectorAll('a, button').forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('expand'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('expand'));
    });
    (function animCursor() {
      // Higher = snappier cursor, less lag.
      cx += (mx - cx) * 0.28;
      cy += (my - cy) * 0.28;
      cursor.style.left = cx + 'px';
      cursor.style.top = cy + 'px';
      requestAnimationFrame(animCursor);
    })();
  }

  // Canvas background
  if (typeof initCanvas === 'function') initCanvas();

  // Scroll reveal
  const io = new IntersectionObserver(entries =>
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
    { threshold: 0.06 }
  );
  document.querySelectorAll('.section').forEach(s => io.observe(s));

  // Load data and photos
  if (typeof loadData === 'function') loadData();
});
