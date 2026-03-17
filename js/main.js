(() => {
  const screens = {
    hub: document.getElementById('screen-hub'),
    game: document.getElementById('screen-game'),
    gameover: document.getElementById('screen-gameover'),
    difficulty: document.getElementById('screen-difficulty'),
    tetrisMode: document.getElementById('screen-tetris-mode'),
  };

  const games = App._games;
  let currentGame = null;
  let gameInstance = null;

  function showScreen(name) {
    Object.values(screens).forEach(s => s.classList.remove('active'));
    screens[name].classList.add('active');
  }

  function startGame(id, options) {
    currentGame = id;
    const canvas = document.getElementById('game-canvas');
    const area = document.getElementById('game-area');
    const controls = document.getElementById('game-controls');
    const scoreEl = document.getElementById('game-score');
    const titleEl = document.getElementById('game-title');

    const i18nKey = { 'doodle-jump': 'game_doodle' }[id] || 'game_' + id.replace(/-/g, '_');
    titleEl.textContent = I18n.t(i18nKey);
    scoreEl.textContent = '';
    controls.innerHTML = '';

    Input.clearAll();

    if (gameInstance && gameInstance.destroy) {
      gameInstance.destroy();
    }

    showScreen('game');

    gameInstance = games[id]({
      canvas,
      area,
      controls,
      scoreEl,
      options,
      onGameOver: (stats) => showGameOver(stats),
      onScore: (text) => { scoreEl.textContent = text; },
    });

    if (gameInstance.start) gameInstance.start();
  }

  function showGameOver(stats) {
    Input.clearAll();
    const statsEl = document.getElementById('gameover-stats');

    let html = '';
    if (stats.win) {
      document.querySelector('.gameover-title').textContent = I18n.t('you_win');
      Audio.win();
    } else {
      document.querySelector('.gameover-title').textContent = I18n.t('game_over');
      Audio.lose();
    }

    if (stats.score !== undefined) {
      const isNew = Storage.saveScore(currentGame + (stats.difficulty || ''), stats.score);
      html += `<div class="gameover-stats">
                <span class="label">${I18n.t('score')}</span>
                <span class="highlight">${stats.score}</span>
              </div>`;
      if (stats.label) html += `<div class="label">${stats.label}</div>`;
      if (isNew) html += `<div class="accent" style="color: var(--accent-primary); font-weight: 700;">${I18n.t('new_record')}!</div>`;
    }
    if (stats.time !== undefined) {
      html += `<div class="label">${I18n.t('time')}: ${stats.time}</div>`;
    }
    if (stats.extra) html += `<div class="label">${stats.extra}</div>`;

    statsEl.innerHTML = html;
    showScreen('gameover');
  }

  function init() {
    I18n.applyAll();
    Icons.renderAll();

    // Game cards with tilt effect
    document.querySelectorAll('.game-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (y - centerY) / 10;
        const rotateY = (centerX - x) / 10;
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px) scale(1.02)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });

      card.addEventListener('click', () => {
        Audio.click();
        const id = card.dataset.game;
        if (id === 'minesweeper') {
          showScreen('difficulty');
        } else if (id === 'tetris') {
          showScreen('tetrisMode');
        } else {
          startGame(id);
        }
      });
    });

    // Difficulty selection (minesweeper)
    document.querySelectorAll('[data-difficulty]').forEach(btn => {
      btn.addEventListener('click', () => {
        Audio.click();
        startGame('minesweeper', { difficulty: btn.dataset.difficulty });
      });
    });

    document.getElementById('btn-diff-back').addEventListener('click', () => {
      Audio.click();
      showScreen('hub');
    });

    // Tetris mode selection
    let lastTetrisMode = 'classic';
    document.querySelectorAll('[data-tmode]').forEach(btn => {
      btn.addEventListener('click', () => {
        Audio.click();
        lastTetrisMode = btn.dataset.tmode;
        startGame('tetris', { mode: btn.dataset.tmode });
      });
    });

    document.getElementById('btn-tmode-back').addEventListener('click', () => {
      Audio.click();
      showScreen('hub');
    });

    // Back button
    document.getElementById('btn-back').addEventListener('click', () => {
      Audio.click();
      if (gameInstance && gameInstance.destroy) gameInstance.destroy();
      gameInstance = null;
      Input.clearAll();
      showScreen('hub');
    });

    // Game over buttons
    document.getElementById('btn-retry').addEventListener('click', () => {
      Audio.click();
      if (gameInstance && gameInstance.lastOptions) {
        startGame(currentGame, gameInstance.lastOptions);
      } else {
        startGame(currentGame);
      }
    });

    document.getElementById('btn-hub').addEventListener('click', () => {
      Audio.click();
      showScreen('hub');
    });

    // Footer buttons
    const langBtn = document.getElementById('btn-lang');
    function updateLangBtn() {
      langBtn.textContent = I18n.getLang() === 'zh-TW' ? '中' : 'EN';
    }
    updateLangBtn();
    langBtn.addEventListener('click', () => {
      Audio.click();
      I18n.toggleLang();
      updateLangBtn();
      Icons.renderAll();
    });

    document.getElementById('btn-sound').addEventListener('click', () => {
      const on = Audio.toggle();
      document.getElementById('btn-sound').textContent = on ? '♪' : '✕';
      document.getElementById('btn-sound').classList.toggle('muted', !on);
    });

    // PWA install
    let deferredPrompt = null;
    window.addEventListener('beforeinstallprompt', e => {
      e.preventDefault();
      deferredPrompt = e;
    });

    // Register SW
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  App.startGame = startGame;
  App.showScreen = showScreen;
})();
