# Public sample validation

2026-10-21. Current upstream source: e4701a1b3902579995ad4f3500ce9361ce0bce49.

- 371 files / 369 text files scanned for credential patterns, known internal domains/staff names, spreadsheet-ID literals, active SVG and external CSS: zero flagged after sanitization. This is a pattern scan, not proof of absence.
- npm registry audit of bundled @material/web 2.5.0 and fflate 0.8.3 with their resolved dependency metadata: 0 known advisories (11 packages audited). Bundled binary/font internals not formally verified.
- npm run check: JavaScript syntax and 3 tests pass. Tests cover Host rejection, traversal/dotfiles, unsupported API/write routes, restrictive CSP, live-mode disabling and rejecting spreadsheets before reading any bytes.
- Browser inspection on local port 4281: fictional campaign directory and six fictional creator profiles render.
- Baseline staff literals and spreadsheet IDs removed. XLSX ingestion disabled at exported reader before bytes are read; UI file controls/drop/change paths disabled. External anchor hrefs removed, guarding middle-click/context menu as well as normal click.
- Original Git history, production server, migrations, environment files, exports, internal docs, OAuth/integration workers and deployment configuration excluded from publication source.
- This audit is for a fictional local demo. It does not certify production application security or promise zero vulnerabilities.
