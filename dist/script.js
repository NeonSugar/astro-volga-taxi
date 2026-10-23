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
    const result = typeof value === 'string' ? value.replace(/[^+\d]/g, '') : '';
    return /^\+?\d{7,15}$/.test(result) ? result : null;
  };
  const emailAddress = value => typeof value === 'string' && /^[^@\s<>]+@[^@\s<>]+\.[^@\s<>]+$/.test(value) ? value : null;
  if (Number.isSafeInteger(config.metrikaId) && config.metrikaId > 0) {
    window.ym = window.ym || function () { (window.ym.a = window.ym.a || []).push(arguments); };
    window.ym.l = Date.now();
    const script = document.createElement('script');
    script.async = true; script.src = 'https://mc.yandex.ru/metrika/tag.js';
    document.head.append(script);
    window.ym(config.metrikaId, 'init', { clickmap: true, trackLinks: true, accurateTrackBounce: true });
  }
  const track = (name, params = {}) => {
    window.dispatchEvent(new CustomEvent('astro:goal', { detail: { name, ...params } }));
    if (config.metrikaId && typeof window.ym === 'function') window.ym(config.metrikaId, 'reachGoal', name, params);
  };
  const toast = document.querySelector('.toast');
  let toastTimer;
  const notify = message => {
    clearTimeout(toastTimer); toast.querySelector('p').textContent = message; toast.hidden = false;
    toastTimer = setTimeout(() => { toast.hidden = true; }, 6000);
  };
  toast.querySelector('button').addEventListener('click', () => { clearTimeout(toastTimer); toast.hidden = true; });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') toast.hidden = true; });
  text('[data-phone]', config.phoneDisplay || '+7 (000) 000-00-00');
  text('[data-driver-phone]', config.driverContact?.phoneDisplay || '+7 (000) 000-00-01');
  text('[data-contact-email-display]', config.emailDisplay || emailAddress(config.email) || 'hello@example.com');
  text('[data-contact-address]', config.address || 'г. Луганск, адрес уточняется');
  text('[data-year]', new Date().getFullYear());
  document.querySelector('[data-demo-note]').hidden = config.demoMode === false;

  const tariffs = Array.isArray(config.tariffs) ? config.tariffs.filter(item => item && typeof item.name === 'string' && ['boarding', 'perKm', 'perMinute'].every(key => typeof item[key] === 'number' && Number.isFinite(item[key]) && item[key] >= 0)).slice(0, 3) : [];
  if (tariffs.length) {
    const holder = document.querySelector('[data-tariff-list]');
    const template = document.querySelector('#tariff-template');
    holder.style.setProperty('--tariff-columns', String(tariffs.length));
    tariffs.forEach((tariff, index) => {
      const card = template.content.firstElementChild.cloneNode(true);
      const image = card.querySelector('[data-tariff-image]');
      image.src = ['assets/tariff-sedan.webp', 'assets/tariff-crossover.webp', 'assets/tariff-child.webp'][index];
      image.alt = 'Иллюстрация автомобиля: ' + tariff.name;
      card.querySelector('h3').textContent = tariff.name;
      card.querySelector('.tariff-description').textContent = tariff.description || '';
      if (tariff.featured === true) card.classList.add('tariff-card-featured');
      const badge = card.querySelector('.tariff-badge');
      if (typeof tariff.badge === 'string' && tariff.badge.trim()) {
        badge.textContent = tariff.badge.trim(); badge.hidden = false;
      }
      const features = Array.isArray(tariff.features) ? tariff.features.filter(item => typeof item === 'string' && item.trim()).slice(0, 3) : [];
      const featureList = card.querySelector('.tariff-features');
      features.forEach(value => {
        const item = document.createElement('li'); item.textContent = value.trim(); featureList.append(item);
      });
      featureList.hidden = features.length === 0;
      card.querySelector('.tariff-order').setAttribute('aria-label', 'Заказать такси: ' + tariff.name);
      ['boarding', 'perKm', 'perMinute'].forEach(key => {
        card.querySelector('[data-price="' + key + '"]').textContent = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 }).format(tariff[key]) + ' ₽';
      });
      const note = card.querySelector('.tariff-note');
      note.textContent = tariff.note || ''; note.hidden = !tariff.note;
      holder.append(card);
    });
    document.querySelector('#tariffs').hidden = false;
    all('[data-tariff-link]', el => { el.hidden = false; });
  }

  const passenger = config.passenger || {};
  const appUrl = safeUrl(passenger.apk) || safeUrl(passenger.android) || safeUrl(passenger.universal);
  const storeUrl = safeUrl(passenger.rustore);
  if (storeUrl) {
    const link = document.querySelector('[data-rustore]');
    link.href = storeUrl; link.hidden = false; link.dataset.goal = 'passenger_app_click';
    document.querySelector('[data-rustore-placeholder]').hidden = true;
  }
  if (appUrl) {
    const block = document.querySelector('[data-qr-block]');
    const renderQr = () => {
      if (typeof window.qrcode !== 'function') return;
      const qr = window.qrcode(0, 'M'); qr.addData(appUrl); qr.make();
      document.querySelector('[data-qr]').innerHTML = qr.createSvgTag({ cellSize: 3, margin: 12, scalable: true });
      document.querySelector('[data-qr] svg').setAttribute('aria-hidden', 'true');
      block.hidden = false;
    };
    if (typeof window.qrcode === 'function') renderQr();
    else {
      const script = document.createElement('script');
      script.src = 'assets/qrcode.js'; script.async = true; script.onload = renderQr;
      document.head.append(script);
    }
  }
  const shots = Array.isArray(config.screenshots) ? config.screenshots.filter(item => item && safeUrl(item.src)).slice(0, 3) : [];
  if (shots.length) {
    const holder = document.querySelector('[data-screenshots]');
    holder.style.gridTemplateColumns = 'repeat(' + shots.length + ',minmax(0,1fr))';
    shots.forEach((shot, index) => {
      const figure = document.createElement('figure'); figure.className = 'screenshot';
      const img = document.createElement('img');
      img.src = safeUrl(shot.src); img.alt = shot.alt || 'Экран приложения ' + (index + 1);
      img.loading = 'lazy'; img.decoding = 'async';
      figure.append(img);
      if (shot.alt) { const caption = document.createElement('figcaption'); caption.textContent = shot.alt; figure.append(caption); }
      holder.append(figure);
    });
    holder.hidden = false;
  }

  const setEmail = (selector, value, display) => {
    const email = emailAddress(value);
    if (email) all(selector, link => { link.href = 'mailto:' + email; link.textContent = display || email; link.hidden = false; link.dataset.goal = 'email_click'; });
  };
  setEmail('[data-email]', config.email, config.emailDisplay);
  setEmail('[data-driver-email]', config.driverContact?.email, config.driverContact?.emailDisplay);
  all('[data-messenger]', link => {
    const url = safeUrl(config.messengers?.[link.dataset.messenger]);
    if (url) { link.href = url; link.hidden = false; link.dataset.goal = 'messenger_click'; }
  });
  all('[data-legal]', link => {
    const url = safeUrl(link.dataset.legal === 'privacy' ? config.privacyUrl : config.agreementUrl);
    if (url) { link.href = url; link.hidden = false; }
  });
  document.querySelector('.legal-links').hidden = !document.querySelector('.legal-links a:not([hidden])');
  document.querySelector('.messenger-links').hidden = !document.querySelector('.messenger-links a:not([hidden])');
  text('[data-address]', config.address || '');
  text('[data-company]', config.companyDetails || '');
  document.querySelector('[data-company-block]').hidden = !(config.address || config.companyDetails || safeUrl(config.officeMapUrl));
  const mapUrl = safeUrl(config.officeMapUrl);
  if (mapUrl) {
    const holder = document.querySelector('[data-office-map]');
    const iframe = document.createElement('iframe'); iframe.src = mapUrl;
    iframe.title = 'Офис Астро-Волга Такси'; iframe.loading = 'lazy'; iframe.referrerPolicy = 'no-referrer';
    holder.append(iframe); holder.hidden = false;
  }

  all('[data-action]', button => button.addEventListener('click', () => {
    const action = button.dataset.action;
    const channel = button.dataset.channel || 'passenger';
    const position = button.dataset.position || 'page';
    if (action === 'email') {
      const email = emailAddress(config.email);
      if (!email) { notify('Email службы пока не добавлен. Это демонстрационная версия.'); return; }
      track('email_click', { position }); location.href = 'mailto:' + email; return;
    }
    if (action === 'call') {
      const phone = phoneNumber(channel === 'driver' ? config.driverContact?.phone : config.phone);
      if (!phone) { notify(channel === 'driver' ? 'Номер для подключения водителей пока не добавлен.' : 'Номер службы пока не добавлен. Это демонстрационная версия.'); return; }
      track('phone_click', { position, channel }); location.href = 'tel:' + phone; return;
    }
    if (action !== 'passenger' && action !== 'driver') return;
    const links = config[action] || {};
    const platform = button.dataset.platform || (/iPhone|iPad|iPod/.test(navigator.userAgent) ? 'ios' : 'apk');
    const url = safeUrl(links[platform]) || (platform === 'apk' ? safeUrl(links.android) : null) || safeUrl(links.universal);
    if (!url) { notify(action === 'driver' ? 'Приложение для водителей пока не подключено. Скачивание недоступно.' : 'Пассажирское приложение пока не подключено. Скачивание недоступно.'); return; }
    track(action === 'driver' ? 'driver_app_click' : 'passenger_app_click', { platform, position });
    if (platform === 'apk') {
      track('apk_download_click', { audience: action, position });
      const link = document.createElement('a');
      link.href = url; link.download = action === 'driver' ? 'astro-volga-driver.apk' : 'astro-volga-taxi.apk';
      link.rel = 'noopener'; document.body.append(link); link.click(); link.remove();
    } else window.open(url, '_blank', 'noopener,noreferrer');
  }));
  all('[data-goal]', link => link.addEventListener('click', () => track(link.dataset.goal, { position: link.dataset.position || 'contacts', platform: link.dataset.messenger || 'store' })));
  all('.faq-list details', details => details.addEventListener('toggle', () => {
    if (details.open) all('.faq-list details', other => { if (other !== details) other.open = false; });
  }));
  if ('IntersectionObserver' in window) {
    const bar = document.querySelector('.mobile-action-bar');
    new IntersectionObserver(entries => { bar.hidden = entries[0].isIntersecting; }).observe(document.querySelector('.hero-actions'));
  }

  const nav = document.querySelector('.main-nav');
  const header = document.querySelector('.site-header');
  const navSections = [...nav.querySelectorAll('a[href^="#"]')].map(link => ({
    link, section: document.getElementById(link.getAttribute('href').slice(1)),
  })).filter(item => item.section);
  let currentNavLink = null;
  let navFramePending = false;
  let navNeedsMeasure = true;
  const updateNav = () => {
    navFramePending = false;
    const visibleSections = navSections.filter(item => !item.link.hidden && !item.section.hidden);
    if (!visibleSections.length) return;
    const activationLine = header.getBoundingClientRect().bottom + Math.min(window.innerHeight * .2, 120);
    let active = visibleSections[0];
    visibleSections.forEach(item => {
      if (item.section.getBoundingClientRect().top <= activationLine) active = item;
    });
    const last = visibleSections[visibleSections.length - 1];
    const atBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
    if (atBottom && last.section.getBoundingClientRect().top < window.innerHeight) active = last;
    if (currentNavLink !== active.link) {
      navSections.forEach(item => item.link.removeAttribute('aria-current'));
      active.link.setAttribute('aria-current', 'location');
      currentNavLink = active.link;
      navNeedsMeasure = true;
    }
    if (navNeedsMeasure && nav.offsetWidth) {
      const navBounds = nav.getBoundingClientRect();
      const linkBounds = active.link.getBoundingClientRect();
      nav.style.setProperty('--nav-x', (linkBounds.left - navBounds.left) + 'px');
      nav.style.setProperty('--nav-width', linkBounds.width + 'px');
      nav.setAttribute('data-nav-ready', '');
      navNeedsMeasure = false;
    }
  };
  const scheduleNav = () => {
    if (navFramePending) return;
    navFramePending = true;
    window.requestAnimationFrame(updateNav);
  };
  const measureNav = () => { navNeedsMeasure = true; scheduleNav(); };
  window.addEventListener('scroll', scheduleNav, { passive: true });
  window.addEventListener('resize', measureNav, { passive: true });
  window.addEventListener('hashchange', scheduleNav);
  if ('ResizeObserver' in window) {
    const navObserver = new window.ResizeObserver(measureNav);
    [nav, document.querySelector('main'), document.querySelector('.site-footer')].forEach(element => navObserver.observe(element));
  }
  if (document.fonts) document.fonts.ready.then(measureNav);
  scheduleNav();

  const siteUrl = safeUrl(config.siteUrl) || location.href.split('#')[0];
  const provider = { '@type': 'Organization', name: 'Астро-Волга Такси', url: siteUrl };
  if (phoneNumber(config.phone)) provider.telephone = phoneNumber(config.phone);
  const graph = [
    { '@type': 'TaxiService', name: provider.name, url: siteUrl, areaServed: { '@type': 'City', name: 'Луганск' }, provider },
    { '@type': 'FAQPage', mainEntity: [...document.querySelectorAll('.faq-list details')].map(el => ({ '@type': 'Question', name: el.querySelector('summary').textContent.trim(), acceptedAnswer: { '@type': 'Answer', text: el.querySelector('.faq-answer').textContent.trim() } })) },
  ];
  const structured = document.createElement('script'); structured.type = 'application/ld+json';
  structured.textContent = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }); document.head.append(structured);
})();
