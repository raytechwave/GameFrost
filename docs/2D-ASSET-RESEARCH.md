# 2D character asset research — 8 October 2026

The user's latest instruction permits finding new assets and using 2D animation for the unfinished character scenes. Four scene performances have now been authored as new review artwork rather than left blocked waiting for missing source. This does not recover the previously accepted Goku artwork, and new artwork must not be described as that recovered artwork.

## Source audit

`SCENE-RECOVERY.md`, `upload-inventory.json`, `asset-manifest.json` and `references/supplied-completion-plan.md` were inspected again. The supplied assets contain the current Wolverine model, animation and textures. They contain no Goku, Spider-Man, Harry Potter or Ronaldo scene artwork or animation. `/images/spider-man-2.webp` is a square product-cover asset with an opaque background; it is unsuitable for a transparent character performance and should remain product imagery.

## Public asset research

Requests made in this cloud environment produced these results. A CONNECT 403 is a network/proxy result, not evidence that the source has no usable assets.

| Source checked | Intended use | Observed access | Import decision |
| --- | --- | --- | --- |
| Wikimedia Commons API | Search full-body character artwork and inspect author/license | CONNECT 403 | No asset inspected or imported |
| OpenGameArt search | Inspect reusable animation/artwork with explicit licenses | CONNECT 403 | No asset inspected or imported |
| Kenney asset library | Inspect generic reusable effects/football props | CONNECT 403 | No asset inspected or imported |
| Official Dragon Ball site | Identity/costume reference | CONNECT 403 | No asset inspected or imported |
| Marvel Spider-Man character page | Identity/costume reference | CONNECT 403 | No asset inspected or imported |
| Harry Potter official site | Identity/costume/wand reference | CONNECT 403 | No asset inspected or imported |
| Real Madrid Cristiano Ronaldo history page | Athlete/kit reference | CONNECT 403 | No asset inspected or imported |
| raw.githubusercontent.com | Potential source/code distribution | HTTP 200 | Connectivity only; no named-character asset or license verified |

No external asset is recommended as verified by this research. A download being available does not establish transparent edges, complete anatomy, continuity across poses or reuse rights. Search thumbnails, extracted game sprites and cropped promotional art would require separate source/license inspection; none has been imported.

## Recommended implementation within the available environment

Use original, transparent, full-body vector artwork designed specifically for the four performances. Retain the supplied Wolverine GLB and its documented credits. This avoids splicing a single raster illustration into moving limbs, dependence on unknown animation files, oversized downloads and opaque background rectangles.

These vectors need to depict the actual requested characters: silver-haired Ultra Instinct Goku, the red/blue Spider-Man suit and white mask lenses, bespectacled Harry Potter with a wand and restrained red discharge, and Ronaldo in a recognizable number 7 football kit. They must not be relabeled robots or generic replacement characters.

Treat the vector source as new project-authored fan artwork. Record the source code location and authorship in the manifest. Character identities, costume designs and marks remain associated with their respective rights holders; original drawing does not establish a merchandise or promotional license. Do not label the character artwork CC0, licensed by the rights holder or the previously accepted Goku artwork without evidence.

For credible 2D movement, author anatomical chains rather than segmenting raster images. Shoulder/elbow/wrist and hip/knee/ankle points must have stable lengths, overlapped closed joint surfaces and continuous silhouette curves. Draw each evaluated pose from one shared timeline. The torso, head, face, hands, clothing folds and planting foot must follow those anatomical points, so a moving effect cannot mask an otherwise static character.

Keep effects in the same local coordinate system as the evaluated pose: the Goku beam begins between both hands, Spider-Man's web begins at the shooting wrist, Harry's red discharge begins at the wand tip, and the football is still until the striking boot contacts its spherical boundary. Calculate these endpoints in the same frame as the pose; never position them by unrelated CSS percentages or independent timers.

Use a common scene viewport and reserve space for the complete movement envelope at mobile widths. Frame the character and source of the attack fully; a beam or web may leave the edge after its source remains visible. Use the same floor/contact treatment and restrained typography across all five chapters. Avoid large blur filters and hundreds of elements whose redraw cost could erase the performance advantage of vector art.

## Implemented and inspected

Four built-in vector rigs are in `components/game-frost/vector-{goku,spiderman,harry,ronaldo}.ts`; the shared anatomy and drawing helpers are in `vector-helpers.ts`. Their performance is driven by the same seekable timeline as the supplied Wolverine scene. Effects are drawn from per-frame hand, wrist, wand or boot anchors. Original synthesized action sounds are opt-in and use those action markers. Static ready-pose SVGs live at `public/characters/*-2d.svg`.

`vector-motion-verification.json` records 1,001 geometry samples per new rig, the desktop and emulated mobile pose sheets, button/scroll/reverse checks, sound marker checks, reduced motion, eight viewport sizes and 200% text. The exact Goku art referenced in the plan was absent; this is new review artwork preserving its silver-haired Ultra Instinct and hand-fired beam direction. Rights/credits are recorded as new project-authored fan artwork, not as a license from a rightsholder.
