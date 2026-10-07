# GAME FROST Netlify Drop build

This browser-only distribution uses the same animated showroom, product pages
and forms. Cart, drafts and photos persist in IndexedDB on each device. It has no
server identity, payments, shared merchant dashboard or message delivery.
The hosted Site continues to use its existing owner-scoped D1 and R2 storage.

Build with the existing project dependencies:

    node node_modules/vite/bin/vite.js build --config netlify/vite.config.mjs

Add `_redirects` with `/* /index.html 200` to the generated output before deploying.
The packaged download includes this already and needs no Netlify build step.
