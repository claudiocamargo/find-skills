// usage: node render.mjs <outDir> [t1,t2,...]  (sem tempos = todos os quadros a 30fps, 1080x1920)
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import { mkdirSync } from 'fs';
import path from 'path';
const out = process.argv[2], FPS = 30;
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const probe = await browser.newPage(); await probe.goto('file://' + path.resolve('index.html'));
const TOTAL = await probe.evaluate(() => window.ready); await probe.close();
const times = process.argv[3] ? process.argv[3].split(',').map(Number) : Array.from({ length: Math.round(TOTAL * FPS) }, (_, i) => i / FPS);
const WORKERS = 4;
await Promise.all(Array.from({ length: WORKERS }, async (_, w) => {
  const page = await browser.newPage({ viewport: { width: 720, height: 1280 }, deviceScaleFactor: 1.5 });
  page.on('pageerror', e => console.error('ERR', e.message));
  await page.goto('file://' + path.resolve('index.html'));
  await page.evaluate(() => window.ready);
  for (let i = w; i < times.length; i += WORKERS) {
    await page.evaluate(t => window.render(t), times[i]);
    const name = process.argv[3] ? `t${times[i].toFixed(2)}.png` : `f${String(i).padStart(5, '0')}.png`;
    await page.screenshot({ path: path.join(out, name), type: 'png' });
  }
}));
await browser.close();
console.log('TOTAL', TOTAL, 'frames', times.length);
