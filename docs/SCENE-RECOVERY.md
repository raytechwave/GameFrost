# Scene recovery and correction — 8 October 2026

The previous GitHub review build omitted the showroom from the homepage and used manual chapter selection. It did not deliver the requested five animated scroll scenes. This correction restores the supplied 3D store below the character journey and connects native scrolling to the available animation controller.

## Exact uploaded sources

The original uploaded archives were re-inspected without modification. Their hashes, entries and motion filenames are recorded in `upload-inventory.json`.

| Uploaded item | Actual contents relevant to animation |
| --- | --- |
| GAME-FROST-Optimized-CMS-Complete.zip | Earlier store source with the six-department 3D showroom; no GLB, glTF, FBX, MP4 or WebM character performance assets |
| Wolverine-3D-Complete.zip | Latest standalone Wolverine review, one animated GLB and original Wolverine FBX/textures |
| wolverine-rigged-deadpool-and-wolverine.zip | Original Wolverine FBX/textures; no additional character performance |
| GAMEFROST-Sol-6.1-Completion-Plan.md | Handoff describing a newer canonical revision, a Rift Arena archive and separate accepted Goku artwork; it contains no scene source or artwork itself |

The supplied store's Spider-Man game-cover image is product artwork, not a Spider-Man scene or rig. The two Wolverine archives contain the same character, not the other four required performances. The newer Rift Arena archive and accepted Goku beam-on/off assets referenced in the plan are absent from these uploads. This environment has no callable Sites source tools. The canonical live source has not been overwritten.

## Implemented correction

- The existing six-department showroom is back on the homepage, immediately after the character journey. The dedicated `/showroom` route remains available.
- A visible entry link and header navigation reach the 3D store directly. Rendering loads on entry, so shopping remains usable before graphics are ready.
- The shared character panel follows native scrolling in the exact order Goku Ultra Instinct → Spider-Man → Wolverine → Harry Potter → Ronaldo. Scroll position also determines the available Wolverine pose; seeking backwards produces the same pose at the same progress.
- Chapter buttons change document scroll rather than keeping visitors in a separate manual selector. Short viewports, enlarged text and reduced motion keep a natural-height panel with chapter controls.
- The original Wolverine skeleton, skins, geometry, animation and texture bytes remain unchanged by this correction. Offline framing samples 290 points from its actual baked clip, adds conservative margin and stores the envelope in metadata. Runtime avoids resampling the entire animation before first display. Other uploaded GLBs without this metadata retain the existing runtime framing path.
- No sparks, guessed attack origins, replacement robots, segmented image limbs or oversized screen scratches were added.

Current browser evidence is in `scroll-showroom-verification.json`. The new recordings use actual browser screencast timestamps and installed system FFmpeg; software WebGL pacing is retained. They do not certify physical-device frame rates or missing performances.

## Remaining hard dependency

Goku's accepted scene/artwork and the other three character scenes must be recovered before completing the combined experience. The current placeholders are explicitly unfinished, and four attacks cannot be certified from a plan alone. The complete five-character release remains blocked. No live deployment is authorized by this correction.
