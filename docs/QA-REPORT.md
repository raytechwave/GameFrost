# GAME FROST integration review — 7 October 2026

This is a review candidate, not the completed five-character release. Nothing has been deployed to or published on the existing live website. The supplied CMS archive is the recovered main store; the Wolverine scene was separate and is now integrated. Canonical Site revision 12 and the later Rift Arena archive were unavailable for comparison.

## Current verification

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

The original Wolverine rig's nodes, meshes, skins, animations, accessors and all 112 non-image buffer views are unchanged. Two skins and the 41-channel authored attack remain intact. Only embedded textures were resized/re-encoded. Runtime uses one Three.js instance, full animation-envelope camera framing and a transparent canvas/poster, with explicit playback/reset and seek controls. No extra floating sparks, blade echoes or detached scratch effects were added.

The accepted Goku performance/artwork, Spider-Man wrist/web performance, Harry Potter wand/red-spell performance and Ronaldo boot/ball performance are absent from the uploaded source/assets. Their identities and order are retained, with explicit unfinished chapters. Full consecutive scroll choreography and those four attack attachments cannot be certified or completed from these files. No invented substitute characters are presented as finished work.

## Performance

See `final-performance.json` for the current exact build sizes. Initial shopping/home JavaScript is approximately 155 KB gzip. All optional route/admin/Three.js JavaScript totals approximately 399 KB gzip, exceeding the handoff's 250 KB total budget. Three.js and the model are loaded only by explicit character activation. The model is 6,866,136 bytes versus 12,475,700 originally; gzip size 1,653,406 depends on hosting compression. Original rig/reference sources are included for rollback.

Stable-viewport browser walkthroughs are included in the evidence ZIP. Their MP4 presentations shorten the model-loading wait without speeding up the attack; `preview-recording.json` records the cut boundaries. The cloud software renderer took roughly 15–24 seconds to prepare the model in these recordings; that is not a physical-device load-time benchmark.

These are build sizes and software-WebGL browser checks. No physical-phone frame-rate target, field Core Web Vitals, low-end device test or live authentication/payment integration is claimed.

## Publishing and business data

Hosted shared publishing requires the supported Sites identity proxy and configured D1/R2 bindings. Netlify/launcher editing applies only to that browser until an exported package is redeployed. Customer submissions and statuses are not paid orders, reservations or confirmed bookings. No merchant gateway or automated WhatsApp/SMS/email integration is configured. Sample prices/model-reference images remain labeled; actual-unit stock photos, final prices, operating days, email and genuine review videos require business input.

## Release gates

Supply the newer Rift Arena store archive and accepted Goku assets, plus the other three missing character performances; compare them with the canonical live revision; integrate and visually verify all five scroll scenes and their attachment points. Confirm business inventory/policies and supported live authentication/bindings, then obtain approval of the completed combined preview before replacing the live site.
