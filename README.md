# Mintlify example

Sample Mintlify docs site with Encatch page feedback in the footer.

<table>
<tr>
<td valign="top">
<p><strong>Don't have the feedback form yet?</strong></p>
<p>Click the button to install a ready-made documentation feedback form in your Encatch workspace. It creates the combined form used in this example — helpful votes, suggest edits, and issue reports — with no manual form builder setup.</p>
</td>
<td align="center" valign="middle" width="210">
<a href="https://templates.encatch.com/templates/preview/documentation-frameworks/docs-feedback"><img src="https://encatch.com/button" alt="Encatch it" width="210" height="42"></a>
</td>
</tr>
</table>

## Project layout

Mintlify site content lives in **`docs/`** (the [content directory](https://www.mintlify.com/docs/deploy/monorepo)). Playwright tests and dev tooling stay at the repo root.

```
mintlify-examples/
├── docs/                    ← Mintlify content directory (run mint dev here)
│   ├── docs.json
│   ├── index.mdx
│   ├── docs-feedback.mdx
│   ├── encatch-config.js    ← gitignored
│   ├── encatch-init.js
│   ├── custom.css
│   └── snippets/
├── tests/
├── package.json
└── playwright.config.ts
```

On Mintlify deploy, set the monorepo documentation path to `/docs`.

## Setup

Mintlify requires **Node LTS** (20 or 22). Node 25+ is not supported.

Install the [Mintlify CLI](https://www.mintlify.com/docs/cli/install):

```bash
npm i -g mint
```

If your default Node is 25+, install Node 22 as well (Homebrew keeps it side by side):

```bash
brew install node@22
```

**Option A — Install the form:** use the button above if you need the feedback form created in Encatch.

**Option B — Wire this site:** Copy `docs/encatch-config.js.example` → `docs/encatch-config.js` and set your Encatch publishable key and combined form slug / question slugs.

**Publishable key:** [admin.encatch.com](https://admin.encatch.com) → **Settings** → **Publishable key**.

## Run

From the documentation-platforms repo root:

```bash
./docs dev mintlify
```

Or from `docs/` directly:

```bash
cd docs
PATH="/opt/homebrew/opt/node@22/bin:$PATH" mint dev
```

Open http://localhost:3000 (or the port shown in the terminal).

Playwright visual tests use a dedicated dev server on **port 3333** (`scripts/mint-dev.sh`) so they do not conflict with other apps on 3000.

## Encatch integration

This example uses the same pattern as the Fumadocs examples, adapted for Mintlify:

1. **`docs/encatch-config.js`** — publishable key + combined form slug and question slugs (copy from `docs/encatch-config.js.example`). Must use this filename so it loads before `encatch-init.js`.
2. **`docs/encatch-init.js`** — loads the Encatch SDK from CDN, initializes it, and exposes form helpers on `window.EncatchDocs`.
3. **`docs/snippets/docs-page-feedback.jsx`** — footer UI (helpful yes/no, suggest edits, raise issue).
4. **Each MDX page** — imports `<DocsPageFeedback />` at the bottom of the page.

Mintlify [auto-includes every `.js` file in the content directory](https://www.mintlify.com/docs/customize/custom-scripts) on each page (after interactive). Only commit `encatch-init.js` — keep `encatch-config.js` gitignored. Use `encatch-config.js.example` (not `.js`) so the template is not injected.

`encatch-init.js` syncs Encatch theme with Mintlify’s light/dark mode by watching the `dark` class on `<html>` and calling `setTheme('light' | 'dark')`, matching the Docusaurus example pattern.

**Local `mint dev` note:** Mintlify’s live preview may not inject root `.js` files the same way as a deployed site. The files are still served at `/encatch-config.js` and `/encatch-init.js` for manual checks. Playwright tests load them explicitly when needed.

## Pages

| Pages |
|-------|
| `/index`, `/docs-feedback` |
