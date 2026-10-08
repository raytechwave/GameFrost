# GAME FROST integration review — corrected 8 October 2026

This is a review candidate, not the completed five-character release. Nothing has been deployed to or published on the existing live website. The supplied CMS archive is the recovered main store; the Wolverine scene was separate and is now integrated. Canonical Site revision 12 and the later Rift Arena archive were unavailable for comparison.

## 8 October corrective verification

The six-department 3D store is restored to the homepage and retains its dedicated route. Native scrolling selects the required chapters and drives the available Wolverine clip. The complete five-character release remains blocked by four missing scene assets.

- Hosted/static builds and TypeScript checks pass. The static exporter checks 104 page/query states.
- Current desktop/mobile checks pass for 17 important routes each (34 visits) and real 404 responses; no browser exceptions, broken loaded images or horizontal overflow. See `corrective-route-verification.json`.
- New browser motion checks pass: 16 actual scroll-driven Wolverine poses, pixel-identical return to the same pose after reverse seeking, native chapter jumps, explicit playback/reset, disposal on chapter exit, reduced-motion poster behavior, failed-download fallback and usable store entry.
- The restored showroom passes all six department selections, free roam, movement controls, product inspection, fullscreen/Escape and shopping navigation on desktop and emulated mobile.
- Eight viewport sizes and 200% root text pass overflow checks; the trust strip now reflows with enlarged text. Short/enlarged layouts keep natural flow rather than a cropped pinned panel. See `scroll-showroom-verification.json`.
- Cached motion-envelope metadata samples 290 actual poses. Every rig/clip/geometry/texture binary byte is unchanged from the previous delivery. See `motion-envelope-verification.json`.
- Independently extracted Source and Drop ZIPs pass 17 important mobile routes each, real 404 and actual GLB rendering. The Source ZIP’s included launcher was used; dependencies were not reinstalled for this correction. All three ZIPs pass CRC checks. See `corrective-package-verification.json`.
- Current recordings are untrimmed CDP screencasts encoded with installed system FFmpeg. Frame timestamps and software rendering pace are retained. These replace the earlier presentation recordings. Current pose sheets and showroom screenshots were visually inspected.

## 7 October verification of the preceding baseline

- Frozen install with the original lockfile, pnpm 11.25.0 and Node 24.19.0; hosted and static production builds pass. TypeScript `--noEmit` passes.
- Isolated Worker tests: 33 CMS checks and 28 customer-request checks pass, including access isolation, draft/published separation, stale conflicts, upload validation, server-calculated prices, idempotent submission and owner workflow status conflicts. These exercise real D1/R2 test bindings, not the live database.
- Static exporter: 88 server-rendered page routes, 104 page/query states, 204 internal targets, 27 image references, and 90 generated HTML pages. Portable export succeeds.
- Actual Chromium: all 89 routes on desktop 1440 and mobile 390 (178 route visits), plus 109 layout states including widths 320, 360, 390, 430, 768, 1024, 1440 and landscape. No broken route images, browser exceptions or unresolved horizontal overflow. The reviews-grid defect was corrected and rechecked at all seven widths; see `review-layout-recheck.json`.
- Browser interactions pass: mobile menu/search, PS5 search, persistent cart, quantity changes, checkout validation/private draft, account total, URL filtering, empty results, confirmed contact details, actual HTTP 404, local admin preview/apply, stale-save 409, separate visitor isolation and browser Netlify ZIP download.
- Actual hosted two-session browser checks pass: product and FAQ draft/publish reach an independent visitor only after publication; normalized saves clear the dirty state; checkout submits a quote; the owner queue updates the customer status; anonymous visitors cannot open the editor or queue. Identity is mocked only in the isolated loopback harness.
- Motion checks pass on desktop/mobile: normal playback, forward/reverse seeking, reset, all seven widths, one canvas, offscreen pause, canvas disposal on chapter changes, reduced-motion behavior, failed-model poster fallback, WebGL context-loss recovery, native shopping navigation and 200% text-size reflow. Six check groups, sixteen sampled poses, no browser exceptions. Desktop/mobile pose sheets were visually inspected.
- Independent source ZIP install/rebuild passes; all 185 public files match the built Drop distribution. Both extracted editions pass 17 important phone routes each, real 404 and independently served GLB rendering. ZIP CRC checks pass; release ZIP hashes are supplied separately.
- Development setup passes after local migrations: `/`, `/shop`, `/api/content` and `/api/store?view=cart` return HTTP 200. Repeating the migration command applies nothing. Cloud install/start instructions were saved as a draft; future-task snapshot restoration is unverified.

## Character evidence and limitations

The original Wolverine rig's nodes, meshes, skins, animations, accessors and all 112 non-image buffer views are unchanged. Two skins and the 41-channel authored attack remain intact. Only embedded textures were resized/re-encoded. Runtime uses one Three.js instance, cached full animation-envelope camera framing and a transparent canvas/poster, with native scroll seeking plus explicit playback/reset controls. No extra floating sparks, blade echoes or detached scratch effects were added.

The accepted Goku performance/artwork, Spider-Man wrist/web performance, Harry Potter wand/red-spell performance and Ronaldo boot/ball performance are absent from the uploaded source/assets. Their identities and order are retained, with explicit unfinished chapters. The native chapter/seek controller is now implemented, but the complete five-performance choreography and those four attack attachments remain blocked by missing scenes. No invented substitute characters are presented as finished work.

## Performance

See `final-performance.json` for the current exact build sizes. Initial shopping/home JavaScript is approximately 161 KB gzip. All optional route/admin/Three.js JavaScript totals approximately 400 KB gzip, exceeding the handoff's 250 KB total budget. The character model loads on entering its chapter in scroll mode, with no automatic model load under reduced motion or data saving. The showroom renderer loads on explicit store entry. The model is 6,865,876 bytes versus 12,475,700 originally; gzip size 1,653,410 depends on hosting compression. Original rig/reference sources are included for rollback.

Current stable-viewport browser walkthroughs are included in the evidence ZIP. They retain original screencast timestamps without trimming or speeding up playback; `scroll-showroom-verification.json` records their scope. The former loading-trim metadata in `preview-recording.json` describes the historical 7 October recordings, not these new MP4s.

These are build sizes and software-WebGL browser checks. No physical-phone frame-rate target, field Core Web Vitals, low-end device test or live authentication/payment integration is claimed.

## Publishing and business data

Hosted shared publishing requires the supported Sites identity proxy and configured D1/R2 bindings. Netlify/launcher editing applies only to that browser until an exported package is redeployed. Customer submissions and statuses are not paid orders, reservations or confirmed bookings. No merchant gateway or automated WhatsApp/SMS/email integration is configured. Sample prices/model-reference images remain labeled; actual-unit stock photos, final prices, operating days, email and genuine review videos require business input.

## Release gates

Supply the newer Rift Arena store archive and accepted Goku assets, plus the other three missing character performances; compare them with the canonical live revision; integrate and visually verify all five scroll scenes and their attachment points. Confirm business inventory/policies and supported live authentication/bindings, then obtain approval of the completed combined preview before replacing the live site.
