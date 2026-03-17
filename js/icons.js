// Canvas-drawn game icons for the hub
const Icons = (() => {
  const DPR = window.devicePixelRatio || 1;

  function create(size) {
    const c = document.createElement('canvas');
    c.width = size * DPR;
    c.height = size * DPR;
    c.style.width = size + 'px';
    c.style.height = size + 'px';
    const ctx = c.getContext('2d');
    ctx.scale(DPR, DPR);
    return { c, ctx };
  }

  function downstairs(size) {
    const { c, ctx } = create(size);
    const s = size;
    ctx.lineCap = 'round';

    // Platforms (steps going down)
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fillRect(s*0.1, s*0.2, s*0.35, 3);
    ctx.fillRect(s*0.3, s*0.42, s*0.4, 3);
    ctx.fillRect(s*0.15, s*0.64, s*0.35, 3);
    ctx.fillRect(s*0.45, s*0.82, s*0.4, 3);

    // Character (little circle person)
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(s*0.45, s*0.34, s*0.07, 0, Math.PI*2);
    ctx.fill();
    // Body
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(s*0.45, s*0.41);
    ctx.lineTo(s*0.45, s*0.52);
    ctx.stroke();
    // Legs
    ctx.beginPath();
    ctx.moveTo(s*0.45, s*0.52);
    ctx.lineTo(s*0.38, s*0.6);
    ctx.moveTo(s*0.45, s*0.52);
    ctx.lineTo(s*0.52, s*0.6);
    ctx.stroke();

    // Arrow down
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(s*0.8, s*0.3);
    ctx.lineTo(s*0.8, s*0.6);
    ctx.lineTo(s*0.73, s*0.53);
    ctx.moveTo(s*0.8, s*0.6);
    ctx.lineTo(s*0.87, s*0.53);
    ctx.stroke();

    return c;
  }

  function doodle(size) {
    const { c, ctx } = create(size);
    const s = size;
    ctx.lineCap = 'round';

    // Platforms
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fillRect(s*0.15, s*0.75, s*0.35, 3);
    ctx.fillRect(s*0.45, s*0.55, s*0.35, 3);
    ctx.fillRect(s*0.2, s*0.35, s*0.3, 3);

    // Spring on middle platform
    ctx.strokeStyle = 'rgba(120,255,120,0.7)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(s*0.6, s*0.55);
    ctx.lineTo(s*0.57, s*0.5);
    ctx.lineTo(s*0.63, s*0.47);
    ctx.lineTo(s*0.6, s*0.44);
    ctx.stroke();

    // Character jumping up
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(s*0.35, s*0.2, s*0.08, 0, Math.PI*2);
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(s*0.35, s*0.28);
    ctx.lineTo(s*0.35, s*0.4);
    ctx.stroke();
    // Arms up
    ctx.beginPath();
    ctx.moveTo(s*0.35, s*0.32);
    ctx.lineTo(s*0.25, s*0.26);
    ctx.moveTo(s*0.35, s*0.32);
    ctx.lineTo(s*0.45, s*0.26);
    ctx.stroke();
    // Legs
    ctx.beginPath();
    ctx.moveTo(s*0.35, s*0.4);
    ctx.lineTo(s*0.28, s*0.48);
    ctx.moveTo(s*0.35, s*0.4);
    ctx.lineTo(s*0.42, s*0.48);
    ctx.stroke();

    // Arrow up
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(s*0.82, s*0.65);
    ctx.lineTo(s*0.82, s*0.3);
    ctx.lineTo(s*0.75, s*0.37);
    ctx.moveTo(s*0.82, s*0.3);
    ctx.lineTo(s*0.89, s*0.37);
    ctx.stroke();

    return c;
  }

  function upstairs(size) {
    const { c, ctx } = create(size);
    const s = size;
    ctx.lineCap = 'round';

    // Staircase pattern
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fillRect(s*0.1, s*0.8, s*0.3, 3);
    ctx.fillRect(s*0.25, s*0.62, s*0.3, 3);
    ctx.fillRect(s*0.4, s*0.44, s*0.3, 3);
    ctx.fillRect(s*0.55, s*0.26, s*0.3, 3);

    // Character on stairs
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(s*0.38, s*0.36, s*0.07, 0, Math.PI*2);
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(s*0.38, s*0.43);
    ctx.lineTo(s*0.38, s*0.54);
    ctx.stroke();
    // Legs (stepping up)
    ctx.beginPath();
    ctx.moveTo(s*0.38, s*0.54);
    ctx.lineTo(s*0.32, s*0.6);
    ctx.moveTo(s*0.38, s*0.54);
    ctx.lineTo(s*0.44, s*0.58);
    ctx.stroke();
    // Arms
    ctx.beginPath();
    ctx.moveTo(s*0.38, s*0.46);
    ctx.lineTo(s*0.3, s*0.42);
    ctx.moveTo(s*0.38, s*0.46);
    ctx.lineTo(s*0.46, s*0.5);
    ctx.stroke();

    return c;
  }

  function mine(size) {
    const { c, ctx } = create(size);
    const s = size;

    // Grid cells
    const gridSize = 3;
    const cellS = s * 0.2;
    const gx = s * 0.15;
    const gy = s * 0.18;

    for (let r = 0; r < gridSize; r++) {
      for (let cl = 0; cl < gridSize; cl++) {
        ctx.fillStyle = 'rgba(255,255,255,0.12)';
        ctx.fillRect(gx + cl * (cellS + 2), gy + r * (cellS + 2), cellS, cellS);
      }
    }

    // Revealed cells with numbers
    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    ctx.fillRect(gx, gy, cellS, cellS);
    ctx.fillRect(gx + cellS + 2, gy, cellS, cellS);

    ctx.font = `bold ${cellS * 0.6}px 'JetBrains Mono', monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#6ea8fe';
    ctx.fillText('1', gx + cellS/2, gy + cellS/2);
    ctx.fillStyle = '#63d97a';
    ctx.fillText('2', gx + cellS + 2 + cellS/2, gy + cellS/2);

    // Flag
    ctx.fillStyle = '#ff6b6b';
    const fx = gx + 2*(cellS+2) + cellS*0.35;
    const fy = gy + 2*(cellS+2) + cellS*0.2;
    ctx.fillRect(fx + 2, fy, 1.5, cellS*0.6);
    ctx.beginPath();
    ctx.moveTo(fx + 3.5, fy);
    ctx.lineTo(fx + cellS*0.45, fy + cellS*0.15);
    ctx.lineTo(fx + 3.5, fy + cellS*0.3);
    ctx.fill();

    // Mine hint
    ctx.fillStyle = 'rgba(255,80,80,0.5)';
    ctx.beginPath();
    ctx.arc(s*0.75, s*0.75, s*0.1, 0, Math.PI*2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,80,80,0.5)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(s*0.75, s*0.63); ctx.lineTo(s*0.75, s*0.87);
    ctx.moveTo(s*0.63, s*0.75); ctx.lineTo(s*0.87, s*0.75);
    ctx.stroke();

    return c;
  }

  function tetris(size) {
    const { c, ctx } = create(size);
    const s = size;
    const b = s * 0.18;
    const gap = 1;

    // T-piece
    ctx.fillStyle = 'rgba(180,130,255,0.8)';
    ctx.fillRect(s*0.1, s*0.15, b, b);
    ctx.fillRect(s*0.1 + b + gap, s*0.15, b, b);
    ctx.fillRect(s*0.1 + 2*(b+gap), s*0.15, b, b);
    ctx.fillRect(s*0.1 + b + gap, s*0.15 + b + gap, b, b);

    // L-piece
    ctx.fillStyle = 'rgba(255,170,80,0.8)';
    ctx.fillRect(s*0.12, s*0.55, b, b);
    ctx.fillRect(s*0.12, s*0.55 + b + gap, b, b);
    ctx.fillRect(s*0.12 + b + gap, s*0.55 + b + gap, b, b);

    // S-piece
    ctx.fillStyle = 'rgba(100,220,100,0.8)';
    ctx.fillRect(s*0.55, s*0.5, b, b);
    ctx.fillRect(s*0.55 + b + gap, s*0.5, b, b);
    ctx.fillRect(s*0.55 - b - gap, s*0.5 + b + gap, b, b);
    ctx.fillRect(s*0.55, s*0.5 + b + gap, b, b);

    return c;
  }

  const drawers = { downstairs, doodle, upstairs, mine, tetris };

  function renderAll() {
    document.querySelectorAll('.game-icon[data-icon]').forEach(el => {
      const name = el.dataset.icon;
      if (drawers[name]) {
        const isWide = el.closest('.game-card.wide');
        const size = isWide ? 40 : 48;
        el.innerHTML = '';
        el.appendChild(drawers[name](size));
      }
    });
  }

  return { renderAll };
})();
