App.registerGame('downstairs', ({ canvas, area, controls, onGameOver, onScore }) => {
  const ctx = canvas.getContext('2d');
  let W, H;
  let animId = null;
  let running = false;

  // Game state
  const PLAYER_W = 20;
  const PLAYER_H = 24;
  const PLAT_H = 10;
  const GRAVITY = 0.35;
  const MOVE_SPEED = 3;
  const SCROLL_SPEED_BASE = 0.8;

  let player, platforms, scrollSpeed, score, bestScore;
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
    scrollSpeed = SCROLL_SPEED_BASE;
    bestScore = Storage.getBest('downstairs');
    platforms = [];

    // Generate initial platforms
    for (let i = 0; i < 8; i++) {
      platforms.push(createPlatform(H * 0.15 + i * (H / 8)));
    }

    // Player starts on first platform
    const firstPlat = platforms[1];
    player = {
      x: firstPlat.x + firstPlat.w / 2 - PLAYER_W / 2,
      y: firstPlat.y - PLAYER_H,
      vy: 0,
      onGround: true,
      facing: 1,
    };

    onScore(`${I18n.t('score')}: 0`);
  }

  function createPlatform(y) {
    const w = 50 + Math.random() * 70;
    const x = Math.random() * (W - w);
    const type = Math.random() < 0.1 ? 'spike' : 'normal';
    return { x, y, w, h: PLAT_H, type };
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

    // Wrap around
    if (player.x + PLAYER_W < 0) player.x = W;
    if (player.x > W) player.x = -PLAYER_W;

    // Gravity
    player.vy += GRAVITY;
    player.y += player.vy;
    player.onGround = false;

    // Platform collision (only when falling)
    if (player.vy >= 0) {
      for (const plat of platforms) {
        if (
          player.y + PLAYER_H >= plat.y &&
          player.y + PLAYER_H <= plat.y + plat.h + player.vy + 2 &&
          player.x + PLAYER_W > plat.x + 4 &&
          player.x < plat.x + plat.w - 4
        ) {
          if (plat.type === 'spike') {
            endGame();
            return;
          }
          player.y = plat.y - PLAYER_H;
          player.vy = 0;
          player.onGround = true;
          break;
        }
      }
    }

    // Scroll everything up
    for (const plat of platforms) {
      plat.y -= scrollSpeed;
    }
    player.y -= scrollSpeed;

    // Remove platforms that go off top
    while (platforms.length > 0 && platforms[0].y + PLAT_H < 0) {
      platforms.shift();
      score++;
      if (score % 10 === 0) scrollSpeed += 0.1;
      onScore(`${I18n.t('score')}: ${score}`);
    }

    // Add new platforms at bottom
    while (platforms.length < 8) {
      const lastY = platforms.length > 0 ? platforms[platforms.length - 1].y : H * 0.5;
      platforms.push(createPlatform(lastY + H / 8 + Math.random() * 20));
    }

    // Death: pushed off top
    if (player.y + PLAYER_H < 0) {
      endGame();
      return;
    }

    // Death: fall off bottom
    if (player.y > H) {
      endGame();
      return;
    }
  }

  function draw() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, H);

    // Danger zone at top
    ctx.fillStyle = 'rgba(255,50,50,0.15)';
    ctx.fillRect(0, 0, W, 20);

    // Platforms
    for (const plat of platforms) {
      if (plat.type === 'spike') {
        ctx.fillStyle = 'rgba(255,80,80,0.6)';
        ctx.fillRect(plat.x, plat.y, plat.w, plat.h);
        // Spike markers
        ctx.fillStyle = 'rgba(255,80,80,0.9)';
        for (let sx = plat.x + 5; sx < plat.x + plat.w - 5; sx += 10) {
          ctx.fillRect(sx, plat.y - 4, 4, 4);
        }
      } else {
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.fillRect(plat.x, plat.y, plat.w, plat.h);
      }
    }

    // Player
    ctx.fillStyle = '#fff';
    ctx.fillRect(player.x, player.y, PLAYER_W, PLAYER_H);
    // Eyes
    ctx.fillStyle = '#000';
    if (player.facing > 0) {
      ctx.fillRect(player.x + 12, player.y + 6, 4, 4);
    } else {
      ctx.fillRect(player.x + 4, player.y + 6, 4, 4);
    }
    // Feet
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fillRect(player.x + 2, player.y + PLAYER_H, 6, 2);
    ctx.fillRect(player.x + PLAYER_W - 8, player.y + PLAYER_H, 6, 2);
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
