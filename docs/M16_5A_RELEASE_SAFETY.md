# TranZit Field Atlas — M16.5A Release-Safety Remediation

**Scope:** narrowly approved safety-only changes on draft PR #1. No merge, deployment, branch promotion, backend, or change to protected `main`.

**Repository:** https://github.com/hdog960/BO2-map  
**Draft PR:** https://github.com/hdog960/BO2-map/pull/1  
**Branch:** `m16-clean-ui-audit-20261116`  
**Protected production main:** `80cdb6db12efb38edb41a3d43adbfec52ac5a99a`, unchanged.  
**Exact verified implementation HEAD prior to this documentation-only commit:** `063636c7deb93814a433aad0f25947cd02a5ff28`.

## Remediations

### 1. Cross-project Cache Storage isolation — FIXED

The pre-M16 `sw.js` worker used `keys.filter(key=>key!==CACHE)` on the shared `hdog960.github.io` origin; it could delete unrelated PWAs' cached assets on activation. The updated worker names its cache `tranzit-atlas-v14`, precaches all of its own app assets (including the new Apple touch PNG), and deletes **only** cache names that start with `tranzit-atlas-` and are not the current cache. It never deletes a cache whose name lacks this exact prefix. The normal network-first / cached-response offline fallback remains intact. The service worker was changed **only on the draft PR branch**.

**Caveat:** the new worker prevents future cross-project eviction; it cannot reconstruct any sibling caches that an older already-activated worker may have deleted. Those PWAs may need to be reopened online if prior caches were lost.

### 2. MAP tab glyph — FIXED

Replaced the unsupported `⌖` character in the primary MAP tab with an inline native line-art SVG that does not depend on glyph font coverage. Original three-tab semantics and touch targets are unchanged.

### 3. iOS Home Screen icon — FIXED

Added `apple-touch-icon.png`, 180×180 pixels, rasterized from the project's original unchanged `icon.svg` artwork. The iOS touch-icon link now points to the PNG and declares its size. The updated worker precaches it. The existing SVG icon remains for the standard icon and the PWA manifest, which were not redesigned.

### 4. Published-site source comparisons — EXPANDED

M16 CI compares the **still-deployed** Pages version against the immutable main SHA for nine existing public assets: `index.html`, `app.js`, `data.js`, `sw.js`, `styles.css`, `world-art.svg`, `diagnostics.js`, `manifest.webmanifest`, and `icon.svg`. The new, not-yet-published PNG is independently checked for a valid PNG signature, correct 180×180 dimensions and references in the candidate HTML and service worker. New candidate assets are **not** assumed to be live.

## Tests and source-exact acceptance

At exact implementation HEAD `063636c7deb93814a433aad0f25947cd02a5ff28`:

- **Atlas Actions #44003882778 — SUCCESS:** 85/85 Node regressions, including five new service-worker simulations covering owned-cache upgrades, preservation of unrelated sibling caches, offline fallback for HTML/art/PNG, and strict cross-origin fetch passthrough. Source syntax, SVG XML parsing and real Chromium UI smoke pass.
- **M16 release-safety Actions #44003882762 — SUCCESS:** literal PR HEAD checkout and SHA assertion, 85/85 Node checks, all nine published Pages assets byte-matched to protected production main, 180px PNG validation, and **54 actual Chromium screenshots** at five phone-size viewports.
- The previously protected **53 source-specific captures** remain, including map/filter/location sheets, Maxis (6 steps), Richtofen (8 steps), four-player Crew, all nine build code/color identities with 28 saved part slots, Jet Gun, NAV Table, BUS with no fake fixed bench, and real save/reload witnesses.
- New **390×844 genuine Chromium offline screenshot and state ledger**: the browser manually registered the new worker on a secure local loopback origin; a seeded `tranzit-atlas-v13` entry was deleted when `v14` activated, while the `mythwrought-offline-sentinel` test cache retained its exact response bytes. The worker controlled the page; CDP then emulated network offline and reloaded. The full map, all 10 site anchors, 130 catalog entries and cached Apple PNG survived. Metadata reports `online:false`, `controller:true` and the two expected cache names. This is a real browser operation, **not a simulated worker-only assertion**.
- The local HTTP test harness's app banner says `HTTPS REQUIRED` because the production UI deliberately checks for HTTPS; localhost is treated as a secure context by Chromium, and the test explicitly registered the worker. The banner is not evidence of a real published-HTTPS app failure. It also is not evidence that physical iOS Safari was tested.
- Early test-only failures were resolved by waiting for asynchronous worker activation cleanup and making the metrics sampler tolerate the browser's transient empty document during an offline navigation. Neither error was counted as passing evidence.

## Protected ownership and compatibility

No modifications to `data.js`, `world-art.svg`, `diagnostics.js`, the authored quest/build/marker catalogs, the `tranzit-atlas-save-v1` localStorage key, or saved-state schema. Preserve exactly 130 unique catalog entries (91 site callouts, 39 non-fixed index items), 10 sites, 5 stops, 6 Maxis / 8 Richtofen steps, 9 coded and colored buildables with 28 part slots, all four Crew names and assignments, native touch camera behavior and scanner v2. The only new binary is the original-artwork PNG fallback.

## Required final gate following this documentation commit

This documentation commit changes the branch SHA. Run both independent workflows again on the new exact branch head; verify success, 85/85 native tests, the updated 54-PNG artifact's recorded `candidateCommit`, that published Pages still equals protected main and PR #1 remains open/draft/unmerged. Do not report an acceptance green at a prior SHA as final approval.

## Next authorized planning stage — M16.5B iPhone acceptance and release proposal

The verified build is technically ready for **separately authorized** physical-iPhone evaluation. No actual device testing, staging Pages publication, merge or production deployment was performed under M16.5A. Before an authorized release:

1. Agree on a safe iPhone-accessible preview/temporary hosting approach; do not overwrite current Pages or another project's site.
2. On the user's actual iPhone, validate real touch drag/pinch, portrait/landscape UI, MAP icon and PNG Home Screen icon, Maxis/Richtofen and Crew/part saved progress across app termination, and offline/airplane-mode reopen after at least one online load.
3. Confirm a controlled fallback to immutable production main and the new worker's scoped cache namespace. Avoid resetting `tranzit-atlas-save-v1` and never delete unrelated caches.
4. Return the exact production release checklist and request **separate explicit creator authorization to merge and deploy**. M16.5A does not provide that authorization.
