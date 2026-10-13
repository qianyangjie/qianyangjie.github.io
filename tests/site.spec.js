import { test, expect } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

const ids = ['home', 'about', 'research', 'projects', 'publications', 'contact'];
async function noOverflow(page) {
  const sizes = await page.evaluate(() => ({ viewport: innerWidth, document: document.documentElement.scrollWidth }));
  expect(sizes.document).toBeLessThanOrEqual(sizes.viewport + 1);
}
async function language(page, lang) {
  await page.locator(`[data-lang="${lang}"]`).click();
  await expect(page.locator('html')).toHaveAttribute('lang', lang === 'zh' ? 'zh-CN' : 'en');
}

for (const width of [1920, 1440, 768, 390, 375]) {
  test(`${width}px: both languages, all six sections and no horizontal overflow`, async ({ page }) => {
    await page.setViewportSize({ width, height: width >= 1024 ? 900 : 844 });
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('#hero-heading')).toContainText('SIMON');
    for (const lang of ['en', 'zh']) {
      await language(page, lang);
      for (const id of ids) {
        await page.locator(`#${id}`).scrollIntoViewIfNeeded();
        await noOverflow(page);
        const heading = page.locator(`#${id} h1, #${id} > .container h2`).first();
        await expect(heading).not.toBeEmpty();
      }
    }
    expect(errors).toEqual([]);
    expect(await page.locator('.project-card').count()).toBe(3);
    expect(await page.locator('.repository-slot a').count()).toBe(0);
    await expect(page.locator('.contact-links a').first()).toHaveAttribute('href', 'https://github.com/Simon-charming');
    await expect(page.locator('.contact-links a').last()).toHaveAttribute('href', 'mailto:2428286976@qq.com');
  });
}

test('language preference persists; switching keeps scroll and updates metadata', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await page.locator('.main-nav a[href="#research"]').click();
  await expect(page).toHaveURL(/#research$/);
  await page.waitForFunction(() => Math.abs(document.querySelector('#research').getBoundingClientRect().top - document.querySelector('.site-header').offsetHeight - 20) < 2);
  const before = await page.evaluate(() => scrollY);
  await language(page, 'zh');
  expect(Math.abs(await page.evaluate(() => scrollY) - before)).toBeLessThan(3);
  await expect(page).toHaveTitle(/钱扬杰/);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /雷达信号处理/);
  await expect(page.locator('.main-nav a[href="#research"]')).toHaveAttribute('aria-current', 'location');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN');
  await expect(page.locator('#research-heading')).toContainText('识别微弱目标');
});

test('mobile menu supports keyboard, Escape and navigation without pinned scroll', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const menu = page.locator('.menu-toggle');
  await menu.focus(); await page.keyboard.press('Enter');
  await expect(menu).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('.main-nav a').first()).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(menu).toBeFocused(); await expect(menu).toHaveAttribute('aria-expanded', 'false');
  for (const id of ['about', 'research', 'projects', 'publications', 'contact', 'home']) {
    await menu.click();
    await page.locator(`.main-nav a[href="#${id}"]`).click();
    await expect(menu).toHaveAttribute('aria-expanded', 'false');
    await expect(page).toHaveURL(new RegExp(`#${id}$`));
    await page.waitForFunction((target) => {
      const sectionTop = document.querySelector(`#${target}`).getBoundingClientRect().top;
      const desired = target === 'home' ? 0 : document.querySelector('.site-header').offsetHeight + 20;
      const atBottom = scrollY >= document.documentElement.scrollHeight - innerHeight - 3;
      return Math.abs(sectionTop - desired) < (target === 'home' ? 8 : 3) || (target === 'contact' && atBottom);
    }, id);
    await expect(page.locator(`.main-nav a[href="#${id}"]`)).toHaveAttribute('aria-current', 'location');
    await noOverflow(page);
  }
  expect(await page.locator('.pin-spacer').count()).toBe(0);
});

test('research stages change the canvas; desktop pinning remains stable through scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await page.locator('.main-nav a[href="#research"]').click();
  await expect(page.locator('.research-scene')).toHaveClass(/is-story/);
  await page.waitForTimeout(900);
  expect(await page.locator('.pin-spacer').count()).toBe(2);
  await page.locator('[data-stage="0"]').click();
  await expect(page.locator('[data-stage="0"]')).toHaveAttribute('aria-pressed', 'true');
  await page.waitForTimeout(650);
  const raw = await page.locator('#signal-canvas').evaluate((canvas) => canvas.toDataURL());
  for (const value of [1, 2, 3]) {
    await page.locator(`[data-stage="${value}"]`).click();
    await expect(page.locator(`[data-stage="${value}"]`)).toHaveAttribute('aria-pressed', 'true');
  }
  await page.waitForTimeout(650);
  const processed = await page.locator('#signal-canvas').evaluate((canvas) => canvas.toDataURL());
  expect(processed).not.toBe(raw);
  await expect(page.locator('.research-areas')).toHaveCSS('visibility', 'visible');
  const count = await page.locator('*').count();
  for (let i = 0; i < 4; i++) {
    await page.locator('[data-stage="0"]').click();
    await page.locator('[data-stage="3"]').click();
  }
  expect(await page.locator('*').count()).toBe(count);
  await page.locator('.main-nav a[href="#contact"]').click();
  await page.waitForFunction(() => document.querySelector('#contact').getBoundingClientRect().top < 130);
  await expect(page.locator('.main-nav a[href="#contact"]')).toHaveAttribute('aria-current', 'location');
});

test('reduced motion keeps all content accessible and stages work without pinning', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/#research');
  await expect(page.locator('#signal-canvas')).toBeVisible();
  await page.locator('[data-stage="3"]').click();
  await expect(page.locator('[data-stage="3"]')).toHaveAttribute('aria-pressed', 'true');
  expect(await page.locator('.pin-spacer').count()).toBe(0);
  await expect(page.locator('.research-areas')).toBeVisible();
  await language(page, 'zh');
  await expect(page.locator('#stage-description')).toContainText('四个');
});

test('initial HTML remains meaningful with JavaScript disabled', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4173');
  await expect(page.locator('#hero-heading')).toBeVisible();
  await expect(page.locator('.radar-fallback')).toBeVisible();
  await page.locator('#contact').scrollIntoViewIfNeeded();
  await expect(page.locator('.contact-links a').first()).toBeVisible();
  await noOverflow(page);
  await context.close();
});

test('resizing a pinned desktop story to mobile releases the page and preserves stage controls', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/#research');
  await expect(page.locator('.research-scene')).toHaveClass(/is-story/);
  await page.locator('[data-stage="2"]').click();
  await expect(page.locator('[data-stage="2"]')).toHaveAttribute('aria-pressed', 'true');
  await page.setViewportSize({ width: 375, height: 812 });
  await expect(page.locator('.research-scene')).not.toHaveClass(/is-story/);
  expect(await page.locator('.pin-spacer').count()).toBe(0);
  await page.locator('[data-stage="1"]').click();
  await expect(page.locator('[data-stage="1"]')).toHaveAttribute('aria-pressed', 'true');
  await language(page, 'zh');
  await expect(page.locator('#stage-description')).toContainText('削弱杂波');
  await noOverflow(page);
});

test('visual review screenshots: desktop, research and bilingual mobile', async ({ page }) => {
  await mkdir('.qa', { recursive: true });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/'); await page.waitForTimeout(1600);
  await page.screenshot({ path: '.qa/desktop-home.png' });
  await page.locator('.main-nav a[href="#research"]').click();
  await page.locator('[data-stage="3"]').click(); await page.waitForTimeout(800);
  await page.screenshot({ path: '.qa/desktop-research.png' });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/'); await page.screenshot({ path: '.qa/desktop-full.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/'); await page.screenshot({ path: '.qa/mobile-home.png' });
  await language(page, 'zh'); await page.screenshot({ path: '.qa/mobile-full-zh.png', fullPage: true });
});
