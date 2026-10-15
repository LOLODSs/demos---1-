// Browser QA used for the delivered build. Requires Playwright in the test environment.
const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE || "playwright"
);
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";
import assert from "node:assert/strict";
const output = path.dirname(fileURLToPath(import.meta.url));
const browser = await chromium.launch({
  executablePath:
    process.env.CHROMIUM_PATH ||
    (existsSync("/usr/local/bin/chromium")
      ? "/usr/local/bin/chromium"
      : undefined),
  headless: true,
  args: ["--no-sandbox"],
});
const report = { viewports: [], checks: [], errors: [], network: [] };
const base = process.env.BASE_URL || "http://127.0.0.1:4174";
const check = (name, condition, details) => {
  report.checks.push({
    name,
    passed: Boolean(condition),
    ...(details ? { details } : {}),
  });
  assert.ok(condition, name);
};
const screenshotStyle =
  ".header,.mobile-actions,.skip-link{visibility:hidden!important}";
const shot = async (page, name, locator) => {
  await page.waitForTimeout(70);
  if (locator)
    await locator.evaluate((e) =>
      window.scrollTo({
        top: e.getBoundingClientRect().top + window.scrollY,
        behavior: "instant",
      }),
    );
  if (locator)
    await locator.screenshot({
      path: path.join(output, name + ".png"),
      animations: "disabled",
      style: screenshotStyle,
    });
  else
    await page.screenshot({
      path: path.join(output, name + ".png"),
      animations: "disabled",
    });
};
try {
  for (const width of [1440, 1024, 768, 390, 320]) {
    const page = await browser.newPage({
      viewport: { width, height: width < 760 ? 844 : 1000 },
      deviceScaleFactor: 1,
      locale: "ru-RU",
    });
    page.on("pageerror", (e) =>
      report.errors.push({ width, message: e.message }),
    );
    page.on("request", (req) => {
      if (!req.url().startsWith(base) && !req.url().startsWith("data:"))
        report.network.push(req.url());
    });
    await page.goto(base, { waitUntil: "networkidle" });
    await page.evaluate(() => {
      document.querySelectorAll("img").forEach((e) => (e.loading = "eager"));
      return document.fonts.ready;
    });
    await page.waitForFunction(() =>
      [...document.images].every((e) => e.complete && e.naturalWidth > 0),
    );
    check(
      `${width}: no page overflow`,
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    );
    check(
      `${width}: images load`,
      await page
        .locator("img")
        .evaluateAll((es) => es.every((e) => e.complete && e.naturalWidth > 0)),
    );
    check(`${width}: no canvas`, (await page.locator("canvas").count()) === 0);
    const overflow = await page.evaluate(() =>
      [...document.querySelectorAll("main *,header *,footer *")]
        .filter((e) => {
          const r = e.getBoundingClientRect(),
            s = getComputedStyle(e);
          return (
            r.width > 0 && s.display !== "none" && r.right > innerWidth + 1
          );
        })
        .slice(0, 10)
        .map((e) => e.className || e.tagName),
    );
    check(
      `${width}: elements within viewport`,
      overflow.length === 0,
      overflow,
    );
    report.viewports.push({
      width,
      height: await page.evaluate(() => document.documentElement.scrollHeight),
    });
    if (width === 1440 || width === 390) {
      for (const id of [
        "home",
        "services",
        "about",
        "team",
        "reviews",
        "gallery",
        "faq",
        "contacts",
      ]) {
        await page.locator("#" + id).scrollIntoViewIfNeeded();
        await shot(page, `${width}-${id}`, page.locator("#" + id));
      }
      await shot(page, `${width}-footer`, page.locator("footer"));
    }
    check(
      `${width}: all services visible`,
      (await page.locator(".service-card").count()) === 6,
    );
    check(
      `${width}: no service tabs`,
      (await page.locator("[role=tab]").count()) === 0,
    );
    check(
      `${width}: no procedural images`,
      (await page.locator("#services img").count()) === 0,
    );
    for (const id of [
      "therapy",
      "diagnostics",
      "surgery",
      "dentistry",
      "prevention",
      "care",
    ]) {
      const card = page.locator("#service-" + id);
      check(
        `${width}: ${id} reason visible`,
        await card.locator(".service-card__when").isVisible(),
      );
      check(
        `${width}: ${id} price visible`,
        await card.locator(".service-card__price").isVisible(),
      );
      await card.locator("summary").focus();
      await page.keyboard.press("Enter");
      check(
        `${width}: ${id} keyboard details`,
        (await card.locator("details").getAttribute("open")) !== null,
      );
      check(
        `${width}: ${id} contents visible`,
        await card.locator(".check-list").isVisible(),
      );
      if ((width === 1440 || width === 390) && id === "diagnostics")
        await shot(page, `${width}-service-expanded`, card);
      await card.locator("summary").click();
      await card.locator(".service-card__book").click();
      check(
        `${width}: ${id} booking selected`,
        (await page.locator("#booking-service").inputValue()) === id,
      );
      check(
        `${width}: options collapsed`,
        !(await page.locator("#booking-date").isVisible()),
      );
      await page.keyboard.press("Escape");
      check(
        `${width}: service returns focus`,
        await card
          .locator(".service-card__book")
          .evaluate((e) => e === document.activeElement),
      );
    }
    const expectedDoctors = ["anna", "mikhail", "elena"];
    for (let i = 0; i < 3; i++) {
      await page.locator(".doctor-card__image").nth(i).click();
      check(
        `${width}: doctor profile ${i}`,
        (await page.locator(".doctor-profile").count()) === 1,
      );
      if (width === 1440 || width === 390)
        await shot(page, `${width}-doctor-${i}`);
      await page.locator(".doctor-profile .button").click();
      check(
        `${width}: doctor booking preselected`,
        (await page.locator("#booking-doctor").inputValue()) ===
          expectedDoctors[i],
      );
      await page.keyboard.press("Escape");
    }
    const initialReview = await page
      .locator(".review-card blockquote")
      .innerText();
    for (let i = 0; i < 3; i++) {
      if (width === 1440 || width === 390)
        await shot(page, `${width}-review-${i}`, page.locator(".reviews"));
      await page
        .getByRole("button", { name: "Следующий отзыв", exact: true })
        .click();
    }
    check(
      `${width}: reviews wrap`,
      (await page.locator(".review-card blockquote").innerText()) ===
        initialReview,
    );
    await page.locator(".gallery-item").first().click();
    for (let i = 0; i < 3; i++) {
      if (width === 1440 || width === 390)
        await shot(page, `${width}-lightbox-${i}`);
      await page.keyboard.press("ArrowRight");
    }
    check(
      `${width}: gallery wraps`,
      (await page.locator(".lightbox__controls>span").innerText()).startsWith(
        "1",
      ),
    );
    await page.keyboard.press("Tab");
    check(
      `${width}: focus in dialog`,
      await page.evaluate(() =>
        Boolean(document.activeElement.closest("dialog")),
      ),
    );
    await page.keyboard.press("Escape");
    for (let i = 0; i < 5; i++) {
      const q = page.locator("#faq-question-" + i);
      if ((await q.getAttribute("aria-expanded")) !== "true") await q.click();
      check(
        `${width}: faq ${i} opens`,
        await page.locator("#faq-answer-" + i).isVisible(),
      );
      if (width === 390)
        await shot(page, `${width}-faq-${i}`, page.locator("#faq"));
    }
    await page.getByRole("button", { name: "На машине", exact: true }).click();
    check(
      `${width}: map toggle`,
      (await page
        .getByRole("button", { name: "На машине", exact: true })
        .getAttribute("aria-pressed")) === "true",
    );
    if (width === 1440 || width === 390)
      await shot(page, `${width}-map-car`, page.locator("#contacts"));
    await page.locator(".contacts__details>.button").click();
    if (width === 1440 || width === 390)
      await shot(page, `${width}-booking-empty`);
    await page.locator(".form-submit").click();
    check(
      `${width}: required validation`,
      (await page.locator(".field-error").count()) === 3,
    );
    await page.waitForFunction(
      () => document.activeElement?.id === "booking-name",
    );
    check(
      `${width}: first error focused`,
      await page
        .locator("#booking-name")
        .evaluate((e) => e === document.activeElement),
    );
    if (width === 1440 || width === 390)
      await shot(page, `${width}-booking-errors`);
    await page.locator("#booking-name").fill("Тестовый владелец");
    await page.locator("#booking-phone").fill("+7 (999) 123-45-67");
    await page.locator("#booking-pet").selectOption({ label: "Кошка" });
    await page.locator("#booking-service").selectOption("therapy");
    await page.locator(".booking-options summary").click();
    if (width === 1440 || width === 390)
      await shot(page, `${width}-booking-optional`);
    check(
      `${width}: optional controls visible`,
      (await page.locator("#booking-date").isVisible()) &&
        (await page.locator("#booking-doctor").isVisible()),
    );
    await page.locator("#booking-date").fill("2020-01-01");
    await page.locator(".booking-options summary").click();
    await page.locator(".form-submit").click();
    check(
      `${width}: invalid date reopens options`,
      await page.locator("#booking-date").isVisible(),
    );
    await page.waitForFunction(
      () => document.activeElement?.id === "booking-date",
    );
    check(
      `${width}: optional date error focused`,
      await page.locator("#date-error").isVisible(),
    );
    await page.locator("#booking-date").fill("");
    await page
      .locator("#booking-note")
      .fill("Вымышленный комментарий для проверки");
    await page.locator(".booking-options summary").click();
    let postRequests = 0;
    page.on("request", (req) => {
      if (req.method() !== "GET") postRequests++;
    });
    await page.locator(".form-submit").click();
    check(
      `${width}: demo success`,
      await page.locator(".booking-success").isVisible(),
    );
    check(`${width}: no sending`, postRequests === 0);
    check(
      `${width}: no persistent storage`,
      await page.evaluate(
        () => localStorage.length === 0 && sessionStorage.length === 0,
      ),
    );
    if (width === 1440 || width === 390)
      await shot(page, `${width}-booking-success`);
    await page
      .getByRole("button", { name: "Изменить данные", exact: true })
      .click();
    check(
      `${width}: edit keeps values`,
      (await page.locator("#booking-name").inputValue()) ===
        "Тестовый владелец",
    );
    await page.keyboard.press("Escape");
    await page.locator(".contacts__details>.button").click();
    check(
      `${width}: closing discards data`,
      (await page.locator("#booking-name").inputValue()) === "",
    );
    await page.keyboard.press("Escape");
    if (width <= 1030) {
      await page.locator(".header__menu").click();
      if (width === 390) await shot(page, "390-menu");
      for (let i = 0; i < 10; i++) {
        await page.keyboard.press("Tab");
        check(
          `${width}: menu focus trap ${i}`,
          await page.evaluate(() =>
            Boolean(document.activeElement.closest("dialog")),
          ),
        );
      }
      await page.locator('.mobile-nav a[href="#team"]').click();
      await page.waitForTimeout(350);
      check(
        `${width}: menu closes on navigation`,
        (await page.locator("dialog").count()) === 0,
      );
      check(`${width}: correct anchor`, new URL(page.url()).hash === "#team");
      await page.locator(".header__menu").click();
      await page.keyboard.press("Escape");
      check(
        `${width}: menu returns focus`,
        await page
          .locator(".header__menu")
          .evaluate((e) => e === document.activeElement),
      );
    }
    await page.locator(".contact-lines>button").click();
    if (width === 1440 || width === 390)
      await shot(page, `${width}-contact-dialog`);
    await page.keyboard.press("Escape");
    await page.getByRole("button", { name: "О данных", exact: true }).click();
    if (width === 1440 || width === 390)
      await shot(page, `${width}-privacy-dialog`);
    await page.keyboard.press("Escape");
    check(
      `${width}: no visible AI labels`,
      !(await page.locator("body").innerText()).includes("создано ИИ"),
    );
    await page.close();
  }
  const offline = await browser.newPage({
    viewport: { width: 390, height: 844 },
    reducedMotion: "reduce",
  });
  await offline.goto("file://" + path.resolve(output, "../preview.html"));
  await offline.evaluate(() =>
    document.querySelectorAll("img").forEach((e) => (e.loading = "eager")),
  );
  await offline.waitForFunction(() =>
    [...document.images].every((e) => e.complete && e.naturalWidth > 0),
  );
  check(
    "Standalone: all images embedded",
    await offline
      .locator("img")
      .evaluateAll((es) => es.every((e) => e.complete && e.naturalWidth > 0)),
  );
  check(
    "Standalone: reduced motion respected",
    await offline
      .locator(".button")
      .first()
      .evaluate((e) => getComputedStyle(e).transitionDuration === "0s"),
  );
  await offline.locator(".hero__actions .button").click();
  check(
    "Standalone: booking works without server",
    await offline.locator("#booking-name").isVisible(),
  );
  await offline.keyboard.press("Escape");
  await offline.close();
  check("No JS exceptions", report.errors.length === 0, report.errors);
  check(
    "No external network requests",
    report.network.length === 0,
    report.network,
  );
  report.passed = true;
} catch (error) {
  report.passed = false;
  report.failure = error.stack;
  console.error(error.stack);
  process.exitCode = 1;
} finally {
  await fs.writeFile(
    path.join(output, "results.json"),
    JSON.stringify(report, null, 2),
  );
  console.log(
    JSON.stringify(
      {
        passed: report.passed,
        checks: report.checks.length,
        errors: report.errors,
        network: report.network,
        failure: report.failure || null,
      },
      null,
      2,
    ),
  );
  await browser.close();
}
