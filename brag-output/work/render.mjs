// usage: [PAGE=x.html VW=.. VH=..] node render.mjs <outDir> [t1,t2,...]   (no times = all frames at 30fps)
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import { mkdirSync } from 'fs';
import path from 'path';

const out = process.argv[2];
const FPS = 30, END = 21.6;
const PAGE = process.env.PAGE || 'index.html', VW = +(process.env.VW || 1920), VH = +(process.env.VH || 1080);
const times = process.argv[3] ? process.argv[3].split(',').map(Number)
  : Array.from({ length: Math.round(END * FPS) }, (_, i) => i / FPS);
mkdirSync(out, { recursive: true });

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--allow-file-access-from-files'] });
const page = await browser.newPage({ viewport: { width: VW, height: VH } });
await page.goto('file://' + path.resolve(PAGE));
await page.evaluate(() => window.ready);
for (let i = 0; i < times.length; i++) {
  await page.evaluate(t => window.render(t), times[i]);
  const name = process.argv[3] ? `t${times[i].toFixed(2)}.png` : `f${String(i).padStart(4, '0')}.png`;
  await page.screenshot({ path: path.join(out, name), type: 'png' });
}
await browser.close();
