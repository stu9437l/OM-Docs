Operations Manager — Docs Hosting Bundle (no File Compare)
==========================================================

Includes
--------
  index.html                              Landing page (start here)
  assets/cedar-gate-logo.png              Brand logo
  flow/                                   OM Flow Diagram
  salesforce-flow/                        Salesforce Flow Diagram
  operations-manager-user-guide.html      OM User Guide
  OM-Module-Dependency-Matrix.html        Dependency Matrix
  Salesforce-Client-Gateway-User-Guide.html  Salesforce / Client Gateway Guide
  start.sh                                Optional local static preview
  README-DEPLOY.txt                       This file

Bundle date: 2026-10-01
  - File Comparison Module removed
  - Other documentation modules retained (flows + guides + matrix)
  - Static hosting friendly (IIS / nginx / Apache) — no Python app required

Not included
------------
  - excel-compare / File Comparison Module
  - FastAPI serve.py /compare/ endpoints

Deploy (recommended for corp hosts)
-----------------------------------
1. Unzip into the web root (example):
     unzip OM-Docs-Hosting-Bundle-2026-10-01-docs.zip -d /opt/om-docs
     # or map IIS site physical path to the unzipped folder

2. Open:
     http://<server-host>/
     Relative links (flow/, salesforce-flow/, *.html) work as static files.

Optional local preview
----------------------
  ./start.sh
  Open http://127.0.0.1:8790/

  Or:  python3 -m http.server 8790 --bind 0.0.0.0

Notes
-----
  - salesforce-flow/ needs sibling flow/ (shared styles/app.js).
  - IQVIA internal use only — restrict access per company policy.
