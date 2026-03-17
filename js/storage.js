const Storage = (() => {
  const PREFIX = 'mg-';

  function getScores(game) {
    try {
      return JSON.parse(localStorage.getItem(PREFIX + game + '-scores')) || [];
    } catch { return []; }
  }

  function saveScore(game, score, extra) {
    const scores = getScores(game);
    scores.push({ score, date: Date.now(), ...extra });
    scores.sort((a, b) => b.score - a.score);
    scores.splice(10);
    localStorage.setItem(PREFIX + game + '-scores', JSON.stringify(scores));
    return scores[0].score === score && scores.filter(s => s.score === score).length === 1;
  }

  function getBest(game) {
    const scores = getScores(game);
    return scores.length ? scores[0].score : 0;
  }

  function getSetting(key, def) {
    try {
      const v = localStorage.getItem(PREFIX + key);
      return v !== null ? JSON.parse(v) : def;
    } catch { return def; }
  }

  function setSetting(key, val) {
    localStorage.setItem(PREFIX + key, JSON.stringify(val));
  }

  return { getScores, saveScore, getBest, getSetting, setSetting };
})();
