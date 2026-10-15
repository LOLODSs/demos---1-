const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE || "playwright"
);
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL("../", import.meta.url));
const b = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/local/bin/chromium",
  args: ["--no-sandbox"],
});
const report = { passed: false, checks: [] };
const inspect = async (p, name) => {
  const text = await p.locator("body").innerText();
  const matches = text.match(/демо\S*|вымышлен\S*|демонстраци\S*/giu) || [];
  report.checks.push({ name, passed: matches.length === 0, matches });
  assert.equal(matches.length, 0, name);
};
try {
  for (const width of [1440, 390]) {
    const p = await b.newPage({
      viewport: { width, height: 1000 },
      reducedMotion: "reduce",
    });
    await p.goto(process.env.BASE_URL || "http://127.0.0.1:4196");
    await inspect(p, width + ": page");
    for (let i = 0; i < 5; i++) {
      await p.locator("#faq-question-" + i).click();
      await inspect(p, width + ": FAQ " + i);
    }
    for (let i = 0; i < 3; i++) {
      await p.locator(".doctor-card__image").nth(i).click();
      await inspect(p, width + ": specialist " + i);
      await p.keyboard.press("Escape");
    }
    await p.locator(".contact-lines>button").click();
    await inspect(p, width + ": contacts");
    await p.keyboard.press("Escape");
    await p.getByRole("button", { name: "О данных", exact: true }).click();
    await inspect(p, width + ": data information");
    await p.keyboard.press("Escape");
    if (width === 390) {
      await p.locator(".header__menu").click();
      await inspect(p, width + ": menu");
      await p.keyboard.press("Escape");
    }
    await p.locator(".hero__actions .button").click();
    await inspect(p, width + ": form");
    await p.locator("#booking-name").fill("Алексей");
    await p.locator("#booking-phone").fill("+7 999 123-45-67");
    await p.locator("#booking-pet").selectOption("Кошка");
    await p.locator(".form-submit").click();
    await inspect(p, width + ": result");
    assert.match(
      await p.locator(".booking-success").innerText(),
      /Заявка не отправлена/,
    );
    await p.close();
  }
  report.passed = true;
} finally {
  await b.close();
  await fs.writeFile(
    root + "qa/no-labels-results.json",
    JSON.stringify(report, null, 2),
  );
  console.log(
    JSON.stringify({ passed: report.passed, checks: report.checks.length }),
  );
}
