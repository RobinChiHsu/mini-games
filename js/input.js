const Input = (() => {
  const keys = {};
  const callbacks = {};

  document.addEventListener('keydown', e => {
    keys[e.key] = true;
    if (callbacks.keydown) callbacks.keydown(e.key, e);
  });

  document.addEventListener('keyup', e => {
    keys[e.key] = false;
    if (callbacks.keyup) callbacks.keyup(e.key, e);
  });

  function isDown(key) { return !!keys[key]; }

  function on(event, cb) { callbacks[event] = cb; }
  function off(event) { delete callbacks[event]; }

  function clearAll() {
    Object.keys(keys).forEach(k => keys[k] = false);
    Object.keys(callbacks).forEach(k => delete callbacks[k]);
  }

  function setupTouchBtn(el, action) {
    if (!el) return;
    const start = () => { el.classList.add('pressed'); action(true); };
    const end = () => { el.classList.remove('pressed'); action(false); };
    el.addEventListener('touchstart', e => { e.preventDefault(); start(); }, { passive: false });
    el.addEventListener('touchend', e => { e.preventDefault(); end(); }, { passive: false });
    el.addEventListener('touchcancel', end);
    el.addEventListener('mousedown', start);
    el.addEventListener('mouseup', end);
    el.addEventListener('mouseleave', end);
  }

  return { isDown, on, off, clearAll, setupTouchBtn };
})();
