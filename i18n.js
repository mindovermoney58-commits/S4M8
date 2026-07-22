// =============================================================
// Shared EN/RU language layer for the dashboard pages.
//
// Usage per page:
//   <script> window.I18N_DICT = { en: {...}, ru: {...} }; </script>
//   <script src="i18n.js" defer></script>
//
// - Static text is tagged with data-i18n / data-i18n-ph (placeholder).
// - Dynamic strings call window.__t('key').
// - The current language is stored in localStorage 'dash_lang' and is
//   shared by every page (index.html has its own inline copy of this
//   logic using the same key).
// - A floating EN/RU button is injected unless the page already has a
//   #langToggle element of its own.
// - On switch a 'lang-changed' event fires so pages can re-render
//   dynamic content.
// =============================================================
(function () {
  'use strict';
  const KEY = 'dash_lang';
  let lang = localStorage.getItem(KEY);
  if (lang !== 'en' && lang !== 'ru') lang = 'en';

  const dicts = window.I18N_DICT || { en: {}, ru: {} };
  window.__t = function (k) {
    return (dicts[lang] && dicts[lang][k]) || (dicts.en && dicts.en[k]) || k;
  };
  window.__lang = function () { return lang; };

  function apply() {
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach(el => {
      el.textContent = window.__t(el.getAttribute('data-i18n'));
    });
    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
      el.placeholder = window.__t(el.getAttribute('data-i18n-ph'));
    });
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      el.title = window.__t(el.getAttribute('data-i18n-title'));
    });
    const b = document.getElementById('langToggle');
    if (b) b.textContent = lang === 'en' ? 'RU' : 'EN';
    window.dispatchEvent(new CustomEvent('lang-changed'));
  }
  window.__i18nApply = apply;

  function injectButton() {
    if (document.getElementById('langToggle')) return;
    const b = document.createElement('button');
    b.id = 'langToggle';
    b.type = 'button';
    b.setAttribute('aria-label', 'Language');
    b.style.cssText =
      'position:fixed;top:calc(env(safe-area-inset-top,0px) + 10px);right:14px;z-index:300;' +
      'padding:8px 12px;border-radius:10px;border:1px solid rgba(255,255,255,0.14);' +
      'background:rgba(20,20,22,0.78);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);' +
      'color:#EAEAEA;font-family:inherit;font-size:12px;font-weight:700;letter-spacing:0.06em;cursor:pointer';
    document.body.appendChild(b);
  }

  document.addEventListener('click', (e) => {
    const t = e.target && e.target.closest && e.target.closest('#langToggle');
    if (!t) return;
    lang = lang === 'en' ? 'ru' : 'en';
    localStorage.setItem(KEY, lang);
    apply();
  });

  function boot() {
    injectButton();
    apply();
    // Mirror the language choice across devices ('prefs' row). Skip when
    // embedded — the parent page owns sync in that case.
    try { if (window.self !== window.top) return; } catch (e) { return; }
    if (typeof window.initCloudSync === 'function') {
      window.initCloudSync({
        appKey: 'prefs',
        syncedKeys: [KEY],
        onApplied: function () {
          lang = localStorage.getItem(KEY);
          if (lang !== 'en' && lang !== 'ru') lang = 'en';
          apply();
        }
      });
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
