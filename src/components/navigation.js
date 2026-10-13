import { translate } from '../i18n/translations.js';

export function initNavigation(prepareTarget) {
  const header = document.querySelector('.site-header');
  const menu = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.main-nav');
  const links = [...nav.querySelectorAll('a')];
  const sections = [...document.querySelectorAll('main > section')];
  const mobile = matchMedia('(max-width: 1023px)');
  let open = false;
  let frame = 0;
  function setMenu(value, returnFocus = false) {
    open = value;
    menu.setAttribute('aria-expanded', String(value));
    menu.dataset.i18nAria = value ? 'nav.close' : 'nav.menu';
    menu.setAttribute('aria-label', translate(menu.dataset.i18nAria));
    nav.classList.toggle('is-open', value);
    header.classList.toggle('menu-visible', value);
    document.body.classList.toggle('menu-open', value);
    if (value) links[0].focus();
    else if (returnFocus) menu.focus();
  }
  menu.addEventListener('click', () => setMenu(!open));
  mobile.addEventListener('change', () => setMenu(false));
  document.addEventListener('keydown', (event) => {
    if (!open) return;
    if (event.key === 'Escape') { setMenu(false, true); return; }
    // 菜单打开时让 Tab 在导航、语言切换与关闭按钮之间循环。
    if (event.key === 'Tab') {
      const focusable = [...header.querySelectorAll('a, button')].filter((el) => el.getClientRects().length);
      const first = focusable[0];
      const last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
  function update() {
    frame = 0;
    header.classList.toggle('is-scrolled', window.scrollY > 24);
    let active = sections[0].id;
    const threshold = Math.min(innerHeight * .38, 260);
    sections.forEach((section) => { if (section.getBoundingClientRect().top <= threshold) active = section.id; });
    // 最后章节可能不足一屏，滚到底时仍应标记 Contact，而不是前一章节。
    if (scrollY > 0 && scrollY >= document.documentElement.scrollHeight - innerHeight - 4) active = sections.at(-1).id;
    links.forEach((link) => {
      const current = link.hash === `#${active}`;
      link.classList.toggle('is-active', current);
      if (current) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
    });
  }
  window.addEventListener('scroll', () => { if (!frame) frame = requestAnimationFrame(update); }, { passive: true });
  window.addEventListener('resize', update);
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', async (event) => {
      const target = document.querySelector(link.hash);
      if (!target) return;
      event.preventDefault();
      setMenu(false);
      // 先初始化下游滚动区，再计算位置，防止按需加载改变锚点高度。
      await prepareTarget(target.id);
      const top = target.id === 'home' ? 0 : target.getBoundingClientRect().top + scrollY - header.offsetHeight - 20;
      history.pushState(null, '', link.hash);
      window.scrollTo({ top, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
      update();
    });
  });
  update();
}
