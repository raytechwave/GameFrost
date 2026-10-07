# GAME FROST Store Manager

Open the store's `/admin` address. On the hosted GAME FROST site, sign in with the owner's ChatGPT account. The manager supports phones, tablets and desktop computers.

## Everyday updates

1. Choose **Products** to add or edit an item. Change its name, price, availability, featured status, visibility, image, description or specifications. Use the arrows to change its order. On a phone these actions appear on product cards.
2. Choose **Page content** to search the existing words on the website. Filter by section, then edit the replacement text. Showroom headlines and descriptions have their own **Showroom** section.
3. Use **Games**, **Guides**, **FAQs** and **Services** for their respective lists. **Custom pages** adds a new page with text and image blocks. Add its `/pages/your-slug` link under **Store settings → Navigation**.
4. **Images** uploads JPG, PNG or WebP pictures. The editor compresses them before saving. An image picker also accepts an existing library image or HTTPS URL.
5. **Store settings** changes the store name, contact information, opening hours, menu, announcement, accent colour, homepage artwork, 3D quality and page titles/descriptions. Choose **On entry** for the lightest initial loading. Balanced quality automatically reduces graphics work on phones.
6. Select **Preview** to inspect your draft. Select **Save draft** to keep it without changing the public hosted website. On the hosted edition select **Publish changes** when it is ready.

## Backups and recovery

**Versions & backup** downloads a JSON content backup or imports an existing one into your draft. The latest 12 published versions can be restored to a draft; review and publish the restored draft when ready. Image files hosted by this Site remain at their existing media addresses. A complete Netlify export includes those public images as files.

If another tab has saved a newer revision, keep the editor open and download a backup before reloading. The server rejects stale revisions rather than silently overwriting the newer draft.

## Downloadable / Netlify edition

The static edition has the same manager at `/admin`, including previews, backups and image editing. Its edits are saved in your current browser. **Apply locally** changes your browser's view; updating everyone requires an export:

1. Finish your edits and save the draft.
2. Select **Netlify package** / **Download Netlify package**.
3. Extract the downloaded ZIP. Keep the assets, images, fonts and `store-content.json` together with `index.html`.
4. Upload the extracted folder to the deploy area of your existing Netlify project. For a first deployment, use https://app.netlify.com/drop.
5. Open the deployed site to see the updated store. Repeat this process for later updates. Save a JSON backup before moving to another device or clearing browser data.

The static manager writes only browser storage and downloads. It has no deployment credentials and cannot change a public Netlify deployment by itself. The hosted edition publishes shared changes directly through its owner-protected server.

## View the complete download

Extract the complete ZIP, install Node.js 24 if needed and double-click **START-WEBSITE.cmd** on Windows. Open http://127.0.0.1:8787/ if the browser does not open automatically. Leave the launcher window open. The local manager is http://127.0.0.1:8787/admin. On macOS/Linux run `node launcher.mjs` from the extracted package folder.

**VIEW-WEBSITE.html** is a read-only offline preview. The launcher runs the full interface, including the manager, filters, cart and 3D showroom. Scripts, fonts and images are bundled.

## Commerce features

Prices begin in sample mode. Set confirmed prices and choose the live price display setting when appropriate. Hosted customer drafts, carts and private uploaded photos keep their existing server storage. Static cart/request/photo data is saved separately in each visitor's browser. This package does not add a payment gateway or automatically send draft requests to the shop.

## Verification limits

Build, API, authorization, persistence, rendering, route, asset and export checks are recorded in `docs/*verification.json`. Compressed JavaScript sizes are measured build outputs. Visual browser QA, physical-phone testing and Windows execution were unavailable during this update; no measured LCP or FPS claims are made.
