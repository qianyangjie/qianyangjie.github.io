import { translations } from '../data/content.js';

let language = 'en';
try { if (localStorage.getItem('simon-language') === 'zh') language = 'zh'; } catch { /* 隐私模式禁用存储时仍可切换语言。 */ }
export const getLanguage = () => language;
export const translate = (key) => translations[language][key] ?? translations.en[key] ?? key;

export function setLanguage(next, save = true) {
  language = next === 'zh' ? 'zh' : 'en';
  const position = window.scrollY;
  // querySelectorAll 查找带 data-i18n 的 DOM 元素，textContent 修改文字。
  document.querySelectorAll('[data-i18n]').forEach((element) => { element.textContent = translate(element.dataset.i18n); });
  document.querySelectorAll('[data-i18n-aria]').forEach((element) => { element.setAttribute('aria-label', translate(element.dataset.i18nAria)); });
  document.querySelectorAll('[data-lang]').forEach((button) => { button.setAttribute('aria-pressed', String(button.dataset.lang === language)); });
  document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';
  document.title = translate('meta.title');
  document.querySelector('meta[name="description"]').content = translate('meta.description');
  document.querySelector('meta[property="og:title"]').content = translate('meta.title');
  document.querySelector('meta[property="og:description"]').content = translate('meta.description');
  document.querySelector('meta[property="og:locale"]').content = language === 'zh' ? 'zh_CN' : 'en_US';
  if (save) { try { localStorage.setItem('simon-language', language); } catch { /* 存储不可用不阻断界面。 */ } }
  document.dispatchEvent(new CustomEvent('languagechange', { detail: { language, position } }));
  window.scrollTo({ top: position, behavior: 'instant' });
}

export function initLanguage() {
  setLanguage(language, false);
  document.querySelectorAll('[data-lang]').forEach((button) => {
    button.addEventListener('click', () => setLanguage(button.dataset.lang));
  });
}
