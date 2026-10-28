(function () {
  var root = document.documentElement;
  var saved, cached;
  try {
    saved = localStorage.getItem('kyrnforge_theme');
    cached = JSON.parse(localStorage.getItem('kyrnforge_appearance') || 'null') || {};
  } catch (e) {
    cached = {};
  }
  if (!root.dataset.accent && cached.accent) root.dataset.accent = cached.accent;
  var fallback = root.dataset.defaultTheme || cached.theme;
  var theme = saved === 'light' || saved === 'dark' ? saved : fallback === 'light' || fallback === 'dark' ? fallback : null;
  if (!theme) theme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  root.dataset.theme = theme;

  var SUN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
  var MOON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401"/></svg>';

  document.addEventListener('DOMContentLoaded', function () {
    var button = document.getElementById('theme');
    if (!button) return;
    var paint = function () {
      var dark = root.dataset.theme === 'dark';
      button.innerHTML = dark ? SUN : MOON;
      button.setAttribute('aria-label', dark ? 'Usar tema claro' : 'Usar tema oscuro');
    };
    paint();
    button.addEventListener('click', function () {
      root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem('kyrnforge_theme', root.dataset.theme); } catch (e) {}
      paint();
    });
  });
})();
