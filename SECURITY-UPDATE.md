# BYOU IQ dependency security update

Checked 2026-10-21.

No vulnerable npm packages found. The public app has no runtime npm dependencies; Material Web 2.5.0, fflate 0.8.3 and esbuild 0.28.2 are now locked as build dependencies so bundled JavaScript can be reproduced and audited. The rebuilt Material bundle is unchanged; fflate differs only by a trailing blank line.

Validation: npm run build:vendor; npm run check (3 tests passed). Full npm audit, including development dependencies: zero known vulnerabilities.

GitHub Dependabot alert listings were unavailable because alerts are disabled for this repository; this is an npm advisory check, not a claim about GitHub alert status or a complete code security audit. Existing SECURITY-REVIEW.md remains the historical source review.

Run npm ci, then npm run audit:security to repeat the dependency check.
