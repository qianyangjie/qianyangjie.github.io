import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { profile, projects, publications } from './data/content.js';
import { initLanguage, getLanguage, translate } from './i18n/translations.js';
import { initNavigation } from './components/navigation.js';
import { initHero } from './animations/hero.js';
import { initScroll } from './animations/scroll.js';

gsap.registerPlugin(ScrollTrigger);
const staticMode = (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) || (navigator.deviceMemory && navigator.deviceMemory <= 2) || false;
const cleanup = [];
let researchPromise;

// 研究可视化按需下载与初始化；同一个 Promise 防止重复创建 Canvas 和事件监听。
function ensureResearch() {
  researchPromise ??= import('./animations/research.js').then(({ initResearch }) => { cleanup.push(initResearch({ staticMode })); });
  return researchPromise;
}

function safeURL(value) {
  try { const url = new URL(value); return url.protocol === 'https:' ? url.href : null; } catch { return null; }
}
function renderPublications() {
  const list = document.querySelector('#publication-list');
  list.replaceChildren();
  document.querySelector('.publications-empty').hidden = publications.length > 0;
  for (const paper of publications) {
    const article = document.createElement('article'); article.className = 'publication-row';
    const title = document.createElement('h3'); title.textContent = typeof paper.title === 'string' ? paper.title : paper.title[getLanguage()] ?? paper.title.en;
    const authors = document.createElement('p'); authors.textContent = paper.authors;
    const venue = document.createElement('p'); venue.textContent = [paper.venue, paper.year].filter(Boolean).join(' · ');
    const links = document.createElement('div'); links.className = 'publication-links';
    for (const field of ['doi', 'pdf', 'github']) {
      const url = safeURL(paper[field]);
      if (!url) continue;
      const link = document.createElement('a'); link.href = url; link.textContent = translate(`publications.${field}`); link.target = '_blank'; link.rel = 'noopener noreferrer'; links.append(link);
    }
    article.append(title, authors, venue, links); list.append(article);
  }
}
function prepareProjectLinks() {
  for (const project of projects) {
    const card = document.querySelector(`[data-project="${project.id}"]`);
    const url = safeURL(project.repository);
    if (!card) continue;
    if (project.status !== 'example') { card.querySelector('.project-status').textContent = project.status; card.querySelector('.project-status').removeAttribute('data-i18n'); }
    if (url) {
      const link = document.createElement('a'); link.href = url; link.target = '_blank'; link.rel = 'noopener noreferrer'; link.dataset.i18n = 'projects.view'; link.textContent = translate('projects.view');
      card.querySelector('.repository-slot').replaceChildren(link);
    }
  }
}

document.querySelector('#year').textContent = new Date().getFullYear();
document.querySelector('.contact-links a').href = profile.github;
document.querySelectorAll('a[href^="mailto:"]').forEach((link) => { link.href = `mailto:${profile.email}`; });
document.querySelector('.email-address').textContent = profile.email;
initLanguage();
prepareProjectLinks();
renderPublications();
cleanup.push(initHero({ staticMode }), initScroll());
initNavigation(async (id) => {
  // About 的平滑滚动也可能进入研究区域的预加载范围；提前完成刷新，避免途中被打断。
  if (id !== 'home' && id !== 'main') await ensureResearch();
  ScrollTrigger.refresh();
});
const researchObserver = new IntersectionObserver((entries) => {
  if (entries.some((entry) => entry.isIntersecting)) { ensureResearch(); researchObserver.disconnect(); }
}, { rootMargin: '800px' });
researchObserver.observe(document.querySelector('#research'));
document.addEventListener('languagechange', (event) => {
  renderPublications();
  // 文案长度改变后更新滚动测量，再恢复切换前的位置；不刷新页面、不重建 timeline。
  ScrollTrigger.refresh();
  window.scrollTo({ top: event.detail.position, behavior: 'instant' });
});
// 直接打开 #contact 等深层链接时也先建立滚动区，再恢复正确锚点。
if (location.hash && location.hash !== '#home') {
  ensureResearch().then(() => {
    const target = document.getElementById(location.hash.slice(1));
    if (target) window.scrollTo({ top: target.getBoundingClientRect().top + scrollY - 100, behavior: 'instant' });
  });
}
// HMR 更新时销毁监听和动画。正常页面卸载由浏览器回收，bfcache 返回保持状态。
if (import.meta.hot) import.meta.hot.dispose(() => { researchObserver.disconnect(); cleanup.forEach((destroy) => destroy()); });
