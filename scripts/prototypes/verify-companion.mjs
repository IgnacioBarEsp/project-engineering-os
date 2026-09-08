import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { servePrototype } from './serve-companion.mjs';

// Browser tooling is optional and external to the universal CLI runtime.
const playwrightModule = await import(process.env.PROJECT_OS_PLAYWRIGHT_MODULE
  ? pathToFileURL(process.env.PROJECT_OS_PLAYWRIGHT_MODULE).href : 'playwright');
const { chromium } = playwrightModule.default ?? playwrightModule;
const output = process.argv[2];
assert(output, 'Supply an evidence output directory.');
await mkdir(output, { recursive: true });
const server = await servePrototype();
let browser;
const evidence = { date: new Date().toISOString(), source: 'discovery prototype, not installed application', checks: [], screenshots: [] };
try {
  browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const url = `http://127.0.0.1:${server.address().port}`;
  assert.equal((await fetch(`${url}/package.json`)).status, 404);
  for (const width of [320, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const profile of ['research', 'software', 'unity', 'media', 'general']) {
      await page.goto(url);
      await page.locator(`input[value="${profile}"]`).check();
      for (let step = 0; step < 6; step++) {
        assert.equal(await page.locator('h1').count(), 1);
        assert.equal(await page.locator('[aria-current="step"]').count(), 1);
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${profile} ${width} step ${step}: horizontal overflow`);
        if (step === 1) await page.locator('#project-name').fill('<script>alert("test")</script> investigación');
        if (step < 5) await page.locator('[data-next]').click();
      }
      assert.equal(await page.locator('#screen script').count(), 0);
      assert.equal(await page.locator('#screen h1').evaluate(el => el === document.activeElement), true);
      await page.locator('#restart').click();
      assert.equal(await page.locator(`input[value="${profile}"]`).isChecked(), true);
      evidence.checks.push(`${profile}: 6 steps, ${width}px, persistence, escaped text, heading focus PASS`);
    }
  }
  await page.goto(url);
  await page.setViewportSize({ width: 320, height: 1000 });
  await page.locator('[data-next]').click();
  await page.locator('#project-name').fill('W'.repeat(100));
  for (let step = 1; step < 5; step++) {
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Maximum-length unbroken project name overflows at step ${step}`);
    await page.locator('[data-next]').click();
  }
  evidence.checks.push('100-character unbroken project name at 320px: reflow PASS');
  await page.goto(url);
  await page.locator('[data-next]').click();
  await page.locator('[data-next]').click();
  await page.locator('input[value="codex"]').uncheck();
  await page.locator('[data-next]').click();
  assert.match(await page.locator('[role="alert"]').innerText(), /Elige al menos una IA/);
  assert.equal(await page.locator('input[name=agent]').first().evaluate(el => el === document.activeElement), true);
  await page.keyboard.press('Space');
  await page.locator('[data-next]').click();
  assert.match(await page.locator('h1').innerText(), /carpeta/);
  evidence.checks.push('Missing AI: precise alert, focus, keyboard correction and recovery PASS');
  await page.goto(url);
  await page.keyboard.press('Tab');
  assert.equal(await page.locator('#theme').evaluate(el => el === document.activeElement), true);
  await page.keyboard.press('Tab');
  await page.keyboard.press('ArrowDown');
  assert(await page.locator('input[value="software"]').isChecked());
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  assert.match(await page.locator('h1').innerText(), /adapte/);
  evidence.checks.push('Keyboard: theme, native radio group, ArrowDown, next and heading focus PASS');
  await page.locator('#error-demo').click();
  assert.match(await page.locator('[role="alert"]').innerText(), /ejemplo/);
  await page.locator('#retry').click();
  assert.equal(await page.locator('[role="alert"]').count(), 0);
  evidence.checks.push('Explicit simulated failure and retry PASS');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  assert.equal(await page.locator('#screen').evaluate(el => getComputedStyle(el).animationName), 'none');
  evidence.checks.push('Reduced motion PASS');
  await page.goto(url);
  await page.evaluate(() => { document.body.style.zoom = '200%'; });
  await page.setViewportSize({ width: 1280, height: 1000 });
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), '200% zoom overflow');
  evidence.checks.push('200% CSS zoom at 1280px: reflow PASS; browser zoom/native screen reader still needs app QA');
  await page.goto(url);
  await page.setViewportSize({ width: 1440, height: 1100 });
  for (const theme of ['studio', 'plane', 'paper']) {
    await page.locator('#theme').selectOption(theme);
    const contrast = await page.evaluate(() => {
      const css = getComputedStyle(document.documentElement);
      const luminance = variable => {
        const hex = css.getPropertyValue(variable).trim().slice(1);
        const expanded = hex.length === 3 ? [...hex].map(c => c + c).join('') : hex;
        const rgb = expanded.match(/../g).map(value => parseInt(value, 16) / 255)
          .map(value => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4);
        return rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722;
      };
      return [['--text','--bg'], ['--muted','--surface'], ['--muted','--soft'],
        ['--muted','--rail'], ['--accent','--bg'], ['--on-accent','--accent'], ['--warn','--error-bg'], ['--control','--surface']]
        .map(([foreground, background]) => {
          const a = luminance(foreground), b = luminance(background);
          return { foreground, background, ratio: (Math.max(a,b)+.05)/(Math.min(a,b)+.05) };
        });
    });
    for (const pair of contrast) assert(pair.ratio >= (pair.foreground==='--control'?3:4.5), `${theme}: contrast ${JSON.stringify(pair)}`);
    evidence.checks.push(`${theme}: 7 text color pairs >= 4.5:1 and control boundaries >= 3:1 PASS`);
    const file = `companion-${theme}.png`;
    await page.screenshot({ path: path.join(output, file), fullPage: true });
    evidence.screenshots.push(file);
  }
  await page.setViewportSize({ width: 320, height: 1000 });
  await page.locator('#theme').selectOption('studio');
  await page.screenshot({ path: path.join(output, 'companion-mobile.png'), fullPage: true });
  evidence.screenshots.push('companion-mobile.png');
  assert.deepEqual(errors, []);
  evidence.checks.push('Browser exceptions: 0; unauthorized preview paths: 404 PASS');
  evidence.status = 'PASS';
} catch (error) {
  evidence.status = 'FAIL';
  evidence.error = error.stack;
  process.exitCode = 1;
} finally {
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
  await writeFile(path.join(output, 'prototype-results.json'), JSON.stringify(evidence, null, 2) + '\n');
  console.log(JSON.stringify(evidence, null, 2));
}
