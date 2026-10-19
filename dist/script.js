(() => {
  'use strict';
  const config = window.ASTRO_CONFIG || {};
  const all = (selector, cb) => document.querySelectorAll(selector).forEach(cb);
  const text = (selector, value) => all(selector, el => { el.textContent = value; });
  const safeUrl = value => {
    if (typeof value !== 'string' || !value.trim()) return null;
    try {
      const url = new URL(value, location.href);
      return url.protocol === 'https:' || (url.protocol === 'http:' && url.origin === location.origin) ? url.href : null;
    } catch { return null; }
  };
  const phoneNumber = value => {
    const phone = typeof value === 'string' ? value.replace(/[^+\d]/g, '') : '';
    return /^\+?\d{7,15}$/.test(phone) ? phone : null;
  };
  const emailAddress = value => typeof value === 'string' && /^[^@\s<>]+@[^@\s<>]+\.[^@\s<>]+$/.test(value) ? value : null;
  if (Number.isSafeInteger(config.metrikaId) && config.metrikaId > 0) {
    window.ym = window.ym || function () { (window.ym.a = window.ym.a || []).push(arguments); };
    window.ym.l = Date.now();
    const analytics = document.createElement('script');
    analytics.async = true;
    analytics.src = 'https://mc.yandex.ru/metrika/tag.js';
    document.head.append(analytics);
    window.ym(config.metrikaId, 'init', { clickmap: true, trackLinks: true, accurateTrackBounce: true });
  }
  const track = (name, params = {}) => {
    window.dispatchEvent(new CustomEvent('astro:goal', { detail: { name, ...params } }));
    if (config.metrikaId && typeof window.ym === 'function') window.ym(config.metrikaId, 'reachGoal', name, params);
  };
  const toast = document.querySelector('.toast');
  let toastTimer;
  const notify = message => {
    clearTimeout(toastTimer);
    toast.querySelector('.toast-text').textContent = message;
    toast.hidden = false;
    toastTimer = setTimeout(() => { toast.hidden = true; }, 6500);
  };
  toast.querySelector('button').addEventListener('click', () => { clearTimeout(toastTimer); toast.hidden = true; });
  text('[data-phone]', config.phoneDisplay || '+7 (000) 000-00-00');
  text('[data-driver-phone]', config.driverContact?.phoneDisplay || '+7 (000) 000-00-01');
  text('[data-driver-email]', config.driverContact?.emailDisplay || config.driverContact?.email || 'drivers@example.com');
  text('[data-address]', config.address || 'ул. Примерная, д. 00');
  text('[data-email]', config.emailDisplay || config.email || 'hello@example.com');
  text('[data-year]', new Date().getFullYear());
  if (phoneNumber(config.phone)) all('.contact-placeholder', el => { el.hidden = true; });
  if (config.companyDetails) text('[data-company]', config.companyDetails);

  const tariffList = document.querySelector('[data-tariff-list]');
  const tariffs = Array.isArray(config.tariffs) ? config.tariffs.filter(item => item && typeof item.name === 'string').slice(0, 3) : [];
  const priceText = value => typeof value === 'number' && Number.isFinite(value) && value >= 0 ? new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 }).format(value) : '—';
  if (tariffs.length) {
    const template = tariffList.firstElementChild.cloneNode(true);
    tariffList.replaceChildren();
    tariffList.classList.toggle('multiple', tariffs.length > 1);
    tariffs.forEach((tariff, index) => {
      const card = template.cloneNode(true);
      card.querySelector('.tariff-badge').textContent = 'ТАРИФ ' + String(index + 1).padStart(2, '0');
      card.querySelector('h3').textContent = tariff.name;
      card.querySelector('.tariff-description').textContent = tariff.description || 'Уточните условия при заказе.';
      ['boarding', 'perKm', 'perMinute'].forEach((key, i) => {
        const cell = card.querySelectorAll('dd')[i];
        const unit = cell.querySelector('span');
        cell.replaceChildren(document.createTextNode(priceText(tariff[key]) + ' '), unit);
      });
      card.querySelector('.tariff-note').textContent = tariff.note || 'Подробные условия уточняйте при заказе.';
      tariffList.append(card);
    });
    text('.tariff-disclaimer', 'Стоимость поездки зависит от маршрута и дополнительных условий. Итоговую сумму уточняйте при заказе.');
  }
  const app = config.passenger || {};
  const apkUrl = safeUrl(app.apk) || safeUrl(app.android);
  const rustoreUrl = safeUrl(app.rustore);
  all('[data-rustore]', el => { el.hidden = !rustoreUrl; });
  if (apkUrl) text('[data-app-note]', 'Android · APK. Скачивайте приложение по кнопке или QR-коду.');
  const qrTarget = apkUrl || safeUrl(app.universal) || (safeUrl(config.siteUrl) ? new URL('#passengers', config.siteUrl).href : location.href.split('#')[0] + '#passengers');
  if (typeof window.qrcode === 'function') {
    const qr = window.qrcode(0, 'M');
    qr.addData(qrTarget); qr.make();
    const holder = document.querySelector('[data-qr]');
    holder.innerHTML = qr.createSvgTag({ cellSize: 3, margin: 12, scalable: true });
    holder.querySelector('svg').setAttribute('aria-hidden', 'true');
    if (apkUrl || safeUrl(app.universal)) {
      holder.setAttribute('aria-label', 'QR-код со ссылкой на пассажирское приложение');
      text('[data-qr-caption]', 'Наведите камеру телефона на QR-код, чтобы перейти к приложению.');
      text('[data-qr-label]', 'Ссылка на приложение');
    }
  }
  const shots = Array.isArray(config.screenshots) ? config.screenshots.filter(item => item && safeUrl(item.src)).slice(0, 3) : [];
  if (shots.length) {
    const gallery = document.querySelector('[data-screenshots]');
    gallery.replaceChildren();
    text('.screenshots-heading p', 'Посмотрите, как выглядит пассажирское приложение.');
    shots.forEach((shot, index) => {
      const figure = document.createElement('figure');
      figure.className = 'screenshot-item';
      const image = document.createElement('img');
      image.src = safeUrl(shot.src);
      image.alt = shot.alt || 'Экран пассажирского приложения ' + (index + 1);
      image.loading = 'lazy'; image.decoding = 'async';
      const caption = document.createElement('figcaption');
      caption.textContent = shot.alt || 'Экран приложения ' + (index + 1);
      figure.append(image, caption); gallery.append(figure);
    });
    gallery.style.gridTemplateColumns = 'repeat(' + shots.length + ', minmax(0, 1fr))';
  }
  const mapUrl = safeUrl(config.officeMapUrl);
  if (mapUrl) {
    const map = document.querySelector('[data-office-map]');
    const frame = document.createElement('iframe');
    frame.src = mapUrl; frame.title = 'Карта расположения офиса Астро-Волга Такси';
    frame.loading = 'lazy'; frame.referrerPolicy = 'no-referrer';
    map.append(frame); map.hidden = false;
  }
  const popup = document.querySelector('.app-popup');
  const dismissalKey = 'astro-taxi-popup-dismissed-v2';
  let popupDismissed = false;
  try { popupDismissed = sessionStorage.getItem(dismissalKey) === '1'; } catch { /* Optional storage. */ }
  const dismissPopup = () => {
    if (popup.open) popup.close();
    popupDismissed = true;
    try { sessionStorage.setItem(dismissalKey, '1'); } catch { /* Optional storage. */ }
  };
  all('[data-close-popup]', el => el.addEventListener('click', dismissPopup));
  popup.addEventListener('cancel', dismissPopup);
  popup.addEventListener('click', event => {
    if (event.target !== popup) return;
    const box = popup.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dismissPopup();
  });
  const showPopup = () => {
    if (popupDismissed || config.popupEnabled === false) return;
    if (document.hidden) { setTimeout(showPopup, 5000); return; }
    if (typeof popup.showModal === 'function') { popup.showModal(); track('app_popup_view'); }
  };
  if (!popupDismissed && config.popupEnabled !== false) setTimeout(showPopup, Number.isFinite(config.popupDelayMs) && config.popupDelayMs >= 0 ? config.popupDelayMs : 30000);

  all('[data-action]', button => button.addEventListener('click', () => {
    const action = button.dataset.action;
    const channel = button.dataset.channel || 'passenger';
    const position = button.dataset.position || (button.closest('header') ? 'header' : 'page');
    if (button.closest('.app-popup')) dismissPopup();
    if (action === 'call') {
      const phone = phoneNumber(channel === 'driver' ? config.driverContact?.phone : config.phone);
      if (!phone) { notify(channel === 'driver' ? 'Контакт отдела подключения водителей будет добавлен перед запуском.' : 'Номер службы появится перед запуском. Сейчас здесь демонстрационный контакт.'); return; }
      track('phone_click', { position, channel }); location.href = 'tel:' + phone; return;
    }
    if (action === 'email') {
      const email = emailAddress(channel === 'driver' ? config.driverContact?.email : config.email);
      if (!email) { notify('Адрес электронной почты будет добавлен перед запуском сайта.'); return; }
      track('email_click', { channel }); location.href = 'mailto:' + email; return;
    }
    if (action === 'privacy' || action === 'agreement') {
      const url = safeUrl(action === 'privacy' ? config.privacyUrl : config.agreementUrl);
      if (url) window.open(url, '_blank', 'noopener,noreferrer');
      else notify(action === 'privacy' ? 'Утверждённая политика конфиденциальности будет добавлена перед запуском.' : 'Пользовательское соглашение будет добавлено после предоставления документа.');
      return;
    }
    if (action === 'messenger') {
      const url = safeUrl(config.messengers?.[button.dataset.platform]);
      if (!url) { notify('Контакт в мессенджере будет добавлен перед запуском.'); return; }
      track('messenger_click', { platform: button.dataset.platform });
      window.open(url, '_blank', 'noopener,noreferrer'); return;
    }
    if (action !== 'passenger' && action !== 'driver') return;
    const links = config[action] || {};
    const platform = button.dataset.platform || (/iPhone|iPad|iPod/.test(navigator.userAgent) ? 'ios' : 'apk');
    const url = safeUrl(links[platform]) || (platform === 'apk' ? safeUrl(links.android) : null) || safeUrl(links.universal);
    if (!url) {
      notify(action === 'driver' ? 'Приложение для водителей будет добавлено позже. Скачивание пока недоступно.' : 'Файл пассажирского приложения будет добавлен позже. Скачивание пока недоступно.');
      return;
    }
    track(action === 'driver' ? 'driver_app_click' : 'passenger_app_click', { platform, position });
    if (platform === 'apk') {
      track('apk_download_click', { audience: action, position });
      const link = document.createElement('a');
      link.href = url; link.download = action === 'driver' ? 'astro-volga-driver.apk' : 'astro-volga-taxi.apk'; link.rel = 'noopener';
      document.body.append(link); link.click(); link.remove();
    } else window.open(url, '_blank', 'noopener,noreferrer');
  }));
  const menu = document.querySelector('.mobile-nav');
  const toggle = document.querySelector('.menu-toggle');
  const closeMenu = () => { menu.hidden = true; toggle.setAttribute('aria-expanded', 'false'); toggle.setAttribute('aria-label', 'Открыть меню'); };
  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    menu.hidden = expanded; toggle.setAttribute('aria-expanded', String(!expanded)); toggle.setAttribute('aria-label', expanded ? 'Открыть меню' : 'Закрыть меню');
  });
  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => { if (event.key === 'Escape') { toast.hidden = true; closeMenu(); } });
  document.querySelectorAll('.faq-list details').forEach(details => details.addEventListener('toggle', () => {
    if (details.open) document.querySelectorAll('.faq-list details').forEach(other => { if (other !== details) other.open = false; });
  }));
  if ('IntersectionObserver' in window) {
    const fixed = document.querySelector('.desktop-action-bar');
    new IntersectionObserver(entries => { fixed.classList.toggle('active', !entries[0].isIntersecting); }).observe(document.querySelector('.hero'));
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.body.classList.add('motion-ready');
      const observer = new IntersectionObserver(entries => entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
      }), { threshold: 0.1 });
      all('.reveal', el => observer.observe(el));
    }
  }
  const siteUrl = safeUrl(config.siteUrl) || location.href.split('#')[0];
  const provider = { '@type': 'Organization', name: 'Астро-Волга Такси', url: siteUrl };
  if (phoneNumber(config.phone)) provider.telephone = phoneNumber(config.phone);
  if (emailAddress(config.email)) provider.email = config.email;
  const graph = [
    { '@type': 'TaxiService', name: 'Астро-Волга Такси', url: siteUrl, areaServed: { '@type': 'City', name: 'Луганск' }, provider },
    { '@type': 'FAQPage', mainEntity: [...document.querySelectorAll('.faq-list details')].map(details => ({ '@type': 'Question', name: details.querySelector('summary').textContent.trim(), acceptedAnswer: { '@type': 'Answer', text: details.querySelector('.faq-answer').textContent.trim() } })) },
  ];
  const structured = document.createElement('script');
  structured.type = 'application/ld+json';
  structured.textContent = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph });
  document.head.append(structured);
})();
