import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

const packageJson = JSON.parse(readFileSync("package.json", "utf8")) as { version: string };

function readCommit(): string {
  if (existsSync(".pages-source-commit")) {
    return readFileSync(".pages-source-commit", "utf8").trim();
  }

  try {
    return execSync("git rev-parse --short HEAD", { encoding: "utf8" }).trim();
  } catch {
    return "dev";
  }
}

export default defineConfig({
  base: process.env.VITE_PUBLIC_BASE_PATH ?? "/lenia-life-lab/",
  build: {
    outDir: "docs",
    emptyOutDir: false,
    sourcemap: false,
    rollupOptions: {
      output: {
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]"
      }
    }
  },
  css: {
    postcss: resolve("postcss.config.js")
  },
  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version),
    __GIT_COMMIT__: JSON.stringify(readCommit())
  },
  test: {
    environment: "jsdom",
    globals: true,
    include: ["tests/unit/**/*.test.ts"]
  }
});
