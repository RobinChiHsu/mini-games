App.registerGame('upstairs', ({ canvas, area, controls, onGameOver, onScore }) => {
  const ctx = canvas.getContext('2d');
  let W, H;
  let animId = null;
  let running = false;

  const PLAYER_W = 24;
  const PLAYER_H = 32;
  const PLAT_H = 10;
  const GRAVITY = 0.25;
  const JUMP_FORCE = -8;
  const MOVE_SPEED = 4;
  const SCROLL_SPEED_BASE = 0.3;

  let player, platforms, scrollSpeed, score, floor;
  let lastTime = 0;
  let leftPressed = false, rightPressed = false;
  let canJump = false;
  let playerOnGround = false;

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
    floor = 0;
    scrollSpeed = SCROLL_SPEED_BASE;
    platforms = [];

    // Generate staircase-like platforms
    for (let i = 0; i < 10; i++) {
      platforms.push(createPlatform(H - 30 - i * (H / 10)));
    }

    // Floor
    platforms.unshift({ x: 0, y: H - 15, w: W, h: PLAT_H, type: 'normal' });

    const startPlat = platforms[0];
    player = {
      x: W / 2 - PLAYER_W / 2,
      y: startPlat.y - PLAYER_H,
      vy: 0,
      facing: 1,
    };
    canJump = true;

    onScore(`${I18n.t('floor')}: 0`);
  }

  let lastPlatX = 0;

  function createPlatform(y) {
    const w = 65 + Math.random() * 55;
    // Limit horizontal distance from last platform so it's reachable
    const maxDx = W * 0.35;
    let x;
    if (platforms.length > 0) {
      const minX = Math.max(0, lastPlatX - maxDx);
      const maxX = Math.min(W - w, lastPlatX + maxDx);
      x = minX + Math.random() * Math.max(0, maxX - minX);
    } else {
      x = Math.random() * (W - w);
    }
    lastPlatX = x;
    let type = 'normal';
    if (floor > 20 && Math.random() < 0.1) type = 'spike';
    else if (floor > 40 && Math.random() < 0.06) type = 'crumble';
    return { x, y, w, h: PLAT_H, type, timer: 0 };
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
    playerOnGround = false;

    // Platform collision (falling)
    if (player.vy >= 0) {
      for (let i = 0; i < platforms.length; i++) {
        const plat = platforms[i];
        if (plat.crumbling && plat.timer > 45) continue;
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
          playerOnGround = true;
          canJump = true;

          if (plat.type === 'crumble') {
            if (!plat.crumbling) {
              plat.crumbling = true;
              plat.timer = 0;
            }
            // 自動彈跳，不用按跳
            player.vy = JUMP_FORCE;
            canJump = false;
            Audio.jump();
          }
          break;
        }
      }
    }

    // Auto jump when on ground (like original upstairs game)
    if (playerOnGround && canJump) {
      // Check for jump input or auto-jump
      if (Input.isDown('ArrowUp') || Input.isDown('w') || Input.isDown(' ')) {
        player.vy = JUMP_FORCE;
        canJump = false;
        Audio.jump();
      }
    }

    // Scroll down (platforms move down, pushing player up effectively)
    for (const plat of platforms) {
      plat.y += scrollSpeed;
      if (plat.crumbling) {
        plat.timer++;
        if (plat.timer > 50) plat.y += 3;
      }
    }
    player.y += scrollSpeed;

    // Remove platforms that go below screen
    for (let i = platforms.length - 1; i >= 0; i--) {
      if (platforms[i].y > H + 50) {
        platforms.splice(i, 1);
      }
    }

    // Score: platforms passed
    let topPlat = platforms.length > 0 ? Math.min(...platforms.map(p => p.y)) : H / 2;

    // Generate new platforms above
    while (topPlat > -20) {
      const gap = 35 + Math.random() * 20;
      topPlat -= gap;
      platforms.push(createPlatform(topPlat));
      floor++;
      score = floor;
      if (floor % 20 === 0) scrollSpeed += 0.05;
      onScore(`${I18n.t('floor')}: ${score}`);
    }

    // Death: fall below screen
    if (player.y > H + 30) {
      endGame();
      return;
    }

    // Death: pushed off top (by scrolling)
    if (player.y + PLAYER_H < -30) {
      endGame();
      return;
    }
  }

  function draw() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, H);

    // Danger zone at bottom
    ctx.fillStyle = 'rgba(255,50,50,0.1)';
    ctx.fillRect(0, H - 30, W, 30);

    // Platforms
    for (const plat of platforms) {
      if (plat.type === 'spike') {
        ctx.fillStyle = 'rgba(255,80,80,0.6)';
        ctx.fillRect(plat.x, plat.y, plat.w, plat.h);
        ctx.fillStyle = 'rgba(255,80,80,0.9)';
        for (let sx = plat.x + 5; sx < plat.x + plat.w - 5; sx += 10) {
          ctx.fillRect(sx, plat.y - 4, 4, 4);
        }
      } else if (plat.crumbling) {
        const alpha = Math.max(0.1, 0.7 - plat.timer * 0.02);
        ctx.fillStyle = `rgba(255,200,100,${alpha})`;
        ctx.fillRect(plat.x, plat.y, plat.w, plat.h);
      } else if (plat.type === 'crumble') {
        ctx.fillStyle = 'rgba(255,200,100,0.6)';
        ctx.fillRect(plat.x, plat.y, plat.w, plat.h);
      } else {
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.fillRect(plat.x, plat.y, plat.w, plat.h);
      }
    }

    // Player
    Character.draw(ctx, player.x, player.y, PLAYER_W, PLAYER_H, player.facing, player.vy, playerOnGround);
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
      <button class="ctrl-btn" id="ctrl-jump">↑</button>
      <button class="ctrl-btn" id="ctrl-right">→</button>
    `;
    Input.setupTouchBtn(document.getElementById('ctrl-left'), v => { leftPressed = v; });
    Input.setupTouchBtn(document.getElementById('ctrl-right'), v => { rightPressed = v; });
    Input.setupTouchBtn(document.getElementById('ctrl-jump'), v => {
      if (v && canJump) {
        player.vy = JUMP_FORCE;
        canJump = false;
        Audio.jump();
      }
    });
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
