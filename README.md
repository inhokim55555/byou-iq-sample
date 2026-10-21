# BYOU IQ Sample Repo

A public, fictional-data edition of the BYOU IQ creator and campaign workspace. Derived from the current application source at revision `e4701a1b3902579995ad4f3500ce9361ce0bce49` on October 21, 2026.

## Run locally

1. Install Node.js 22 or 24 from its official website.
2. Download this repository and unzip it, or clone it with Git.
3. Open a terminal inside the folder and run `npm start`. No dependency installation is needed.
4. Open http://127.0.0.1:4281 in your browser.

Run `npm run check` for syntax and security-boundary tests.

## What works

Browse fictional campaigns and creators, edit sample campaigns, and explore the original frontend workflows. Sample edits remain in this browser's local storage. Clear site data for this local address to reset them.

## What is intentionally absent

Production server, databases, migrations, credentials, internal documents, operational exports, deployment configuration, and original Git history are not included. Gmail, Google Drive, Supabase, AI services, payments, real shipping, uploads and external navigation are unavailable. Some frontend screens remain visible to demonstrate the interface but require a connected service in the original application. Any send/payment status is a local simulation, never a real action.

Use fictional data only. This is a local portfolio demonstration, not a production CRM or a secure place to store personal information. The server binds only to 127.0.0.1 and deliberately cannot connect to external services from the browser.

The portfolio's embedded demo is a separately packaged earlier revision; this repository is the sanitized current-source edition.

See THIRD-PARTY-NOTICES.md for bundled asset attribution and SECURITY-REVIEW.md for the release checks and limitations.
