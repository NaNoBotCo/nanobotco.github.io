# Wholesale Desk — public-safe browser app

**Hosted URL:** https://nanobotco.github.io/wholesale-desk/

This is a standalone HTML/PWA invoicing and pricing application. **The public code contains no supplier prices**. The owner receives the private 157-SKU starter catalog separately in a JSON file, which must never be committed here.

## Open and use

1. Open the hosted URL in a browser.
2. Import the **PRIVATE_supplier_catalog_import.json** supplied privately in ChatGPT, or export and import a full JSON backup from the older local v0.2 HTML app.
3. Enter seller settings and buyer details; adjust markup, MOQ, rounding, testing and landed-cost assumptions in Pricing Lab.
4. Create quotes, proformas, and commercial invoices; print or save as PDF.
5. Export a JSON backup routinely. Install the PWA from your browser's menu if available.

## Operational limitations

**This is a hosted single-browser preview, not a secure multi-user production system.** It stores all imported records in plaintext browser localStorage, without a backend, authentication, encryption or cloud sync. Since this website shares the nanobotco.github.io origin with other projects, scripts on that origin could potentially read the data. Do not store real confidential commercial records or personal buyer data here until an isolated origin, access control and secure backend are added. Clearing browser data will erase local records, and changing devices does not move them. JSON backups are plaintext.

The offline service worker caches the application shell only, not invoice data. The app does not file tax records or automatically reconcile payments. It is not a replacement for an accountant-reviewed system.

**NEVER upload** the supplier PDF, original unsanitized HTML, private catalog JSON, or internal acquisition-cost matrix to this public repository.
