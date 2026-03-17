App.registerGame('doodle-jump', ({ canvas, area, controls, onGameOver, onScore }) => {
  const ctx = canvas.getContext('2d');
  let W, H;
  let animId = null;
  let running = false;

  const PLAYER_W = 24;
  const PLAYER_H = 32;
  const PLAT_H = 10;
  const JUMP_FORCE = -9;
  const GRAVITY = 0.3;
  const MOVE_SPEED = 4;

  let player, platforms, score, camera, maxHeight;
  let lastTime = 0;
  let leftPressed = false, rightPressed = false;

  function resize() {
    const maxW = area.clientWidth;
    const maxH = area.clientHeight - 8;
    W = Math.min(maxW, 400);
    H = Math.min(maxH, 700);
    canvas.width = W;
    canvas.height = H;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
  }

  function initGame() {
    resize();
    score = 0;
    camera = 0;
    maxHeight = 0;
    platforms = [];

    // Generate initial platforms
    for (let i = 0; i < 10; i++) {
      platforms.push(createPlatform(H - i * (H / 10) - 30));
    }

    // Floor platform
    platforms[0] = { x: 0, y: H - 20, w: W, h: PLAT_H, type: 'normal' };

    player = {
      x: W / 2 - PLAYER_W / 2,
      y: H - 20 - PLAYER_H,
      vy: JUMP_FORCE,
      facing: 1,
    };

    onScore(`${I18n.t('height')}: 0`);
  }

  function createPlatform(y) {
    const w = 50 + Math.random() * 50;
    const x = Math.random() * (W - w);
    let type = 'normal';
    const r = Math.random();
    if (score > 500 && r < 0.08) type = 'break';
    else if (score > 200 && r < 0.12) type = 'moving';
    else if (r < 0.05) type = 'spring';
    return { x, y, w, h: PLAT_H, type, dir: 1, speed: 1 + Math.random() };
  }

  function update(dt) {
    // Input
    if (leftPressed || Input.isDown('ArrowLeft') || Input.isDown('a')) {
      player.x -= MOVE_SPEED;
      player.facing = -1;
    }
    if (rightPressed || Input.isDown('ArrowRight') || Input.isDown('d')) {
      player.x += MOVE_SPEED;
      player.facing = 1;
    }

    // Wrap
    if (player.x + PLAYER_W < 0) player.x = W;
    if (player.x > W) player.x = -PLAYER_W;

    // Gravity
    player.vy += GRAVITY;
    player.y += player.vy;

    // Moving platforms
    for (const plat of platforms) {
      if (plat.type === 'moving') {
        plat.x += plat.speed * plat.dir;
        if (plat.x <= 0 || plat.x + plat.w >= W) plat.dir *= -1;
      }
    }

    // Platform collision (only falling)
    if (player.vy >= 0) {
      for (let i = platforms.length - 1; i >= 0; i--) {
        const plat = platforms[i];
        if (
          player.y + PLAYER_H >= plat.y &&
          player.y + PLAYER_H <= plat.y + plat.h + player.vy + 2 &&
          player.x + PLAYER_W > plat.x + 4 &&
          player.x < plat.x + plat.w - 4
        ) {
          if (plat.type === 'break') {
            plat.broken = true;
            Audio.land();
            continue;
          }
          player.y = plat.y - PLAYER_H;
          if (plat.type === 'spring') {
            player.vy = JUMP_FORCE * 1.6;
            Audio.score();
          } else {
            player.vy = JUMP_FORCE;
            Audio.jump();
          }
          break;
        }
      }
    }

    // Remove broken platforms
    for (let i = platforms.length - 1; i >= 0; i--) {
      if (platforms[i].broken) {
        platforms[i].y += 5;
        if (platforms[i].y > camera + H + 50) platforms.splice(i, 1);
      }
    }

    // Camera follows player upward
    const targetCam = player.y - H * 0.35;
    if (targetCam < camera) {
      camera = targetCam;
    }

    // Track height
    const height = Math.floor(-camera / 10);
    if (height > maxHeight) {
      maxHeight = height;
      score = maxHeight;
      onScore(`${I18n.t('height')}: ${score}`);
    }

    // Generate new platforms above
    let topPlat = Math.min(...platforms.map(p => p.y));
    while (topPlat > camera - 100) {
      const gap = 45 + Math.random() * 40;
      if (score > 300) gap + 10;
      topPlat -= gap;
      platforms.push(createPlatform(topPlat));
    }

    // Remove platforms below screen
    for (let i = platforms.length - 1; i >= 0; i--) {
      if (platforms[i].y > camera + H + 50) platforms.splice(i, 1);
    }

    // Death: fall below camera
    if (player.y > camera + H + 50) {
      endGame();
    }
  }

  function draw() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, H);

    ctx.save();
    ctx.translate(0, -camera);

    // Platforms
    for (const plat of platforms) {
      if (plat.broken) {
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
      } else if (plat.type === 'spring') {
        ctx.fillStyle = 'rgba(100,255,100,0.7)';
      } else if (plat.type === 'break') {
        ctx.fillStyle = 'rgba(255,150,150,0.5)';
        // Crack lines
        ctx.strokeStyle = 'rgba(255,100,100,0.5)';
        ctx.beginPath();
        ctx.moveTo(plat.x + plat.w * 0.3, plat.y);
        ctx.lineTo(plat.x + plat.w * 0.5, plat.y + plat.h);
        ctx.stroke();
      } else if (plat.type === 'moving') {
        ctx.fillStyle = 'rgba(150,150,255,0.7)';
      } else {
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
      }
      ctx.fillRect(plat.x, plat.y, plat.w, plat.h);

      if (plat.type === 'spring' && !plat.broken) {
        ctx.fillStyle = 'rgba(100,255,100,0.9)';
        ctx.fillRect(plat.x + plat.w / 2 - 4, plat.y - 6, 8, 6);
      }
    }

    // Player
    Character.draw(ctx, player.x, player.y, PLAYER_W, PLAYER_H, player.facing, player.vy, false);

    ctx.restore();
  }

  function loop(ts) {
    if (!running) return;
    const dt = Math.min(ts - lastTime, 32);
    lastTime = ts;
    update(dt);
    draw();
    animId = requestAnimationFrame(loop);
  }

  function endGame() {
    running = false;
    cancelAnimationFrame(animId);
    onGameOver({ score });
  }

  function setupControls() {
    controls.innerHTML = `
      <button class="ctrl-btn" id="ctrl-left">←</button>
      <div class="ctrl-spacer"></div>
      <button class="ctrl-btn" id="ctrl-right">→</button>
    `;
    Input.setupTouchBtn(document.getElementById('ctrl-left'), v => { leftPressed = v; });
    Input.setupTouchBtn(document.getElementById('ctrl-right'), v => { rightPressed = v; });
  }

  return {
    start() {
      initGame();
      setupControls();
      running = true;
      lastTime = performance.now();
      animId = requestAnimationFrame(loop);
    },
    destroy() {
      running = false;
      cancelAnimationFrame(animId);
    }
  };
});
