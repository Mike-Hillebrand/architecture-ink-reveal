#!/usr/bin/env node
// Nimmt die Browseranimation Frame für Frame über window.architecturePreview.seek(ms) auf.
// Nutzung: node capture_frames.js <url> <ausgabeordner> [fps=30] [dauerMs=12000] [breite=1080]
// Braucht playwright-core (npm i playwright-core) und ein installiertes Google Chrome.
const { chromium } = require('playwright-core');
const fs = require('fs');

const [url, out, fps = 30, dur = 12000, width = 1080] = process.argv.slice(2);
if (!url || !out) {
  console.error('Nutzung: node capture_frames.js <url> <ausgabeordner> [fps] [dauerMs] [breite]');
  process.exit(1);
}
(async () => {
  fs.mkdirSync(out, { recursive: true });
  if (fs.readdirSync(out).length) throw new Error(`Ausgabeordner ist nicht leer: ${out}`);
  const browser = await chromium.launch({ channel: 'chrome' });
  const page = await browser.newPage({ viewport: { width: Number(width), height: 2000 }, deviceScaleFactor: 2 });
  await page.goto(url);
  await page.waitForFunction(() => window.architecturePreview);
  const { width: w, height: h } = await page.evaluate(() => window.architecturePreview.state);
  const W = Number(width), H = Math.round(W * h / w);
  // Nur das Zeichenblatt aufnehmen, in exakter Bildproportion.
  await page.addStyleTag({ content: `.sheet{position:fixed!important;left:0;top:0;width:${W}px!important;height:${H}px!important;max-height:none!important;z-index:99;margin:0!important}` });
  const frames = Math.round(Number(dur) / 1000 * Number(fps));
  for (let i = 0; i <= frames; i++) {
    await page.evaluate(t => window.architecturePreview.seek(t), i / frames * Number(dur));
    await page.screenshot({ path: `${out}/f${String(i).padStart(4, '0')}.png`, clip: { x: 0, y: 0, width: W, height: H } });
  }
  await browser.close();
  console.log(JSON.stringify({ frames: frames + 1, width: W * 2, height: H * 2, fps: Number(fps) }));
})().catch(error => { console.error(error.message); process.exit(1); });
