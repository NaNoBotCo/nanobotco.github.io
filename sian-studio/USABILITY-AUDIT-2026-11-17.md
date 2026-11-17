# Sian Studio — Usability and accessibility audit
Date: 17 November 2026 | Release: v1.7 | GitHub Pages demonstration

## Method and evidence
This is a source inspection, expert usability walkthrough and browser-based functional regression, NOT a moderated human study of Thai amulet dealers.

We inspected the seven-tab builder, visual editor, public showroom, sale/handoff, and export source code. Three independent browser sessions explored shop/product/appearance/features, sections/sale/publish, and product/social controls. Additional sessions reproduced the Gold + Dots error and verified the correction; separate sessions checked storefront catalogue/search/sorting, math toy and divination widgets.

A same-origin automated regression on the public build passed **34 / 34 assertions**, including seven-tab navigation, Gold + Dots computed contrast, product editing, HTTPS and LINE validation, mobile preview widths, cancellation of destructive actions and social format selection. This is NOT evidence that all interaction combinations or real phones have passed.

## Severity 0: Gold + Dots breaks contrast — FIXED
The ornament selector previously replaced the built-in section's carefully composed background image with a light patterned layer. This revealed a light surface under text meant for a dark gradient. The old contrast badge measured chosen color values rather than the rendered content.

Fixes deployed:
- New section-readability runtime restores existing gradients, layers ornaments with very faint patterns, and ensures readable text for custom solid backgrounds.
- Merchant-selected low-contrast text is repaired in the rendered site, with an explicit control to store a safer color.
- Section readability now samples COMPUTED text colors in the live storefront iframe; gradients, photographs and decorative strokes are called out as unverified.
- The Gold palette heading was darkened.
- Default spacing, corner, and alignment values no longer silently override a selected art direction. These properties take effect only after the merchant changes them.

Repeatable test, Math Toy / Gold / Dots: **heading 7.70:1**; **description 9.00:1** versus the gold section background. Switching to Lines and back to None passed.

## Seven-tab audit matrix
| Tab | Controls checked | Fixes / findings |
| --- | --- | --- |
| 1. Shop | Thai and English brand fields, story, LINE OA, live preview | Edits propagate. Added LINE validation and character counts. |
| 2. Products | Add, title, price, status/category, front/back photo inputs, search metadata, recorded/live links, social formats/toggles | Added draft readiness cue, nonnegative price enforcement, HTTPS validation and confirmation before deletion. Real camera upload pipeline and downloadable social cards still need phone-level QA. |
| 3. Appearance | Eight art directions, font and density chips, global sliders and advanced controls | Opt-in CSS overrides preserve distinctive art directions. Global reset now asks confirmation; deep settings are still numerous. |
| 4. Features | Tarot, I Ching, Kau Cim, math toy, newsletter, hero spinner | Toggles exist and respond. Added help distinguishing features from entire page sections. |
| 5. Sections | Thirteen section types, editor, add, move, hide/show, delete, per-section colors, ornament, buttons | Added accessible action labels and deletion confirmation. Image/Gallery renamed to Image block; Video renamed to Video link (the custom block is not a hosted video player). |
| 6. Sale | Setup THB fee, monthly fee, checkout URL, billing email, quote and handoff buttons | Added HTTPS/email/nonnegative fee messages. No integrated payment verification or automated provisioning. |
| 7. Publish | Readiness checks, domain, ZIP and JSON export, import, reset | Added clear distinction: JSON is private editable project backup; ZIP is public hostable website. Neither publishes by itself. |

### Preview and standalone storefront
- Desktop, tablet and phone preview controls respond; Edit-mode annotations can be hidden. Annotations can overlap on small screens.
- Direct text editing works through the WYSIWYG layer. Undo and Redo cover inline text ONLY, not product deletion, styling, or all edits. A universal history is still missing.
- Public showroom category filtering, search, and low/high price sorting changed visible results in browser tests.
- Math toy Pause/Resume and equation Shuffle changed visible state. Spinner arm/friction/spin/brake and three divination methods were exercised in browser sessions.
- Product detail modal code contains provenance, pricing, video links, share links and product images. Clicking a generic article/card wrapper is not the same as clicking the More button; a dedicated explicit More test is still pending. No demo item carries an actual rear-photo file, so two-sided presentation cannot be accepted from the demo alone.
- Google Translate opens a SEPARATE external tab and only works on public hosted URLs; the label now says so. Built-in EN is the same-page language control.
- Newsletter is local demonstration functionality, not a real subscription/list provider. Consent and delivery must be connected before sale.
- Product image metadata supports Google discovery but indexing/Google Lens ranking is external and cannot be guaranteed.
- Public social-sharing, native share APIs and social-card image files need Android/iOS tests; their buttons existing is not full end-to-end proof.

## Release gate evidence
Public regression page: https://nanobotco.github.io/sian-studio/qa-usability-v17.html

**34 PASS / 0 FAIL** included:
Seven tabs; eight art directions; export button visibility; accessible section action names; six local palettes; Gold + Dots computed contrast; actual runtime loaded; rendered contrast badge; Lines and None; section delete Cancel; mobile and desktop frame mode; HTTP/HTTPS checkout; billing email; invalid/valid LINE ID; bad site domain; new product draft, title, negative price and delete Cancel; three social creative sizes and three photo-layout choices.

This gate checks behavior in isolated drafts, not business payments or actual customer publication.

## Open issues, prioritized
**P0**
1. Real merchant accounts, cloud drafts, backups, tenancy separation and ownership; localStorage + JSON alone is not scalable hosting.
2. Authenticated checkout, signed payment confirmation, publication job, deployed HTTPS site, custom domains, and rollback.
3. Device tests with ORIGINAL front/back images and video, including camera permission, upload failures, localStorage quota, mobile clipboard, LINE shares and visual social card downloads.
4. Contrast audit over image/gradient backgrounds and canvas artwork, plus keyboard accessibility for modal, overlays and spinner.

**P1**
1. One universal undo history for style changes, deletes, product edits, and section reordering.
2. True front/back product gallery or flip with zoom, price and status; test a REAL two-sided item.
3. Replace long expert control lists with contextual controls in the preview and task-specific mini editors.
4. Make newsletter demo versus real subscriber delivery unmistakable.
5. Validate full HTML ZIP, original media, OG share previews, Merchant Center CSV and stable product permalinks on the actual hosting platform.

## Real sian study needed
Recruit 6–8 Thai amulet sellers, including phone-first LINE/Facebook video sellers. With NO coaching, have each:
1. Name a shop and choose a style they want to use.
2. Take/upload front and rear photos, create one listing, assign a price and condition.
3. Add a video, create a Thai social post, and copy a product link.
4. Make a deliberate wrong style choice and recover without help.
5. Explain the difference between saving a draft, paying, and having a published site.

Collect completion without assistance, wrong-click rate, task duration, confusion about controls, and ability to recover from mistakes. Aim for 80% or better unassisted completion for each core task before calling the software self-service.

No purchases, public publishing, customer emails or real merchant data were used in this functional audit.
