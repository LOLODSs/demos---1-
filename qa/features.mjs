const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE || "playwright"
);
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const output = path.dirname(fileURLToPath(import.meta.url));
const base = process.env.BASE_URL || "http://127.0.0.1:4174";
const report = { checks: [], errors: [], network: [] };
const check = (name, passed) => {
  report.checks.push({ name, passed: Boolean(passed) });
  assert.ok(passed, name);
};
const browser = await chromium.launch({
  executablePath:
    process.env.CHROMIUM_PATH ||
    (existsSync("/usr/local/bin/chromium")
      ? "/usr/local/bin/chromium"
      : undefined),
  args: ["--no-sandbox"],
});
const shot = async (p, name, locator) => {
  if (locator)
    await locator.screenshot({
      path: path.join(output, name + ".png"),
      animations: "disabled",
      style: ".header,.mobile-actions,.skip-link{visibility:hidden!important}",
    });
  else
    await p.screenshot({
      path: path.join(output, name + ".png"),
      animations: "disabled",
    });
};
try {
  for (const width of [320, 390, 768, 1024, 1100, 1280, 1440]) {
    const p = await browser.newPage({
      viewport: { width, height: width < 760 ? 844 : 1000 },
      reducedMotion: "reduce",
      locale: "ru-RU",
    });
    p.on("pageerror", (e) => report.errors.push({ width, message: e.message }));
    p.on("request", (r) => {
      if (!r.url().startsWith(base) && !r.url().startsWith("data:"))
        report.network.push(r.url());
    });
    await p.goto(base, { waitUntil: "networkidle" });
    check(
      `${width}: no overflow`,
      await p.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    );
    const urgent = p.locator(
      width <= 760 ? ".mobile-actions .button--urgent" : ".header__urgent",
    );
    check(
      `${width}: urgent visible before scrolling`,
      await urgent.isVisible(),
    );
    check(
      `${width}: urgent target >=44`,
      await urgent.evaluate((e) => e.getBoundingClientRect().height >= 44),
    );
    await urgent.click();
    check(
      `${width}: direct urgent form`,
      (await p.locator("#booking-title").innerText()) === "Срочная запись",
    );
    check(
      `${width}: emergency caution visible`,
      await p.locator(".urgent-notice").isVisible(),
    );
    check(
      `${width}: demo caution`,
      (await p.locator(".urgent-notice").innerText()).includes(
        "не заменяет экстренную помощь",
      ),
    );
    await p.waitForFunction(() =>
      document.activeElement?.classList.contains("urgent-notice"),
    );
    check(
      `${width}: caution receives initial focus`,
      await p
        .locator(".urgent-notice")
        .evaluate((e) => document.activeElement === e),
    );
    if (width === 1440 || width === 390)
      await shot(p, `${width}-urgent-booking`);
    await p.locator("#booking-name").fill("Демо владелец");
    await p.locator("#booking-phone").fill("+7 999 123-45-67");
    await p.locator("#booking-pet").selectOption("Собака");
    await p.locator(".form-submit").click();
    check(
      `${width}: urgent demo confirmation`,
      await p.locator(".booking-urgent-status").isVisible(),
    );
    check(
      `${width}: no real booking promise`,
      (await p.locator(".booking-success .demo-note").innerText()).includes(
        "Приём не забронирован",
      ),
    );
    await p.keyboard.press("Escape");
    check(
      `${width}: urgent returns focus`,
      await urgent.evaluate((e) => document.activeElement === e),
    );
    await p.locator(".hero__actions .button").click();
    check(
      `${width}: normal form not urgent`,
      (await p.locator("#booking-title").innerText()) === "Запись на приём" &&
        (await p.locator(".urgent-notice").count()) === 0,
    );
    await p.keyboard.press("Escape");
    const builder = p.locator("#about");
    check(
      `${width}: no personal fields in card builder`,
      (await builder.locator("input,select,textarea").count()) === 0,
    );
    const firstLine = await builder
      .locator(".visit-line__thread")
      .getAttribute("d");
    for (const pet of ["Кошка", "Собака"])
      for (const visit of ["Первый приём", "Повторный"]) {
        await builder.getByRole("button", { name: pet, exact: true }).click();
        await builder.getByRole("button", { name: visit, exact: true }).click();
        const title = await p.locator("#visit-ticket-title").innerText();
        check(
          `${width}: ${pet}/${visit} heading`,
          title ===
            `${pet} · ${visit === "Повторный" ? "повторный приём" : "первый приём"}`,
        );
        const cardText = await p.locator(".visit-ticket__body").innerText();
        check(
          `${width}: ${pet} transport`,
          cardText.includes(pet === "Кошка" ? "переноску" : "Поводок"),
        );
        check(
          `${width}: ${visit} checklist`,
          cardText.includes(
            visit === "Повторный" ? "Предыдущие назначения" : "Ветпаспорт",
          ),
        );
        check(
          `${width}: exactly two selected choices`,
          (await builder.locator("[aria-pressed=true]").count()) === 2,
        );
        check(
          `${width}: not a medical prescription`,
          cardText.includes("не назначает лечение"),
        );
        if (width === 1440 || width === 390)
          await shot(
            p,
            `${width}-visit-${pet === "Кошка" ? "cat" : "dog"}-${visit === "Повторный" ? "repeat" : "first"}`,
            builder,
          );
      }
    check(
      `${width}: line changes for repeat visit`,
      (await builder.locator(".visit-line__thread").getAttribute("d")) !==
        firstLine,
    );
    await builder.getByRole("button", { name: "Кошка", exact: true }).focus();
    await p.keyboard.press("Space");
    check(
      `${width}: keyboard species choice`,
      (await builder
        .getByRole("button", { name: "Кошка", exact: true })
        .getAttribute("aria-pressed")) === "true",
    );
    await builder
      .getByRole("button", { name: "Первый приём", exact: true })
      .focus();
    await p.keyboard.press("Enter");
    check(
      `${width}: keyboard visit choice`,
      (await builder
        .getByRole("button", { name: "Первый приём", exact: true })
        .getAttribute("aria-pressed")) === "true",
    );
    await builder
      .getByRole("button", { name: "К записи", exact: true })
      .click();
    check(
      `${width}: card species preselected`,
      (await p.locator("#booking-pet").inputValue()) === "Кошка",
    );
    check(
      `${width}: no inferred medical service`,
      (await p.locator("#booking-service").inputValue()) === "",
    );
    await p.keyboard.press("Escape");
    check(
      `${width}: card selection retained`,
      (await p.locator("#visit-ticket-title").innerText()) ===
        "Кошка · первый приём",
    );
    await p.evaluate(() => {
      window.__printCalls = 0;
      window.print = () => window.__printCalls++;
    });
    await builder
      .getByRole("button", { name: "Печать / PDF", exact: true })
      .click();
    check(
      `${width}: print button invokes browser print`,
      await p.evaluate(() => window.__printCalls === 1),
    );
    await p.emulateMedia({ media: "print" });
    check(
      `${width}: ticket prints`,
      await p.locator(".visit-ticket").isVisible(),
    );
    check(
      `${width}: no controls in print`,
      !(await p.locator(".visit-ticket__actions").isVisible()) &&
        !(await p.locator(".visit-builder__left").isVisible()),
    );
    check(
      `${width}: no unrelated page in print`,
      !(await p.locator("header").isVisible()) &&
        !(await p.locator("#services").isVisible()) &&
        !(await p.locator(".mobile-actions").isVisible()),
    );
    if (width === 1440)
      await p.pdf({
        path: path.join(output, "print-cat-first.pdf"),
        printBackground: true,
      });
    await p.emulateMedia({ media: "screen" });
    await builder.getByRole("button", { name: "Собака", exact: true }).click();
    await builder
      .getByRole("button", { name: "Повторный", exact: true })
      .click();
    if (width === 1440) {
      await p.emulateMedia({ media: "print" });
      await p.pdf({
        path: path.join(output, "print-dog-repeat.pdf"),
        printBackground: true,
      });
      await p.emulateMedia({ media: "screen" });
    }
    check(
      `${width}: no persistence`,
      await p.evaluate(
        () => localStorage.length === 0 && sessionStorage.length === 0,
      ),
    );
    check(
      `${width}: final no overflow`,
      await p.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    );
    await p.close();
  }
  check("no JS errors", report.errors.length === 0);
  check("no external network", report.network.length === 0);
  report.passed = true;
} catch (e) {
  report.passed = false;
  report.failure = e.stack;
  process.exitCode = 1;
  console.error(e.stack);
} finally {
  await fs.writeFile(
    path.join(output, "features-results.json"),
    JSON.stringify(report, null, 2),
  );
  console.log(
    JSON.stringify({
      passed: report.passed,
      checks: report.checks.length,
      failure: report.failure || null,
      errors: report.errors,
      network: report.network,
    }),
  );
  await browser.close();
}
