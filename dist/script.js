(() => {
  'use strict';
  const config = window.ASTRO_CONFIG || {};
  if (Number.isSafeInteger(config.metrikaId) && config.metrikaId > 0) {
    window.ym = window.ym || function () { (window.ym.a = window.ym.a || []).push(arguments); };
    window.ym.l = Date.now();
    const analytics = document.createElement('script');
    analytics.async = true;
    analytics.src = 'https://mc.yandex.ru/metrika/tag.js';
    document.head.append(analytics);
    window.ym(config.metrikaId, 'init', { clickmap: true, trackLinks: true, accurateTrackBounce: true });
  }
  const toast = document.querySelector('.toast');
  const toastText = toast.querySelector('.toast-text');
  let toastTimer;
  const notify = message => {
    clearTimeout(toastTimer);
    toastText.textContent = message;
    toast.hidden = false;
    toastTimer = setTimeout(() => { toast.hidden = true; }, 6500);
  };
  const track = (name, params) => {
    window.dispatchEvent(new CustomEvent('astro:goal', { detail: { name, ...params } }));
    if (config.metrikaId && typeof window.ym === 'function') window.ym(config.metrikaId, 'reachGoal', name, params);
  };
  const safeUrl = value => {
    if (!value) return null;
    try { const url = new URL(value); return url.protocol === 'https:' ? url.href : null; } catch { return null; }
  };
  document.querySelectorAll('[data-phone]').forEach(el => { el.textContent = config.phoneDisplay || '+7 (000) 000-00-00'; });
  document.querySelector('[data-address]').textContent = config.address || 'ул. Примерная, д. 00';
  document.querySelector('[data-email]').textContent = config.email || 'hello@example.com';
  document.querySelector('[data-year]').textContent = new Date().getFullYear();
  if (config.phone) document.querySelector('.contact-placeholder').hidden = true;
  document.querySelectorAll('[data-action]').forEach(button => button.addEventListener('click', () => {
    const action = button.dataset.action;
    if (action === 'call') {
      if (!config.phone) { notify('Номер службы появится перед запуском. Сейчас здесь демонстрационный контакт.'); return; }
      const phone = config.phone.replace(/[^+\d]/g, '');
      if (!/^\+?\d{7,15}$/.test(phone)) { notify('Контактный номер пока не настроен.'); return; }
      track('phone_click', { position: button.closest('header') ? 'header' : button.closest('footer') ? 'footer' : 'page' });
      window.location.href = `tel:${phone}`;
      return;
    }
    if (action === 'privacy') {
      const url = safeUrl(config.privacyUrl);
      if (url) window.open(url, '_blank', 'noopener,noreferrer');
      else notify('Политика конфиденциальности будет добавлена перед запуском сайта.');
      return;
    }
    const app = config[action] || {};
    const platform = button.dataset.platform || (/iPhone|iPad|iPod/.test(navigator.userAgent) ? 'ios' : 'android');
    const url = safeUrl(app[platform]) || safeUrl(app.universal);
    if (!url) {
      notify(action === 'driver' ? 'Ссылка на приложение для водителей появится позже. Скачивание пока недоступно.' : 'Ссылка на пассажирское приложение появится позже. Скачивание пока недоступно.');
      return;
    }
    track(action === 'driver' ? 'driver_app_click' : 'passenger_app_click', { platform, position: button.dataset.position || 'page' });
    window.open(url, '_blank', 'noopener,noreferrer');
  }));
  toast.querySelector('button').addEventListener('click', () => { clearTimeout(toastTimer); toast.hidden = true; });
  const menu = document.querySelector('.mobile-nav');
  const toggle = document.querySelector('.menu-toggle');
  const closeMenu = () => { menu.hidden = true; toggle.setAttribute('aria-expanded', 'false'); toggle.setAttribute('aria-label', 'Открыть меню'); };
  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    menu.hidden = expanded;
    toggle.setAttribute('aria-expanded', String(!expanded));
    toggle.setAttribute('aria-label', expanded ? 'Открыть меню' : 'Закрыть меню');
  });
  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') { toast.hidden = true; closeMenu(); }
  });
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window) {
    document.body.classList.add('motion-ready');
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
    }), { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  }
})();
