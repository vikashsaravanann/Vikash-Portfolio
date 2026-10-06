'use strict';

// Run against a static server: PORTFOLIO_URL=http://127.0.0.1:5500 node tests/portfolio.smoke.cjs
// Requires Playwright and Chromium; set CHROMIUM_PATH if Chromium is elsewhere.
const assert = require('node:assert/strict');
const { test, before, after } = require('node:test');
const { chromium } = require('playwright');
const baseURL = process.env.PORTFOLIO_URL || 'http://127.0.0.1:5500';
let browser;

before(async () => {
  browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium',
    headless: true,
    args: ['--no-sandbox'],
  });
});
after(async () => browser?.close());

async function eventually(check, message) {
  let error;
  for (let attempt = 0; attempt < 80; attempt++) {
    try { await check(); return; } catch (failure) { error = failure; }
    await new Promise(resolve => setTimeout(resolve, 75));
  }
  assert.fail(`${message}: ${error?.message}`);
}

async function withPage(options, callback) {
  const context = await browser.newContext({ serviceWorkers: 'block', ...options });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  try {
    const response = await page.goto(baseURL, { waitUntil: 'networkidle' });
    assert.equal(response.status(), 200);
    await callback(page, context);
    assert.deepEqual(errors, [], 'No JavaScript or console errors');
  } finally {
    await context.close();
  }
}

async function assertNoOverflow(page, label) {
  const layout = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    content: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
  }));
  assert.ok(layout.content <= layout.viewport + 1, `${label}: content ${layout.content}px exceeds viewport ${layout.viewport}px`);
}

test('all 15 certificates are available and their viewer loads, closes, and restores focus', async () => {
  await withPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' }, async page => {
    await page.getByText('Explore all 15 certificates', { exact: false }).click();
    const certificates = page.locator('[data-certificate]:visible');
    assert.equal(await certificates.count(), 15);
    const certificate = page.getByRole('link', { name: /Data Analysis with Python/ });
    await certificate.click();
    const dialog = page.getByRole('dialog');
    assert.equal(await dialog.isVisible(), true);
    assert.equal(await dialog.getByRole('heading').innerText(), 'Data Analysis with Python');
    assert.equal(await dialog.locator('#certificate-issuer').innerText(), 'freeCodeCamp');
    await eventually(async () => assert.equal(await dialog.locator('img').evaluate(img => img.complete && img.naturalWidth > 0), true), 'Certificate image loads');
    await page.keyboard.press('Escape');
    await eventually(async () => assert.equal(await dialog.isVisible(), false), 'Escape closes certificate');
    assert.equal(await certificate.evaluate(node => node === document.activeElement), true);
    await certificate.click();
    await page.getByRole('button', { name: 'Close certificate', exact: true }).click();
    assert.equal(await dialog.isVisible(), false);
    await eventually(async () => assert.equal(await certificate.evaluate(node => node === document.activeElement), true), 'Close restores focus');
    for (const href of await certificates.evaluateAll(nodes => nodes.map(node => node.href))) {
      const response = await page.request.get(href);
      assert.equal(response.status(), 200, href);
      assert.match(response.headers()['content-type'], /^image\//, href);
    }
  });
});

test('mobile navigation supports opening, Escape, section links, and outside clicks', async () => {
  await withPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' }, async page => {
    const toggle = page.getByRole('button', { name: 'Toggle navigation' });
    const nav = page.getByRole('navigation', { name: 'Main navigation' });
    assert.equal(await nav.isVisible(), false);
    await toggle.click();
    assert.equal(await nav.isVisible(), true);
    assert.equal(await toggle.getAttribute('aria-expanded'), 'true');
    await page.keyboard.press('Escape');
    assert.equal(await nav.isVisible(), false);
    assert.equal(await toggle.evaluate(node => node === document.activeElement), true);
    await toggle.click();
    await nav.getByRole('link', { name: 'About me' }).click();
    assert.equal(await nav.isVisible(), false);
    assert.equal(new URL(page.url()).hash, '#about');
    assert.equal(await toggle.getAttribute('aria-expanded'), 'false');
    await toggle.click();
    await page.locator('#about-title').click();
    assert.equal(await nav.isVisible(), false);
  });
});

test('portfolio guide answers each topic and keyboard closing restores focus', async () => {
  await withPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' }, async page => {
    const toggle = page.getByRole('button', { name: 'A quick intro' });
    const guide = page.getByRole('complementary', { name: 'Quick portfolio guide' });
    await toggle.click();
    assert.equal(await guide.isVisible(), true);
    assert.equal(await toggle.getAttribute('aria-expanded'), 'true');
    for (const [name, expected] of [
      ['What do you build?', /Python.*React.*computer vision/],
      ['Where should I start?', /About me.*toolkit.*certificates/],
      ["Let's connect", /internship.*vikash07052008@gmail.com/],
    ]) {
      await guide.getByRole('button', { name, exact: true }).click();
      assert.match(await guide.locator('[role="status"]').innerText(), expected);
    }
    await page.keyboard.press('Escape');
    assert.equal(await guide.isVisible(), false);
    assert.equal(await toggle.evaluate(node => node === document.activeElement), true);
    await toggle.click();
    await page.getByRole('button', { name: 'Close portfolio guide' }).click();
    assert.equal(await guide.isVisible(), false);
  });
});

test('copy email writes the displayed address and announces success', async () => {
  await withPage({ reducedMotion: 'reduce' }, async page => {
    await page.evaluate(() => {
      window.copiedEmail = null;
      Object.defineProperty(navigator, 'clipboard', { configurable: true, value: {
        writeText: async text => { window.copiedEmail = text; },
      } });
    });
    await page.getByRole('button', { name: 'Copy email address' }).click();
    assert.equal(await page.evaluate(() => window.copiedEmail), 'vikash07052008@gmail.com');
    assert.match(await page.locator('#copy-status').innerText(), /Email address copied/);
  });
});

test('résumé is a real PDF and every local link or source resolves', async () => {
  await withPage({}, async page => {
    const resumeURL = await page.getByRole('link', { name: 'Download résumé' }).getAttribute('href');
    const resume = await page.request.get(new URL(resumeURL, baseURL).href);
    assert.equal(resume.status(), 200);
    assert.match(resume.headers()['content-type'], /application\/pdf/);
    assert.equal((await resume.body()).subarray(0, 5).toString(), '%PDF-');
    const references = await page.evaluate(() => [...document.querySelectorAll('[href], [src]')].map(node => node.getAttribute('href') || node.getAttribute('src')).filter(Boolean));
    for (const reference of new Set(references)) {
      if (reference.startsWith('#')) {
        assert.equal(await page.evaluate(id => !!document.getElementById(id), reference.slice(1)), true, `Anchor ${reference} exists`);
        continue;
      }
      const url = new URL(reference, page.url());
      if (url.origin !== new URL(baseURL).origin) continue;
      const response = await page.request.get(url.href);
      assert.equal(response.status(), 200, `Local resource ${reference}`);
    }
  });
});

test('layout fits small phones, tablets, and desktop with expanded content', async () => {
  for (const width of [320, 375, 390, 768, 1024, 1440]) {
    await withPage({ viewport: { width, height: 900 }, reducedMotion: 'reduce' }, async page => {
      await assertNoOverflow(page, `Initial ${width}`);
      await page.getByText('Explore all 15 certificates', { exact: false }).click();
      await page.locator('#life summary').click();
      await assertNoOverflow(page, `Expanded ${width}`);
      await page.getByRole('button', { name: 'A quick intro' }).click();
      await assertNoOverflow(page, `Guide ${width}`);
      const guide = await page.locator('#portfolio-guide').boundingBox();
      assert.ok(guide.x >= 0 && guide.x + guide.width <= width + 1, `Guide fits ${width}`);
      const hero = page.getByRole('heading', { level: 1 });
      assert.equal(await hero.isVisible(), true);
      await eventually(async () => assert.equal(await page.locator('.portrait-frame img').evaluate(img => img.complete && img.naturalWidth > 0), true), 'Portrait loads');
    });
  }
});

test('reduced motion keeps content visible and disables decorative animation', async () => {
  await withPage({ reducedMotion: 'reduce' }, async page => {
    const motion = await page.evaluate(() => ({
      hidden: [...document.querySelectorAll('.reveal')].filter(node => getComputedStyle(node).opacity !== '1').length,
      animated: [...document.querySelectorAll('*')].filter(node => {
        const style = getComputedStyle(node);
        return style.animationName !== 'none' || style.transitionDuration.split(',').some(duration => parseFloat(duration) > 0);
      }).map(node => node.className),
      smoothScroll: getComputedStyle(document.documentElement).scrollBehavior,
    }));
    assert.equal(motion.hidden, 0);
    assert.deepEqual(motion.animated, []);
    assert.equal(motion.smoothScroll, 'auto');
  });
});

test('essential portfolio content and certificates work with JavaScript disabled', async () => {
  await withPage({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } }, async page => {
    assert.equal(await page.getByRole('heading', { level: 1 }).isVisible(), true);
    assert.equal(await page.locator('.project-card:visible').count(), 0);
    for (const id of ['about-title', 'skills-title', 'learning-title', 'contact-title']) {
      assert.equal(await page.locator(`#${id}`).isVisible(), true, id);
    }
    assert.equal(await page.locator('.contact-bottom a[href^="mailto:"]').isVisible(), true);
    await page.getByText('Explore all 15 certificates', { exact: false }).click();
    assert.equal(await page.locator('[data-certificate]:visible').count(), 15);
    await assertNoOverflow(page, 'No JavaScript');
    const opacity = await page.locator('.reveal').evaluateAll(nodes => nodes.map(node => getComputedStyle(node).opacity));
    assert.ok(opacity.every(value => value === '1'), 'Content is readable without JavaScript');
  });
});

test('service worker controls the page and cached portfolio remains readable offline', async () => {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  try {
    await page.goto(baseURL, { waitUntil: 'networkidle' });
    await page.evaluate(() => navigator.serviceWorker.ready);
    await eventually(async () => assert.equal(await page.evaluate(() => !!navigator.serviceWorker.controller), true), 'Service worker takes control');
    await page.reload({ waitUntil: 'networkidle' });
    // Give the cache.put promises time to settle by observing the expected cached resources.
    await eventually(async () => {
      const available = await page.evaluate(async () => {
        const cache = await caches.open((await caches.keys()).find(key => key.startsWith('vikash-portfolio-')));
        return (await cache.keys()).map(request => new URL(request.url).pathname);
      });
      assert.ok(available.some(path => path.endsWith('/assets/profile/profile11.webp')));
      assert.ok(available.some(path => path.endsWith('/css/portfolio.css')));
    }, 'Offline assets are cached');
    await context.setOffline(true);
    const response = await page.reload({ waitUntil: 'load' });
    assert.equal(response.status(), 200);
    assert.equal(await page.getByRole('heading', { level: 1 }).isVisible(), true);
    assert.equal(await page.locator('.project-card:visible').count(), 0);
    await eventually(async () => assert.equal(await page.locator('.portrait-frame img').evaluate(img => img.complete && img.naturalWidth > 0), true), 'Cached portrait loads offline');
  } finally {
    await context.close();
  }
});
