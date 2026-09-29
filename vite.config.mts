import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { defineConfig, type Plugin } from "vite-plus";
import builtins from "builtin-modules";
import path from "node:path";

const isWatch = process.argv.includes("--watch");

function devOutDir(): string {
  const pluginsDir = process.env.PLUGINS_DIR?.trim();
  return pluginsDir
    ? path.join(pluginsDir, "better-note-width")
    : "test-vault/.obsidian/plugins/better-note-width";
}

const outDir = isWatch ? devOutDir() : "dist";

function copyManifest(): Plugin {
  return {
    name: "copy-manifest",
    apply: "build",
    closeBundle() {
      const source = path.resolve("manifest.json");
      const destination = path.resolve(outDir, "manifest.json");
      if (!existsSync(path.dirname(destination))) {
        mkdirSync(path.dirname(destination), { recursive: true });
      }
      copyFileSync(source, destination);
      if (isWatch) console.log(`[better-note-width] Deployed to ${outDir}`);
    },
  };
}

export default defineConfig({
  test: {
    // Vitest v4 compatibility: preserve mock call history.
    // Remove after tests no longer rely on calls from setup or earlier tests.
    // https://viteplus.dev/guide/vitest-v5#remove-unneeded-compatibility-settings
    // https://vitest.dev/guide/migration/#clearmocks-is-enabled-by-default
    clearMocks: false,
  },
  plugins: [copyManifest()],
  resolve: {
    alias: {
      src: path.resolve("./src"),
    },
  },
  build: {
    lib: {
      entry: "src/main.ts",
      formats: ["cjs"],
      fileName: () => "main.js",
    },
    rollupOptions: {
      external: [
        "obsidian",
        "electron",
        "@codemirror/autocomplete",
        "@codemirror/collab",
        "@codemirror/commands",
        "@codemirror/language",
        "@codemirror/lint",
        "@codemirror/search",
        "@codemirror/state",
        "@codemirror/view",
        "@lezer/common",
        "@lezer/highlight",
        "@lezer/lr",
        ...builtins,
      ],
      output: {
        entryFileNames: "main.js",
        assetFileNames: (info) =>
          info.name?.endsWith(".css") ? "styles.css" : (info.name ?? "asset"),
      },
    },
    outDir,
    emptyOutDir: !isWatch,
    sourcemap: isWatch ? "inline" : false,
    minify: !isWatch,
    copyPublicDir: false,
  },
});
