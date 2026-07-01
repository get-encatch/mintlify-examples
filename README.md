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

`./docs dev mintlify` from the repo root will automatically use Node 22 when needed. For `mint dev` directly:

```bash
PATH="/opt/homebrew/opt/node@22/bin:$PATH" mint dev
```

**Option A — Install the form:** use the button above if you need the feedback form created in Encatch.

**Option B — Wire this site:** Copy `encatch-config.example.js` → `encatch-config.js` and set your Encatch publishable key and combined form slug / question slugs.

**Publishable key:** [admin.encatch.com](https://admin.encatch.com) → **Settings** → **Publishable key**.

## Run

```bash
mint dev
```

Open http://localhost:3000 (or the port shown in the terminal).

## Encatch integration

This example uses the same pattern as the Fumadocs examples, adapted for Mintlify:

1. **`encatch-config.js`** — publishable key + combined form slug and question slugs (copy from `encatch-config.example.js`). Must use this filename so Mintlify loads it before `encatch-init.js`.
2. **`encatch-init.js`** — loads the Encatch SDK from CDN, initializes it, and exposes form helpers on `window.EncatchDocs`.
3. **`snippets/docs-page-feedback.jsx`** — footer UI (helpful yes/no, suggest edits, raise issue).
4. **Each MDX page** — imports `<DocsPageFeedback locale="..." />` at the bottom of the page.

Mintlify site configuration (navigation, theme, i18n) lives in **`docs.json`**. Mintlify auto-includes `.js` files in the project root on every page.

## Pages

| Pages |
|-------|
| `/index`, `/docs-feedback` |
