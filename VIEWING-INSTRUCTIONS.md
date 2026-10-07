# Open the GAME FROST review

The delivery is an integration **review candidate**. The Wolverine performance is integrated into the recovered store. Four accepted character performances and the newer Rift Arena source were not provided; those chapters visibly remain unfinished. The live website has not been changed.

1. For the quickest visual review, extract `GAME-FROST-Preview-Evidence.zip` and open `index.html`. It contains desktop/mobile browser recordings and pose sheets. These are recordings of the combined application, not a public live URL.
2. To use the actual store locally, extract `GAME-FROST-Source-Review.zip`. Install Node.js 22.13 or newer. Open the `GAME-FROST` folder and double-click `START-WEBSITE.cmd` on Windows, or run `sh START-WEBSITE.sh` on macOS/Linux. Open **http://127.0.0.1:4175** in Chrome/Edge; keep the terminal open. No dependency install is needed to view the included build. Do not double-click React source HTML.
3. On the homepage, select **03 Wolverine**, then **Load performance** and **Play**. Use the slider and reset to inspect poses. Goku is first; unavailable chapters disclose the missing assets. Shop remains accessible throughout. Visit `/admin` for the browser-local editor. Changes here do not reach other visitors.
4. `GAME-FROST-Netlify-Drop-Review.zip` is ready to extract and drop onto a **separate review deployment**: the folder must directly contain `index.html`, `_redirects`, `_headers` and `assets`. It contains no shared backend. Do not replace the live site until the combined work is approved.
5. For source development, shared admin setup and rebuild commands, read `README.md` and `docs/ADMIN-GUIDE-CURRENT.md`. Read `docs/QA-REPORT.md` for exact tested scope and limitations.

The source ZIP includes both the React source and the prebuilt static edition. The Drop ZIP includes only the static edition. Neither ZIP is a `.env`, database, credential, customer-record or payment-gateway backup.
