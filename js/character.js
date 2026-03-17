// Shared character renderer — clean capsule-style character
const Character = (() => {
  function draw(ctx, x, y, w, h, facing, vy, onGround) {
    const cx = x + w / 2;
    const s = Math.min(w, h);

    // Body proportions
    const headR = s * 0.32;
    const headCY = y + headR + 1;
    const bodyW = s * 0.42;
    const bodyH = h * 0.38;
    const bodyTop = headCY + headR - 2;
    const bodyBot = bodyTop + bodyH;

    // Squash & stretch based on velocity
    const stretch = Math.min(Math.abs(vy) * 0.008, 0.12);
    const sx = vy < -2 ? 1 - stretch * 0.5 : (vy > 2 ? 1 + stretch * 0.4 : 1);
    const sy = vy < -2 ? 1 + stretch : (vy > 2 ? 1 - stretch * 0.6 : 1);

    ctx.save();
    ctx.translate(cx, y + h * 0.45);
    ctx.scale(sx, sy);
    ctx.translate(-cx, -(y + h * 0.45));

    // Shadow
    if (onGround) {
      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      ctx.beginPath();
      ctx.ellipse(cx, y + h + 1, w * 0.35, 2, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Legs
    const legW = s * 0.12;
    const legH = h * 0.18;
    const legGap = s * 0.12;
    const legY = bodyBot - 1;

    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    roundRect(ctx, cx - legGap - legW, legY, legW, legH, legW * 0.4);
    ctx.fill();
    roundRect(ctx, cx + legGap, legY, legW, legH, legW * 0.4);
    ctx.fill();

    // Body (capsule)
    ctx.fillStyle = '#fff';
    roundRect(ctx, cx - bodyW / 2, bodyTop, bodyW, bodyH, bodyW * 0.35);
    ctx.fill();

    // Head
    ctx.beginPath();
    ctx.arc(cx, headCY, headR, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    const eyeR = Math.max(1.8, headR * 0.16);
    const eyeSpan = headR * 0.38;
    const eyeY = headCY - headR * 0.05;
    const eyeShift = facing * headR * 0.08;

    ctx.fillStyle = '#0a0a0a';
    ctx.beginPath();
    ctx.arc(cx - eyeSpan + eyeShift, eyeY, eyeR, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + eyeSpan + eyeShift, eyeY, eyeR, 0, Math.PI * 2);
    ctx.fill();

    // Mouth (context-dependent)
    const mouthY = headCY + headR * 0.32;
    ctx.fillStyle = '#0a0a0a';

    if (vy < -4) {
      // Jumping — open mouth
      ctx.beginPath();
      ctx.arc(cx + eyeShift, mouthY, headR * 0.12, 0, Math.PI * 2);
      ctx.fill();
    } else if (vy > 5) {
      // Falling fast — wide open
      ctx.beginPath();
      ctx.ellipse(cx + eyeShift, mouthY + 1, headR * 0.14, headR * 0.2, 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Normal — small smile line
      ctx.strokeStyle = '#0a0a0a';
      ctx.lineWidth = Math.max(1, headR * 0.08);
      ctx.lineCap = 'round';
      ctx.beginPath();
      const smW = headR * 0.22;
      ctx.arc(cx + eyeShift, mouthY - smW * 0.6, smW, 0.2 * Math.PI, 0.8 * Math.PI);
      ctx.stroke();
    }

    ctx.restore();
  }

  function roundRect(ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  return { draw };
})();
