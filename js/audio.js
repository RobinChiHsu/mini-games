const Audio = (() => {
  let ctx = null;
  let enabled = Storage.getSetting('sound', true);

  function getCtx() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    return ctx;
  }

  function play(freq, duration, type) {
    if (!enabled) return;
    try {
      const c = getCtx();
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = type || 'square';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.08, c.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
      osc.connect(gain);
      gain.connect(c.destination);
      osc.start(c.currentTime);
      osc.stop(c.currentTime + duration);
    } catch {}
  }

  function jump() { play(440, 0.1, 'square'); }
  function land() { play(220, 0.08, 'triangle'); }
  function score() { play(660, 0.12, 'square'); }
  function lose() {
    play(200, 0.3, 'sawtooth');
    setTimeout(() => play(150, 0.4, 'sawtooth'), 150);
  }
  function win() {
    play(523, 0.1); setTimeout(() => play(659, 0.1), 100);
    setTimeout(() => play(784, 0.2), 200);
  }
  function click() { play(800, 0.05, 'square'); }
  function flag() { play(500, 0.08, 'triangle'); }
  function boom() { play(100, 0.5, 'sawtooth'); }
  function reveal() { play(600, 0.04, 'sine'); }

  function toggle() {
    enabled = !enabled;
    Storage.setSetting('sound', enabled);
    return enabled;
  }

  function isEnabled() { return enabled; }

  return { jump, land, score, lose, win, click, flag, boom, reveal, toggle, isEnabled };
})();
