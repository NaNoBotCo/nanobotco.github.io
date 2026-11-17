# One-time setup: automatic Wholesale Desk deployments

The GitHub workflow at `.github/workflows/wholesale-desk.yml` runs Node 22 security/revision tests on every protected-source push and deploys ONLY when a Cloudflare token is configured. Changes elsewhere in this repository do not trigger the Wholesale Desk workflow.

## 1. Create a scoped Cloudflare API token

Open Cloudflare Dashboard → Manage account → Account API tokens → Create Token. Use a **custom, account-scoped token** for the existing account. For its first deployment, the token must permit Workers **Admin** at product level because it creates the new Worker. The existing D1 database is already created and migrated; it does not need D1 query/write permissions just to deploy a Worker with the D1 binding. Do not issue a global API key. After the Worker exists, replace the token with one scoped to Worker **Editor** on this Worker, where supported. See Cloudflare's current Workers permissions documentation.

Never put the token into this repository, browser screenshots, chat, or a JSON file.

## 2. Save one GitHub Actions secret

Open:
https://github.com/NaNoBotCo/nanobotco.github.io/settings/secrets/actions

Create repository secret named **CLOUDFLARE_API_TOKEN**, pasting the token in GitHub's private secret entry field. The Cloudflare account ID is already configured in the workflow, and the database binding ID is configured in `cloudflare-wholesale-desk/wrangler.toml`.

## 3. Deploy

Open:
https://github.com/NaNoBotCo/nanobotco.github.io/actions/workflows/wholesale-desk.yml

Select **Run workflow**, branch `main`. The workflow validates the protected UI and Worker and deploys using `cloudflare/wrangler-action@v4` in the `cloudflare-wholesale-desk` folder.

The Worker name is `wholesale-desk-ops`. The app deliberately fails closed before Access configuration; a 503 is expected until step 4.

## 4. Protect the entire Worker

Cloudflare Dashboard → Workers & Pages → `wholesale-desk-ops` → **Access** → **Protect this Worker behind Access** → **All traffic**.

Create a policy permitting ONLY the specific operator email address(es) you choose. Do not allow a whole email domain, everyone or bypass. Protect both production and preview URLs. Cloudflare documents this Worker-level protection at https://developers.cloudflare.com/workers/configuration/cloudflare-access/.

In Worker settings add:
- `ACCESS_TEAM_DOMAIN`: your team's hostname like `your-team.cloudflareaccess.com` (no protocol);
- `ACCESS_AUD`: the Access application's AUD tag;
- `AUTHORIZED_EMAILS`: exact comma-separated email addresses of approved operators.

The Worker verifies signed JWTs and exact email allowlist on every route. The `keep_vars = true` setting preserves dashboard variables across updates.

## 5. Test before using live customer data

1. In an incognito browser, check that the URL shows the Cloudflare login or returns denied to an unauthorized user; the underlying Worker source must not be accessible.
2. Sign in with a permitted email; `/api/session` should return authenticated and `/api/workspace` should return revision 0 and null state.
3. Privately import `PRIVATE_supplier_catalog_import.json` (157 SKUs). The file contains acquisition costs: **never commit it**.
4. Change a markup and check the green `✓ D1 saved` label; reload and verify it persisted.
5. Create a test buyer, draft, invoice and partial payment. Export a JSON backup.
6. Sign in from a second device and verify the shared record. Test a stale edit and confirm HTTP 409 protects against overwrites.

## Operations and limitations

- No separate browser automation fees are needed to deploy code after this initial setup.
- All approved users currently have full access to supplier costs and customer records.
- D1 writes use full-workspace revision CAS; a conflicting edit is rejected rather than merged.
- Test workflow does NOT deploy when the API token is missing.
- Never use the older GitHub Pages demo for real confidential customer records.
- D1 audit logs are not offsite backups; export protected backups periodically.
