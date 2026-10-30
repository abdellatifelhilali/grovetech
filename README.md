# GroveTech

An initial product-research dashboard for comparing dropshipping opportunities. Node.js 24+, no third-party dependencies.

## Run

From this checkout, run `npm test`, then `npm start`. The server listens on loopback port 3000 (override with PORT). Health check: `curl -f http://127.0.0.1:3000/api/health`.

## What works

- Enter or import up to 100 products as JSON, calculate per-unit profit, rank opportunities, export results.
- Explicitly labeled example data; no invented live market metrics.
- Server-side read-only Shopify GraphQL and CJ catalog adapters. Live account access requires credentials and has not been verified.

Import objects require: `name`, `price`, `cost`, `shipping`, `fees`, `adCost`, `monthlySales`, `reviews`. All numeric values must be nonnegative and price must be positive. Use a single currency. Exported results can be imported again.

## Integrations

Set process environment variables (see .env.example; the file is not automatically loaded):

- SHOPIFY_STORE: your exact `store.myshopify.com` hostname.
- SHOPIFY_ACCESS_TOKEN: Admin API token with read_products permission. Uses API 2026-10.
- CJ_ACCESS_TOKEN: a current CJ developer access token. Token acquisition/refresh is not automated.

Secrets remain on the server. Connection status indicates configuration presence, not verified authentication. Allow outbound HTTPS to your Shopify hostname and developers.cjdropshipping.com; Node's --use-env-proxy flag respects the environment proxy.

Amazon analysis accepts user-supplied research only. No Amazon scraping or live Amazon integration is included. Scores are transparent heuristics, not sales predictions. Catalogs are displayed for review; automatic catalog matching and store publishing are future work.

## Deployment limits

This is a local, single-user MVP. There is no application authentication, account database, order automation, or persistence. Keep its loopback binding until authentication and a secure deployment layer are added. Do not expose account-connected routes publicly. No credentials belong in Git.
