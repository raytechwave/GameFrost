# GAME FROST — Sol 6.1 completion and integration plan

Prepared 6 October 2026 • Implementation handoff • Existing project, not a new template

## 1. The assignment

Finish the incomplete parts of GAME FROST, combine the best existing work into one coherent gaming store, and deliver a professionally reviewed website, full source package and prebuilt Netlify Drop package. The experience should feel like entering a gaming store, with a cinematic character journey, while making products, prices, navigation and purchasing easy to use. Goku Ultra Instinct must be first.

Quality means convincing character movement, coherent art direction, usable shopping, real content management, fast mobile delivery and evidence that the finished build works. Do not describe the result as “top 1%,” perfect or production-ready on the strength of screenshots or a successful build alone.

This document is a plan based on a recovered-file/source audit. It does not claim that the combined site has been implemented, that live integrations work, or that the remaining characters are finished. Complete the unfinished work before the final integration review and release. Keep the existing public site unchanged until the user approves the combined preview, consistent with the established review workflow.

## 2. What has actually been recovered and inspected

| Item | Evidence and present status | Action |
| --- | --- | --- |
| Main GAME FROST Site | Saved Site projection identifies source version 12. Its rendered content still names Astra, Silk, Talon, Ember and Striker and displays sample prices. This was a saved-content inspection, not a live runtime audit. | Open the canonical Site source, record its revision, and compare it with the archives before choosing the integration baseline. |
| Rift Arena Animation Fix Complete | Archive recovered; inspected its package manifest, router, character dispatch, CMS schema/server/API, admin guide and verification reports. Includes commerce pages, brand assets, motion variants and portable build support. | Reuse working store infrastructure. Do not assume the newest archive's character artwork was approved. |
| Optimized CMS Complete | Archive recovered; source and admin documentation available as an earlier comparison baseline. | Use to identify regressions and recover intact admin/store behavior. Do not copy the entire older project over the canonical source. |
| Wolverine 3D Complete | Latest saved version 2 recovered. Contains the clean standalone preview, source, original model and a 12,475,700-byte GLB with two skins and one animation containing 41 channels. The authored clip is approximately 4.8 seconds. | Integrate this character asset, not the old Wolverine raster puppet or Talon robot. Optimize a copy and compare it with the original. |
| Other four character scenes | Earlier scene code/assets exist in the full archive. Goku beam-on/off illustrations were located separately. No equivalent completed, verified skeletal package for Spider-Man, Harry or Ronaldo was established by this audit. | Treat these as unfinished until recovered, rendered and checked. Preserve Goku's previously accepted beam alignment when assessing its current assets. |
| Hosted admin | Archived implementation includes authenticated owner checks, shared draft/published documents, revision conflicts, media storage and published-version history. | Extend and re-test the existing implementation; it is not necessary to invent another CMS. |
| Netlify admin | Archived guide and code describe browser-local edits, JSON backups and exporting a new deployment package. | Do not label this a shared production CMS. Explain its operating mode visibly to the owner. |
| Real commerce | Existing documentation distinguishes saved drafts from confirmed orders, payments and message delivery. | Complete the order workflow and enable only integrations that are configured and verified. |

Important defect found: `lib/original-heroes.ts` uses `usesOriginalHero()` to identify scenes from filename prefixes. `originalChapters()` can replace requested character copy/artwork with robot alternatives. `components/game-frost/rift-character.tsx` uses the same heuristic to select its renderer. Merely adding a new GLB is insufficient: remove this implicit substitution from the active journey and migrate content to explicit character/renderer records.

Earlier verification reports include useful checks, but some explicitly say visual browser or physical-phone QA was unavailable. Their measured compressed bundle sizes are not measured loading times or FPS. Do not reuse those reports as certification of the new combined build.

## 3. Non-negotiable creative direction

Use the established GAME FROST identity and product catalog, not SP DEALZ branding and not a fresh generic storefront. Restore the existing brand tokens and assets before inventing replacements. The earlier handover provides dark navy surfaces, frost cyan, restrained orange action accents, Unbounded display type and Inter body type; verify the current accepted theme against the recovered source.

The primary journey is Goku Ultra Instinct → Spider-Man → Wolverine → Harry Potter → Ronaldo → shopping. The same camera language, floor/contact treatment, lighting direction, scale discipline and transition rhythm must connect all five scenes. Accent colors can change by chapter; typography, controls, product cards and page structure should not.

Keep an immediate “Shop” route and an accessible skip link. Visitors must not complete all five attacks to reach products. Navigation and shopping actions remain usable during asset loading or a graphics failure. Use native scrolling; do not trap touch or wheel input in an animation.

Reject these previously unsuccessful approaches: segmented still-image limbs that tear, static character images presented as skeletal animation, robot replacements, mismatched photographic rectangles behind characters, effects with guessed attachment points, oversized permanent scratches, unexplained symbols, cut-off heads and a football launched before foot contact.

Do not reintroduce the removed full-screen Wolverine scratch lines or detached sparks. The latest revision deliberately removed them. A future screen impact must be brief, visibly connected and reviewed; it must never obscure the store or make the scene appear broken.

## 4. Work order and completion gates

| Stage | Work to complete | Exit requirement |
| --- | --- | --- |
| A — Recover and baseline | Canonical source, archive comparison, route/content/asset inventory, backups and issue list. | One identified baseline; every claimed feature has a source location and status. |
| B — Finish character assets | Repair/recover the four unfinished scenes and adapt the latest Wolverine. | Each character passes its isolated movement and attachment checks. No rejected fallback stands in for completion. |
| C — Shared scene system | Common renderer contract, deterministic timeline, loading/fallback behavior and transitions. | Five consecutive scenes work together on desktop and mobile without resets, duplicate loops or clipping. |
| D — Complete the store | Every linked page, catalog flow, cart, forms, order handling and content state. | Full customer journey works on direct URLs, refresh, back/forward and navigation. |
| E — Finish administration | Shared publishing, scene controls, media, stock/prices, revision handling and backup/restore. | Owner can change real content without editing source; a separate visitor sees published changes. |
| F — Optimize and review | Visual, functional, accessibility, security and performance checks against the final build. | No unresolved release-blocking defects; evidence and honest limitations recorded. |
| G — Package and present | Source ZIP, prebuilt Netlify ZIP, guides, asset manifest, QA report and integrated preview. | Packages extracted and tested independently; the user reviews the combined result before live replacement. |

Build in small runnable increments. Necessary reversible repairs can proceed without repeatedly asking permission. If an external credential or irreplaceable asset is missing, finish all independent work and list the exact dependency and the feature it blocks. Do not invent credentials, business details or successful service connections.

## 5. Stage A: establish one source of truth

1. Open the existing Site through the Sites workflow. Record the project ID, source revision/commit and working branch. Read its applicable project instructions. Do not materialize or replace the Site's Library text projection as though it were website source.
2. Compare the canonical source with the two recovered full-store archives. Preserve the existing catalog, design assets, owner authorization, D1/R2 integrations and portable exporter where they work. Isolate changes in a review branch/checkpoint.
3. Create `docs/completion-audit.md`: feature, source file, current behavior, defect, dependency, required fix and acceptance evidence. Use “verified,” “implemented but unverified,” “incomplete,” or “blocked.”
4. Inventory all routes and active navigation targets. Extract all character assets and classify them as approved/current, candidate, rejected or obsolete. Keep the user's actual references available beside the animation work.
5. Create `docs/asset-manifest.json` containing source/provenance, character identity, renderer type, dimensions, transparency, file size, clip names, texture dependencies, credits, mobile derivative and review status. Do not silently switch a named character to a robot.
6. Preserve lockfiles. The inspected store manifest declares Three.js ^0.186.0, while the standalone Wolverine work used 0.169.0. Use one Three.js runtime in the site and verify the GLB under that runtime; do not ship the standalone application bundle inside the main application.

Exit: a baseline build runs, the store and admin can be opened, and the missing work is enumerated. An unresolved baseline build error must be repaired before character integration proceeds.

## 6. Stage B: finish each character before assembling the journey

Use actual rigged animation where suitable assets exist. If a suitable rig is unavailable, identify that as an asset dependency; a coherent pre-rendered animated clip is a possible explicitly documented presentation asset, but a still image with moving light is not equivalent to character animation. Do not generate another batch of unreviewed limbs or spend hours repeating a method the user rejected.

For every character, compare ready, anticipation, attack/contact, follow-through and recovery against the user's references. Review the transitions between poses at normal speed and slow speed. A character must change posture, shift weight and react to the action—not only translate across the canvas.

| Character | Required performance | Attachment/contact check |
| --- | --- | --- |
| Goku Ultra Instinct, first | Recognizable silver-haired Ultra Instinct appearance; grounded preparation, hands gathering energy, aligned beam release, torso recoil and controlled recovery. | Beam begins between the animated hands and follows their direction. Preserve previously accepted alignment; no light beam originating beside his body. |
| Spider-Man | Weight shift, intact shoulder/elbow/wrist chain, recognizable web-shooting hand pose, web release and follow-through. If swinging is used, body motion must respond to tether tension. | Web begins at the correct wrist/hand position, has a visible direction/anchor, and never detaches during camera movement or resizing. |
| Wolverine | Reuse latest clean GLB: wide low guard, deeper load, forward lean, tucked leading knee, trailing bent leg, diagonal airborne strike and compressed landing. Retain the restrained brow/eyelid/cheek performance. | Six claws remain attached. Any blade echo uses actual skinned tip positions. No old Talon robot, raster Wolverine or giant screen marks. Original model has no jaw control; do not claim a jaw-driven roar. |
| Harry Potter | Full head and body remain in frame; preparation, planted casting stance, wand-arm extension, red Expelliarmus-style discharge and recovery. | Red effect begins at the wand tip in the same coordinate space as the character. Avoid describing it as an invented lethal spell in website copy. |
| Ronaldo | Recognizable athlete, short preparation, planted support foot, hip rotation, striking-leg swing, ball contact and follow-through. | Ball is still until the contact event; separation starts at the boot. Use a properly shaded spherical ball and ground shadow. No detached leg or floating ball launch. |

Wolverine integration details:

- Load `Wolverine-Claw-Attack.glb` as a separate cached asset. Keep both skinned meshes and their bindings. Do not rebind, rename bones or flatten hierarchy without comparing the result.
- Use its baked animation as the baseline; do not paste the preview HTML, its UI, global variables or embedded FBX/base64 bundle into the store.
- The clip ends forward of its starting position. Replay/reset must be explicit or concealed by a scene transition; never interpolate the root back through the visible recovery and create foot sliding.
- The preview's faint blade echo is browser code, not baked GLB geometry. Rebuild it only if needed using actual sockets/vertices; omitting it is preferable to an incorrect effect.
- Preserve credits. The supplied asset is a game-style model; do not label it film-quality or motion capture.

Exit: render a small pose sheet and continuous playback for each scene; check anatomy, silhouette, face framing, wrists, knees, feet, weapon alignment and texture consistency. A numeric joint-length test alone does not establish visual quality.

## 7. Stage C: one coordinated animation system

Replace filename-based dispatch with an explicit scene record. Proposed fields: stable `id`, character name, order, renderer (`gltf`, `video`, or `poster`), asset URLs, clip name/duration, poster/mobile fallback, camera framing, content/CTA references, event markers, attachment definitions, motion quality and revision. Migrate existing CMS documents rather than invalidating saved edits. Keep Goku first and each required character present exactly once.

The shared controller should load, seek to normalized progress, pause/resume, report readiness, resize and dispose. All model pose, camera and effects derive from one timeline. No separate unsynchronized CSS keyframes or independent timers for the same action. A seek to the same progress must produce the same pose in either scroll direction; seeded particles and replay events must also behave predictably.

Use one active 3D renderer where practical, with the current scene and at most the next scene being prepared. Dispose of unused GPU resources, listeners and animation frames. Do not preload all five full models before the first screen. Do not create a permanent render loop for invisible chapters.

Define shared coordinate conventions: meters, up axis, forward axis, ground height, world scale, attachment transforms and responsive camera framing. Convert bone/socket positions to screen coordinates only after the current pose, model matrices and camera are updated. On-screen effects and skinned meshes must use the same frame.

Keep character boundaries deliberate: settle the outgoing action, transition the environment over roughly 250–450 ms as an initial tuning range, reveal the incoming ready pose, then let the next action progress. Tune this by actual playback, not by duration alone. Avoid five simultaneous backgrounds or a blank screen between assets.

Input behavior: native scroll progression on desktop; natural touch scrolling on mobile; visible action/replay and motion controls; keyboard-operable chapter selection; no sound until the visitor opts in. “Shop now” works at all times. Reduced-motion shows a composed static pose with the same content and links. WebGL failure or context loss gives a stable poster and usable store, not a spinner forever.

## 8. Stage D: finish the entire storefront

Use the existing router and templates. The goal is consistency across the complete site, not an elaborate homepage with broken secondary pages.

| Area | Required finished behavior |
| --- | --- |
| Home and cinematic journey | Correct first CTA, readable copy, responsive character framing, fast route to products, consistent transition to the shopping section. |
| Shop/category/search | Working platform/category filters, search, sort, reset, empty results and loading/error states. Preserve filter state in URLs where appropriate. |
| Product details | Correct images, variants/condition, PKR price or clear quote-only state, availability, specifications, included items, warranty/delivery information and related products. Unknown products produce a real missing-item state. |
| Cart | Add, update, remove, valid quantities, persistence and totals. Re-check current price/availability on the server before order submission. |
| Checkout and account | Guest flow, validated contact/delivery data, clear total, durable submission, duplicate-submit protection and truthful confirmation/status. Preserve access isolation for customer records. |
| Trade-in and services | Complete forms, usable photo upload where supported, confirmation and owner-visible requests. An estimate is not a final quote; a preferred date is not a confirmed booking. |
| Games, guides and reviews | Real routes, maintained release information, genuine review content, captions/posters for video and useful empty states. No fabricated ratings or copied expired launch claims. |
| About, visit, seal guide, FAQ, policies | Real store/contact data where supplied, working links, readable policies and consistent navigation. Preserve the distinction between seal-intact hardware and unopened retail packaging. |
| Custom pages and 404 | CMS-created pages render correctly; missing routes do not fall back to a misleading home page. Direct deep links and refresh work in both distributions. |

Existing documentation describes draft commerce, not completed payment processing. Finish durable order/request handling and its owner workflow before calling the store operational. If merchant credentials are available, integrate the authorized hosted payment flow and verify the return/webhook path, amount/currency, duplicate callbacks and failed/cancelled payments. Never trust a client success screen as proof of payment. If credentials are absent, leave that payment option unavailable and record the exact blocker; do not fabricate checkout success.

A WhatsApp button should open a correct prepared conversation only when the store number is configured. It must not claim that a message was sent. Do not silently transmit customer messages or run real charges during QA without existing authorization.

## 9. Stage E: a genuinely usable admin

Keep the existing protected hosted admin and complete its missing fields/workflows. The owner should be able to update products, pricing, availability, images, categories, hero text, navigation, FAQs, guides, service information, contact details, SEO and scene selection without editing code.

Add explicit scene asset selection, active/hidden state, fallback poster, CTA, accent and constrained motion settings. Separate ordinary content fields from advanced asset configuration. Explain that uploading a picture changes artwork; it does not automatically create a rig or a new animated performance. Provide preview before publishing.

Preserve draft versus published content, conflict rejection and version restore. Publishing must be atomic and visible to a second visitor after the normal cache-refresh policy. A failed save must keep the editor's work. Backups must include content plus a media manifest; a JSON file alone is not an independent media backup.

Add or complete the merchant queue for submitted orders, service requests and trade-ins. This is separate from the customer's draft/account screen. Restrict it on the server, not only by hiding buttons. Preserve per-customer access boundaries, safe uploads, input validation and server-calculated totals. Do not ship privileged keys to the browser or a hardcoded universal admin password.

Admin acceptance exercise: edit a test product, replace its image, change a FAQ and scene CTA, save a draft, confirm the public page has not changed, preview, publish, verify from a fresh visitor session, restore an earlier revision to draft, then clean up test data. Repeat an unauthorized request and a stale concurrent save; both must be rejected without losing the valid content.

## 10. Hosting and portable delivery: keep the distinction honest

Preserve the current hosted architecture for the complete shared store while integrating the presentation. The inspected source uses the Sites/Cloudflare environment, D1/R2 storage and owner authentication; it is not a drop-in standalone Netlify server application.

| Distribution | What it should provide | What must not be implied |
| --- | --- | --- |
| Full hosted site | Shared content publishing, owner authentication, durable orders/requests and configured integrations. | That a saved draft is a paid order or a message has been sent. |
| Prebuilt Netlify Drop | Finished responsive frontend, routes/assets, local cart/content editing and export workflow, matching the completed visual design. | That browser-local edits update all visitors, or that dropping static files provisions the database, authentication or payment services. |
| Full source package | Shared components/domain logic, current adapters, build/export commands, lockfile, assets and setup documentation. | That secrets or external accounts are included in the ZIP. |

Deliver both requested download types. If the user requires the full shared-admin/payment operation specifically on Netlify, treat the backend/auth/storage adapter as unfinished launch work and implement it before calling that Netlify deployment production-complete. Do not try to reuse the Sites identity mechanism across origins without a supported authenticated integration. Do not silently replace the current backend as part of a visual merge.

Netlify documentation distinguishes prebuilt manual deploys from framework builds, and describes Functions deployment through its build pipeline, CLI or API. Package a tested output directory with its required redirects/headers; do not ask the user to drop raw React/source files and hope they compile. See the technical references at the end.

## 11. Performance and mobile acceptance

Set budgets before integration and report the final measurements. These are proposed engineering budgets, not claims about the current build:

- Initial non-3D storefront JavaScript: target no more than 200 KB gzip, hard review threshold 250 KB. Count all automatically loaded chunks. Keep admin and legacy showroom code off the initial route.
- Treat the original brief's total-JS limit separately: optional Three.js still counts toward total feature cost. Do not claim total JS is under 250 KB merely because the initial shell is small; choose a lighter delivery mode or document the unresolved budget conflict.
- First screen transfer: target approximately 1 MB or less before optional motion. Load a properly sized hero poster promptly; do not block the store on a multi-megabyte rig.
- Character asset target: roughly 2–4 MB compressed transfer per scene after texture/mesh optimization where practical. The recovered Wolverine GLB is about 12.5 MB before delivery compression, so it needs a measured optimization pass. Preserve facial and blade quality; recheck deformation after compression.
- One active heavy scene, lazy next-scene loading, bounded decoded-image/GPU memory, device-pixel-ratio caps and offscreen/background pause. Provide a lighter mode when frame pacing suffers.
- Aim for stable 60 FPS on capable desktop hardware and at least 30 FPS on the selected midrange test phone. Record device, browser, settings and frame-time behavior; emulation is not physical-phone evidence.
- Core Web Vitals objectives: LCP ≤2.5 s, INP ≤200 ms and CLS ≤0.1 at the 75th percentile of real visits. Before launch, report lab results separately; Lighthouse TBT is not measured field INP.

Test 320, 360, 390, 430, 768, 1024 and 1440-pixel widths, plus phone landscape. Inspect menu, filters, forms, admin editing, sticky cart controls and every animation pose. Reserve safe regions for heads, hands, claws, wand and ball; allow camera/layout changes rather than cropping key anatomy. Use touch targets around 44 pixels or larger, readable text, visible focus and 200% text zoom without losing actions. No horizontal overflow or hover-only essential behavior.

Use responsive WebP/AVIF derivatives and appropriate image dimensions. Generate editorial art only where genuinely needed; actual product/condition/seal evidence must remain accurate to the unit being sold. Do not promise “HD” just by upscaling a low-resolution texture.

## 12. Double-check the release, not an earlier preview

Perform these checks on the final packaged build after the last visual/code change:

| Check | Evidence required |
| --- | --- |
| Visual continuity | Continuous recording of all five chapters at desktop and phone sizes; reviewed ready/contact/recovery frames; no detached effects or identity substitution. |
| Anatomy and contact | Inspect shoulder/elbow/wrist and hip/knee/ankle continuity, hand/wand/claw attachments, football contact, root motion and foot planting. Check intermediate frames, not only endpoints. |
| Timeline | Slow scroll, fast scroll, reverse scroll, chapter jumps, replay, resize and background/resume. No duplicate listeners or multiple animation clocks. |
| Store routes | Visit every navigation target and representative dynamic detail route; refresh deep links; test back/forward, 404 and broken assets. A 200 response alone is insufficient. |
| Commerce | Search → product → cart → checkout/request → owner queue; correct totals, sold-out behavior, invalid input, failed submission and repeat clicks. |
| CMS | Draft/publish separation, cross-session visibility, uploads, unauthorized access, stale revision, restore and export/import. |
| Resilience | Slow network, failed scene asset, WebGL unavailable/context loss, reduced motion and no audio permission. Core shopping remains usable. |
| Accessibility | Keyboard journey, focus order, modal escape/focus return, labels/errors, contrast, reduced motion and text zoom. |
| Performance | Cold-load request totals, bundle breakdown, media transfer, lab metrics and timed animation traces. Clearly identify anything not physically tested. |
| Packaging | Extract into a fresh folder; run the documented launcher/build; serve the Netlify output independently; confirm no scratch/localhost dependencies or missing files. |

Release blockers: broken primary routes, missing required characters, robot fallback, torn anatomy, effects visibly disconnected from their sources, cropped key body parts, admin changes that do not persist as advertised, incorrect totals, unauthorized data access or a package that cannot start. Fix these before asking the user to review. Minor remaining limitations must be stated specifically; no blanket “everything tested” claim.

The existing Wolverine-only viewport/playback checks do not certify the combined store. Repeat the necessary checks after integration, then stop optional testing once the actual release risks are resolved.

## 13. Final deliverables and user handover

Produce from one recorded source revision:

1. `GAME-FROST-Complete.zip`: complete source, lockfile, optimized assets, original asset references/credits, environment example without secrets, migrations where needed, launcher, build/export scripts, content/media backup and concise README.
2. `GAME-FROST-Netlify-Drop.zip`: prebuilt deployable output, correct routes/redirects/headers, fonts/media and current content snapshot. Document its actual backend mode.
3. `ADMIN-GUIDE.pdf` or an equally readable guide: login, everyday edits, previews, publishing, image uploads, orders/requests, backup/restore and the hosted-versus-portable distinction.
4. `QA-REPORT.md`: revision, test environment, passed/failed checks, measurements and exact remaining external dependencies.
5. Integrated desktop/mobile preview recordings and a review URL where supported. Show the complete storefront, not only Wolverine.

For the complete package, provide exact Windows and macOS/Linux viewing steps and the actual supported runtime version. Test the launcher you include. For the Netlify package, explain extraction and dropping the output folder. Do not promise double-clicking a React project's source index will run its backend. Verify that the ZIPs match the preview revision and retain a rollback checkpoint.

Present the finished combined preview and files. Apply the existing user review boundary before replacing the live site. Do not post intermediate downloads as if they were the completed store.

## 14. Recovery references for the implementing agent

Use current Library versions and the corresponding skills. These identifiers identify source material, not deployment approval.

| Resource | Stable reference |
| --- | --- |
| Canonical GAME FROST Site | Project `appgprj_6abc5dcea7588191a79942ded1b529d5`; slug `game-frost`; Site Library identity `libfile_b0b263ecd6f081918c505117c73563b2`. |
| Main review address | https://game-frost.kingasadkhan1556.chatgpt.site |
| Rift Animation Fix Complete | `libfile_dcb3db71c0bc81919566180adddd3ff9` — `GAME-FROST-Rift-Arena-Animation-Fix-Complete.zip`. |
| Optimized CMS comparison source | `libfile_b692f0c275508191b836aee43b51d9f5` — `GAME-FROST-Optimized-CMS-Complete.zip`. |
| Current Wolverine package | `libfile_03df724348188191a25a7427cb7a1318` — `Wolverine-3D-Complete.zip`, version 2 at this audit. |
| Current Wolverine video | `libfile_764d0b4ee7bc81918691c95ba3d9fc24` — `Wolverine-Attack-Preview.mp4`. |
| Original rig supplied by user | `libfile_de91c7351864819181bf32d0460d6b21` — `wolverine-rigged-deadpool-and-wolverine.zip`. |
| Original business brief | `libfile_395e85eb1570819192f9231f41e9d166` — `Pasted text.txt`. |
| Design and commerce handover | `libfile_541cc5cf5c348191b8bf2cdb21bba481` — `GAME-FROST-Design-Handover.pdf`. |
| Goku beam-off illustration candidate | `libfile_8db8f66696e481918cd17c6864774ed7` — `Goku’s beam-off Ultra Instinct stance.png`; located, not visually re-audited in this planning turn. |
| Goku beam-on illustration candidate | `libfile_5ca10bace46c8191bb7f04247468f9eb` — `Goku Unleashes the Ultra Instinct Kamehameha.png`; located, not visually re-audited in this planning turn. |

Useful inspected source locations under the full archive's `website/`: `components/game-frost/router.tsx`, `rift-home.tsx`, `rift-character.tsx`, `rift-original-hero.ts`, `admin.tsx`; `lib/original-heroes.ts`, `rift-timeline.ts`, `cms-model.ts`, `cms-validation.ts`, `cms-server.ts`; `app/api/admin/route.ts`; `netlify/local-cms.ts`, `local-store.ts`, `export-package.ts`; `docs/*verification.json`.

Earlier scratch files may have been removed by workspace maintenance. Recover persisted assets instead of assuming they still exist or asking for uploads that are already recoverable.

## 15. Ready-to-use instruction for Sol 6.1

> Continue the existing GAME FROST project using this handoff. First recover and audit the canonical Site source and the identified saved packages. Complete the unfinished characters and commerce/admin requirements before final assembly. Preserve the latest Wolverine 3D motion and Goku's accepted beam alignment; remove filename-based robot substitution. Use one coherent, mobile-friendly scene system with real attachment/contact points. Keep all shopping routes and owner updates functional. Produce a combined review preview, full source ZIP, tested Netlify Drop output, owner guide and evidence-based QA report. Do not claim browser-local CMS edits are shared publishing or draft checkout is live payment processing. Inspect the final full motion and final packages after the last change, fix release blockers, and present the concrete result for the user's review before replacing the live site. Continue autonomously on ordinary reversible work; report only genuine missing assets, credentials or business data as blockers.

## Technical references checked for this plan

- Google, Web Vitals: https://web.dev/articles/vitals — current metric thresholds, field-versus-lab distinction and TBT/INP distinction.
- Netlify, Create deploys: https://docs.netlify.com/deploy/create-deploys/ — manual and continuous deployment workflows.
- Netlify, Get started with functions: https://docs.netlify.com/build/functions/get-started/ — supported Functions build/deployment routes.

These external references support the deployment/performance guidance. Project status and the specific source defects above come from the recovered project files, saved Site projection and this conversation. No full-site runtime test or production deployment was performed during this planning task.
