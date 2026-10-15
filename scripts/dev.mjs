import { context } from "esbuild";
import { buildSite, buildOptions, root } from "./build.mjs";
await buildSite();
const ctx = await context({ ...buildOptions, minify: false, sourcemap: true });
await ctx.watch();
const { port } = await ctx.serve({
  servedir: root + "/dist",
  port: 5173,
  host: "127.0.0.1",
});
console.log(
  `Разработка: http://127.0.0.1:${port}. После изменения исходников обновите страницу.`,
);
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, async () => {
    await ctx.dispose();
    process.exit(0);
  });
