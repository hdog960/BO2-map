# TranZit Field Atlas — M16.4 Craftables Redesign & Feature-Parity Acceptance

**Project:** https://github.com/hdog960/BO2-map  
**Draft development PR:** https://github.com/hdog960/BO2-map/pull/1 (leave DRAFT, unmerged)  
**Isolated development branch:** \`m16-clean-ui-audit-20261116\`  
**Immutable protected main:** \`80cdb6db12efb38edb41a3d43adbfec52ac5a99a\`  
**Exact verified implementation HEAD:** \`1165d31133b2e6b5e4725caa9d32fbac38e874d8\`. This document is an additional documentation-only commit: re-run exact-HEAD acceptance after it.

## User-facing delivery

- **Nine original color-coded builds:** TB Turbine, ZS Zombie Shield, TR Turret, ET Electric Trap, PS Power switch, JG Jet Gun, PAP Pack-a-Punch, NAV NAV Table and BUS Bus upgrades, with distinct original source colors and no replacement IDs. The selector is now a swipeable, thumb-sized, announced group with accessible \`aria-pressed\`; the active build stays visible when returning from another tab and the rail does not jump to the start after checking parts.
- **Selected-build details:** clearer source-authored name, code, original note, collected count, source-based progress bar and Show only this on map action. All 28 original part slots across nine builds are preserved; no quest, item or part IDs have been invented.
- **Part-by-part source guidance:** each checklist card shows the original part name, valid site(s), catalog room/reference text where available, original part guidance, any alternate-spawn warning, a manual collected toggle and a site-linked map-area action. Candidate areas are not presented as guaranteed simultaneously spawned items, and room notes are not given fake X/Y measurements.
- **Assemblies and moving equipment:** all eight static buildables keep their original source-linked physical workbench actions. BUS upgrades explicitly have **no fixed workbench**; tapping the installation action returns to a candidate-area overview rather than inventing a stationery bus bench pin. Pack-a-Punch's three bank-area components still share an area reference, not three fake measured object coordinates.
- **Responsive screen:** the selected build, progress and map action fit above the fixed three-tab navigation in each tested landscape viewport. Portrait is scrollable, with individual 44px part toggles, map actions and accessible headings. The selected build is automatically revealed in the horizontal library rail.

## Full source and feature-parity safeguards

No edits to \`data.js\`, \`world-art.svg\`, \`sw.js\`, \`diagnostics.js\`, \`manifest.webmanifest\` or the original placement ledger. Exact automated assertions now cover:
- 130 unique catalog IDs; 91 **site-callout** references and 39 **index-only** entries, with every zone and alternate-zone ID valid and every non-spatial entry explaining why it lacks a fixed map pin;
- ten source-backed map anchors, five numbered bus stops in order (Depot, Diner, Farm, Power Station, Town);
- exactly nine build IDs/codes and nine distinct original colors, with every component source ref resolving to an actual catalog part and every static workbench ID resolving to a bench;
- the original six Maxis and eight Richtofen Tower of Babble steps and their source sites, the old \`tranzit-atlas-save-v1\` schema, four Crew names and assignments, 3 primary navigation tabs, map gestures, Find/Sites sheets and v2 privacy-safe diagnostics;
- unchanged original PWA service worker, relative manifest and offline asset precache. A source/CI test is **not** proof of actual on-device offline reload.

## Actual exact-implementation evidence

At \`1165d31133b2e6b5e4725caa9d32fbac38e874d8\`:
- **Atlas Actions #43987714016 SUCCESS:** **80/80 native Node regressions**, valid source syntax/SVG parse, genuine Chromium interaction suite including all nine craft options, per-build code and color, NAV alternate spawns, bus with no static bench and map-link behavior.
- **M16 mobile Actions #43987714026 SUCCESS:** **80/80 native tests**, production GitHub Pages byte-equivalence against the untouched protected main, and **53 original branch-exact Chromium screenshots** saved in \`m16-craft-five-viewports\`.
- Genuine five-size screenshots at **390×844, 440×956, 667×375, 844×390 and 932×430**. Every size captured source-driven JG, NAV and BUS views alongside existing map, filters, location, both quest routes and expanded Crew. At 390×844, tests captured both a collected Jet Gun part and the part after actual Chromium reload, together with the earlier saved Richtofen quest, Crew name and assignment.
- Source-driven visual examination of the generated portrait and landscape PNGs confirms the chosen build is on-screen in the library; badges, room text, map action and part lists are readable without horizontal clipping. At 667×375, the map-action button bottom measured **264.9 CSS pixels** versus navigation top **325px** (about 60px clear). Other landscape sizes: 844×390 action bottom ~264.9 vs nav 340; 932×430 action bottom ~264.9 vs nav 380. The acceptance script hard-fails an obscured action or an offscreen selected craft.
- The screenshot script first detected a genuine selected-build scroll issue after a hidden-tab render; corrected with a visibility-aware scroll restore. Separate early failures came from a test-only HTML-escaped apostrophe assertion and nested quotes in a Chrome DevTools evaluation. These issues were corrected and **not** counted as passing evidence. The final implementation SHA passed both complete independent workflows.

## Unverified and release gates

- The actual user's physical iPhone Safari / standalone Home Screen swipes, pinch feel, native tap feedback, readability, and offline airplane-mode reload remain **unverified**; never claim this automated emulation was physical phone testing.
- This release is **draft-only**. No merge, deployment, promotion, live Pages replacement, backend, cross-phone sync, Codex, Work or third-party paid service.
- **M16.4 acceptance requires final exact-head CI** after this file lands: verify new PR HEAD, both independent workflows SUCCESS at that same SHA, 53 PNG artifact, unchanged protected main and strict ownership. Only then advance to next phase.

## Next permitted activity — M16.5 Release-Readiness Audit (read-only)

A final whole-project, production-safety, iPhone-readiness and visual audit of M16.0–M16.4; exact diffs against main, source/scan/quest/build data, 3-tab UX, touch hit targets, save migration, PWA cache behavior and 53+ reference screenshots. Document physical iPhone actions still needed. **Do not merge/deploy without explicit new creator authorization.**
