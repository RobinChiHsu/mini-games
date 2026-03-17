const I18n = (() => {
  const dict = {
    'zh-TW': {
      game_downstairs: '下樓梯',
      game_doodle: 'Doodle Jump',
      game_upstairs: '上樓梯',
      game_minesweeper: '踩地雷',
      game_over: 'GAME OVER',
      retry: '再玩一次',
      back_to_hub: '回大廳',
      back: '返回',
      select_difficulty: '選擇難度',
      easy: '簡單 (9×9)',
      medium: '中等 (16×16)',
      hard: '困難 (30×16)',
      score: '分數',
      time: '時間',
      best: '最佳',
      mines: '地雷',
      flags: '旗標',
      flag_mode: '🚩 插旗模式',
      dig_mode: '⛏ 挖掘模式',
      you_win: 'YOU WIN!',
      new_record: '新紀錄！',
      floor: '樓層',
      height: '高度',
      game_tetris: '俄羅斯方塊',
      select_mode: '選擇模式',
      mode_classic: '經典',
      mode_marathon: '馬拉松',
      mode_timeattack: '限時挑戰',
      mode_sprint40: '40 行衝刺',
      mode_garbage: '垃圾行',
      mode_invisible: '隱形',
      mode_zen: '禪修',
      mode_ultra: '極速衝刺',
    },
    en: {
      game_downstairs: 'Downstairs',
      game_doodle: 'Doodle Jump',
      game_upstairs: 'Upstairs',
      game_minesweeper: 'Minesweeper',
      game_over: 'GAME OVER',
      retry: 'PLAY AGAIN',
      back_to_hub: 'BACK TO HUB',
      back: 'BACK',
      select_difficulty: 'SELECT DIFFICULTY',
      easy: 'EASY (9×9)',
      medium: 'MEDIUM (16×16)',
      hard: 'HARD (30×16)',
      score: 'SCORE',
      time: 'TIME',
      best: 'BEST',
      mines: 'MINES',
      flags: 'FLAGS',
      flag_mode: '🚩 FLAG',
      dig_mode: '⛏ DIG',
      you_win: 'YOU WIN!',
      new_record: 'NEW RECORD!',
      floor: 'FLOOR',
      height: 'HEIGHT',
      game_tetris: 'Tetris',
      select_mode: 'SELECT MODE',
      mode_classic: 'CLASSIC',
      mode_marathon: 'MARATHON',
      mode_timeattack: 'TIME ATTACK',
      mode_sprint40: '40 LINES',
      mode_garbage: 'GARBAGE',
      mode_invisible: 'INVISIBLE',
      mode_zen: 'ZEN',
      mode_ultra: 'ULTRA',
    }
  };

  let lang = localStorage.getItem('mg-lang') || 'zh-TW';

  function t(key) {
    return (dict[lang] && dict[lang][key]) || (dict['zh-TW'][key]) || key;
  }

  function setLang(l) {
    lang = l;
    localStorage.setItem('mg-lang', lang);
    applyAll();
  }

  function toggleLang() {
    setLang(lang === 'zh-TW' ? 'en' : 'zh-TW');
  }

  function getLang() { return lang; }

  function applyAll() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      el.textContent = t(el.dataset.i18n);
    });
  }

  return { t, setLang, toggleLang, getLang, applyAll };
})();
