# GAME FROST review downloads

The review build combines the gaming store, restored six-room 3D showroom, five-character scroll journey and opt-in browser sound effects. The exact earlier accepted Goku artwork and newer Rift Arena archive were not in the supplied files; the four newly drawn 2D scenes preserve the requested direction and order. Wolverine uses the supplied 3D rig. The canonical live website has not been changed.

- [Five-scene desktop and mobile preview](GAME-FROST-Preview-Evidence.zip): MP4 walkthroughs with synchronized browser-generated sound, desktop/mobile pose sheets and screenshots, QA report, setup instructions and asset provenance. The interactive website also has a Sound on/off control.
- [Complete source ZIP](GAME-FROST-Source-Review.zip): source plus a prebuilt static website. Extract it, open the `GAME-FROST` folder, then run `START-WEBSITE.cmd` on Windows or `sh START-WEBSITE.sh` on macOS/Linux. Open the loopback address printed by the launcher. Node.js 22.13 or newer is required.
- [Netlify Drop ZIP](GAME-FROST-Netlify-Drop-Review.zip): extract it and drop the folder containing `index.html`, `_redirects`, `_headers` and `assets` onto a separate Netlify review site. No build step is needed; this does not replace the existing live website.
- [SHA256 checksums](SHA256SUMS.txt): integrity checks for the three ZIPs.

On the homepage, scroll or use the five chapter buttons. Play/pause/replay/reset and the progress slider drive the same character timeline. The 3D showroom loads when you enter it. For reduced motion, automatic animation and pinned scrolling stop; manual pose and chapter controls remain available.

Hosted `/admin` publishing writes shared content only when the connected owner publishes through the supported backend. The Netlify Drop and local launcher editors change only that browser; download and redeploy an updated package to share their changes. Local customer drafts do not reach a shared queue.

GitHub shows the repository and download files; GitHub Pages is not configured. See the root [README](../README.md), [animation and sound QA](../docs/vector-motion-verification.json), [admin guide](../docs/ADMIN-GUIDE-CURRENT.md) and [scene recovery notes](../docs/SCENE-RECOVERY.md).
