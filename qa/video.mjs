const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE || "playwright"
);
import { fileURLToPath, pathToFileURL } from "node:url";
const root = fileURLToPath(new URL("../", import.meta.url));
import assert from "node:assert/strict";
import fs from "node:fs/promises";
const base = process.env.BASE_URL || "http://127.0.0.1:4195";
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/local/bin/chromium",
  args: ["--no-sandbox"],
});
const report = { passed: false, checks: [], errors: [] };
const check = (name, value) => {
  report.checks.push({ name, passed: !!value });
  assert.ok(value, name);
};
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
  });
  page.on("pageerror", (e) => report.errors.push(e.message));
  await page.goto(base);
  await page.waitForFunction(
    () => document.querySelector("video")?.currentTime > 0.3,
  );
  check(
    "autoplay muted inline and loop",
    await page
      .locator("video")
      .evaluate((v) => v.muted && v.loop && v.playsInline && !v.paused),
  );
  check(
    "film loaded",
    await page
      .locator("video")
      .evaluate((v) => v.videoWidth === 1280 && v.videoHeight === 720),
  );
  check(
    "hours below film, not over cat",
    await page.evaluate(() => {
      let a = document.querySelector("video").getBoundingClientRect(),
        b = document.querySelector(".hero__photo-note").getBoundingClientRect();
      return b.top >= a.bottom - 1;
    }),
  );
  await page
    .getByRole("button", { name: "Приостановить видео", exact: true })
    .click();
  check(
    "pause control works",
    await page.locator("video").evaluate((v) => v.paused),
  );
  let time = await page.locator("video").evaluate((v) => v.currentTime);
  await page.waitForTimeout(350);
  check(
    "paused frame stays still",
    await page
      .locator("video")
      .evaluate((v, t) => Math.abs(v.currentTime - t) < 0.05, time),
  );
  await page
    .getByRole("button", { name: "Воспроизвести видео", exact: true })
    .click();
  await page.waitForTimeout(200);
  check(
    "manual play works",
    await page.locator("video").evaluate((v) => !v.paused),
  );
  await page.locator("#team").scrollIntoViewIfNeeded();
  await page.waitForTimeout(250);
  check(
    "offscreen film pauses",
    await page.locator("video").evaluate((v) => v.paused),
  );
  await page.locator("#home").scrollIntoViewIfNeeded();
  await page.waitForTimeout(250);
  check(
    "visible film resumes",
    await page.locator("video").evaluate((v) => !v.paused),
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.waitForFunction(() => !document.querySelector("video"));
  check(
    "reduced motion unmounts film",
    (await page.locator("video").count()) === 0,
  );
  check("poster remains", await page.locator(".hero__film img").isVisible());
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.waitForFunction(
    () => document.querySelector("video")?.currentTime > 0.1,
  );
  check(
    "motion preference update works",
    (await page.locator("video").count()) === 1,
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForFunction(() => !document.querySelector("video"));
  check("mobile uses no video", (await page.locator("video").count()) === 0);
  check(
    "mobile photo source",
    await page
      .locator(".hero__film img")
      .evaluate((i) => i.naturalWidth === 674),
  );
  await page.close();
  for (const mode of [
    "mobile",
    "reduced",
    "saveData",
    "failure",
    "standalone",
  ]) {
    const p = await browser.newPage({
      viewport: { width: mode === "mobile" ? 390 : 1440, height: 900 },
      reducedMotion: mode === "reduced" ? "reduce" : "no-preference",
    });
    const requests = [];
    p.on("request", (r) => {
      if (r.url().includes("/videos/")) requests.push(r.url());
    });
    p.on("pageerror", (e) => report.errors.push(e.message));
    if (mode === "saveData")
      await p.addInitScript(() =>
        Object.defineProperty(navigator, "connection", {
          value: { saveData: true },
        }),
      );
    if (mode === "failure") await p.route("**/videos/**", (r) => r.abort());
    await p.goto(
      mode === "standalone" ? pathToFileURL(root + "preview.html").href : base,
    );
    if (mode === "standalone") {
      await p.waitForFunction(
        () => document.querySelector("video")?.currentTime > 0.1,
      );
      check("standalone embedded MP4 plays", true);
    } else if (mode === "failure") {
      await p.waitForFunction(() => !document.querySelector("video"));
      check(
        "video failure shows poster",
        await p.locator(".hero__film img").isVisible(),
      );
    } else {
      await p.waitForTimeout(300);
      check(
        mode + ": no video mounted",
        (await p.locator("video").count()) === 0,
      );
      check(mode + ": no MP4 request", requests.length === 0);
    }
    await p.close();
  }
  for (const width of [
    320, 390, 600, 760, 761, 820, 1024, 1030, 1031, 1100, 1280, 1440, 1920,
    2560,
  ]) {
    const p = await browser.newPage({ viewport: { width, height: 1000 } });
    await p.goto(base);
    await p.waitForTimeout(100);
    check(
      width + ": no horizontal overflow",
      await p.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    );
    if (width > 1030)
      check(
        width + ": both faces inside video frame",
        await p.locator(".hero__film").evaluate((e) => {
          let v = e.querySelector("video") || e.querySelector("img"),
            r = v.getBoundingClientRect(),
            scale = Math.max(r.width / 1280, r.height / 720),
            x = (r.width - 1280 * scale) * 0.55;
          return 440 * scale + x >= 0 && 930 * scale + x <= r.width;
        }),
      );
    await p.close();
  }
  check("no JS errors", report.errors.length === 0);
  report.passed = true;
} finally {
  await browser.close();
  await fs.writeFile(
    root + "qa/video-results.json",
    JSON.stringify(report, null, 2),
  );
  console.log(
    JSON.stringify({
      passed: report.passed,
      checks: report.checks.length,
      errors: report.errors,
    }),
  );
}
