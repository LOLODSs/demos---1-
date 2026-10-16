const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
import assert from "node:assert/strict";
import fs from "node:fs/promises";
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/local/bin/chromium",
  args: ["--no-sandbox"],
});
const base = process.env.BASE_URL || "http://127.0.0.1:4198";
const report = {
  passed: false,
  checks: [],
  viewports: [],
  errors: [],
  external: [],
};
const check = (name, v) => {
  report.checks.push({ name, passed: !!v });
  assert.ok(v, name);
};
try {
  for (const width of [
    320, 360, 390, 480, 600, 760, 768, 820, 1024, 1280, 1440, 1920,
  ]) {
    const p = await browser.newPage({
      viewport: { width, height: 1000 },
      reducedMotion: "reduce",
    });
    p.on("pageerror", (e) => report.errors.push(e.message));
    p.on("request", (r) => {
      if (/^https?:/.test(r.url()) && !r.url().startsWith(base))
        report.external.push(r.url());
    });
    await p.goto(base);
    await p.evaluate(async () => {
      await Promise.all(
        [...document.images].map(async (e) => {
          e.loading = "eager";
          await e.decode().catch(() => {});
        }),
      );
    });
    const d = await p.evaluate(() => ({
      overflow: document.documentElement.scrollWidth > innerWidth,
      height: document.querySelector(".site-scroll").scrollHeight,
      sections: [...document.querySelectorAll("main>section")].map((e) => ({
        id: e.id,
        height: Math.round(e.getBoundingClientRect().height),
      })),
      dock:
        innerWidth <= 760
          ? {
              height: document
                .querySelector(".mobile-actions")
                .getBoundingClientRect().height,
              overlap:
                document.querySelector(".site-scroll").getBoundingClientRect()
                  .bottom >
                document
                  .querySelector(".mobile-actions")
                  .getBoundingClientRect().top +
                  1,
            }
          : null,
      broken: [...document.images].filter((e) => !e.naturalWidth).length,
      small: [
        ...document.querySelectorAll(
          "main p,main button,main a,main small,main span",
        ),
      ]
        .filter(
          (e) =>
            e.getBoundingClientRect().width > 0 &&
            parseFloat(getComputedStyle(e).fontSize) < 14,
        )
        .map((e) => e.className),
    }));
    report.viewports.push({ width, ...d });
    check(width + ": no overflow", !d.overflow);
    check(width + ": all images loaded", !d.broken);
    check(width + ": text floor", !d.small.length);
    if (d.dock) {
      check(width + ": compact dock", d.dock.height === 57);
      check(width + ": dock does not overlap", !d.dock.overlap);
    }
    if (width <= 760) {
      check(
        width + ": reviews single column",
        await p
          .locator(".reviews__layout")
          .evaluate(
            (e) =>
              getComputedStyle(e).gridTemplateColumns.split(" ").length === 1,
          ),
      );
      check(
        width + ": care title word spacing",
        (await p.locator(".care-path__title").innerText())
          .replace(/\s+/g, " ")
          .includes("знакомства к"),
      );
    }
    for (const id of [
      "services",
      "about",
      "team",
      "reviews",
      "gallery",
      "faq",
      "contacts",
    ]) {
      await p
        .locator("#" + id)
        .evaluate((e) =>
          e.scrollIntoView({ block: "start", behavior: "instant" }),
        );
      check(
        width + ": " + id + " visible",
        await p
          .locator("#" + id)
          .evaluate((e) => getComputedStyle(e).opacity === "1"),
      );
    }
    if ([390, 1440].includes(width)) {
      const prefix = `qa/${width}`;
      await p
        .locator("#home")
        .evaluate((e) =>
          e.scrollIntoView({ behavior: "instant", block: "start" }),
        );
      await p.screenshot({ path: prefix + "-home.png" });
      for (const id of [
        "services",
        "about",
        "team",
        "reviews",
        "gallery",
        "faq",
        "contacts",
      ]) {
        await p.locator("#" + id).evaluate((e) => {
          const sc = document.querySelector(".site-scroll");
          if (innerWidth <= 760)
            sc.scrollTop = e.getBoundingClientRect().top + sc.scrollTop - 72;
          else e.scrollIntoView({ block: "start", behavior: "instant" });
        });
        await p.waitForTimeout(120);
        await p.screenshot({ path: prefix + "-" + id + ".png" });
      }
      const expand = p.locator(".service-card__details").first();
      await expand.locator("summary").click();
      check(
        width + ": service expands",
        (await expand.getAttribute("open")) !== null,
      );
      await p.screenshot({ path: prefix + "-service-open.png" });
      await expand.locator("summary").click();
      await p
        .locator(".visit-choice-group button")
        .filter({ hasText: "Собака" })
        .click();
      await p
        .locator(".visit-choice-group button")
        .filter({ hasText: "Повторный" })
        .click();
      check(
        width + ": ticket reflects choices",
        (await p.locator("#visit-ticket-title").innerText()).includes(
          "Собака · повторный",
        ),
      );
      const download = p.waitForEvent("download");
      await p.locator(".visit-ticket__actions .button").click();
      const file = await download;
      await file.saveAs(prefix + "-ticket-dog-repeat.png");
      check(
        width + ": PNG saved",
        file.suggestedFilename() === "lesnaya-dog-repeat.png",
      );
      await p.screenshot({ path: prefix + "-ticket-saved.png" });
      await p.locator(".review-controls button").last().click();
      check(
        width + ": review changes",
        (await p.locator(".review-person").innerText()).includes("Дмитрий"),
      );
      await p.locator(".faq-question").nth(1).click();
      check(
        width + ": FAQ expands",
        (await p
          .locator(".faq-question")
          .nth(1)
          .getAttribute("aria-expanded")) === "true",
      );
      await p.locator(".doctor-card__image").first().click();
      check(
        width + ": doctor profile",
        await p.locator(".doctor-profile").isVisible(),
      );
      await p.screenshot({ path: prefix + "-doctor.png" });
      await p.keyboard.press("Escape");
      await p.locator(".gallery-item").first().click();
      check(
        width + ": gallery opens",
        (await p.locator(".lightbox h3").innerText()) === "На осмотре",
      );
      await p.keyboard.press("ArrowRight");
      check(
        width + ": gallery keyboard",
        (await p.locator(".lightbox h3").innerText()) === "Приёмная",
      );
      await p.screenshot({ path: prefix + "-lightbox.png" });
      await p.keyboard.press("Escape");
      const dockOrHeader =
        width <= 760 ? ".mobile-actions" : ".header__actions";
      await p.locator(dockOrHeader + " .button--urgent").click();
      check(
        width + ": urgent opens short guidance",
        await p.locator(".urgent-dialog").isVisible(),
      );
      check(
        width + ": urgent has no form",
        (await p.locator("dialog form").count()) === 0,
      );
      check(
        width + ": unverified phone not callable",
        (await p.locator('a[href^="tel:"]').count()) === 0,
      );
      await p.screenshot({ path: prefix + "-urgent.png" });
      check(width + ": urgent has no booking action",
        (await p.locator('.urgent-dialog button,.urgent-dialog form').count()) === 0);
      await p.keyboard.press("Escape");
      await p.locator(dockOrHeader + " .button--amber").click();
      check(width + ": planned booking separate from urgent", await p.locator("#booking-name").isVisible());
      await p.locator(".booking-form button[type=submit]").click();
      check(
        width + ": validation",
        (await p.locator("[aria-invalid=true]").count()) === 3,
      );
      await p.screenshot({ path: prefix + "-form-errors.png" });
      await p.locator("#booking-name").fill("Проверка");
      await p.locator("#booking-phone").fill("+7 900 000 00 00");
      await p.locator("#booking-pet").selectOption({ label: "Кошка" });
      await p.locator(".booking-form button[type=submit]").click();
      check(
        width + ": honest local result",
        (await p.locator(".booking-success").innerText()).includes(
          "Заявка не отправлена",
        ),
      );
      await p.screenshot({ path: prefix + "-form-summary.png" });
      await p.keyboard.press("Escape");
      if (width <= 760) {
        await p.locator(".header__menu").click();
        check(
          width + ": mobile menu",
          await p.locator(".mobile-nav").isVisible(),
        );
        await p.screenshot({ path: prefix + "-menu.png" });
        await p.keyboard.press("Escape");
      }
      await p.emulateMedia({ media: "print" });
      check(
        width + ": only ticket prints",
        await p
          .locator(".visit-ticket")
          .evaluate((e) => getComputedStyle(e).visibility !== "hidden"),
      );
      await p.emulateMedia({ media: "screen" });
    }
    await p.close();
  }
  const offline = await browser.newPage({
    viewport: { width: 390, height: 844 },
  });
  offline.on("pageerror", (e) => report.errors.push(e.message));
  await offline.goto(new URL("../preview.html", import.meta.url).href);
  await offline.locator(".mobile-actions .button--urgent").click();
  check(
    "standalone urgent works",
    await offline.locator(".urgent-dialog").isVisible(),
  );
  await offline.close();
  check("No JS errors", !report.errors.length);
  check("No external requests", !report.external.length);
  report.passed = true;
} finally {
  await browser.close();
  await fs.writeFile("qa/design-results.json", JSON.stringify(report, null, 2));
  console.log(
    JSON.stringify({
      passed: report.passed,
      checks: report.checks.length,
      errors: report.errors,
    }),
  );
}
