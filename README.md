# Book of Knowledge — prototype

Counter assistant for Martinizing Cleaners of Flower Mound CSRs, built by Kingside Group after the 10/19/2026 discovery call.

- **Content:** `assets/knowledge.js`, every page sourced from the CSR Training Manual (vf), the Employee Handbook (rev. June 2026), or the discovery call. `gap` fields mark questions the source material doesn't answer yet.
- **Logic:** `assets/app.js` — keyword search, promise-time calculator (CSR Manual Day 5), route-day helper (route pairs from the call, unconfirmed), outage playbooks.
- **App shell:** sidebar on desktop/tablet, bottom tab bar + More sheet on phones. Installable (`manifest.webmanifest`, icons in `icons/`) and works offline via `sw.js`. Bump the `?v=` asset versions in `index.html` and `sw.js` together on every change.
- **Hosting:** static files on GitHub Pages. No build step, no backend. `noindex` + `robots.txt` keep it out of search engines.

Run locally: `python3 -m http.server 4317` in this folder.
