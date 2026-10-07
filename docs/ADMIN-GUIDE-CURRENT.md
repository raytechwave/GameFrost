# GAME FROST owner guide

## Know which edition you opened

**Hosted Site:** `/admin` requires the original owner’s verified Sites/ChatGPT identity. The server checks ownership on every content, media and request operation. D1 stores shared documents and customer requests; R2 stores media. A saved draft changes no public page. Publishing atomically changes shared content; a new visitor receives the published version. The live hosting identity and database must be connected through the original supported Sites architecture. Do not expose the Worker directly with untrusted identity headers.

**Netlify Drop / START-WEBSITE:** `/admin` is an editor for this browser’s IndexedDB. It has no shared authentication/database. **Apply locally** affects this device only. **Netlify package** downloads current content, assets and pages; extract and deploy the folder to update visitors. A static ZIP does not provision a shared backend. Local cart, photos and checkout drafts are never submitted to an owner queue.

## Everyday edits

1. Products: edit name, price, stock, visibility, images, specifications and featured picks. Choose a blank price for quote-only listings. Model reference pictures cannot prove an exact unit’s seal or condition.
2. Page content, FAQs, guides, games, services, navigation, custom pages and SEO have separate editor sections. Confirm current release information and actual business policy before publishing.
3. Character scenes: the fixed order is Goku Ultra Instinct, Spider-Man, Wolverine, Harry Potter, Ronaldo. Ordinary fields control copy, CTA, poster and accent. Advanced fields choose renderer, motion asset, exact clip and duration. A picture is a poster; uploading it does not create a rig or attack. Preview attachment points and all poses before marking an asset ready. The supplied source lacks four performances.
4. Preview shows the draft in an iframe. Save draft for persistence, then Publish changes (hosted) or Apply locally (static). Failed and stale saves retain your editor work; download a backup before reloading to merge another tab’s update.
5. Versions & backup can restore an earlier publication to the draft. Restoring does not overwrite published content until you deliberately publish it.

## Submitted requests

Hosted customers explicitly submit quote, service, trade-in and story requests. A received request is not a paid order, stock reservation, accepted trade or confirmed appointment. Customer requests in the owner editor lists only submitted records, never private drafts. Review customer details and condition photos; set reviewing, quoted, closed or cancelled as an internal workflow. Status changes do not send WhatsApp/SMS/email, collect money or automatically agree a quote. Submitted photos stay private to their customer and authorized owner.

The customer’s account shows their private draft or the latest request status. Guest records stay with that browser’s HttpOnly session; signed-in records use the platform user identity. Guest and signed-in records are not silently merged.

## Back up and restore

- **Content JSON** includes products, pages, settings, scenes and a public-media manifest. Hosted `/media/` links remain references; JSON alone is not a media backup.
- **Media backup ZIP** downloads `content.json`, `media-manifest.json`, and the actual public image/model files. It stops on any missing asset rather than handing you an incomplete backup. Private customer records/photos are excluded.
- On the same deployment, restore content JSON into a draft and preview it. On a different hosted instance, upload the backed-up images in Images and relink using the manifest before publishing. Put model assets into source `public/characters`; image upload is not a model uploader.
- **Netlify package** is the simplest portable public-content snapshot: hosted public uploads are copied into the package. Download it after publishing or explicitly choose the intended draft, preview it and deploy only after approval.

## Contact and payments

The supplied address is 13c Block, Block 13 C Gulshan-e-Iqbal, Karachi 75300, Pakistan. Phone/WhatsApp: +923350263448. Hours: 3 PM–2 AM Pakistan time; no days or email were supplied. The WhatsApp link opens a prepared conversation; it does not send a message automatically. Payment preferences are recorded for a future quote only. No gateway, payment verification or automated message delivery is enabled in this review build.
