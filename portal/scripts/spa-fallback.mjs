/**
 * GitHub Pages has no server rewrite for SPA routes.
 * Missing paths (e.g. /referendums/EQ…) serve 404.html — copy of index so React Router boots.
 */
import { copyFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const dist = join(dirname(fileURLToPath(import.meta.url)), "..", "dist");
const index = join(dist, "index.html");
const fallback = join(dist, "404.html");

if (!existsSync(index)) {
  console.error("spa-fallback: dist/index.html missing — run vite build first");
  process.exit(1);
}
copyFileSync(index, fallback);
console.log("spa-fallback: wrote dist/404.html");
