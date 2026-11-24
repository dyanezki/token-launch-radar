import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

// Render only this build's four offline assets. Nothing leaves the browser.
const base = new URL('.', import.meta.url);
const files = new Map();
for (const path of ['dashboard/index.html', 'dashboard/app.js', 'dashboard/app.css', 'data.js']) {
  files.set('/' + path, await readFile(new URL('out/' + path, base)));
}
const { rows } = JSON.parse(await readFile(new URL('out/board.json', base), 'utf8'));
const shots = new Map();
const browser = await chromium.launch({ chromiumSandbox: true });
try {
  const page = await browser.newPage({ viewport: { width: 1380, height: 920 }, deviceScaleFactor: 1 });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.route('**/*', async route => {
    const url = new URL(route.request().url());
    const body = files.get(url.pathname);
    if (url.origin !== 'https://radar.test' || !body) return route.abort();
    const contentType = url.pathname.endsWith('.css') ? 'text/css'
      : url.pathname.endsWith('.js') ? 'text/javascript' : 'text/html';
    return route.fulfill({ body, contentType });
  });
  await page.goto('https://radar.test/dashboard/index.html');
  const tableRows = page.locator('tbody tr');
  assert.equal(await tableRows.count(), rows.length);
  shots.set('1-board.jpg', await page.screenshot({ type: 'jpeg', quality: 88 }));
  await tableRows.first().click();
  const detail = page.getByRole('dialog');
  assert.equal(await detail.getByRole('heading', { name: rows[0].name, exact: true }).count(), 1);
  assert.equal(await detail.locator('ol li').count(), rows[0].farm_steps.length);
  shots.set('2-detail.jpg', await page.screenshot({ type: 'jpeg', quality: 88 }));
  await detail.getByRole('button', { name: 'Close details' }).click();
  const category = 'Lending';
  await page.getByLabel('Filter by category').selectOption(category);
  const expected = rows.filter(row => row.category === category).length;
  assert.ok(expected > 0 && expected < rows.length);
  assert.equal(await tableRows.count(), expected);
  shots.set('3-filtered.jpg', await page.screenshot({ type: 'jpeg', quality: 88 }));
  assert.deepEqual(errors, []);
} finally {
  await browser.close();
}
const destination = new URL('screenshots/', base);
await mkdir(destination, { recursive: true });
for (const [name, bytes] of shots) {
  assert.ok(bytes.length <= 512 * 1024);
  await writeFile(new URL(name, destination), bytes);
}
console.log('Verified board, detail and filter. Wrote three screenshots to', fileURLToPath(destination));
