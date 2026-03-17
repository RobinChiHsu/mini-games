// Shared character renderer — pixel-art slime
const Character = (() => {
  function draw(ctx, x, y, w, h, facing, vy, onGround) {
    const cx = x + w / 2;
    const bot = y + h;

    // Squash & stretch
    const stretch = Math.min(Math.abs(vy) * 0.01, 0.15);
    let scaleX, scaleY;
    if (vy < -2) {
      // Jumping up — tall & narrow
      scaleX = 1 - stretch * 0.5;
      scaleY = 1 + stretch;
    } else if (vy > 2) {
      // Falling — wide & flat
      scaleX = 1 + stretch * 0.5;
      scaleY = 1 - stretch * 0.7;
    } else {
      scaleX = 1;
      scaleY = 1;
    }

    // Idle bounce
    let bounceY = 0;
    if (onGround && Math.abs(vy) < 1) {
      bounceY = Math.sin(Date.now() * 0.005) * 1.5;
    }

    ctx.save();
    ctx.translate(cx, bot);
    ctx.scale(scaleX, scaleY);
    ctx.translate(-cx, -bot);

    const slimeW = w * 0.9;
    const slimeH = h * 0.75;
    const slimeX = cx - slimeW / 2;
    const slimeY = bot - slimeH + bounceY;

    // Shadow
    if (onGround) {
      ctx.fillStyle = 'rgba(100,220,140,0.12)';
      ctx.beginPath();
      ctx.ellipse(cx, bot + 2, slimeW * 0.45, 2.5, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Slime body — pixel-art style using small blocks
    const px = Math.max(2, Math.floor(w / 8)); // pixel size

    // Build slime shape row by row (approximate dome/blob)
    const bodyColor = '#5ddb6e';
    const darkColor = '#3aad4a';
    const lightColor = '#8cf09a';

    // Row definitions: [offsetFromCenter, width] in pixel units
    const rows = [
      { oy: 0, half: 2 },   // top
      { oy: 1, half: 3 },
      { oy: 2, half: 4 },
      { oy: 3, half: 4 },
      { oy: 4, half: 5 },
      { oy: 5, half: 5 },
      { oy: 6, half: 5 },   // widest
      { oy: 7, half: 4 },
      { oy: 8, half: 4 },   // bottom
    ];

    // Scale rows to fit
    const totalRows = 9;
    const pxH = slimeH / totalRows;
    const pxW = px;

    // Draw body pixels
    for (const row of rows) {
      const ry = slimeY + row.oy * pxH;
      for (let i = -row.half; i < row.half; i++) {
        const rx = cx + i * pxW;
        // Edge pixels are darker
        if (i === -row.half || i === row.half - 1) {
          ctx.fillStyle = darkColor;
        } else if (i === -row.half + 1 && row.oy <= 3) {
          // Highlight on top-left
          ctx.fillStyle = lightColor;
        } else {
          ctx.fillStyle = bodyColor;
        }
        ctx.fillRect(Math.floor(rx), Math.floor(ry), Math.ceil(pxW), Math.ceil(pxH));
      }
    }

    // Top highlight pixels
    ctx.fillStyle = lightColor;
    ctx.fillRect(Math.floor(cx - pxW), Math.floor(slimeY), Math.ceil(pxW), Math.ceil(pxH));
    ctx.fillRect(Math.floor(cx), Math.floor(slimeY), Math.ceil(pxW), Math.ceil(pxH));

    // Eyes
    const eyeY = slimeY + pxH * 3;
    const eyeSpan = pxW * 1.5;
    const eyeShift = facing * pxW * 0.3;

    // White of eyes
    ctx.fillStyle = '#fff';
    ctx.fillRect(Math.floor(cx - eyeSpan + eyeShift - pxW * 0.5), Math.floor(eyeY), Math.ceil(pxW * 1.5), Math.ceil(pxH * 2));
    ctx.fillRect(Math.floor(cx + eyeSpan + eyeShift - pxW), Math.floor(eyeY), Math.ceil(pxW * 1.5), Math.ceil(pxH * 2));

    // Pupils
    ctx.fillStyle = '#1a1a2e';
    const pupilShift = facing * pxW * 0.25;
    ctx.fillRect(Math.floor(cx - eyeSpan + eyeShift + pupilShift), Math.floor(eyeY + pxH * 0.5), Math.ceil(pxW * 0.8), Math.ceil(pxH * 1));
    ctx.fillRect(Math.floor(cx + eyeSpan + eyeShift + pupilShift - pxW * 0.3), Math.floor(eyeY + pxH * 0.5), Math.ceil(pxW * 0.8), Math.ceil(pxH * 1));

    // Mouth
    const mouthY = slimeY + pxH * 5.5;

    if (vy < -4) {
      // Jumping — happy open mouth
      ctx.fillStyle = '#2d7a3a';
      ctx.fillRect(Math.floor(cx - pxW * 0.8 + eyeShift), Math.floor(mouthY), Math.ceil(pxW * 1.6), Math.ceil(pxH));
    } else if (vy > 5) {
      // Falling — surprised O mouth
      ctx.fillStyle = '#2d7a3a';
      ctx.fillRect(Math.floor(cx - pxW * 0.5 + eyeShift), Math.floor(mouthY - pxH * 0.3), Math.ceil(pxW), Math.ceil(pxH * 1.3));
    } else {
      // Normal — small smile (two dots)
      ctx.fillStyle = '#2d7a3a';
      ctx.fillRect(Math.floor(cx - pxW * 0.8 + eyeShift), Math.floor(mouthY), Math.ceil(pxW * 0.4), Math.ceil(pxH * 0.5));
      ctx.fillRect(Math.floor(cx + pxW * 0.4 + eyeShift), Math.floor(mouthY), Math.ceil(pxW * 0.4), Math.ceil(pxH * 0.5));
    }

    // Cheek blush (subtle pink pixels)
    ctx.fillStyle = 'rgba(255,150,150,0.35)';
    ctx.fillRect(Math.floor(cx - eyeSpan - pxW * 0.8 + eyeShift), Math.floor(eyeY + pxH * 2), Math.ceil(pxW), Math.ceil(pxH * 0.7));
    ctx.fillRect(Math.floor(cx + eyeSpan + pxW * 0.3 + eyeShift), Math.floor(eyeY + pxH * 2), Math.ceil(pxW), Math.ceil(pxH * 0.7));

    ctx.restore();
  }

  return { draw };
})();
