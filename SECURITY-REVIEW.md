# Security Review: BYOU-IQ-Sample

## Scope

Sanitized current-source BYOU IQ public local sample; upstream e4701a1b3902579995ad4f3500ce9361ce0bce49. Destination was populated/remediated after scan launch; initial empty-directory snapshot is not release identity. Reviewed source digest before report export: 74c0f41385f1c2d41967dcfb320b625acb9162b38123e8ffb4d19b774751184d.

- Scan mode: repository
- Target kind: directory_snapshot
- Target ID: target_sha256_b33d7a17e550e8a866c3e4c98dc5dabb876c821d5457ab19da4d6f95e1c2e3af
- Snapshot digest: codex-security-snapshot/v1:sha256:75886c9285f7b38118ac1acf8d567d6ae3308d694babd55d09436d65620f2b1e
- Inventory strategy: directory
- Included paths: .
- Excluded paths: none

Limitations and exclusions:
- No guarantee of zero vulnerabilities or PII.
- Binary font/image internals not forensically audited.
- fflate compression internals only reachability/advisory-reviewed; ingestion disabled.
- CSS pattern-reviewed; SVG structurally parsed.
- Production system is not covered.
- Excluded prototype/fonts/\*.ttf; prototype/assets/\*.png: Binary inventory only, not forensic audit.
- Excluded prototype/vendor/fflate.browser.js: Reachability and advisory checks only; whole compression algorithm not audited. Ingestion disabled.

### Scan Summary

| Field | Value |
| --- | --- |
| Scan outcome | completed |
| Reportable findings | 0 |
| Severity mix | none |
| Confidence mix | none |
| Coverage | partial |
| Validation mode | Independent static reviews, full-tree patterns, runtime security tests, browser smoke test, dependency advisory lookup |

Canonical artifacts: `scan-manifest.json`, `findings.json`, and `coverage.json`. This report is a deterministic projection of those files.

## Threat Model

Public fictional-data creator/campaign demonstration (user-provided context), consisting of a Node.js static server and original browser UI with local simulation adapters. npm start executes server.mjs; default address is http://127.0.0.1:4281, with PORT override validated to 1024–65535 (package.json:7; server.mjs:28–31). Server content root is the real path of ./prototype relative to server.mjs, independent of shell cwd (server.mjs:5). Browser entry loads sample-guard.js before app.mjs (prototype/index.html:23–28). requestJson routes through portfolioRequest, which returns local results or throws instead of reaching the retained production fetch fallback (prototype/app.mjs:540–541; prototype/portfolio-sample.mjs:12–43). Demo runtime selects local campaign operations (prototype/app.mjs:2968–2983).

### Assets

- Host filesystem confidentiality outside prototype, protected by lexical and realpath containment and allowed file types (server.mjs:19–25).
- User browser's local fictional workspace integrity: portfolio_iq_creators and portfolio_iq_intake (prototype/portfolio-sample.mjs:2–4), portfolio_iq_operations_v1 campaign/assignment/reply/payment simulation state (prototype/campaign-operations-model.mjs:431–438), and portfolio_iq_messages simulated drafts/sends (prototype/campaign-operations-controller.mjs:1674). These are same-origin localStorage, not authenticated server records.
- No unintended external-service actions or disclosure from the browser: enforced independently by server-delivered CSP, fetch shim, local API adapter and navigation guards (server.mjs:7–9; prototype/sample-guard.js:3–23; prototype/portfolio-sample.mjs:43).
- Published source and bundled assets must contain only material authorized for public release; absence of customer data/PII is user-required context, not established by this architecture pass.

### Trust Boundaries

- Local HTTP client to host filesystem: raw method, Host and URL are untrusted. Server only accepts exact localhost/127.0.0.1 Host with actual listening port and GET/HEAD, decodes URL, rejects backslashes/dot-prefixed segments, checks lexical and resolved containment, requires a regular file and allowlisted extension before readFile (server.mjs:13–25). No server mutation/API implementation exists in this handler.
- Browser UI to remote network: server CSP disables connections, frames, objects and form actions and restricts scripts/fonts to self and images to self/data/blob (server.mjs:7–9). sample-guard separately rejects fetch other than synthetic runtime/session responses, blocks external anchor clicks and window.open, and cancels submits (prototype/sample-guard.js:3–23). Guard runs before application module (prototype/index.html:23–28).
- Application workflow to live authority: portfolioRequest handles selected local creator/runtime/session routes and throws on other connected workflows (prototype/portfolio-sample.mjs:12–43); requestJson awaits this before its legacy network implementation (prototype/app.mjs:540–550). Retained creator upload/evidence code calls /api/sample-parse, but shim rejects it and server rejects POST (prototype/portfolio-sample.mjs:31–39; prototype/sample-guard.js:4–8; server.mjs:15).
- Local operator/UI to persistent browser state: demo adapter reads/writes unencrypted same-origin localStorage and local operation wrappers persist mutations (prototype/portfolio-sample.mjs:2–10; prototype/campaign-operations-model.mjs:431–438). Browser user and same-origin scripts already share authority; there is no tenant or authenticated role isolation in this sample.
- Bundled dependencies execute with the page's same-origin script authority: shipment parser imports bundled fflate; dynamically loaded material-controls owns UI implementation (prototype/shipment-xlsx-import.mjs:1; prototype/app.mjs:7794). package.json declares no npm dependencies (package.json:1–8); notices identify locally bundled libraries/assets (THIRD-PARTY-NOTICES.md:3–6).

### Attacker Capabilities

- A local client can send arbitrary Host/method/path requests to the loopback server but does not thereby control application files or localStorage. A malicious webpage may attempt loopback interactions, subject to Host checks, browser policies and server headers.
- A source recipient can inspect all distributed files. Actual public publication and comprehensive sanitization are outside what this architecture pass verifies.
- An operator can edit their own demo data/localStorage; self-only alteration of simulation records is not privilege escalation. A separate injection hypothesis requires a distinct lower-trust input and demonstrated execution/data crossing.
- External network exposure requires a changed startup, forwarding, or consumer of exported createSampleServer; the documented direct startup binds 127.0.0.1 (server.mjs:8,28–31).

### Security Objectives

- Serve only eligible files inside the resolved prototype directory; never expose parent directories, dotfiles or symlink targets outside it (server.mjs:19–25).
- Keep server read-only and loopback-only on supported direct startup (server.mjs:14–15,28–31).
- Keep demo activity local with no real email, payment, shipping, database or AI action; labels representing sends/payments remain simulation (README.md:20–22; prototype/campaign-operations-controller.mjs:1674).
- Publish no real customer records, PII or live credentials (user-provided requirement).
- Do not represent browser localStorage as secure personal-information storage or as authenticated multiuser persistence (README.md:16,22).

### Assumptions

- Supported normal deployment uses npm start or direct node server.mjs. Exported createSampleServer does not itself bind an interface; a separate importer could choose a different listener, and such a deployment is not documented or demonstrated (package.json:7; server.mjs:8,28–31).
- CSP enforcement depends on serving through server.mjs; opening/rehosting prototype through another server changes that independent control. Browser guard is JavaScript and is not an authorization boundary against someone already controlling the page.
- README claims uploads and external navigation are unavailable (README.md:20). Creator intake uploads are demonstrably blocked by independent controls. Local parser modules remain bundled; blanket claims about all local file-reading paths require workflow review, not inference from the fetch shim (prototype/shipment-xlsx-import.mjs:1).
- An about:blank window is allowed by the guard and retained live workflow code can call gmailTab.location.replace; architecture alone does not establish an externally reachable navigation bypass because live request routing is disabled (prototype/sample-guard.js:18–22; prototype/campaign-operations-controller.mjs:821; prototype/portfolio-sample.mjs:43).
- SECURITY.md resolver ran for root and prototype with exit 0 and empty output; no nested SECURITY.md was found. No supplied authoritative threat model or knowledge base was provided.
- Architecture inspection does not certify all source files sanitized, all dependency code audited, or runtime controls tested.

## Findings

### No findings

No reportable findings survived the canonical discovery, validation, and reportability gates.

## Reviewed Surfaces

| Surface | Risk Area | Outcome | Notes |
| --- | --- | --- | --- |
| Disabled spreadsheet import | not recorded | Rejected | Original candidate valid for earlier state. Entry now throws before any file bytes; independently verified and regression tested. No remaining reachable import. Evidence: artifacts/validation-summary.md |
| Staff and internal identifiers sanitized | not recorded | Rejected | Original candidate removed before publication: staff enums fictional, original domains/mailboxes/spreadsheet IDs removed. Whole text scan zero matches. Evidence: artifacts/validation-summary.md |
| Assets and dependencies | not recorded | Needs follow-up | 258 SVGs structurally inspected; 25 CSS files pattern checked; vendor advisory lookup clean. Full binary/compression audit not performed. Evidence: artifacts/validation-summary.md |
| Local server and browser isolation | not recorded | No issue found | Host/realpath/method/CSP checks and throwing local API adapter reviewed and tested. Evidence: artifacts/validation-summary.md |
| All application JavaScript | not recorded | No issue found | All 73 frontend mjs modules including Material bundle reviewed across independent reviewers; guard/server/tests/config reviewed. |

## Open Questions And Follow Up

- Full semantic compression-library and binary/font audit not performed; no confirmed remaining finding in performed checks.
  - Follow-up prompt: Review deferred unit sample-library-depth and close its stated proof gap. Paths: prototype/vendor/fflate.browser.js, prototype/fonts/Manrope-Variable.ttf, prototype/assets/byou-club-logo.png.
