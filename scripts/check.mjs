import assert from "node:assert/strict";
import { access, readFile, stat } from "node:fs/promises";
import { root } from "./build.mjs";
import {
  services,
  doctors,
  gallery,
  faqs,
  navigation,
  money,
} from "../src/data.js";
assert.equal(services.length, 6);
assert.equal(doctors.length, 3);
assert.ok(services.every((s) => s.when && s.priceLabel));
assert.equal(new Set(services.map((s) => s.id)).size, services.length);
assert.equal(new Set(doctors.map((d) => d.id)).size, doctors.length);
assert.ok(faqs.length >= 5);
assert.ok(
  navigation.every(([id]) =>
    ["services", "about", "team", "reviews", "contacts"].includes(id),
  ),
);
assert.equal(money(1200).replace(/\s/g, ""), "1200₽");
for (const d of doctors) assert.ok(services.some((s) => s.id === d.service));
for (const image of new Set([
  "hero-pets.webp",
  "hero-pets-mobile.webp",
  "hero-pets-compact.webp",
  "hero-film-poster.webp",
  "visit-cat-illustration.webp",
  "visit-dog-illustration.webp",
  ...doctors.map((d) => d.image),
  ...gallery.map((g) => g.image),
]))
  await access(root + "/public/images/" + image);
await access(root + "/public/videos/hero-pets.mp4");
const app = await readFile(root + "/src/App.jsx", "utf8");
assert.ok(!/NatureCanvas|Preloader|Cursor|ProgressVine/.test(app));
const booking = await readFile(root + "/src/components/Booking.jsx", "utf8");
assert.ok(
  !/\bfetch\(|localStorage\.|sessionStorage\.|XMLHttpRequest/.test(booking),
);
const css = await readFile(root + "/src/styles.css", "utf8");
assert.ok(css.includes("prefers-reduced-motion"));
function luminance(hex) {
  const c = hex
    .replace("#", "")
    .match(/../g)
    .map((v) => parseInt(v, 16) / 255)
    .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return c[0] * 0.2126 + c[1] * 0.7152 + c[2] * 0.0722;
}
const pairs = [
  ["Illustrated scene stage labels", "#5e6c60", "#e9ecdf"],
  ["Urgent button", "#fffaf5", "#a3342c"],
  ["Urgent note", "#692b25", "#f8ebe5"],
  ["Body", "#24372b", "#f7f5ee"],
  ["Secondary", "#5e6c60", "#f7f5ee"],
  ["Notebook secondary and eyebrow", "#5e6c60", "#fffdf6"],
  ["Featured service secondary", "#5e6c60", "#eaf0e4"],
  ["Header urgent", "#fffaf5", "#a3342c"],
  ["Mobile urgent", "#fffaf5", "#a3342c"],
  ["Light button", "#173427", "#efb86e"],
  ["Dark button", "#fffef9", "#163728"],
  ["Dark metadata", "#bcccaf", "#0e251c"],
  ["Eyebrow", "#5e715d", "#f7f5ee"],
  ["Form error", "#a52e24", "#fffef9"],
  ["Form placeholder", "#697660", "#fffef9"],
];
const contrasts = pairs.map(([name, foreground, background]) => {
  const a = luminance(foreground),
    b = luminance(background);
  const ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  assert.ok(ratio >= 4.5, `${name}: ${ratio}`);
  return { name, ratio: Number(ratio.toFixed(2)) };
});
const bytes = (await stat(root + "/dist/assets/main.js")).size;
console.log(
  JSON.stringify(
    {
      passed: true,
      data: "6 services, 3 doctors, consistent references",
      assets: "all present",
      network: "form has no sending or persistence",
      javascriptBytes: bytes,
      contrasts,
    },
    null,
    2,
  ),
);
