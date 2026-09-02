/**
 * Apply known fixes when smoke-check / logs match patterns.
 * Exits 0 always; prints CHANGES=1 when files were modified.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
let changes = 0;

function ensure(rel, content) {
  const path = join(root, rel);
  if (!existsSync(path)) {
    writeFileSync(path, content, "utf8");
    console.log(`+ created ${rel}`);
    changes++;
    return;
  }
  const cur = readFileSync(path, "utf8");
  if (cur !== content) {
    writeFileSync(path, content, "utf8");
    console.log(`~ updated ${rel}`);
    changes++;
  }
}

function patch(rel, needle, insert) {
  const path = join(root, rel);
  if (!existsSync(path)) return;
  const cur = readFileSync(path, "utf8");
  if (cur.includes(needle)) return;
  if (!cur.includes(insert.trim().split("\n")[0])) {
    writeFileSync(path, cur.replace(/^/, insert), "utf8");
    console.log(`~ patched ${rel}`);
    changes++;
  }
}

function patchMainImport() {
  const path = join(root, "src/main.tsx");
  if (!existsSync(path)) return;
  let cur = readFileSync(path, "utf8");
  if (cur.includes('import "./buffer-polyfill"')) return;
  cur = cur.replace(/^import/m, 'import "./buffer-polyfill";\nimport');
  writeFileSync(path, cur, "utf8");
  console.log("~ patched src/main.tsx (buffer import)");
  changes++;
}

function ensurePackageDep() {
  const path = join(root, "package.json");
  const pkg = JSON.parse(readFileSync(path, "utf8"));
  pkg.dependencies ||= {};
  if (!pkg.dependencies.buffer) {
    pkg.dependencies.buffer = "^6.0.3";
    writeFileSync(path, `${JSON.stringify(pkg, null, 2)}\n`, "utf8");
    console.log("~ added buffer dependency");
    changes++;
    spawnSync("npm", ["install"], { cwd: root, stdio: "inherit", shell: true });
  }
}

function ensureViteConfig() {
  const path = join(root, "vite.config.ts");
  if (!existsSync(path)) return;
  let cur = readFileSync(path, "utf8");
  if (cur.includes('buffer: "buffer/"')) return;
  if (!cur.includes("optimizeDeps")) {
    cur = cur.replace(
      /resolve:\s*\{/,
      `resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      buffer: "buffer/",
    },
  },
  optimizeDeps: {
    include: ["buffer"],
  },
  define: {
    global: "globalThis",
  },
  resolve_OLD: {`,
    );
    writeFileSync(path, cur, "utf8");
    console.log("~ patched vite.config.ts");
    changes++;
  }
}

// --- detect issues from argv / stdin ---
const input = process.argv.slice(2).join("\n");
const logBlob = input || "";

const needsBuffer =
  /Buffer is not defined/i.test(logBlob) ||
  /WHITE_SCREEN/i.test(logBlob) ||
  process.env.FORCE_FIX_BUFFER === "1";

if (needsBuffer) {
  ensure(
    "src/buffer-polyfill.ts",
    `import { Buffer } from "buffer";

(globalThis as unknown as { Buffer: typeof Buffer }).Buffer = Buffer;
`,
  );
  patchMainImport();
  ensurePackageDep();
  ensureViteConfig();
}

console.log(`CHANGES=${changes}`);
process.exit(0);
