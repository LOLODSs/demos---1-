const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE || "playwright"
);
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
const browser = await chromium.launch({
  executablePath:
    process.env.CHROMIUM_PATH ||
    (existsSync("/usr/local/bin/chromium")
      ? "/usr/local/bin/chromium"
      : undefined),
  args: ["--no-sandbox"],
});
const root = fileURLToPath(new URL("../", import.meta.url));
const results = { widths: [], checks: [] };
for (const width of [
  320, 360, 390, 480, 600, 760, 768, 820, 1024, 1280, 1440, 1920,
]) {
  const p = await browser.newPage({
    viewport: { width, height: 1000 },
    reducedMotion: "reduce",
  });
  await p.goto(pathToFileURL(root + "preview.html").href);
  await p.evaluate(() =>
    document.querySelectorAll("img").forEach((e) => (e.loading = "eager")),
  );
  await p.waitForFunction(() => [...document.images].every((e) => e.complete));
  const r = await p.evaluate(() => ({
    width: innerWidth,
    overflow: document.documentElement.scrollWidth > innerWidth,
    h2: parseFloat(
      getComputedStyle(document.querySelector("#services h2")).fontSize,
    ),
    team: Math.round(
      document.querySelector("#team").getBoundingClientRect().height,
    ),
    gallery: Math.round(
      document.querySelector("#gallery").getBoundingClientRect().height,
    ),
    italicHeadings: [...document.querySelectorAll("main h1 em,main h2 em")]
      .length,
    small: [
      ...document.querySelectorAll(
        "main p,main button,main a,main small,main span",
      ),
    ]
      .filter((e) => {
        const r = e.getBoundingClientRect();
        return (
          r.width > 0 &&
          r.height > 0 &&
          parseFloat(getComputedStyle(e).fontSize) < 14
        );
      })
      .map((e) => e.className),
    assets: document.images.length,
  }));
  assert.equal(r.overflow, false);
  assert.equal(r.small.length, 0);
  assert.equal(r.italicHeadings, 1);
  results.widths.push(r);
  if ([320, 768, 1024].includes(width)) {
    for (const id of ["home", "services", "about", "team", "gallery"]) {
      await p.locator("#" + id).scrollIntoViewIfNeeded();
      await p.locator("#" + id).screenshot({
        path: `${root}qa/${width}-${id}-polish.png`,
        animations: "disabled",
        style:
          ".header,.mobile-actions,.skip-link{visibility:hidden!important}",
      });
    }
  }
  await p.close();
}
await fs.writeFile(
  root + "qa/refinement-results.json",
  JSON.stringify(results, null, 2),
);
console.log(JSON.stringify({ passed: true, widths: results.widths.length }));
await browser.close();
