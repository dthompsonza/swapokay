# SwapOkay – Copilot Instructions (Source of Truth)

## 0. MANDATORY CHANGE PROTOCOL (applies to every request)
1. **Never modify app files** (anything outside `.github\copilot-instructions.md`) unless this file was updated first.
2. When the user requests a change: (a) update this file to record it (add to the spec and append to the Change Log, section 12); (b) summarise the instruction-file change to the user and **ask for confirmation**; (c) only after confirmation, change the app files so they match this file.
3. If the request is ambiguous, ask questions (ask_user) before updating this file.
4. If app files and this file disagree, this file wins; flag the discrepancy to the user.
5. Pure questions/explanations need no file change.

## 1. Purpose
Client-side-only Angular SPA to capture collections of collectibles (counts per item) and compare two collections (via QR code) so users can swap duplicates for items the other lacks. No backend; user data in `localStorage`.

## 2. Tech stack
- Latest Angular, standalone components, signals, new control flow (`@if/@for`), Angular Router, TypeScript strict.
- No NgModules. No backend. Static hosting (hash-based routing, `withHashLocation()`, so deep links work on any static host).
- QR: `qrcode` (generate) + `@zxing/browser` (camera scan). Mobile-first responsive UI.
- Tests: Angular CLI default runner; unit tests required for the codec, validation and diff logic.

## 2a. Windows / PowerShell environment (mandatory)
- The developer uses **Windows with PowerShell**, not Linux/Bash. Everything must build, run and test from PowerShell.
- Commands given to the user or run by Copilot use PowerShell syntax (`;` not `&&` before PowerShell keywords, `$env:VAR`, `Remove-Item`, backslash paths). No `.sh` scripts, no `rm`/`cp`/`export`/`VAR=x cmd` in npm scripts; use cross-platform npm packages (e.g. `rimraf`, `cross-env`) if ever needed.
- Standard commands (documented in `README.md`, PowerShell): `npm install`, `npm start` (dev server, http://localhost:4200), `npm run build`, `npm test`.
- Angular **v21** is used because the installed Node is v22.20 (Angular CLI "latest" requires Node ≥ 22.22). Do not upgrade Angular without checking the Node version.
- Project/package name is `swapokay`; `package.json` must contain no Bash-only scripts.
- `.npmrc` contains `legacy-peer-deps=true` (npm 10.9 crashes with "Cannot read properties of null (reading 'edgesOut')" resolving jsdom/canvas peers otherwise) so plain `npm install` works. jsdom pinned to `^27`.
- A root `.gitignore` excludes `node_modules/` (plus build/cache output: `dist/`, `.angular/`, `out-tsc/`, and logs).
- Verification before declaring done: `npm install`, `npm run build` and `npm test` all succeed in PowerShell, and `npm start` serves the app.

## 2b. Deployment (GitHub Pages)
- Hosted at `https://dthompsonza.github.io/swapokay/` (repo `dthompsonza/swapokay`, project site, so base path `/swapokay/`).
- GitHub Actions workflow `.github/workflows/deploy.yml`: triggers on push to `main` (and `workflow_dispatch`); runs `npm ci`, `npm test` (headless, non-watch), `npm run build -- --base-href /swapokay/`, copies `index.html` to `404.html`, adds `.nojekyll`, uploads `dist/swapokay/browser` with `actions/upload-pages-artifact`, deploys with `actions/deploy-pages`. Node 22; permissions `contents: read`, `pages: write`, `id-token: write`.
- One-time manual repo setting: Settings → Pages → Source = "GitHub Actions".
- Base href is passed only in CI; local `npm start`/`npm run build` keep `/`. Runtime asset/data URLs must stay relative (no leading `/`).

## 3. Domain terms
- **CollectibleKind**: a type of collectible set (e.g. Checkers Stickables, code `CHK2026`, 50 items). Defined by JSON on the host server.
- **Collectable** (home list entry): one entry per CollectibleKind.
- **Collection**: a user-created, named list of counts for one CollectibleKind.

## 4. CollectibleKind data (server JSON, static assets)
- Index: `public/data/kinds.json` → `[{ "code": "CHK2026", "name": "Checkers Stickables", "file": "CHK2026.json" }]`
- Kind file: `public/data/CHK2026.json` → `{ "code": "CHK2026", "name": "Checkers Stickables 2026", "items": [{ "code": "ABSA", "name": "Absa", "description": "ABSA", "image": "images/CHK2026/ABSA.png", "icon": "images/CHK2026/icons/ABSA.png" }, ... 50 items] }`
  - `code` = unique item code (from dataset), `name` = short description (shown under the icon in the grid), `description` = full description (shown under the large image in the modal).
- Item order in `items` defines byte position in the encoded string. Never reorder/remove items of a published kind.
- Images in `public/images/CHK2026/{CODE}.png` (480×480, "full size", used in the item modal) and `public/images/CHK2026/icons/{CODE}.png` (124×124, used in the collection grid and compare lists). Each item's JSON has `image` (full) and `icon` (icon) paths, which are the source of truth. The SVG placeholders are removed.
- **CHK2026 dataset (50 items, in byte order = this order; format `CODE | short | full`):**
  1. ABSA | Absa | ABSA
  2. ALLGOLD | All Gold | All Gold Tomato Sauce Bottle
  3. AQUELLE | aQuellé | aQuellé Naartjie Flavoured Sparkling Water
  4. BARONE | Bar-One | Bar-One Milk Chocolate Bar
  5. BIC | BIC Kids | BIC Kids Evolution Stripes Colouring Pencils
  6. BLACKCAT | Black Cat | Black Cat Smooth Peanut Butter
  7. BUTRO | Clover Butro | Clover Butro Full Cream Modified Butter Spread
  8. CATMOR | Catmor | Catmor Chicken Flavoured Dry Cat Food
  9. CLOVERBLISS | Clover Bliss | Clover Bliss Choc Chip Double Cream Yoghurt
  10. CLOVERMILK | Clover Milk | Clover UHT Full Cream Milk
  11. COLGATE | Colgate | Colgate Total Active Prevention Clean Mint Fluoride Toothpaste
  12. CROSSEBLACKWELL | Crosse & Blackwell | Crosse & Blackwell Tangy Mayonnaise
  13. CROXLEY | Croxley | Croxley Mathematical Instruments Set
  14. DOOM | Doom | DOOM Odourless Multi Insects Spray
  15. DURACELL | Duracell | Duracell Plus AA Alkaline Batteries
  16. ENERGADE | Energade | Energade Blueberry Flavoured Sports Drink
  17. ENERGIZER | Energizer | Energizer MAX AA Alkaline Batteries
  18. ESKORT | Eskort | Eskort Wood Smoked Rindless Streaky Bacon
  19. FORAGEFEAST | Forage & Feast | Forage & Feast Cape Fynbos & Wildflower Honey
  20. GLADE | Glade | Glade Scents of Africa Serengeti Oud Scented Mist Air Freshener
  21. HANDYANDY | Handy Andy | Handy Andy Multi-Purpose Spray
  22. HUGGIES | Huggies | Huggies Gold Skin Soft Nappies
  23. JUNGLE | Jungle | Jungle Yoghurt Energy Bar
  24. KELLOGGS | Kellogg's | Kellogg's Hot 'n Spicy Mie Goreng Premium Stir Fry Noodles
  25. KNORR | Knorr | Knorr Carbonara Pasta Pot
  26. KRUSH | Clover Krush | Clover Krush 100% Orange Fruit Juice Blend
  27. LAAGER | Laager | Laager Pure Rooibos Teabags
  28. MAYNARDS | Maynards | Maynards Original Wine Gums
  29. METALAB | Metalab | METALAB BRIDGE Vanilla Milk Premium Whey Protein Blend
  30. NEDBANK | Nedbank | Nedbank
  31. NIVEAMEN | Nivea Men | NIVEA Men Deep Body Lotion
  32. NIVEAROLLON | Nivea Roll-On | NIVEA Roll-On
  33. OMO | Omo | OMO Superlift Auto Washing Liquid
  34. OROS | Oros | Oros Orange Flavoured Concentrated Squash
  35. PARMALAT | Parmalat | Parmalat Cheddar Cheese
  36. PIEMANS | Pieman's | PIEMAN'S BBQ Chicken Pizza Pockets
  37. REXONA | Rexona | Rexona Aerosol
  38. RICOFFY | Ricoffy | NESCAFÉ RICOFFY Soluble Chicory & Coffee Granules
  39. ROBERTSONS | Robertsons | Robertsons Braai & Grill All-in-One Spice
  40. SIMPLETRUTH | Simple Truth | Simple Truth Large Free-Range Eggs
  41. SIRFRUIT | Sir Fruit | Sir Fruit Orange 100% Fruit Juice Blend
  42. SIXTY60 | Sixty60 | Sixty60 Teal Ride-On Bike with Loadbox
  43. STANDARDBANK | Standard Bank | Standard Bank
  44. STERISTUMPIE | Steri Stumpie | Steri Stumpie Chocolate Flavoured Milk
  45. SUNFOIL | Sunfoil | Sunfoil Pure Sunflower Seed Oil
  46. SUNSHINED | Sunshine D | Sunshine D Original Fat Spread
  47. TYPEK | Typek | Typek A4 Copy Paper
  48. VASELINE | Vaseline | Vaseline Cera Glow Body Gel Oil
  49. WAHL | Wahl | Wahl Home Pro Haircutting Kit
  50. XTRASAVINGS | Xtra Savings Card | Checkers Xtra Savings Card
- Fetched with `HttpClient` at runtime (relative URLs); cached in memory.

## 4a. Variants
- A **variant** is a separate collectible item that shares its `code` with a base item but has a `variant` name. Items without a variant have no `variant` field (the 50 existing CHK2026 items stay exactly as they are). CHK2026 now also has 50 **GOLD** variant items: same `code`/`name`/`description`-base as the base item, plus `"variant": "GOLD"`, with `image` = `images/CHK2026/{CODE}-GOLD.png` and `icon` = `images/CHK2026/icons/{CODE}-GOLD.png` (all 100 image/icon files exist). `CollectibleItem` gains optional `variant?: string`. Item identity = `code` + `variant`.
- The 50 GOLD items are **appended after** the existing 50 in `items` (positions 51-100), so existing byte positions never change. Their `description` is the base description followed by ` (Gold)`; `name` is the base short name (the grid shows only one variant at a time).
- Storage/codec: counts have one byte per item (now 100 for CHK2026). A stored or decoded counts array that is **shorter** than the kind's item count is accepted and padded with zeros (older 50-byte collections/QR codes remain valid); longer is still rejected. Compare/swap rules (section 7) are unchanged and work on the full item list (a gold item is only ever matched with the same gold item).

## 5. Screens / behaviour
1. **Home (`/`)**: list of Collectables (from `kinds.json`; one for now), each shown as a **responsive picture card** (the kind's image, no text list; the kind name is the image `alt`/accessible label and visible caption below the image). Selecting one → Kind page.
   - `kinds.json` entries gain `"image": "images/CHK2026/chk2026"` (base path, no width/extension) and `"imageWidths": [400, 600, 800]`; files are `{image}-{width}.jpg` (e.g. `images/CHK2026/chk2026-800.jpg`, 16:9, 800×450 provided). `KindSummary` gains `image` and `imageWidths`.
   - Rendered as `<img>` with `srcset` (`{base}-{w}.jpg {w}w`), `sizes="(min-width: 800px) 800px, 100vw"`, `width`/`height` 800×450 attributes (no layout shift), `loading="lazy"`, card max-width 800px, centred; the whole card is a link (min 44px target, keyboard focus style).
   - Image sizes per kind: 400×225, 600×338, 800×450 (all three supplied for CHK2026); the 800 is the `src` fallback.
2. **Kind page (`/kind/:code`)**: lists the user's Collections for that kind (empty state message when none) and an **Add Collection** button.
   - Each collection row shows, on the same line as the name and right-aligned, plain non-clickable text `unique/total`: unique = number of items with count > 0, total = sum of all counts (e.g. 10 items of which 3 distinct -> `3/10`). Only the name (and its icon) remains the link to the collection page.
3. **Add Collection – step 1 (`/kind/:code/new`)**: 
   - If no collection named `My Collection` (case-insensitive) exists for the kind, the Add Collection button skips the name step: it creates `My Collection` with a **randomly chosen icon** and goes straight to the collection page.
   - If `My Collection` already exists, show the name step: name input (max 30 chars, Next disabled until valid) plus an icon picker (48 icons, random one preselected). Label `Collection name` has clear vertical spacing (≥ 0.5rem) from its input.
   - Valid name: trimmed, 1–30 chars, only `[A-Za-z0-9 ]`, unique within the kind (case-insensitive). Show inline errors.
  - Collection icons: the 48 SVGs `public/images/collection-icons/01.svg` … `48.svg` (file names are a unique two-digit id `XX`; old `line-design-NN.svg` files are removed). The list is defined in one place (`core/collection-icons.ts`) as ids (`01`…`48`); the path is `images/collection-icons/{XX}.svg` (`.svg` is always assumed). Each collection stores one icon (`icon` = the id `XX`, e.g. `07`). The icon is part of the encoded string/QR (section 6). Existing collections without a valid icon (including old `line-design-NN.svg` values) get a random one assigned and saved on load. The icon is shown next to the collection name on the collection page and in the kind page collection list.
4. **Add Collection – step 2 / Collection page (`/kind/:code/c/:name`)**: grid of all items, **invisible grid lines** (no borders), responsive columns.
   - Each cell: item icon with a **count badge** (starts `0`), item name underneath.
   - Tap icon → count +1 (max 255; at 255 do nothing/visual hint). Each tap that increments plays a short happy "chirrup" (Web Audio, ~120ms rising sine pitch sweep, no audio files; silently skipped if unavailable; not played at 255). Unless the collection is **locked** (see below), in which case tapping the icon does not change the count but alerts the user: a short plain tone (Web Audio oscillator, ~150ms, low pitch, no audio files; silently skipped if audio is unavailable) and the item's cell flashes red, the red fading to transparent over 2 seconds (CSS animation; with `prefers-reduced-motion` the sound still plays and the flash is shown without motion, which is the same fade).
   - **Lock toggle:** on the Show QR / Scan QR row, immediately to the right of those buttons, a flat rectangular toggle button (same style as them, `aria-pressed`, aria-label "Lock collection"/"Unlock collection") shows a Lock icon when locked and an Unlock icon when unlocked. When locked, tapping an item icon in the grid does not change the count but plays a short tone and flashes the item red, fading over 2 seconds; the item modal (opened via the item name) still allows changing the count (±, typing). The lock only protects the list view from accidental changes. The state is persisted per collection in localStorage as `locked` (boolean, default/missing = false) and only changes when the user toggles it; new collections are unlocked. It is not part of the QR/encoded string and survives rename/edit.
   - Tap/click name → **modal**: larger image, name underneath, count text field with **"−"** to the left and **"+"** to the right (±1). Bounds 0–255; typed input is sanitised/clamped to integers 0–255.
   - Collection is saved to localStorage when step 1 completes and on every change.
   - No Rename button. A **pencil icon button** (aria-label "Edit collection") sits to the right of the collection name and opens an **edit modal** to change the name (same name rules; unchanged own name is allowed) and pick a different icon from the 50 (current one selected). Save/Cancel.
   - Under the collection name (title row) a smaller dark-gray line shows the same `unique/total` stats as the kind page; it updates live as counts change. The stats calculation lives in one place (`collection-codec.ts`) and is reused by the kind page.
   - Actions: Show QR, Scan QR (compare). There is no Delete button on the collection view; deleting is done from the edit modal: a trash icon button (aria-label "Delete collection", min 44px) sits to the right of the name input; it opens a confirm dialog ("Delete {name}? This cannot be undone." Delete/Cancel); on confirm the collection is removed from localStorage and the app navigates back to the kind page, which refreshes the list.
   - **Filters** (on the same row as the Show QR / Scan QR buttons, right-aligned to the list content, wrapping below on narrow screens; not persisted, reset when leaving the page): (1) **Variant** toggle, no label, two options **None** (default; shows only items with no variant) and **Golden** (shows only items with `variant = GOLD`); no-variant and gold items are never shown together. (2) **Count** filter, default off/blank; the user can switch on one of **Missing** (count = 0), **Single** (count = 1), **Duplicates** (count > 1); tapping the active option turns it off. Filters combine (variant AND count). When nothing matches show an empty-state message. The collection stats under the name (`unique/total`) and Show QR/Compare always use the whole collection, not the filtered view. Controls are plain accessible buttons (`aria-pressed`, min 44px) styled as a segmented toggle, mobile-first.
5. **Show QR**: modal rendering the collection's encoded string as a QR code (plus the text string and a copy button). The QR is generated with error correction level `H` and the collection's icon is drawn at the centre (about 22% of the QR width, on a white rounded backing square) so it stays scannable. The QR image is rendered to a canvas and shown as an image.
6. **Scan QR / Compare**: opened from within a collection; scans via camera (fallback: paste the string). Decodes the other string, then:
   - If kind code differs from the current collection's kind → **reject with error message**.
   - If invalid/corrupt → error message.
   - Otherwise show the result (see section 7).

## 5a. Sound toggle
- The top app bar (same bar as the logo) has a **speaker icon button** at the top right (aria-label "Mute sounds"/"Unmute sounds", `aria-pressed`, min 44px). Enabled by default (speaker icon); pressing it toggles to muted (speaker with a line through it).
- A single app-wide sound setting (signal in one service, persisted in localStorage key `swapokay.sound.v1`; missing = enabled). The item-tap chirrup and the locked-collection tone (section 5.4) play **only when sound is enabled**; the visual red flash for locked taps is unaffected.

## 6. Storage & encoding
- Encoded collection string: `Base64(KINDCODE^Name^Icon)^Base64(counts)` e.g. `Q0hLMjAyNl5NeSBTdGlja2Vyc14wNw==^AAAAAAo...` (header is `CHK2026^My Stickers^07`).
  - Part 1 (obfuscated header): standard Base64 of UTF-8 text `KINDCODE^Name^Icon` (kind code; collection name, alphanumeric + spaces only so `^` never appears; icon id `XX` only, no `.svg`). Separator `^` (Base64 never contains `^`). Part 2: standard Base64 of a byte array, **one byte per item** in kind item order (value 0–255); 50 items → 50 bytes. The old plain formats (`KIND^Name^Base64[^Icon]`) are no longer supported.
  - Example (3 items, 10 of the 2nd): bytes `00 0A 00`.
- Decoding validates: exactly 2 `^` parts, header Base64 decodes to exactly 3 `^` segments, icon is one of the known icon ids, matching kind code, valid name, valid Base64 counts, byte length == item count of the kind.
- localStorage key `swapokay.collections.v1`: JSON array of `{ "kind": "CHK2026", "name": "...", "data": "<base64>", "icon": "07", "locked": false, "updated": "<ISO date>" }` (`locked` optional, missing = false; full string derived via the codec; no duplicate storage format).
- Single `CollectionStore` service (signals) owns all reads/writes; handle missing/corrupt localStorage gracefully.

## 7. Compare / swap rules
Let `mine[i]`, `theirs[i]` be counts per item.
- **I can give** = items where `mine[i] > 1` and `theirs[i] == 0`; quantity offered = `mine[i] − 1` (always keep one).
- **I can receive** = items where `theirs[i] > 1` and `mine[i] == 0`; quantity = `theirs[i] − 1`.
- Show two lists (images/names/quantities) plus the number of possible 1-for-1 swaps = `min(giveCount, receiveCount)` distinct items.
- Comparison is read-only: never alters either collection.

## 8. Project structure (planned)
```
src/app/
  core/       models.ts, collection-codec.ts, collection-store.ts, kind.service.ts, swap-diff.ts
  pages/      home, kind, new-collection, collection
  shared/     modal, item-modal, qr-show, compare (scan/paste + swap result)
public/data/, public/images/CHK2026/
```
Rename/delete dialogs live inside the collection page using `modal`. Unit tests: `core\core.spec.ts` (codec, validation, swap), `app.spec.ts`.

## 9. UI / UX
- Mobile-first, touch-friendly (min 44px targets), keyboard accessible, ARIA labels on badges/buttons/modals.
- Invisible grid lines; badge overlays top-right of icon; modal closes on Esc/backdrop/close button.

## 10. Coding conventions
- Strict TS, no `any`; OnPush; signals for state; small focused components; minimal comments.
- Name validation and codec logic live in one place (`collection-codec.ts`) and are reused everywhere.

## 11. Open items
- Real item images supplied (placeholders removed); visual design/branding otherwise open.
- Visual design/branding not yet specified.

## 12. Change Log
- 2026-10-27: Initial specification created (all of the above).
- 2026-10-27: Initial build completed per this spec: Angular 21 app, `.npmrc` legacy-peer-deps, generated placeholder SVG images, README, tests (build/test pass). Initial bundle budget warning raised to 900kB (zxing); `qrcode` allowed as CommonJS dependency.
- 2026-10-27: Added section 2a: project must be buildable/runnable from Windows PowerShell (no Bash dependence); Angular 21 pinned due to Node 22.20; README with PowerShell commands.
- 2026-10-27: Added real CHK2026 dataset (50 items; code/short name/full description); item model changed from `id`/`name` to `code`/`name`/`description`; image path now `images/CHK2026/{CODE}.png`; kind name "Checkers Stickables 2026".
- 2026-10-27: Added root `.gitignore` requirement (excludes `node_modules/`, `dist/`, `.angular/`, `out-tsc/`, logs).
- 2026-10-29: Added section 2b: deploy to GitHub Pages via GitHub Actions on every push to `main`.
- 2026-10-29: Home page shows each kind as a responsive image card (`srcset`, widths 400/600/800) instead of text; `kinds.json` gains `image` + `imageWidths`.
- 2026-10-29: Real item images (PNG): 480×480 full size for the modal, 124×124 icons in `icons/` for grid/compare; items gain an `icon` field; SVG placeholders removed.
- 2026-10-29: Collections get an icon (50 SVGs in collection-icons); default name 'My Collection' with random icon, name step only if taken; Rename button replaced by pencil icon opening an edit modal (name + icon); label/input spacing fixed.
- 2026-10-29: Encoded string/QR now includes the collection icon as a 4th segment (3-segment strings still accepted).
- 2026-10-30: Collection icons are now 48 files `XX.svg` (ids 01–48); stored/encoded as the id only (`.svg` assumed). Encoded string changed to `Base64(KINDCODE^Name^Icon)^Base64(counts)` (obfuscated header, icon after name); old formats dropped; old stored icon values re-randomised.
- 2026-10-30: Show QR now overlays the collection's icon at the centre of the QR code (EC level H).
- 2026-10-30: Delete moved from the collection view into the edit modal (trash icon right of the name input, with confirm).
- 2026-10-30: Kind page collection rows show right-aligned `unique/total` stats text.
- 2026-10-30: Collection view shows live `unique/total` stats under the name (dark gray, small); stats helper shared in the codec.
- 2026-10-31: Introduced variants (GOLD items appended to CHK2026 data, optional `variant` field, shorter counts padded with zeros) and collection grid filters (Variant None/Golden toggle; Count Missing/Single/Duplicates).
- 2026-10-31: Tapping an item icon in an unlocked collection plays a short happy chirrup sound for each tap that increments.
- 2026-10-31: Tapping an item while the collection is locked now plays a short tone and flashes the item red, fading out over 2 seconds.
- 2026-10-31: Added persisted per-collection Lock/Unlock toggle (right of Show/Scan QR) that disables tap-to-increment in the grid; the item modal still edits counts.
- 2026-10-31: Action and filter buttons restyled flatter and more rectangular (min-height 36px, 2px corner radius, tighter padding); this supersedes the 44px minimum for these buttons only.
- 2026-10-31: Filter controls moved onto the same row as Show QR / Scan QR, right-aligned.
- 2026-10-31: Added app-wide sound toggle (speaker / muted speaker icon in the top bar, default on, persisted); item sounds only play when enabled (section 5a).