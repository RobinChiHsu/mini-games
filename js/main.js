(() => {
  const screens = {
    hub: document.getElementById('screen-hub'),
    game: document.getElementById('screen-game'),
    gameover: document.getElementById('screen-gameover'),
    difficulty: document.getElementById('screen-difficulty'),
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
      html += `<div class="highlight">${stats.score}</div>`;
      if (stats.label) html += `<div>${stats.label}</div>`;
      if (isNew) html += `<div>${I18n.t('new_record')}</div>`;
    }
    if (stats.time !== undefined) {
      html += `<div>${I18n.t('time')}: ${stats.time}</div>`;
    }
    if (stats.extra) html += `<div>${stats.extra}</div>`;

    statsEl.innerHTML = html;
    showScreen('gameover');
  }

  function init() {
    I18n.applyAll();

    // Game cards
    document.querySelectorAll('.game-card').forEach(card => {
      card.addEventListener('click', () => {
        Audio.click();
        const id = card.dataset.game;
        if (id === 'minesweeper') {
          showScreen('difficulty');
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
      if (currentGame === 'minesweeper') {
        startGame(currentGame, gameInstance ? gameInstance.lastOptions : {});
      } else {
        startGame(currentGame);
      }
    });

    document.getElementById('btn-hub').addEventListener('click', () => {
      Audio.click();
      showScreen('hub');
    });

    // Footer buttons
    document.getElementById('btn-lang').addEventListener('click', () => {
      Audio.click();
      I18n.toggleLang();
    });

    document.getElementById('btn-sound').addEventListener('click', () => {
      const on = Audio.toggle();
      document.getElementById('btn-sound').textContent = on ? '🔊' : '🔇';
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

  document.addEventListener('DOMContentLoaded', init);

  App.startGame = startGame;
  App.showScreen = showScreen;
})();
