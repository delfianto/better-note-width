# Better Note Width contributor guide

These instructions apply to the entire repository.

## Project purpose

Better Note Width is an Obsidian community plugin that applies one global readable line length to Markdown notes and makes notes matching user-defined regular expressions full width. It must never modify note content or frontmatter.

## Toolchain

- Use Bun for dependency installation and scripts.
- The codebase is strict TypeScript bundled as CommonJS by Vite+.
- Tests use Vitest.
- Formatting and linting use Oxfmt and Oxlint through Vite+.
- Use Obsidian's native settings components. Do not add a UI framework unless the interface becomes complex enough to justify it.

Run these checks before considering a change complete:

```bash
bun run check
bun run type-check
bun run test
bun run build
```

Use `bun run format` after editing source or configuration files. Production artifacts are generated in `dist/` and must not be committed.

## Architecture

- `src/main.ts` owns the plugin lifecycle, persisted settings, and Obsidian event registration.
- `src/settings.ts` defines settings, defaults, migration/normalization, and CSS width serialization.
- `src/settings-tab.ts` renders the native Obsidian settings UI.
- `src/rule-matcher.ts` is the pure regular-expression compilation and matching layer.
- `src/leaf-width-manager.ts` applies and removes width styling across open Markdown leaves.
- `src/styles.css` contains only presentation that cannot be expressed through the per-leaf CSS variable.
- `test/` contains unit tests for pure behavior. Keep Obsidian-independent logic outside UI and lifecycle classes so it remains easy to test.

## Behavioral invariants

- Apply ordinary widths through Obsidian's `--file-line-width` CSS variable.
- Match rules against the complete vault-relative path after normalizing path separators to `/`.
- Preserve named rules even when their expression is invalid. Invalid and empty expressions must be ignored rather than matching notes or preventing other rules from working.
- Case-insensitive matching is the default; case sensitivity is controlled by the saved setting.
- Reapply styles to every open Markdown leaf, not only the active leaf, so split panes remain consistent.
- Remove all classes, data attributes, and inline CSS properties installed by the plugin during unload.
- Do not introduce per-note state, YAML properties, or writes to vault files.
- Obsidian's built-in Readable line length option is expected to be enabled; document this requirement rather than changing Obsidian's preference.

## Change guidelines

- Keep defaults in `DEFAULT_SETTINGS` and normalize persisted data defensively for upgrades.
- Add or update tests for matcher behavior and settings migrations when either changes.
- Keep `package.json`, `manifest.json`, and `versions.json` versions synchronized when releasing.
- Preserve mobile compatibility and avoid Electron-only APIs.
- Treat undocumented Obsidian APIs and theme-specific selectors as compatibility risks; prefer public APIs and `--file-line-width`.
- Keep dependencies minimal. Runtime dependencies require a concrete benefit for this small plugin.
