// usage: node render.mjs <outDir> [t1,t2,...]   (no times = all 900 frames at 30fps, 4 parallel pages)
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import { mkdirSync } from 'fs';
import path from 'path';
const out = process.argv[2], FPS = 30, END = 30;
const times = process.argv[3] ? process.argv[3].split(',').map(Number) : Array.from({ length: END * FPS }, (_, i) => i / FPS);
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const WORKERS = 4;
await Promise.all(Array.from({ length: WORKERS }, async (_, w) => {
  const page = await browser.newPage({ viewport: { width: 720, height: 1280 } });
  page.on('pageerror', e => console.error('ERR', e.message));
  await page.goto('file://' + path.resolve('index.html'));
  await page.evaluate(() => window.ready);
  for (let i = w; i < times.length; i += WORKERS) {
    await page.evaluate(t => window.render(t), times[i]);
    const name = process.argv[3] ? `t${times[i].toFixed(2)}.png` : `f${String(i).padStart(4, '0')}.png`;
    await page.screenshot({ path: path.join(out, name) });
  }
}));
await browser.close();
