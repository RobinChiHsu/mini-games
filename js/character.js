// Shared character renderer — Modern "Juicy" Slime
const Character = (() => {
  function draw(ctx, x, y, w, h, facing, vy, onGround) {
    const cx = x + w / 2;
    const bot = y + h;

    // Squash & stretch logic
    const stretch = Math.min(Math.abs(vy) * 0.015, 0.25);
    let scaleX, scaleY;
    if (vy < -1) {
      // Jumping up — tall & narrow
      scaleX = 1 - stretch * 0.6;
      scaleY = 1 + stretch;
    } else if (vy > 1) {
      // Falling — wide & flat
      scaleX = 1 + stretch * 0.4;
      scaleY = 1 - stretch * 0.5;
    } else {
      scaleX = 1;
      scaleY = 1;
    }

    // Idle bounce
    let bounceY = 0;
    if (onGround && Math.abs(vy) < 1) {
      bounceY = Math.sin(Date.now() * 0.006) * 2;
      scaleX += Math.sin(Date.now() * 0.006) * 0.02;
      scaleY -= Math.sin(Date.now() * 0.006) * 0.02;
    }

    ctx.save();
    ctx.translate(cx, bot);
    ctx.scale(scaleX, scaleY);
    ctx.translate(-cx, -bot);

    const slimeW = w * 0.95;
    const slimeH = h * 0.8;
    const slimeX = cx - slimeW / 2;
    const slimeY = bot - slimeH + bounceY;

    // 1. Shadow on ground
    if (onGround) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.beginPath();
      ctx.ellipse(cx, bot + 2, slimeW * 0.4, 3, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // 2. Slime Body (Organic Shape)
    const r = slimeW * 0.45; // base radius
    ctx.beginPath();
    ctx.moveTo(slimeX, bot + bounceY);
    // Bottom curve
    ctx.bezierCurveTo(slimeX, bot + bounceY - r*0.2, cx - r, slimeY, cx, slimeY);
    ctx.bezierCurveTo(cx + r, slimeY, slimeX + slimeW, bot + bounceY - r*0.2, slimeX + slimeW, bot + bounceY);
    ctx.closePath();

    // Body Gradient
    const grad = ctx.createLinearGradient(cx, slimeY, cx, bot + bounceY);
    grad.addColorStop(0, '#ccff00'); // Electric Lime top
    grad.addColorStop(1, '#99cc00'); // Slightly darker bottom
    ctx.fillStyle = grad;
    ctx.fill();

    // Glossy Highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.ellipse(cx - slimeW * 0.2, slimeY + slimeH * 0.2, slimeW * 0.15, slimeH * 0.1, Math.PI * -0.1, 0, Math.PI * 2);
    ctx.fill();

    // 3. Eyes (More expressive)
    const eyeY = slimeY + slimeH * 0.35;
    const eyeSpacing = slimeW * 0.18;
    const eyeSize = slimeW * 0.12;
    const eyeShiftX = facing * slimeW * 0.08;
    
    // Eye Whites
    ctx.fillStyle = '#fff';
    // Left Eye
    ctx.beginPath();
    ctx.ellipse(cx - eyeSpacing + eyeShiftX, eyeY, eyeSize * 0.8, eyeSize, 0, 0, Math.PI * 2);
    ctx.fill();
    // Right Eye
    ctx.beginPath();
    ctx.ellipse(cx + eyeSpacing + eyeShiftX, eyeY, eyeSize * 0.8, eyeSize, 0, 0, Math.PI * 2);
    ctx.fill();

    // Pupils
    ctx.fillStyle = '#0d0d12';
    const pupilShiftX = facing * eyeSize * 0.3;
    const pupilSize = eyeSize * 0.5;
    ctx.beginPath();
    ctx.arc(cx - eyeSpacing + eyeShiftX + pupilShiftX, eyeY, pupilSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + eyeSpacing + eyeShiftX + pupilShiftX, eyeY, pupilSize, 0, Math.PI * 2);
    ctx.fill();

    // 4. Mouth
    const mouthY = eyeY + slimeH * 0.25;
    ctx.strokeStyle = '#2d7a3a';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';

    if (vy < -3) {
      // Jumping — Happy "D" mouth
      ctx.fillStyle = '#2d7a3a';
      ctx.beginPath();
      ctx.arc(cx + eyeShiftX, mouthY, slimeW * 0.1, 0, Math.PI);
      ctx.fill();
    } else if (vy > 3) {
      // Falling — Surprised "O" mouth
      ctx.beginPath();
      ctx.ellipse(cx + eyeShiftX, mouthY, slimeW * 0.05, slimeW * 0.08, 0, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      // Idle — Cute smile
      ctx.beginPath();
      ctx.arc(cx + eyeShiftX, mouthY - 2, slimeW * 0.08, 0.2 * Math.PI, 0.8 * Math.PI);
      ctx.stroke();
    }

    // 5. Blush
    ctx.fillStyle = 'rgba(255, 100, 150, 0.2)';
    ctx.beginPath();
    ctx.arc(cx - eyeSpacing * 1.8 + eyeShiftX, eyeY + 5, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + eyeSpacing * 1.8 + eyeShiftX, eyeY + 5, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  return { draw };
})();
