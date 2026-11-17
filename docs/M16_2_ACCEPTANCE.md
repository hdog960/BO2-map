# M16.2 — Map redesign acceptance and handoff

**Repo:** `hdog960/BO2-map`  
**Date:** 2026-11-16  
**Draft PR:** https://github.com/hdog960/BO2-map/pull/1  
**Isolated branch:** `m16-clean-ui-audit-20261116`  
**Protected main baseline:** `80cdb6db12efb38edb41a3d43adbfec52ac5a99a`  
**Reviewed implementation commit:** `74b3af757790838334def0efb54005f27433483c` (this acceptance document is an additional docs-only commit).

## Delivered and protected

- **Map viewport dominates phone screen.** Compact page title, hidden redundant header explanation, restrained charcoal/ivory/amber styling, and the enlarged portrait and landscape viewport keep the existing source-geometry `world-art.svg`, named site anchors, callout leaders and five numbered bus stops.
- **On-map compact key/filters.** `#mapKeyDisclosure` is closed by default, expands to all ten category controls + All and all nine distinct craftable color/code selectors + All. Filter selection collapses the drawer without discarding progress; Escape closes it. Bus route order and map precision caveat remain in the drawer. Existing category, craft map isolation and data IDs are unchanged.
- **Camera aspect and input alignment.** Map SVG uses `xMidYMid slice` to make use of portrait and landscape viewport real estate. `refreshMapMetrics`, `pointerToMap`, and `clampMap` now use matching slice scale and viewport-aware edge bounds. Fixed-size SVG pins/labels are inverse-scaled. The map starts at centered overview zoom rather than an excessively tight 1.7× crop. Pan, pinch, zoom controls, expanded mode and diagnostic telemetry retain their handlers.
- **Grounded, scrollable location sheets.** A map marker opens a compact, independently scrolling sheet with site or item identity, area/room, price/access, actual detail, alternate-spawn areas where recorded, track actions and an expandable placement-accuracy explanation. Site detail still leads to the preserved schematic interiors. Tapping map markers dismisses an open key drawer.
- **Help and search preserved.** Find overlay retains all 130 source entries; Map Diagnostics remains under Help with the same privacy-safe, copyable v2 scan. No live BO2 connection, backend, synchronized phones, or exact invented in-room pickup coordinate is claimed.
- **Immutable content.** No changes to `data.js`, `world-art.svg`, `diagnostics.js`, `sw.js`, `manifest.webmanifest`, the v1 storage key, IDs or saved progress. 130 entries and their full placement audit remain: 91 site-linked callouts, 39 non-fixed index entries, ten world anchors, five bus stops; nine builds and both complete quest routes. Four crew names and assignments survive.

## Actual verification and screenshot findings

- **Atlas tests:** On source commit `53f1d21625663e052236e489161b11b35fa90a2e`, GitHub Actions **#43919409266 SUCCESS**, including 68/68 Node tests, SVG parsing and genuine Chromium interaction smoke. Test cases cover the compact drawer, categories, Escape, native touch pan/pinch, fixed-size pins, costs/rooms and preserved v1 saves.
- **Five-size screenshots:** On source commit `53f1d21625663e052236e489161b11b35fa90a2e`, Actions **#43919409132 SUCCESS (attempt 2)**, exact branch source. Its first attempt failed **before any screenshot** because headless Chromium failed to expose `DevToolsActivePort`; a rerun of the *same SHA* passed all verification, the Pages main SHA comparison and **20 genuine Chromium PNGs**. This was an intermittent browser startup failure, not a passed test on attempt 1.
- Screenshot coverage at `390×844`, `440×956`, `667×375`, `844×390`, `932×430`: one map + one expanded filter drawer + one grounded Town location detail per size (15 PNGs); plus Easter Egg, Craftables, Find, Sites and Crew in portrait (5 PNGs).
- Inspecting the real renders confirmed the footer remains fully visible; portrait map starts around **129–132 CSS px**, with **656–768px** interactive height. Landscape map starts around **96 CSS px**, with **220px**, **235px** and **275px** interactive map heights at the three target resolutions. All five had exactly the matching document width, with no horizontal overflow. Filters overlay the map and sheets scroll inside it.
- At default 1.7× the new cropped map was unhelpfully tight. After reducing the initial camera to 1× and centering, screenshots show more Town, Cabin, bridge and Depot context. This is a deliberately broader map view; it does not invent or move an item pin.
- **Unverified:** a user's physical iPhone Safari/Home Screen pinch/drag feel, visual contrast in bright light, true offline re-entry after a service-worker update, and real four-player gameplay. These still require an actual device playtest. Never report them as passed.
- Published Pages remains byte-matched to protected `main`, and draft PR #1 remains **unmerged**. M16.2 documentation does not grant release permission.

## M16.2 exact-head gate

After this document commit, require **both** repository Atlas CI and M16 screenshot workflow SUCCESS on the same final PR HEAD, review screenshot artifact existence and confirm only the intended M16 paths changed. If failures appear, fix them before proceeding to M16.3. Main must remain unchanged.

## Next stage — M16.3 Easter Egg redesign (not started)

Prioritize one clear NEXT OBJECTIVE, Maxis/Richtofen choice, collapsed completed steps and expandable future steps, richer step details, grounded location actions, and a compact Crew disclosure. Preserve all six Maxis and eight Richtofen quest steps, original prerequisites, four names/assignments, storage key and manual progress. Extend tests for both paths, old save reload, map links, Crew workflow and all five viewports. Keep PR draft; no deployment or merge without explicit approval.
