# Wholesale Desk — Cloudflare protected edition

Cloudflare Worker + D1, protected by Cloudflare Access JWT verification and an exact email allowlist. Source contains no supplier acquisition costs, buyer records or private backups.

**DO NOT** upload the PRIVATE 157-SKU JSON, supplier PDF or operational JSON backups to this public repository.

This folder is the Cloudflare Worker build root. Configure GitHub integration root directory as `cloudflare-wholesale-desk` and deployment command `npx wrangler deploy`; D1 is already created and migrated in the owner's Cloudflare account. JWT checks fail closed until worker vars ACCESS_TEAM_DOMAIN (the team.cloudflareaccess.com hostname), ACCESS_AUD (Application AUD tag) and AUTHORIZED_EMAILS (exact comma-separated users) are configured.

Use Cloudflare Worker-level Access to protect *all* routes and previews. Never select a broad email-domain allow policy. After configuring, sign in, import the privately delivered 157-SKU JSON via UI, and verify the top-right cloud save indicator before issuing real invoices.

**Limitations:** shared full-access operators only (no RBAC yet); write collisions yield explicit HTTP 409 and users must export unsaved JSON/reconcile; no tax-invoice certification, bank-feed ingestion, R2 CoA storage, or automatic offsite backups. Not a production-certified accounting ledger.
