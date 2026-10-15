import { build } from "esbuild";
import { realpathSync } from "node:fs";
import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
export const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
export const buildOptions = {
  absWorkingDir: root,
  entryPoints: ["src/main.jsx"],
  bundle: true,
  outdir: "dist/assets",
  entryNames: "main",
  minify: true,
  sourcemap: false,
  target: ["es2020"],
  jsx: "automatic",
  format: "esm",
  define: { "process.env.NODE_ENV": '"production"' },
  logLevel: "warning",
};
const favicon =
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" rx="9" fill="#163728"/><path d="M20 33V16M20 23C11 23 8 15 9 9c8 0 12 6 11 14ZM20 18C20 10 26 6 33 7c0 8-5 12-13 11Z" fill="none" stroke="#efb86e" stroke-width="1.7" stroke-linejoin="round"/></svg>',
  );
const head = `<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#0e251c"><meta name="robots" content="noindex,nofollow"><meta name="description" content="Ветеринарная клиника Лесная. Бережный подход к кошкам и собакам: услуги, команда, подготовка к визиту и запись."><link rel="icon" href="${favicon}"><title>Лесная — бережно к тем, кто вам дорог</title>`;
export async function buildSite() {
  await rm(path.join(root, "dist"), { recursive: true, force: true });
  await mkdir(path.join(root, "dist/assets"), { recursive: true });
  await cp(path.join(root, "public"), path.join(root, "dist"), {
    recursive: true,
  });
  await build(buildOptions);
  await writeFile(
    path.join(root, "dist/index.html"),
    `<!doctype html><html lang="ru"><head>${head}<link rel="stylesheet" href="./assets/main.css"></head><body><div id="root"></div><script type="module" src="./assets/main.js"></script></body></html>`,
  );
  const standalone = await build({
    ...buildOptions,
    format: "iife",
    write: false,
  });
  const js = standalone.outputFiles
    .find((file) => file.path.endsWith(".js"))
    .text.replace(/<\/script/gi, "<\\/script");
  const css = standalone.outputFiles.find((file) =>
    file.path.endsWith(".css"),
  ).text;
  const images = {};
  for (const name of await readdir(path.join(root, "public/images"))) {
    if (name.endsWith(".webp"))
      images[name] =
        "data:image/webp;base64," +
        (await readFile(path.join(root, "public/images", name))).toString(
          "base64",
        );
  }
  const video =
    "data:video/mp4;base64," +
    (await readFile(path.join(root, "public/videos/hero-pets.mp4"))).toString(
      "base64",
    );
  await writeFile(
    path.join(root, "preview.html"),
    `<!doctype html><html lang="ru"><head>${head}<style>${css}</style></head><body><div id="root"></div><script>globalThis.__LESNAYA_IMAGES__=${JSON.stringify(images)};globalThis.__LESNAYA_VIDEO__=${JSON.stringify(video)};${js}</script></body></html>`,
  );
  console.log(
    "Built dist/ and standalone preview.html (no external resources).",
  );
}
if (
  process.argv[1] &&
  realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)
)
  await buildSite();
