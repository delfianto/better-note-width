# Better Note Width

Better Note Width gives every Markdown note in Obsidian a consistent, readable line length while allowing selected files to use the full editor width.

Unlike per-note width plugins, it does not write frontmatter or store an override for every file. You configure one global width and a small set of named regular-expression rules.

## Features

- One vault-wide readable line length in `ch`, `px`, or `%`
- Named regular-expression exceptions for full-width notes
- Path-aware matching, including files in any folder
- Optional case-sensitive matching
- Live updates across split panes, reading mode, source mode, and Live Preview
- No changes to note contents or frontmatter
- Works on desktop and mobile

The default width is `80ch`. These full-width rules are included initially:

- Claude instructions: `(^|/)CLAUDE\.md$`
- Agent instructions: `(^|/)AGENTS\.md$`
- README files: `(^|/)README\.md$`

Rules are matched against each file's complete vault-relative path. Matching is case-insensitive by default. For example, `(^|/)README\.md$` matches both `README.md` and `docs/README.md`, but not `README.md.bak`.

## Installation

### Manual installation

1. Run `bun install` and `bun run build`.
2. Copy `dist/main.js`, `dist/manifest.json`, and `dist/styles.css` to `<vault>/.obsidian/plugins/better-note-width/`.
3. Reload Obsidian and enable **Better Note Width** in **Settings → Community plugins**.

Obsidian's **Settings → Editor → Readable line length** option must be enabled. Better Note Width customizes the CSS variable used by that feature.

## Configuration

Open **Settings → Better Note Width**.

- **Global width** controls the readable width for ordinary Markdown notes.
- **Case-sensitive matching** controls the regular-expression flags.
- Each **Full-width rule** has a human-readable name and a JavaScript regular expression. Do not include surrounding `/` delimiters.
- Invalid expressions are outlined in red and ignored until corrected.

Some useful expressions:

```text
(^|/)README\.md$              # README.md in any folder
^Projects/                    # every note below Projects/
\.wide\.md$                   # files ending in .wide.md
^(CLAUDE|AGENTS|README)\.md$  # selected root-level files only
```

## Development

The project follows the Bun, TypeScript, Vite+, Vitest, Oxlint, and Oxfmt setup used by Inkwell.

```bash
bun install
bun run dev        # watch and deploy to the test vault or PLUGINS_DIR
bun run check
bun run type-check
bun run test
bun run build
```

For live development, copy `.envrc.example` to `.envrc` and point `PLUGINS_DIR` at a vault's `.obsidian/plugins` directory. Without it, watch builds go to `test-vault/.obsidian/plugins/better-note-width/`.

## License

[MIT](LICENSE)
