import { defineConfig } from "vite-plus";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      src: path.resolve("./src"),
    },
  },
  test: {
    // Vitest v4 compatibility: preserve mock call history.
    // Remove after tests no longer rely on calls from setup or earlier tests.
    // https://viteplus.dev/guide/vitest-v5#remove-unneeded-compatibility-settings
    // https://vitest.dev/guide/migration/#clearmocks-is-enabled-by-default
    clearMocks: false,
    globals: true,
    coverage: {
      reporter: ["text", "html"],
    },
  },
});
