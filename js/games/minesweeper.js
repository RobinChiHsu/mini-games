App.registerGame('minesweeper', ({ canvas, area, controls, scoreEl, options, onGameOver, onScore }) => {
  const CONFIGS = {
    easy:   { rows: 9,  cols: 9,  mines: 10 },
    medium: { rows: 16, cols: 16, mines: 40 },
    hard:   { rows: 16, cols: 30, mines: 99 },
  };

  const diff = (options && options.difficulty) || 'easy';
  const config = CONFIGS[diff];
  const { rows, cols, mines } = config;

  let grid = [];       // 0-8 or -1 (mine)
  let revealed = [];
  let flagged = [];
  let gameOver = false;
  let firstClick = true;
  let flagMode = false;
  let startTime = 0;
  let timer = null;
  let revealedCount = 0;
  const totalSafe = rows * cols - mines;

  // Hide canvas, use DOM grid
  canvas.style.display = 'none';

  // Build grid container
  const container = document.createElement('div');
  container.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:0.5rem;width:100%;height:100%;justify-content:center;padding:0.5rem;';
  area.appendChild(container);

  // Info bar
  const infoBar = document.createElement('div');
  infoBar.className = 'mine-controls';
  container.appendChild(infoBar);

  const mineCounter = document.createElement('span');
  const timerEl = document.createElement('span');
  const toggleBtn = document.createElement('button');
  toggleBtn.className = 'mine-toggle';
  toggleBtn.textContent = I18n.t('flag_mode');
  toggleBtn.addEventListener('click', () => {
    flagMode = !flagMode;
    toggleBtn.textContent = flagMode ? I18n.t('dig_mode') : I18n.t('flag_mode');
    toggleBtn.classList.toggle('active', flagMode);
    Audio.click();
  });

  infoBar.appendChild(mineCounter);
  infoBar.appendChild(toggleBtn);
  infoBar.appendChild(timerEl);

  // Calculate cell size
  const maxW = area.clientWidth - 16;
  const maxH = area.clientHeight - 60;
  const cellSize = Math.min(Math.floor(maxW / cols), Math.floor(maxH / rows), 36);

  // Grid element
  const gridEl = document.createElement('div');
  gridEl.className = 'mine-grid';
  gridEl.style.gridTemplateColumns = `repeat(${cols}, ${cellSize}px)`;
  gridEl.style.gridTemplateRows = `repeat(${rows}, ${cellSize}px)`;
  container.appendChild(gridEl);

  // Create cells
  const cells = [];
  for (let r = 0; r < rows; r++) {
    grid[r] = [];
    revealed[r] = [];
    flagged[r] = [];
    cells[r] = [];
    for (let c = 0; c < cols; c++) {
      grid[r][c] = 0;
      revealed[r][c] = false;
      flagged[r][c] = false;

      const cell = document.createElement('div');
      cell.className = 'mine-cell hidden';
      cell.style.width = cellSize + 'px';
      cell.style.height = cellSize + 'px';
      cell.style.fontSize = Math.max(cellSize * 0.5, 10) + 'px';
      cell.dataset.r = r;
      cell.dataset.c = c;

      cell.addEventListener('click', () => handleClick(r, c));
      cell.addEventListener('contextmenu', e => {
        e.preventDefault();
        toggleFlag(r, c);
      });

      gridEl.appendChild(cell);
      cells[r][c] = cell;
    }
  }

  function placeMines(safeR, safeC) {
    let placed = 0;
    while (placed < mines) {
      const r = Math.floor(Math.random() * rows);
      const c = Math.floor(Math.random() * cols);
      if (grid[r][c] === -1) continue;
      if (Math.abs(r - safeR) <= 1 && Math.abs(c - safeC) <= 1) continue;
      grid[r][c] = -1;
      placed++;
    }
    // Calculate numbers
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (grid[r][c] === -1) continue;
        let count = 0;
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = r + dr, nc = c + dc;
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] === -1) count++;
          }
        }
        grid[r][c] = count;
      }
    }
  }

  function handleClick(r, c) {
    if (gameOver || revealed[r][c]) return;

    if (flagMode) {
      toggleFlag(r, c);
      return;
    }

    if (flagged[r][c]) return;

    if (firstClick) {
      firstClick = false;
      placeMines(r, c);
      startTime = Date.now();
      timer = setInterval(updateTimer, 1000);
    }

    if (grid[r][c] === -1) {
      // Hit mine
      gameOver = true;
      clearInterval(timer);
      revealAll();
      cells[r][c].classList.add('mine');
      Audio.boom();
      setTimeout(() => {
        onGameOver({
          score: revealedCount,
          time: formatTime(Date.now() - startTime),
          difficulty: '-' + diff,
          label: `${revealedCount}/${totalSafe}`,
        });
      }, 800);
      return;
    }

    reveal(r, c);
    Audio.reveal();
    checkWin();
  }

  function reveal(r, c) {
    if (r < 0 || r >= rows || c < 0 || c >= cols) return;
    if (revealed[r][c] || flagged[r][c]) return;

    revealed[r][c] = true;
    revealedCount++;
    const cell = cells[r][c];
    cell.classList.remove('hidden');
    cell.classList.add('revealed');

    if (grid[r][c] === 0) {
      cell.textContent = '';
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          reveal(r + dr, c + dc);
        }
      }
    } else {
      const span = document.createElement('span');
      span.className = 'n' + grid[r][c];
      span.textContent = grid[r][c];
      cell.appendChild(span);
    }
  }

  function toggleFlag(r, c) {
    if (gameOver || revealed[r][c]) return;
    if (firstClick) return;
    flagged[r][c] = !flagged[r][c];
    const cell = cells[r][c];
    if (flagged[r][c]) {
      cell.textContent = '🚩';
      cell.classList.add('flagged');
      Audio.flag();
    } else {
      cell.textContent = '';
      cell.classList.remove('flagged');
    }
    updateMineCounter();
  }

  function revealAll() {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (grid[r][c] === -1 && !flagged[r][c]) {
          cells[r][c].textContent = '💣';
          cells[r][c].classList.remove('hidden');
          cells[r][c].classList.add('revealed');
        }
      }
    }
  }

  function checkWin() {
    if (revealedCount === totalSafe) {
      gameOver = true;
      clearInterval(timer);
      const elapsed = Date.now() - startTime;
      Audio.win();
      setTimeout(() => {
        onGameOver({
          win: true,
          score: Math.max(0, Math.floor(999 - elapsed / 1000)),
          time: formatTime(elapsed),
          difficulty: '-' + diff,
        });
      }, 500);
    }
  }

  function updateMineCounter() {
    let flags = 0;
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++)
        if (flagged[r][c]) flags++;
    mineCounter.textContent = `💣 ${mines - flags}`;
  }

  function updateTimer() {
    timerEl.textContent = formatTime(Date.now() - startTime);
  }

  function formatTime(ms) {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    return m > 0 ? `${m}:${String(s % 60).padStart(2, '0')}` : `${s}s`;
  }

  updateMineCounter();
  timerEl.textContent = '0s';

  return {
    lastOptions: options,
    destroy() {
      clearInterval(timer);
      canvas.style.display = '';
      container.remove();
    }
  };
});
