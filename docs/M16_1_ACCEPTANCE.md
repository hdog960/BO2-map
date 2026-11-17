# M16.1 — Three-tab foundation acceptance checkpoint

**Repository:** `hdog960/BO2-map` · **Draft PR:** https://github.com/hdog960/BO2-map/pull/1  
**Protected main baseline:** `80cdb6db12efb38edb41a3d43adbfec52ac5a99a` (unchanged during M16.1).  
**Verified M16.1 source commit:** `107dc4abcd8e67a0d7f3f2ca42abaa8abdec3804`. This document's subsequent commit changes only this checkpoint; revalidate its exact SHA via Actions before further changes.

## Delivered (isolated and unmerged)

- Primary bottom navigation contains exactly **three** tabs: `MAP`, `EASTER EGG`, `CRAFTABLES`; all other six-tab features remain in the HTML and usable.
- Existing Find/Field Index, all 130 catalog items and filter/search actions remain in a fast overlay from the Map header magnifier (`#globalFind`).
- Interiors and site plans remain accessible from map location details (`data-open-zone`) in an independent secondary sheet; room guides remain explicitly schematic.
- Crew names (four), quests assignments, nine shared build checklists and reset remain accessible from a button on Easter Egg; no fixed Crew tab.
- Map Diagnostics v2 is entered from Help → Open map diagnostics; the scanner continues recording map gestures and producing a copyable local-only report while the map is available.
- Secondary sheets have a visible 44px-or-larger Back/Close target, Escape dismissal, focus restoration and a scroll-contained surface; background body scroll locks until closed.
- Introduced coherent charcoal/ivory/amber typography/spacing/safe-area tokens, three balanced touch-friendly tabs, ≥44px targets for map/search/quest/floor/craft/secondary controls. Fixed an inherited footer `translateX(-50%)` bug caught by screenshot inspection.
- `tranzit-atlas-save-v1` stays unchanged. Legacy `view: atlas/zones/crew` values become accessible secondary surfaces without losing old quests, found markers, part keys, Crew names, assignments or earlier found-ID migration.
- Unchanged `data.js`, `world-art.svg`, `diagnostics.js`, `sw.js`, `manifest.webmanifest`; keep 130 records, 10 anchors, 91 site callouts, 39 index-only records, five ordered bus stops, nine builds and two complete Tower of Babble routes.

## Acceptance evidence

- **Exact source HEAD `107dc4abcd8e67a0d7f3f2ca42abaa8abdec3804`:** Atlas Actions #43916413954 **SUCCESS**, including all 68 Node source regressions, SVG parse and real headless Chromium interactions.
- **Exact source HEAD `107dc4abcd8e67a0d7f3f2ca42abaa8abdec3804`:** M16 foundation viewport Actions #43916413923 **SUCCESS**, plus green Node regression contracts and live Pages byte-for-byte comparison against the protected main baseline.
- Genuine Chromium source-driven screenshots at **390×844**, **440×956**, **667×375**, **844×390**, **932×430**, plus portrait evidence of Easter Egg, Craftables, Find, Sites and Crew. PNG dimensions and actual tab-bar bounds checked, not simulated mockups.
- Screenshot inspection of the completed layout found all three tabs visible at each target viewport, no horizontal overflow; measured nav `x=0`, width equal to CSS viewport width (390/440/667/844/932).
- 667×375, 844×390, 932×430 all show the map beginning at approximately **134 CSS px** from the screen top (M16.0 baseline was about 223 CSS px). The map still grows below the bottom navigation; **M16.2 must reclaim further map area and make overlays more compact**.
- No real physical iPhone gestures, Home Screen reload, or visual playtest were performed. These are still manual-device acceptance tasks, not CI claims.
- Published production pages remain on protected `main`; no merge, deployment, backend, external paid service or other-repository change.

## Next authorized development gate — M16.2 only

Maximize visible map area with a compact header, expandable key/filters, search polish and anchored concise item sheets. Preserve the ten source-matched world anchors, five numbered bus stops, constant-size labels/icons, native iPhone pinch/drag, leader-tethered location callouts, 130-row placement ledger and non-fixed alternatives. Keep diagnostics under Help. Add actual browser gesture, overlay scroll and site detail tests; capture and inspect all five viewports. Never invent precise object XYZ coordinates, modify production saves/data/world geometry, merge, deploy or claim physical iPhone testing.
