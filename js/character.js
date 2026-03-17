// Shared character renderer for platform games
const Character = (() => {
  /**
   * Draw the player character
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} x - left position
   * @param {number} y - top position
   * @param {number} w - character width
   * @param {number} h - character height
   * @param {number} facing - 1 (right) or -1 (left)
   * @param {number} vy - vertical velocity (for expression)
   * @param {boolean} onGround - whether on ground
   */
  function draw(ctx, x, y, w, h, facing, vy, onGround) {
    const cx = x + w / 2;
    const headR = w * 0.45;
    const headY = y + headR + 1;
    const bodyTop = headY + headR + 1;
    const bodyH = h * 0.32;
    const bodyW = w * 0.5;
    const legLen = h * 0.22;
    const armLen = h * 0.2;

    // Shadow under feet
    if (onGround) {
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      ctx.beginPath();
      ctx.ellipse(cx, y + h + 1, w * 0.45, 2, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Legs
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = Math.max(2, w * 0.12);
    ctx.lineCap = 'round';
    const legSpread = onGround ? w * 0.2 : w * 0.15;
    const legBend = !onGround && vy < -2 ? -3 : 0;

    // Left leg
    ctx.beginPath();
    ctx.moveTo(cx - bodyW * 0.25, bodyTop + bodyH);
    ctx.lineTo(cx - legSpread, bodyTop + bodyH + legLen + legBend);
    ctx.stroke();
    // Right leg
    ctx.beginPath();
    ctx.moveTo(cx + bodyW * 0.25, bodyTop + bodyH);
    ctx.lineTo(cx + legSpread, bodyTop + bodyH + legLen + legBend);
    ctx.stroke();

    // Feet
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(cx - legSpread, bodyTop + bodyH + legLen + legBend, w * 0.08, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + legSpread, bodyTop + bodyH + legLen + legBend, w * 0.08, 0, Math.PI * 2);
    ctx.fill();

    // Body
    ctx.fillStyle = '#fff';
    roundRect(ctx, cx - bodyW / 2, bodyTop, bodyW, bodyH, 3);
    ctx.fill();

    // Arms
    const armY = bodyTop + bodyH * 0.15;
    const armSwing = !onGround ? (vy < 0 ? -0.5 : 0.4) : 0;

    // Left arm
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = Math.max(2, w * 0.1);
    ctx.beginPath();
    ctx.moveTo(cx - bodyW / 2, armY);
    ctx.lineTo(cx - bodyW / 2 - armLen * 0.7, armY + armLen * (0.6 + armSwing));
    ctx.stroke();
    // Right arm
    ctx.beginPath();
    ctx.moveTo(cx + bodyW / 2, armY);
    ctx.lineTo(cx + bodyW / 2 + armLen * 0.7, armY + armLen * (0.6 + armSwing));
    ctx.stroke();

    // Hands
    const handR = w * 0.06;
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(cx - bodyW / 2 - armLen * 0.7, armY + armLen * (0.6 + armSwing), handR, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + bodyW / 2 + armLen * 0.7, armY + armLen * (0.6 + armSwing), handR, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(cx, headY, headR, 0, Math.PI * 2);
    ctx.fill();

    // Face
    const eyeOffX = headR * 0.3;
    const eyeY = headY - headR * 0.05;
    const eyeR = Math.max(1.5, headR * 0.18);

    // Eyes
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(cx - eyeOffX + (facing > 0 ? 1 : -1), eyeY, eyeR, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + eyeOffX + (facing > 0 ? 1 : -1), eyeY, eyeR, 0, Math.PI * 2);
    ctx.fill();

    // Eye highlights
    ctx.fillStyle = '#fff';
    const hlR = eyeR * 0.4;
    ctx.beginPath();
    ctx.arc(cx - eyeOffX + (facing > 0 ? 1 : -1) - hlR * 0.5, eyeY - hlR * 0.5, hlR, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + eyeOffX + (facing > 0 ? 1 : -1) - hlR * 0.5, eyeY - hlR * 0.5, hlR, 0, Math.PI * 2);
    ctx.fill();

    // Mouth
    ctx.strokeStyle = '#000';
    ctx.lineWidth = Math.max(1, headR * 0.08);
    ctx.lineCap = 'round';
    const mouthY = headY + headR * 0.35;
    const mouthW = headR * 0.35;

    if (vy < -3) {
      // Jumping up - open mouth excited
      ctx.beginPath();
      ctx.arc(cx + (facing > 0 ? 1 : -1), mouthY, mouthW * 0.4, 0, Math.PI * 2);
      ctx.stroke();
    } else if (vy > 4) {
      // Falling fast - scared mouth
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.ellipse(cx + (facing > 0 ? 1 : -1), mouthY + 1, mouthW * 0.35, mouthW * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Normal - slight smile
      ctx.beginPath();
      ctx.arc(cx + (facing > 0 ? 1 : -1), mouthY - mouthW * 0.3, mouthW, 0.15 * Math.PI, 0.85 * Math.PI, false);
      ctx.stroke();
    }

    // Blush
    ctx.fillStyle = 'rgba(255,150,150,0.2)';
    ctx.beginPath();
    ctx.ellipse(cx - headR * 0.55, headY + headR * 0.2, headR * 0.2, headR * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + headR * 0.55, headY + headR * 0.2, headR * 0.2, headR * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  function roundRect(ctx, x, y, w, h, r) {
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
