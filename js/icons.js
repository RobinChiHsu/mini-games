// Canvas-drawn game icons for the hub — Redesigned for Cyber-Organic Theme
const Icons = (() => {
  const DPR = window.devicePixelRatio || 1;
  const COLORS = {
    primary: '#ccff00',
    secondary: '#00f0ff',
    tertiary: '#ff007f',
    glass: 'rgba(255, 255, 255, 0.2)',
    glassDark: 'rgba(255, 255, 255, 0.05)'
  };

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

  function drawMiniSlime(ctx, cx, cy, size) {
    const s = size;
    const grad = ctx.createLinearGradient(cx, cy - s*0.4, cx, cy + s*0.4);
    grad.addColorStop(0, COLORS.primary);
    grad.addColorStop(1, '#99cc00');
    
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(cx - s*0.4, cy + s*0.3);
    ctx.bezierCurveTo(cx - s*0.4, cy - s*0.4, cx + s*0.4, cy - s*0.4, cx + s*0.4, cy + s*0.3);
    ctx.closePath();
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(cx - s*0.12, cy - s*0.05, s*0.08, 0, Math.PI*2);
    ctx.arc(cx + s*0.12, cy - s*0.05, s*0.08, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = '#0d0d12';
    ctx.beginPath();
    ctx.arc(cx - s*0.12, cy - s*0.05, s*0.04, 0, Math.PI*2);
    ctx.arc(cx + s*0.12, cy - s*0.05, s*0.04, 0, Math.PI*2);
    ctx.fill();
  }

  function downstairs(size) {
    const { c, ctx } = create(size);
    const s = size;
    
    // Abstract steps
    ctx.strokeStyle = COLORS.secondary;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(s*0.2, s*0.3); ctx.lineTo(s*0.5, s*0.3);
    ctx.moveTo(s*0.4, s*0.6); ctx.lineTo(s*0.7, s*0.6);
    ctx.moveTo(s*0.3, s*0.9); ctx.lineTo(s*0.6, s*0.9);
    ctx.stroke();

    drawMiniSlime(ctx, s * 0.45, s * 0.25, s * 0.5);
    
    // Arrow
    ctx.fillStyle = COLORS.tertiary;
    ctx.beginPath();
    ctx.moveTo(s*0.8, s*0.35); ctx.lineTo(s*0.8, s*0.6);
    ctx.lineTo(s*0.7, s*0.5); ctx.moveTo(s*0.8, s*0.6);
    ctx.lineTo(s*0.9, s*0.5); ctx.stroke();
    
    return c;
  }

  function doodle(size) {
    const { c, ctx } = create(size);
    const s = size;

    // Pulse effect
    ctx.fillStyle = 'rgba(0, 240, 255, 0.1)';
    ctx.beginPath();
    ctx.arc(s*0.5, s*0.5, s*0.45, 0, Math.PI*2);
    ctx.fill();

    // Platforms
    ctx.strokeStyle = COLORS.primary;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(s*0.2, s*0.8); ctx.lineTo(s*0.4, s*0.8);
    ctx.moveTo(s*0.6, s*0.5); ctx.lineTo(s*0.8, s*0.5);
    ctx.stroke();

    drawMiniSlime(ctx, s * 0.4, s * 0.35, s * 0.5);
    
    return c;
  }

  function upstairs(size) {
    const { c, ctx } = create(size);
    const s = size;
    
    ctx.strokeStyle = COLORS.tertiary;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(s*0.1, s*0.9); ctx.lineTo(s*0.3, s*0.9);
    ctx.moveTo(s*0.3, s*0.7); ctx.lineTo(s*0.5, s*0.7);
    ctx.moveTo(s*0.5, s*0.5); ctx.lineTo(s*0.7, s*0.5);
    ctx.stroke();

    drawMiniSlime(ctx, s * 0.6, s * 0.4, s * 0.5);
    
    return c;
  }

  function mine(size) {
    const { c, ctx } = create(size);
    const s = size;

    // Grid representation
    ctx.fillStyle = COLORS.glass;
    for(let i=0; i<2; i++) {
      for(let j=0; j<2; j++) {
        ctx.fillRect(s*0.2 + i*s*0.35, s*0.2 + j*s*0.35, s*0.25, s*0.25);
      }
    }

    // Exploding mine (stylized)
    ctx.fillStyle = COLORS.tertiary;
    ctx.beginPath();
    ctx.arc(s*0.7, s*0.7, s*0.15, 0, Math.PI*2);
    ctx.fill();
    
    ctx.strokeStyle = COLORS.tertiary;
    ctx.lineWidth = 2;
    for(let i=0; i<8; i++) {
      const ang = i * Math.PI / 4;
      ctx.beginPath();
      ctx.moveTo(s*0.7 + Math.cos(ang)*s*0.15, s*0.7 + Math.sin(ang)*s*0.15);
      ctx.lineTo(s*0.7 + Math.cos(ang)*s*0.25, s*0.7 + Math.sin(ang)*s*0.25);
      ctx.stroke();
    }

    return c;
  }

  function tetris(size) {
    const { c, ctx } = create(size);
    const s = size;
    const b = s * 0.2;

    // T-piece
    ctx.fillStyle = COLORS.secondary;
    ctx.fillRect(s*0.1, s*0.2, b, b);
    ctx.fillRect(s*0.1 + b + 1, s*0.2, b, b);
    ctx.fillRect(s*0.1 + 2*(b + 1), s*0.2, b, b);
    ctx.fillRect(s*0.1 + b + 1, s*0.2 + b + 1, b, b);

    // Block
    ctx.fillStyle = COLORS.primary;
    ctx.fillRect(s*0.5, s*0.5, b, b);
    ctx.fillRect(s*0.5 + b + 1, s*0.5, b, b);
    ctx.fillRect(s*0.5, s*0.5 + b + 1, b, b);
    ctx.fillRect(s*0.5 + b + 1, s*0.5 + b + 1, b, b);

    return c;
  }

  const drawers = { downstairs, doodle, upstairs, mine, tetris };

  function renderAll() {
    document.querySelectorAll('.game-icon[data-icon]').forEach(el => {
      const name = el.dataset.icon;
      if (drawers[name]) {
        const isWide = el.closest('.game-card.wide');
        const size = isWide ? 48 : 56;
        el.innerHTML = '';
        el.appendChild(drawers[name](size));
      }
    });
  }

  return { renderAll };
})();
