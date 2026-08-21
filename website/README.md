# Meisai website (rebuild)

A full visual and content rebuild of the Meisai marketing site, using fresh
screenshots captured directly from the current extension (loaded headlessly
in Chromium with real, seeded demo data) instead of the outdated images in
`website/assets`. The Meisai app icon is unchanged, since it was the one
asset that was still current.

**Positioning and structure follow `website.md` at the repo root** (a build
spec: category, hero copy, page order, tone rules, and a list of phrases to
avoid). The homepage positions Meisai as a *browser workspace layer* ("Your
browser, with a workspace built around you"), not a new-tab replacement or a
todo app, and never claims the browser or new tab is "broken" or "chaotic."
Only Firefox is presented as live; Chrome/Brave stay entirely out of the
copy until `CHROME_WEB_STORE_URL` / `BRAVE_EXTENSION_URL` are actually set
(see `build.mjs`'s `__AVAILABILITY_NOTE__` token), rather than showing a
"coming soon" placeholder that implies imminent support.

Design direction: a dark, confident hero band over calm, paper-toned content
sections, colors pulled from the product's own UI (the violet→teal app-icon
gradient reserved for brand moments only; a single forest-green accent for
interactive UI, per website.md's "one Meisai accent" rule) so the site and
the product feel like one thing. No em dashes anywhere in the copy, by
standing preference — commas, colons, or a period split instead.

## Local preview

```powershell
$env:SITE_URL="http://localhost:4174"
node new-website/build.mjs
python -m http.server 4174 --directory _new-site
```

Open `http://localhost:4174`.

## Content source of truth

Copy is grounded in the actual extension source (`extension/manifest.json`,
`extension/scripts/**`) and in `feature.md` at the repo root, not in
`docs/MEISAI_FEATURES_AND_FUNCTIONS.md` — that doc turned out to be missing
several shipped features (Fill Info, LinkedIn Formatter, Resume Hub, personal
Kanban, Focus Tab, Pinned tabs/Group Tabs/Workspaces, the extension popup)
and to describe the command palette's colon syntax (`task:`), which the
current code doesn't accept for `note`/`brain` — the real, UI-surfaced
commands are the slash form (`/task`, `/note`, `/brain`), confirmed directly
in `scripts/app/components/command-palette/search.js` and
`scripts/ui/command-bar.js`. If that internal doc gets refreshed, it's worth
re-diffing against this site's copy.

## Regenerating screenshots

Screenshots live in `assets/screens/*.webp`. To recapture them from a newer
build of the extension, load the unpacked extension in Chromium with
Playwright (`--load-extension` / `--disable-extensions-except`), drive
onboarding, seed a few realistic records through the app's own repository
functions (see `scripts/ui/*.js` — `createTask`, `saveStickyNote`,
`saveVault`, `saveProject`, `saveApplication`, `saveResume`, and
`scripts/data/repositories/tab-workspace-repository.js`'s `saveTabSet` for
pinned tabs/Group Tabs/Workspaces), then screenshot each route.

Gotchas hit while capturing:
- Settings routes live on `settings.html#/<path>` (not `app.html`), and hash
  navigation within the same document doesn't reliably re-render the SPA
  router — force a full load (`page.goto('about:blank')` then the real URL).
- Focus Tab is served from `newtab.html#/focus-tab`, not `app.html`.
- The project Kanban board opens from a `<details class="career-card-menu">`
  disclosure on each project card (click `summary`, then
  `[data-open-project-kanban]`) — screenshot the `<dialog>` element directly
  to skip its blurred `::backdrop`.

## Promoting this to the live site

This folder builds independently into `_new-site/` so it doesn't collide
with `website/`'s `_site/` output. To make this the deployed site:

1. Replace `website/` with this folder's contents (or update
   `.github/workflows/pages.yml` to build from `new-website/` and upload
   `_new-site/` instead of `website/`'s `_site/`).
2. Keep the same repository variables: `CHROME_WEB_STORE_URL`,
   `FIREFOX_ADDONS_URL`, `BRAVE_EXTENSION_URL`, `FEEDBACK_URL`.
3. Re-run the search-discovery checklist in the old `website/README.md`
   (resubmit `sitemap.xml`, request re-indexing).

## Browser store URLs

Same contract as before — set these as GitHub repository variables once each
store listing is live:

- `CHROME_WEB_STORE_URL`
- `FIREFOX_ADDONS_URL` (defaults to the current Meisai Firefox listing)
- `BRAVE_EXTENSION_URL` (falls back to the Chrome Web Store listing)

Until a URL is configured, its install button shows **Coming soon** instead
of linking somewhere wrong.

## Contribute to StagePath

Meisai's built-in learning paths open in
[StagePath](https://ankit-anshu.github.io/stagepath/). If you would like to
help make StagePath clearer and more useful, you can contribute by suggesting
or correcting roadmap stages, adding missing skills, recommending quality
learning resources and project ideas, reporting broken links, or improving
the documentation, accessibility, and interface. Contributions should keep
each path practical, beginner-friendly, and easy to follow from the first
topic to a finished project.
