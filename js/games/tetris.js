App.registerGame('tetris', ({ canvas, area, controls, options, onGameOver, onScore }) => {
  const ctx = canvas.getContext('2d');
  let W, H, cellSize;
  let animId = null;
  let running = false;

  const COLS = 10, ROWS = 20, BUFFER = 4, TOTAL_ROWS = ROWS + BUFFER;
  const LOCK_DELAY = 500, MAX_LOCK_MOVES = 15;

  const SHAPES = {
    I: [[[0,0],[0,1],[0,2],[0,3]],[[0,2],[1,2],[2,2],[3,2]],[[2,0],[2,1],[2,2],[2,3]],[[0,1],[1,1],[2,1],[3,1]]],
    O: [[[0,1],[0,2],[1,1],[1,2]],[[0,1],[0,2],[1,1],[1,2]],[[0,1],[0,2],[1,1],[1,2]],[[0,1],[0,2],[1,1],[1,2]]],
    T: [[[0,1],[1,0],[1,1],[1,2]],[[0,1],[1,1],[1,2],[2,1]],[[1,0],[1,1],[1,2],[2,1]],[[0,1],[1,0],[1,1],[2,1]]],
    S: [[[0,1],[0,2],[1,0],[1,1]],[[0,1],[1,1],[1,2],[2,2]],[[1,1],[1,2],[2,0],[2,1]],[[0,0],[1,0],[1,1],[2,1]]],
    Z: [[[0,0],[0,1],[1,1],[1,2]],[[0,2],[1,1],[1,2],[2,1]],[[1,0],[1,1],[2,1],[2,2]],[[0,1],[1,0],[1,1],[2,0]]],
    J: [[[0,0],[1,0],[1,1],[1,2]],[[0,1],[0,2],[1,1],[2,1]],[[1,0],[1,1],[1,2],[2,2]],[[0,1],[1,1],[2,0],[2,1]]],
    L: [[[0,2],[1,0],[1,1],[1,2]],[[0,1],[1,1],[2,1],[2,2]],[[1,0],[1,1],[1,2],[2,0]],[[0,0],[0,1],[1,1],[2,1]]],
  };
  const TYPES = Object.keys(SHAPES);
  const KICKS_STD = [[0,0],[0,-1],[0,1],[1,0],[-1,0]];
  const KICKS_I = [[0,0],[0,-1],[0,1],[0,-2],[0,2],[1,0],[-1,0]];
  const SPEEDS = [1000,900,800,700,600,500,400,300,200,150,100,100,100,80,80,80,60,60,60,40];
  const LINE_SCORES = { 1: 80, 2: 200, 3: 500, 4: 1200 };

  // Mode definitions
  const MODES = {
    classic: {
      name: 'CLASSIC',
      linesPerLevel: 10,
      onLineClear(n, lv) { return (LINE_SCORES[n] || 0) * lv; },
    },
    marathon: {
      name: 'MARATHON',
      linesPerLevel: 5,
      onLineClear(n, lv) { return (LINE_SCORES[n] || 0) * lv; },
    },
    timeattack: {
      name: 'TIME ATTACK',
      fixedLevel: 5,
      duration: 120,
      onLineClear(n) { return (LINE_SCORES[n] || 0) * 5; },
    },
    sprint40: {
      name: '40 LINES',
      fixedLevel: 5,
      targetLines: 40,
      onLineClear(n) { return (LINE_SCORES[n] || 0) * 5; },
    },
    garbage: {
      name: 'GARBAGE',
      linesPerLevel: 10,
      garbageInterval: 15000,
      onLineClear(n, lv) { return (LINE_SCORES[n] || 0) * lv; },
    },
    invisible: {
      name: 'INVISIBLE',
      linesPerLevel: 10,
      invisible: true,
      onLineClear(n, lv) { return (LINE_SCORES[n] || 0) * lv; },
    },
    zen: {
      name: 'ZEN',
      fixedLevel: 1,
      zen: true,
      onLineClear(n) { return (LINE_SCORES[n] || 0); },
    },
    ultra: {
      name: 'ULTRA',
      fixedLevel: 5,
      duration: 60,
      onLineClear(n) { return (LINE_SCORES[n] || 0) * 5; },
    },
  };

  const modeName = (options && options.mode) || 'classic';
  const mode = MODES[modeName];

  let grid, displayGrid, current, holdType, holdUsed, bag, nextQueue;
  let score, level, lines, gameOverFlag;
  let lastDrop, lockTimer, lockMoves, softDropping;
  let flashRows, flashEnd;
  let startTime, lastGarbageTime;

  function resize() {
    const maxW = area.clientWidth;
    const maxH = area.clientHeight - 8;
    cellSize = Math.min(Math.floor(maxH / ROWS), Math.floor(maxW * 0.55 / COLS), 30);
    cellSize = Math.max(cellSize, 14);
    const boardW = cellSize * COLS;
    const sideW = cellSize * 5;
    W = boardW + sideW * 2;
    H = cellSize * ROWS;
    canvas.width = W;
    canvas.height = H;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
  }

  function createBag() {
    const b = [...TYPES];
    for (let i = b.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [b[i], b[j]] = [b[j], b[i]];
    }
    return b;
  }

  function fillQueue() {
    while (nextQueue.length < 4) {
      if (bag.length === 0) bag = createBag();
      nextQueue.push(bag.pop());
    }
  }

  function newPiece(type) {
    const startRow = type === 'I' ? BUFFER - 1 : BUFFER - 2;
    return { type, rotation: 0, row: startRow, col: 3 };
  }

  function getCells(piece) {
    return SHAPES[piece.type][piece.rotation].map(([r, c]) => [r + piece.row, c + piece.col]);
  }

  function canPlace(row, col, type, rotation) {
    const cells = SHAPES[type][rotation];
    for (const [cr, cc] of cells) {
      const r = cr + row, c = cc + col;
      if (c < 0 || c >= COLS || r >= TOTAL_ROWS) return false;
      if (r >= 0 && grid[r][c]) return false;
    }
    return true;
  }

  function initGame() {
    resize();
    grid = Array.from({ length: TOTAL_ROWS }, () => Array(COLS).fill(0));
    displayGrid = null;
    bag = createBag();
    nextQueue = [];
    fillQueue();
    holdType = null;
    holdUsed = false;
    score = 0;
    level = mode.fixedLevel || 1;
    lines = 0;
    gameOverFlag = false;
    lockTimer = null; lockMoves = 0;
    softDropping = false;
    flashRows = []; flashEnd = 0;
    startTime = performance.now();
    lastGarbageTime = 0;
    spawnPiece();
    lastDrop = performance.now();
    updateScore();
  }

  function spawnPiece() {
    const type = nextQueue.shift();
    fillQueue();
    current = newPiece(type);
    holdUsed = false;
    lockTimer = null;
    lockMoves = 0;

    if (!canPlace(current.row, current.col, current.type, current.rotation)) {
      if (mode.zen) {
        // Clear bottom rows to make space
        for (let i = 0; i < 4; i++) {
          grid.pop();
          grid.unshift(Array(COLS).fill(0));
        }
        if (!canPlace(current.row, current.col, current.type, current.rotation)) {
          gameOverFlag = true;
        }
      } else {
        gameOverFlag = true;
      }
    }
  }

  function doHold() {
    if (holdUsed) return;
    const t = current.type;
    if (holdType) {
      current = newPiece(holdType);
    } else {
      spawnPiece();
    }
    holdType = t;
    holdUsed = true;
    lockTimer = null;
    lockMoves = 0;
    Audio.click();
  }

  function move(dr, dc) {
    if (!canPlace(current.row + dr, current.col + dc, current.type, current.rotation)) return false;
    current.row += dr;
    current.col += dc;
    if (lockTimer !== null && lockMoves < MAX_LOCK_MOVES) {
      lockMoves++;
      lockTimer = performance.now();
    }
    return true;
  }

  function rotate(dir) {
    const newRot = (current.rotation + dir + 4) % 4;
    const kicks = current.type === 'I' ? KICKS_I : (current.type === 'O' ? [[0,0]] : KICKS_STD);
    for (const [kr, kc] of kicks) {
      if (canPlace(current.row + kr, current.col + kc, current.type, newRot)) {
        current.row += kr;
        current.col += kc;
        current.rotation = newRot;
        if (lockTimer !== null && lockMoves < MAX_LOCK_MOVES) {
          lockMoves++;
          lockTimer = performance.now();
        }
        Audio.click();
        return;
      }
    }
  }

  function hardDrop() {
    let dropped = 0;
    while (canPlace(current.row + 1, current.col, current.type, current.rotation)) {
      current.row++;
      dropped++;
    }
    score += dropped * 2;
    Audio.land();
    lockPiece();
  }

  function getGhostRow() {
    let r = current.row;
    while (canPlace(r + 1, current.col, current.type, current.rotation)) r++;
    return r;
  }

  function addGarbage(count) {
    for (let i = 0; i < count; i++) {
      grid.shift(); // remove top row
      const row = Array(COLS).fill(1);
      const hole = Math.floor(Math.random() * COLS);
      row[hole] = 0;
      grid.push(row);
    }
    // Push current piece up if needed
    if (current) {
      while (!canPlace(current.row, current.col, current.type, current.rotation) && current.row > 0) {
        current.row--;
      }
    }
  }

  function lockPiece() {
    const cells = getCells(current);
    for (const [r, c] of cells) {
      if (r >= 0 && r < TOTAL_ROWS) grid[r][c] = 1;
    }

    // Check lock out
    if (cells.every(([r]) => r < BUFFER) && !mode.zen) {
      gameOverFlag = true;
      return;
    }

    // For invisible mode, copy to display grid then clear locked cells visually
    if (mode.invisible) {
      if (!displayGrid) displayGrid = Array.from({ length: TOTAL_ROWS }, () => Array(COLS).fill(0));
      // Display grid shows nothing (pieces vanish after locking)
    }

    // Check full rows
    const fullRows = [];
    for (let r = BUFFER; r < TOTAL_ROWS; r++) {
      if (grid[r].every(c => c !== 0)) fullRows.push(r);
    }

    if (fullRows.length > 0) {
      flashRows = fullRows;
      score += mode.onLineClear(fullRows.length, level);
      lines += fullRows.length;

      // Level up
      if (!mode.fixedLevel) {
        const lpl = mode.linesPerLevel || 10;
        const newLevel = Math.floor(lines / lpl) + 1;
        if (newLevel > level) level = newLevel;
      }

      // Sprint40 check
      if (mode.targetLines) {
        mode._linesLeft = Math.max(0, mode.targetLines - lines);
        if (mode._linesLeft <= 0) {
          setTimeout(() => {
            running = false;
            cancelAnimationFrame(animId);
            const elapsed = performance.now() - startTime;
            onGameOver({
              win: true,
              score,
              time: formatTime(elapsed),
              extra: `${lines} lines`,
            });
          }, 150);
        }
      }

      setTimeout(() => {
        fullRows.sort((a, b) => a - b);
        for (let i = fullRows.length - 1; i >= 0; i--) {
          grid.splice(fullRows[i], 1);
          grid.unshift(Array(COLS).fill(0));
        }
        flashRows = [];
        if (running) spawnPiece();
      }, 120);
    } else {
      spawnPiece();
    }
    updateScore();
  }

  function formatTime(ms) {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    return m > 0 ? `${m}:${String(s % 60).padStart(2, '0')}` : `${s}s`;
  }

  function updateScore() {
    let text = `${I18n.t('score')}: ${score}  LV${level}`;
    if (mode.targetLines) {
      const left = mode.targetLines - lines;
      text += `  ${Math.max(0, left)}left`;
    }
    onScore(text);
  }

  function update(now) {
    if (gameOverFlag) {
      running = false;
      cancelAnimationFrame(animId);
      const elapsed = performance.now() - startTime;
      onGameOver({
        score,
        extra: `${mode.name} / LV${level} / ${lines} lines`,
        time: formatTime(elapsed),
      });
      return;
    }

    if (flashRows.length > 0) return;

    const elapsed = now - startTime;

    // Timed modes
    if (mode.duration) {
      const remaining = Math.max(0, mode.duration - elapsed / 1000);
      if (remaining <= 0) {
        running = false;
        cancelAnimationFrame(animId);
        onGameOver({
          score,
          extra: `${mode.name} / ${lines} lines`,
          time: formatTime(mode.duration * 1000),
        });
        return;
      }
      // Show remaining time in header
      const secs = Math.ceil(remaining);
      const m = Math.floor(secs / 60);
      const s = secs % 60;
      let text = `${I18n.t('score')}: ${score}  ${m}:${String(s).padStart(2, '0')}`;
      onScore(text);
    }

    // Garbage mode
    if (mode.garbageInterval) {
      const garbageCount = Math.floor(elapsed / mode.garbageInterval);
      const lastCount = Math.floor(lastGarbageTime / mode.garbageInterval);
      if (garbageCount > lastCount) {
        addGarbage(1);
      }
      lastGarbageTime = elapsed;
    }

    const effectiveLevel = mode.fixedLevel || level;
    const dropInterval = SPEEDS[Math.min(effectiveLevel - 1, SPEEDS.length - 1)];
    const interval = softDropping ? 50 : dropInterval;

    if (now - lastDrop >= interval) {
      if (canPlace(current.row + 1, current.col, current.type, current.rotation)) {
        current.row++;
        if (softDropping) score++;
        lockTimer = null;
      } else {
        if (lockTimer === null) lockTimer = now;
      }
      lastDrop = now;
    }

    if (lockTimer !== null && now - lockTimer >= LOCK_DELAY) {
      if (!canPlace(current.row + 1, current.col, current.type, current.rotation)) {
        lockPiece();
      } else {
        lockTimer = null;
      }
    }
  }

  function draw(now) {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, H);

    const boardX = cellSize * 5;

    // Grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 0.5;
    for (let r = 0; r <= ROWS; r++) {
      ctx.beginPath();
      ctx.moveTo(boardX, r * cellSize);
      ctx.lineTo(boardX + COLS * cellSize, r * cellSize);
      ctx.stroke();
    }
    for (let c = 0; c <= COLS; c++) {
      ctx.beginPath();
      ctx.moveTo(boardX + c * cellSize, 0);
      ctx.lineTo(boardX + c * cellSize, H);
      ctx.stroke();
    }

    // Locked pieces (invisible mode: don't show)
    if (!mode.invisible) {
      for (let r = BUFFER; r < TOTAL_ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          if (!grid[r][c]) continue;
          const vr = r - BUFFER;
          const flash = flashRows.includes(r);
          ctx.fillStyle = flash ? 'rgba(255,255,255,0.7)' : '#fff';
          ctx.fillRect(boardX + c * cellSize + 1, vr * cellSize + 1, cellSize - 2, cellSize - 2);
        }
      }
    }

    if (current && flashRows.length === 0) {
      // Ghost
      const ghostRow = getGhostRow();
      const ghostCells = SHAPES[current.type][current.rotation];
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.lineWidth = 1;
      for (const [cr, cc] of ghostCells) {
        const vr = ghostRow + cr - BUFFER;
        if (vr < 0) continue;
        ctx.strokeRect(boardX + (current.col + cc) * cellSize + 1, vr * cellSize + 1, cellSize - 2, cellSize - 2);
      }

      // Current piece
      const cells = getCells(current);
      ctx.fillStyle = '#fff';
      for (const [r, c] of cells) {
        const vr = r - BUFFER;
        if (vr < 0) continue;
        ctx.fillRect(boardX + c * cellSize + 1, vr * cellSize + 1, cellSize - 2, cellSize - 2);
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.strokeRect(boardX + c * cellSize + 1, vr * cellSize + 1, cellSize - 2, cellSize - 2);
      }
    }

    // Hold panel
    const previewSize = Math.floor(cellSize * 0.7);
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = `${Math.max(10, cellSize * 0.45)}px 'Courier New', monospace`;
    ctx.fillText('HOLD', 4, cellSize * 0.7);

    if (holdType) {
      drawMiniPiece(holdType, cellSize * 0.5, cellSize * 1.2, previewSize, holdUsed ? 0.3 : 1);
    }

    // Next panel
    const nextX = boardX + COLS * cellSize + 8;
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.fillText('NEXT', nextX, cellSize * 0.7);

    for (let i = 0; i < Math.min(3, nextQueue.length); i++) {
      drawMiniPiece(nextQueue[i], nextX, cellSize * 1.2 + i * cellSize * 3, previewSize, 1);
    }

    // Info panel (left bottom)
    const infoY = H - cellSize * 4;
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.fillText(`LV ${level}`, 4, infoY);
    ctx.fillText(`${lines} lines`, 4, infoY + cellSize * 0.8);
    ctx.fillText(mode.name, 4, infoY + cellSize * 1.6);

    // Sprint40: show lines left
    if (mode.targetLines) {
      const left = Math.max(0, mode.targetLines - lines);
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.fillText(`${left} left`, 4, infoY + cellSize * 2.4);
    }
  }

  function drawMiniPiece(type, x, y, size, alpha) {
    const cells = SHAPES[type][0];
    const minR = Math.min(...cells.map(c => c[0]));
    const maxR = Math.max(...cells.map(c => c[0]));
    const minC = Math.min(...cells.map(c => c[1]));
    const maxC = Math.max(...cells.map(c => c[1]));
    const h = maxR - minR + 1, w = maxC - minC + 1;
    const ox = x + (4 * size - w * size) / 2;
    const oy = y + (2 * size - h * size) / 2;

    ctx.fillStyle = `rgba(255,255,255,${alpha})`;
    for (const [cr, cc] of cells) {
      ctx.fillRect(ox + (cc - minC) * size + 1, oy + (cr - minR) * size + 1, size - 2, size - 2);
    }
  }

  function loop(ts) {
    if (!running) return;
    update(ts);
    if (running) {
      draw(ts);
      animId = requestAnimationFrame(loop);
    }
  }

  function setupControls() {
    controls.innerHTML = `
      <button class="ctrl-btn" id="t-left">←</button>
      <button class="ctrl-btn" id="t-down">↓</button>
      <button class="ctrl-btn" id="t-right">→</button>
      <div class="ctrl-spacer"></div>
      <button class="ctrl-btn" id="t-rot">↻</button>
      <button class="ctrl-btn" id="t-drop">⤓</button>
      <button class="ctrl-btn" id="t-hold">H</button>
    `;

    Input.setupTouchBtn(document.getElementById('t-left'), v => { if (v) move(0, -1); });
    Input.setupTouchBtn(document.getElementById('t-right'), v => { if (v) move(0, 1); });
    Input.setupTouchBtn(document.getElementById('t-down'), v => { softDropping = v; });
    Input.setupTouchBtn(document.getElementById('t-rot'), v => { if (v) rotate(1); });
    Input.setupTouchBtn(document.getElementById('t-drop'), v => { if (v) hardDrop(); });
    Input.setupTouchBtn(document.getElementById('t-hold'), v => { if (v) doHold(); });

    Input.on('keydown', (key, e) => {
      if (gameOverFlag || flashRows.length > 0) return;
      switch (key) {
        case 'ArrowLeft': case 'a': move(0, -1); break;
        case 'ArrowRight': case 'd': move(0, 1); break;
        case 'ArrowDown': case 's': softDropping = true; break;
        case 'ArrowUp': case 'w': rotate(1); break;
        case ' ': e.preventDefault(); hardDrop(); break;
        case 'z': rotate(-1); break;
        case 'x': rotate(1); break;
        case 'c': case 'Shift': doHold(); break;
      }
    });

    Input.on('keyup', (key) => {
      if (key === 'ArrowDown' || key === 's') softDropping = false;
    });
  }

  return {
    lastOptions: options,
    start() {
      initGame();
      setupControls();
      running = true;
      animId = requestAnimationFrame(loop);
    },
    destroy() {
      running = false;
      cancelAnimationFrame(animId);
      Input.clearAll();
    }
  };
});
