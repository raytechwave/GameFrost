# Scene recovery and correction — 8 October 2026

The previous GitHub review build omitted the showroom from the homepage and used manual chapter selection. This correction restores the supplied 3D store below the character journey and completes the requested five animated chapters using the new 2D direction the user authorized.

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
- The character panel follows native scrolling in the exact order Goku Ultra Instinct → Spider-Man → Wolverine → Harry Potter → Ronaldo. The supplied Wolverine GLB remains the third scene; original vector rigs fill the other four chapters.
- Chapter buttons, document scroll, play/pause/replay/reset and the progress slider share one deterministic pose controller. Short viewports, enlarged text and reduced motion retain chapter and pose controls.
- Hand, wrist, wand-tip and boot/ball effects use endpoints computed from the same frame as each character. Scene sound effects use those progress markers, require a deliberate Sound click and stop on pause, rewind, mute, backgrounding or chapter exit.
- The earlier accepted Goku artwork was not present in the uploads. The silver-haired Ultra Instinct design and hand-fired beam direction are preserved in a new vector interpretation, not presented as the recovered art file.
- The original Wolverine skeleton, skins, geometry, animation and texture bytes remain unchanged by this correction. Offline framing samples 290 points from its actual baked clip, adds conservative margin and stores the envelope in metadata. Runtime avoids resampling the entire animation before first display. Other uploaded GLBs without this metadata retain the existing runtime framing path.
- No sparks, guessed attack origins, replacement robots, segmented image limbs or oversized screen scratches were added.

Current per-scene browser evidence is in `vector-motion-verification.json`; showroom and route checks remain in `scroll-showroom-verification.json` and `corrective-route-verification.json`. Desktop and emulated-phone Chromium sampled 1,001 frames for each new vector rig, captured 90 poses and checked the five sound cues. MP4s retain actual browser screencast timestamps and software-rendering pace and include the synthesized browser sound recorded from the same scene timelines. These checks do not certify physical-device frame rates or the exact earlier Goku artwork.

## Review and publishing

The combined review build can be inspected and downloaded; the canonical live website has not been changed. The prior Goku artwork and newer Rift Arena archive remain absent from the provided source. The owner can compare those materials later if the exact original Goku design is still required. Hosted shared publishing and browser-only Netlify editing retain their documented, separate behavior. This review does not claim physical-phone frame rates or commercial rights to character artwork.
