# Sian Studio — Sales-to-Hosted-Publication Runbook
Version: 2026-11-17 / v1.3

## Working today
- The public guided builder and storefront showroom are deployed on GitHub Pages.
- Product builder: detailed attributes, original front/back photos, video/live links, social cards, detailed SEO fields.
- Style and section controls: typography, colors, layouts, ordering, toggles, custom content blocks, testimonial, image, video, FAQ and CTA.
- Site export: ZIP containing standalone product HTML pages, images, JSON-LD, sitemap.xml, robots.txt, Merchant Center CSV and social feed.
- Sales: editable quote, external checkout URL, clipboard handoff. No credit card input is handled by Sian Studio.
- Tarot: original Pamela Colman Smith Smith–Waite scans; spinner: original physics canvas and clickable hero motif.

## Operable pilot workflow (manual hosting and payment verification)
1. Live-build the site with the sian; enter LINE OA, real inventory, images, captions and social video URLs.
2. Show social creatives and individual product page/link structure. Agree site design.
3. Agree scope, setup fee, hosting/maintenance terms, domain ownership and support.
4. Add the approved operator-owned HTTPS payment link; copy quote and open checkout outside the builder.
5. Verify receipt in the authenticated payment provider dashboard. A screenshot from buyer is not proof.
6. Record verified order ID and invoice privately.
7. Enter the final HTTPS site origin, export ZIP; confirm demo inventory excluded.
8. Deploy ZIP contents to authorized hosting (preserve /items and /media). This is a human operator action.
9. Test homepage, each product URL, all images, videos, LINE, social previews, JSON-LD and sitemap.
10. Configure Search Console. Submit sitemap. If eligible, complete Merchant Center setup and validate CSV feed.
11. Hand over site, backups, domain and support documentation.

## Automated next phase (NOT YET DEPLOYED)
A static public site cannot verify payment webhooks, safely store credentials, provision isolated tenants or deploy sites.
Recommended: Cloudflare Workers + D1 + R2 media + Cloudflare Pages.

Endpoints:
- Authenticated project and shop CRUD (tenant isolated).
- Signed image uploads to per-shop R2 media, retaining originals and web variants.
- Backend-priced checkout session creation with a supported payment provider.
- Signature-verified and idempotent webhook to record provider-confirmed payment.
- Paid-only publishing with domain/slug validation, static snapshots, image files, sitemap, meta tags, feed and rollback.
- Separate private staff ledger and publicly safe site snapshots.

Payment progression: draft → quoted → checkout_pending → provider_verified → provisioned → published.
Failure modes: cancelled / refunded / suspended. Never let client-side UI mark an order paid.

## Publication and ownership safeguards
- Immutable product ID, canonical page URL, correct Product schema, unique front/back photos, useful alt text and multilingual description.
- Merchant Center eligibility and account review are separate; no guarantee of Google Lens placement.
- Correct status, price, condition, seller contact, video URLs and commercial terms must be reviewed before publishing.
- Project editable JSON and site ZIP are portable, but high-volume commercial media needs real authenticated storage.
- No buyer data, cost of acquisition, receipts, consignor records or private backups in public site export.
- Export/backup and seller-owned domain avoid lock-in.
- Automated deployment must include audit trail, rollback and tenant separation.

## Final automation acceptance test
1. Generate quote → open checkout → valid signed payment webhook updates the order exactly once.
2. Admin or permitted seller can publish to a distinct HTTPS URL, without using GitHub.
3. Test item gets unique searchable page, independent front/back JPEG assets and embedded video/link.
4. XML sitemap, canonical, OG image, Product JSON-LD, Merchant CSV validate.
5. Mobile share to LINE, Facebook, copy captions and 1:1 / 4:5 / 9:16 card export work.
6. Tenant A cannot modify tenant B; seller can export and migrate all public content.

Relevant references:
https://developers.google.com/search/docs/appearance/google-images
https://developers.google.com/search/docs/specialty/ecommerce/where-ecommerce-data-can-appear-on-google
https://github.com/mixvlad/TarotCards
