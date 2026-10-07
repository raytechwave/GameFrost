# GAME FROST review downloads

The source and supplied Wolverine scene are combined in a review candidate. The live website has not been changed. Four accepted character performances and the newer Rift Arena source remain missing; read the main QA report before approving any live replacement.

- [Preview evidence ZIP](https://github.com/raytechwave/GameFrost/raw/refs/heads/main/deliverables/GAME-FROST-Preview-Evidence.zip): desktop/mobile walkthroughs, pose sheets and page screenshots. Extract it and open `index.html`.
- [Source ZIP](https://github.com/raytechwave/GameFrost/raw/refs/heads/main/deliverables/GAME-FROST-Source-Review.zip): full source plus the prebuilt static edition. Install Node.js 22.13 or newer, extract the ZIP, open the `GAME-FROST` folder and run `START-WEBSITE.cmd` on Windows or `sh START-WEBSITE.sh` on macOS/Linux. Open the local address printed by the launcher.
- [Netlify Drop ZIP](https://github.com/raytechwave/GameFrost/raw/refs/heads/main/deliverables/GAME-FROST-Netlify-Drop-Review.zip): extract and drop the folder containing `index.html`, `_redirects`, `_headers` and `assets` onto a separate Netlify review site. No build step is needed. It does not replace the live website.
- [SHA256 hashes](SHA256SUMS.txt): integrity checks for the three ZIPs.

GitHub displays source files and downloads. GitHub Pages is not configured as a live website preview. A clone or GitHub's Code → Download ZIP contains the repository source and these delivery ZIPs; use the packaged Source ZIP above to view the included build without rebuilding.

On the homepage, choose **03 Wolverine → Load performance → Play**. The other unfinished chapters identify their missing assets. Hosted admin publishing needs the supported shared backend; Netlify edits and customer drafts stay browser-local until the public content is exported and redeployed.

See [viewing instructions](../VIEWING-INSTRUCTIONS.md), [QA report](../docs/QA-REPORT.md) and [admin guide](../docs/ADMIN-GUIDE-CURRENT.md).
