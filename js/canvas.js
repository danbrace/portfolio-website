/**
 * Landscape background canvas — Sunset Mountains
 * Exposes initCanvas() to start the background animation.
 */
function initCanvas() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function mulberry32(seed) {
    return function() {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  function makeNoise(seed) {
    const rng = mulberry32(seed);
    const table = Array.from({length: 512}, () => rng());
    return function(x) {
      const xi = Math.floor(x) & 511;
      const xf = x - Math.floor(x);
      const t = 0.5 - 0.5 * Math.cos(xf * Math.PI);
      return table[xi] * (1-t) + table[(xi+1)&511] * t;
    };
  }

  function fractalNoise(fn, x, oct, pers) {
    oct = oct || 5; pers = pers || 0.5;
    var v=0, amp=1, freq=1, max=0;
    for (var i=0;i<oct;i++){ v+=fn(x*freq)*amp; max+=amp; amp*=pers; freq*=2.1; }
    return v/max;
  }

  const noises = Array.from({length:6}, function(_,i){ return makeNoise(42 + i*137); });
  let W, H;
  function resize() { W = canvas.width = innerWidth; H = canvas.height = innerHeight; }
  resize();
  window.addEventListener('resize', resize);

  function drawMountainLayer(noiseFn, offset, baseY, amp, freq, bodyColor, opacity) {
    const pts = [];
    for (let x = 0; x <= W + 2; x += 2) {
      pts.push({ x, y: baseY - fractalNoise(noiseFn, (x + offset) / W * freq, 5, 0.52) * amp });
    }
    ctx.save();
    ctx.globalAlpha = opacity;

    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.moveTo(0, H);
    pts.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(W, H);
    ctx.closePath();
    ctx.fill();
    
    ctx.restore();
  }

  const grainCanvas = document.createElement('canvas');
  const grainCtx = grainCanvas.getContext('2d');
  let grainFrame = 0;
  function makeGrain() {
    grainCanvas.width = W; grainCanvas.height = H;
    const id = grainCtx.createImageData(W, H);
    const d = id.data;
    for (let i = 0; i < d.length; i += 4) {
      const v = Math.random() * 255 | 0;
      d[i]=d[i+1]=d[i+2]=v;
      d[i+3] = Math.random() < 0.5 ? (Math.random()*28|0) : 0;
    }
    grainCtx.putImageData(id, 0, 0);
  }
  makeGrain();

  let scrollT = 0;
  const speeds = [0, 0.06, 0.14, 0.28];

  const STARS = Array.from({length: 220}, () => ({
    x: Math.random(),
    y: Math.random() * 0.62,
    r: 0.5 + Math.random() * 1.4,
    a: 0.50 + Math.random() * 0.50,
    twinkle: Math.random() * Math.PI * 2,
    tSpeed: 0.008 + Math.random() * 0.022,
    depth: Math.random() * 0.4,
  }));

  const MOON = { nx: 0.72, ny: 0.14, r: 28 };

  let mouseX = 0, mouseY = 0, smoothX = 0, smoothY = 0;
  document.addEventListener('mousemove', e => {
    mouseX = (e.clientX / innerWidth  - 0.5) * 2;
    mouseY = (e.clientY / innerHeight - 0.5) * 2;
  });

  function draw() {
    requestAnimationFrame(draw);
    scrollT += 0.3;

    smoothX += (mouseX - smoothX) * 0.04;
    smoothY += (mouseY - smoothY) * 0.04;

    ctx.clearRect(0, 0, W, H);

    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0.00, '#080614');
    sky.addColorStop(0.30, '#1a0820');
    sky.addColorStop(0.52, '#5c1510');
    sky.addColorStop(0.68, '#b83508');
    sky.addColorStop(0.80, '#c85a18');
    sky.addColorStop(0.90, '#3a1820');
    sky.addColorStop(1.00, '#1a1020');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);

    const glow = ctx.createRadialGradient(W*0.5, H*0.72, 0, W*0.5, H*0.72, W*0.75);
    glow.addColorStop(0,    'rgba(230,100,25,0.32)');
    glow.addColorStop(0.45, 'rgba(180,55,12,0.14)');
    glow.addColorStop(1,    'rgba(0,0,0,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);

    for (const s of STARS) {
      s.twinkle += s.tSpeed;
      const alpha = s.a * (0.55 + 0.45 * Math.sin(s.twinkle));
      const px = s.x * W + smoothX * s.depth * 38;
      const py = s.y * H + smoothY * s.depth * 22;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#e8dfd0';
      ctx.beginPath();
      ctx.arc(px, py, s.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    const moonX = MOON.nx * W + smoothX * 14;
    const moonY = MOON.ny * H + smoothY * 8;
    const mr = MOON.r;

    const mg = ctx.createRadialGradient(moonX, moonY, 0, moonX, moonY, mr * 5.5);
    mg.addColorStop(0,    'rgba(220,195,155,0.20)');
    mg.addColorStop(0.35, 'rgba(195,165,120,0.08)');
    mg.addColorStop(1,    'rgba(0,0,0,0)');
    ctx.fillStyle = mg;
    ctx.beginPath();
    ctx.arc(moonX, moonY, mr * 5.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.fillStyle = '#ddd0b0';
    ctx.globalAlpha = 0.92;
    ctx.beginPath();
    ctx.arc(moonX, moonY, mr, Math.PI * 0.5, Math.PI * 1.5, false);
    ctx.arc(moonX + mr * 0.55, moonY, mr * 0.95, Math.PI * 1.5, Math.PI * 0.5, true);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    drawMountainLayer(noises[0], scrollT*speeds[1], H*0.88, H*0.72, 1.5, '#2e1c30', 1.0);
    drawMountainLayer(noises[1], scrollT*speeds[2], H*0.88, H*0.24, 3.2, '#1e1230', 1.0);
    drawMountainLayer(noises[2], scrollT*speeds[3], H*0.92, H*0.10, 5.5, '#130c1e', 1.0);

    const ground = ctx.createLinearGradient(0, H*0.88, 0, H);
    ground.addColorStop(0, '#130d1e');
    ground.addColorStop(1, '#0a0812');
    ctx.fillStyle = ground;
    ctx.fillRect(0, H*0.88, W, H*0.12);

    const haze = ctx.createRadialGradient(W*0.5, H*0.75, 0, W*0.5, H*0.75, W*0.6);
    haze.addColorStop(0,   'rgba(80,20,15,0.18)');
    haze.addColorStop(0.6, 'rgba(40,10,8,0.08)');
    haze.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.fillStyle = haze;
    ctx.fillRect(0, H*0.55, W, H*0.45);

    grainFrame++;
    if (grainFrame % 3 === 0) makeGrain();
    ctx.save();
    ctx.globalAlpha = 0.18;
    ctx.drawImage(grainCanvas, 0, 0);
    ctx.restore();
  }

  draw();
}
