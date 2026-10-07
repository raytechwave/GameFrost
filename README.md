# GAME FROST — source and integration review

**Review candidate, not a finished five-character release.** The supplied Optimized CMS website is the store baseline; the latest Wolverine GLB is integrated. Goku is first in the explicit chapter registry, followed by Spider-Man, Wolverine, Harry Potter and Ronaldo. Four accepted character performances were not supplied and remain blocked, with no robot or raster-limb substitutions. Read `docs/completion-audit.md` and `docs/QA-REPORT.md` before approving any live replacement.

The existing live GAME FROST Site has not been changed. This package does not publish it.

## Download from GitHub

The [delivery folder](deliverables/README.md) contains direct downloads for the **Source ZIP**, **Netlify Drop ZIP** and **desktop/mobile preview ZIP**. The Source ZIP includes the prebuilt website; extract that package for the launcher instructions below. GitHub's Code → Download ZIP and a Git clone contain repository source and the delivery packages, so they require a build before running the source-folder launcher. GitHub Pages is not configured, and uploading this repository does not deploy or replace the live website.

## View the included build

Install Node.js **22.13 or newer** (tested here with **24.19.0**), then extract the entire source ZIP.

- **Windows:** double-click `START-WEBSITE.cmd`; leave the terminal open. Open the local address printed in Chrome/Edge. Alternatively, open a terminal in the extracted folder and run `node scripts/view.mjs`.
- **macOS/Linux:** open Terminal in the extracted folder, run `sh START-WEBSITE.sh`, and open the address printed in your browser. Stop with Ctrl+C.
- `npm run view` does the same thing. If port 4175 is occupied, set `GF_PREVIEW_PORT` to another free port.

This launcher serves the included `netlify-dist/` over loopback; opening a React source HTML file directly does not run the application. Preview admin and checkout use browser-local IndexedDB. Shared hosted features are a different edition.

## Netlify Drop

Extract **GAME-FROST-Netlify-Drop-Review.zip** and drop the folder containing `index.html`, `_redirects`, `_headers`, `assets/` and `store-content.json` onto Netlify Drop. No build step is needed for that archive. Named pages are prebuilt; unknown routes serve the 404 page. Deploy it as a review site, not a replacement of the existing live site without approval.

The static editor at `/admin` changes **only that browser**. Apply locally, then download the updated Netlify package and redeploy it to change content for visitors. Static dropping does not provision shared authentication, D1/R2, merchant queues, payments or message delivery. Local customer drafts never reach the store.

## Develop and rebuild

Use the preserved pnpm lockfile and pinned pnpm **11.25.0**. In the source root:

```sh
npm exec --yes --package=pnpm@11.25.0 -- pnpm install --frozen-lockfile
npm run prepare:local
npm run dev
```

`prepare:local` applies pending migrations only to local development D1, using the same persistence directory as the dev server. It is repeatable and never targets a remote database.

The development framework normally prints a loopback address on port 5173. Its portable mock sign-in is a local development identity, not production owner authentication. The original protected owner allowlist is preserved; use the isolated test harness only for owner browser QA.

To build both distributions and the portable export kit:

```sh
npm run build:netlify
npm run verify:backend
node scripts/verify-portable.mjs
```

`build:netlify` builds the hosted Worker and frontend, writes the current default content snapshot, builds/pre-renders the static edition, creates the hosted admin export kit, and measures compressed bundle sizes. Browser QA tools additionally require Python Playwright, Pillow, Chromium and ffmpeg. The texture optimizer is optional; optimized deliverable assets are already included.

## Hosted shared edition

The existing Sites/Cloudflare architecture is preserved in `.openai/hosting.json`, `app/chatgpt-auth.ts` and server adapters. It needs the supported platform identity proxy, D1 `DB`, R2 `BUCKET` and migrations in `drizzle/`. Apply pending migrations once, in order, using the platform-supported workflow. A raw Worker deployment with client-supplied identity headers is not a supported substitute for that authentication boundary.

Hosted `/admin` uses the confirmed original owner account. Products, content, scene settings, public media, draft/published versions and conflicts are server-checked. Customers can explicitly submit quote, trade-in, service and story requests; the owner queue can review them and update internal statuses. Totals use published prices, and retries are idempotent. Requests do not prove payment, reserve stock or confirm bookings. No payment gateway or automated WhatsApp/SMS/email integration is configured.

`tools/hosted-qa-server.mjs` is an isolated, **loopback-only test harness** with mock identity and an ephemeral database. Never deploy or expose it. Actual live dispatch authentication, real merchant accounts, physical-phone FPS and field Web Vitals were not verified.

## Files and provenance

- `VIEWING-INSTRUCTIONS.md`: quick opening/deployment instructions.
- `docs/CLOUD-SETUP.md`: saved environment draft and current-instance development readiness.
- `docs/ADMIN-GUIDE-CURRENT.md`: editing, preview/publish, request queue, backup/restore and hosting distinctions.
- `docs/QA-REPORT.md`: current checks, measurements and remaining release blockers.
- `docs/asset-manifest.json`: bundled URLs, dimensions, transparency, hashes and provenance.
- `outputs/preview/`: desktop/mobile recordings and pose sheets in the separate review evidence ZIP.
- `references/`: original Wolverine GLB, FBX/textures, supplied animation code, credits/license notes and completion plan. The store imports its own single Three.js runtime, not the standalone preview bundle.
- `docs/archive-reports/` and `docs/ORIGINAL-README.md`: historical material from the supplied archive; it does not certify this build.

Wolverine model credits: K Animator; additional credits 3D MODELS and The Armacham Technology Corporation. The supplied package lists CC BY 4.0. See `references/Wolverine-package-notes.txt`. Three.js is MIT. Product imagery is manufacturer/publisher reference imagery, not actual-unit stock/condition evidence. No secrets, node_modules, live customer records or private customer photos are included.
