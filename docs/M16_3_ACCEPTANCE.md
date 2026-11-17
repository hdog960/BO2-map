# TranZit Field Atlas — M16.3 Easter Egg Redesign Acceptance

**Project:** https://github.com/hdog960/BO2-map  
**Draft PR #1:** https://github.com/hdog960/BO2-map/pull/1  
**Isolated branch:** \`m16-clean-ui-audit-20261116\`  
**Protected main:** \`80cdb6db12efb38edb41a3d43adbfec52ac5a99a\` (unchanged throughout implementation)  
**Verified source HEAD before this documentation commit:** \`35fd037d72ed5324845accefda77b7e479099560\`

## Accepted feature scope

1. The original Tower of Babble **Maxis (6 source-authored steps)** and **Richtofen (8 source-authored steps)** routes are still drawn directly from \`D.quests\`; no game instructions or geography are invented. The mutually exclusive route selector has touch-sized targets and explicit \`aria-pressed\`.
2. An accessible **YOUR NEXT OBJECTIVE** panel surfaces the first unfinished step, source text, real source site, assigned player (or Unassigned), a grounded Show on map link and a manual complete action. Once complete, the next unfinished step advances automatically, while the completed step becomes collapsed. Future steps remain expandable; current instructions open by default.
3. A compact expandable **Before you start** panel preserves Original difficulty, four-player coordination, previous completion checks, and Richtofen/Samuel-specific dialogue guidance. Every actual step retains its complete original note. An optional checklist-help disclosure offers only generic consistency checks, not fabricated BO2 mechanics.
4. A collapsible **four-player Crew** disclosure shows all four stored names and current route-assignment count; it links to the existing edit/buildables panel. The original per-step \`data-assignment\` selectors remain. Edits update the summary and visible step assignment without changing storage keys.
5. Responsive portrait layout uses a next-step hero, compact progress bar, collapsed completed steps and 44px-or-larger touch targets. In short landscape, the next objective and both actions are presented immediately after the route selector, followed by the Crew disclosure and detailed progress/list. This is a presentation change only; step DOM and saves are retained.
6. The unchanged \`tranzit-atlas-save-v1\` localStorage schema protects \`done\`, \`parts\`, \`found\`, \`assign\`, \`crew\`, \`side\` and the legacy view migration. Maxis and Richtofen progress are independent. Nothing auto-detects or syncs with an actual game.
7. World map UI, source \`data.js\`, \`world-art.svg\`, icon-placement ledger, \`diagnostics.js\`, \`sw.js\`, PWA manifest, three primary tabs, map camera, source-linked item callouts and secondary Find/Sites panels remain untouched by M16.3 changes.

## Exact-source acceptance and browser evidence

The source HEAD \`35fd037d72ed5324845accefda77b7e479099560\` passed:
- **Atlas Actions #43984950849 — SUCCESS:** 72/72 repository Node tests; source/PWA contracts and SVG XML validation; real headless Chromium UI smoke including both routes, step completion and reversal, source-backed map links, Crew opening, and saved player assignments.
- **M16 quest/mobile Actions #43984950911 — SUCCESS:** 72/72 Node tests, published Pages comparison to the protected main SHA (not to draft files), genuine Chromium CDP capture and **36 actual PNG screenshots**. 
- **Five browser emulation sizes:** 390×844, 440×956, 667×375, 844×390 and 932×430. Every size captured Maxis, Richtofen, and expanded Crew plus map/filter/location parity; portrait also captured standalone Quest, Craftables, Find, Sites, Crew and post-reload Quest.
- **Actual reload witness:** Chromium checked Richtofen step 1, assigned step 2 to player 3, renamed player 3, reloaded the real page and asserted correct step 2, named player, saved route, completion and assignment through \`localStorage\`. This is stronger than seeding a Node-only mocked save.
- **Measured landscape visibility:** At 667×375, Maxis's objective actions end at ~278.5 CSS px while fixed tabs start at 325px, leaving a comfortable gap. The source-driven browser acceptance test fails if actions overlap the tabs. 844×390 and 932×430 also passed. All four visible Crew cards were captured after short, deliberate scrolling in the landscape test.
- **Human screenshot inspection:** The next objective and both buttons are readable in all three landscape captures; portrait at 390×844 and 440×956 displays route choice, Crew, progress and the next objective without nav overlap. Expanded Crew capture shows names instead of merely asserting \`details[open]\` offscreen.
- **Transient acceptance repairs:** An early new CDP screenshot script used a malformed quoted selector and was corrected; early landscape renders showed the hero below the fold and the Crew after the long archive. Both were corrected and retested on later exact source commits. No failing early evidence is represented as acceptance.

## Explicit limitations

- No person physically tested tapping/pinching, Home Screen installation, brightness readability or airplane-mode reload on an actual iPhone. Desktop Chromium mobile emulation **is not** a physical iPhone verification.
- \`sw.js\`, \`data.js\`, \`world-art.svg\`, \`manifest.webmanifest\`, \`diagnostics.js\` and save format were not modified; that protects the prior offline and placement contracts but is not proof of real-device offline behavior.
- No exact pickup coordinates, multiplayer synchronization or automatic match completion are claimed.
- This is still **draft PR #1**, with **zero** merge, deployment, production registration, release or cross-project edits.

## Final exact-head gate

This document itself advances the PR HEAD and triggers the isolated M16 screenshot workflow. Treat M16.3 as fully accepted only when the Atlas checks and quest/mobile screenshots run at the **new exact HEAD** and both succeed; verify changed paths and immutable main again. Report any failure honestly.

## Next milestone, not started — M16.4 Craftables & final feature-parity polish

A narrowly scoped future pass may improve the existing nine-color-coded buildables browser, part progress, bench map actions, alternate-spawn clarity, list usability and iPhone landscape layout, then run full source-location and save-reload regression. Preserve the 130 catalog entries, 10 anchors, 91 site-linked/39 non-fixed classification, five bus stops, nine crafts, original two quest routes, v1 saves, offline support and diagnostics. Continue on this draft PR; **never merge or deploy without explicit creator approval**.
