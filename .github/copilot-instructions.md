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

## 3. Domain terms
- **CollectibleKind**: a type of collectible set (e.g. Checkers Stickables, code `CHK2026`, 50 items). Defined by JSON on the host server.
- **Collectable** (home list entry): one entry per CollectibleKind.
- **Collection**: a user-created, named list of counts for one CollectibleKind.

## 4. CollectibleKind data (server JSON, static assets)
- Index: `public/data/kinds.json` → `[{ "code": "CHK2026", "name": "Checkers Stickables", "file": "CHK2026.json" }]`
- Kind file: `public/data/CHK2026.json` → `{ "code": "CHK2026", "name": "Checkers Stickables 2026", "items": [{ "code": "ABSA", "name": "Absa", "description": "ABSA", "image": "images/CHK2026/ABSA.png" }, ... 50 items] }`
  - `code` = unique item code (from dataset), `name` = short description (shown under the icon in the grid), `description` = full description (shown under the large image in the modal).
- Item order in `items` defines byte position in the encoded string. Never reorder/remove items of a published kind.
- Images in `public/images/CHK2026/{CODE}.<ext>`; the item's `image` field in the JSON is the source of truth for the path. **Placeholder images are generated `.svg` files** (coloured circle, initials, item number) until real images (e.g. `.png`) are supplied; swapping them only requires replacing the file and updating `image` in `CHK2026.json`.
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

## 5. Screens / behaviour
1. **Home (`/`)**: list of Collectables (from `kinds.json`; one for now). Selecting one → Kind page.
2. **Kind page (`/kind/:code`)**: lists the user's Collections for that kind (empty state message when none) and an **Add Collection** button.
3. **Add Collection – step 1 (`/kind/:code/new`)**: name input, max 30 chars, Next disabled until valid.
   - Valid: trimmed, 1–30 chars, only `[A-Za-z0-9 ]`, unique within the kind (case-insensitive). Show inline errors.
4. **Add Collection – step 2 / Collection page (`/kind/:code/c/:name`)**: grid of all items, **invisible grid lines** (no borders), responsive columns.
   - Each cell: item icon with a **count badge** (starts `0`), item name underneath.
   - Tap icon → count +1 (max 255; at 255 do nothing/visual hint).
   - Tap/click name → **modal**: larger image, name underneath, count text field with **"−"** to the left and **"+"** to the right (±1). Bounds 0–255; typed input is sanitised/clamped to integers 0–255.
   - Collection is saved to localStorage when step 1 completes and on every change.
   - Actions: Rename (same name rules), Delete (confirm dialog), Show QR, Scan QR (compare).
5. **Show QR**: modal rendering the collection's encoded string as a QR code (plus the text string and a copy button).
6. **Scan QR / Compare**: opened from within a collection; scans via camera (fallback: paste the string). Decodes the other string, then:
   - If kind code differs from the current collection's kind → **reject with error message**.
   - If invalid/corrupt → error message.
   - Otherwise show the result (see section 7).

## 6. Storage & encoding
- Encoded collection string: `KINDCODE^Name^Base64` e.g. `CHK2026^My Stickers^AAAAAAo...`
  - Segment 1: kind code. Segment 2: collection name (alphanumeric + spaces only, so `^` can never appear). Segment 3: standard Base64 of a byte array, **one byte per item** in kind item order (value 0–255). 50 items → 50 bytes.
  - Example (3 items, 10 of the 2nd): bytes `00 0A 00`.
- Decoding validates: exactly 3 segments, matching kind code, valid name, valid Base64, byte length == item count of the kind.
- localStorage key `swapokay.collections.v1`: JSON array of `{ "kind": "CHK2026", "name": "...", "data": "<base64>", "updated": "<ISO date>" }` (full string derived via the codec; no duplicate storage format).
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
- Real item images (names/descriptions now provided; placeholders used for images).
- Visual design/branding not yet specified.

## 12. Change Log
- 2026-10-27: Initial specification created (all of the above).
- 2026-10-27: Initial build completed per this spec: Angular 21 app, `.npmrc` legacy-peer-deps, generated placeholder SVG images, README, tests (build/test pass). Initial bundle budget warning raised to 900kB (zxing); `qrcode` allowed as CommonJS dependency.
- 2026-10-27: Added section 2a: project must be buildable/runnable from Windows PowerShell (no Bash dependence); Angular 21 pinned due to Node 22.20; README with PowerShell commands.
- 2026-10-27: Added real CHK2026 dataset (50 items; code/short name/full description); item model changed from `id`/`name` to `code`/`name`/`description`; image path now `images/CHK2026/{CODE}.png`; kind name "Checkers Stickables 2026".
- 2026-10-27: Added root `.gitignore` requirement (excludes `node_modules/`, `dist/`, `.angular/`, `out-tsc/`, logs).