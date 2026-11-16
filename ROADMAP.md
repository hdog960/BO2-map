# TranZit Field Atlas — one master roadmap

## Objective
A free, separate, offline-first iPhone PWA at https://hdog960.github.io/BO2-map/ for four friends doing TranZit Tower of Babble. No connection to other repositories or paid services. Never claim live BO2 integration or physical iPhone verification without direct evidence.

## M0 Research and content verification
Verify original bus route, terrain relationships, six perks, wall buys, buildables, all part alternate spawns, door type/cost, original-vs-Easy quest requirement, Maxis/Richtofen separation, all side secrets and profile conditions. Cite credible sources in app.
**Now:** major categories verified; detailed coordinate accuracy still pending.

## M1 Offline iPhone app foundation
Responsive safe-area layout, portrait/landscape, offline precache, local progress, Apple Home Screen install, versioned cache.
**Now:** implemented; real physical iPhone test pending.

## M2 Hybrid interactive world
Grounded route and geography, five bus stops, pass-through landmarks, all side paths, walking shortcuts, fog, lava, cornfield paths, streetlights; touch pinch/drag/zoom, filters and marker details.
**Now:** original high-resolution vector map redrawn against the user-supplied Afrochubman/BradyGames reference, including recognizable roads, Town junction, Farm, Diner, Depot, Power Station, the Prototype/Nacht, opposing Obelisk/Pylon, tunnel and bridge. Site markers use verified area groupings instead of randomly invented item coordinates. Terrain lengths and interior doors still require detailed verification.

## M3 Interior floor plans
Unique accurate line-drawn interiors for Depot, Diner/Garage/Roof, Farm/Barn/Farmhouse, Power Station/Reactor, Town/Bank/Bar/Jugger/underground; verified doors/stairs/room access.
**Now:** floor-selectable conceptual diagrams only. Exact room footprints are not yet ready.

## M4 Game objects and parts
Six perks, every wall gun, all door prices/types, Mystery Box positions, benches, Turbine, Shield, Turret, Trap, Jet Gun, power, Pack-a-Punch, NAV Table, bus upgrades, alternate part spawns.
**Now:** indexed and tracked; refine exact interior placement/variants.

## M5 Complete Tower of Babble
Maxis power-off, Turbines, Avogadro, two lampposts; Richtofen Samuel, Jet Gun, explosive kills, simultaneous four EMPs at separate activated portals. Quest state, audio-cue checks, errors/troubleshooting and map highlighting.
**Now:** both separate interactive checklists and next-step UI implemented; more failure-state guidance pending.

## M6 Four-player coordination
Editable names, assign objectives, mark parts, item finds, doors and steps; reset per match, persist across local reload.
**Now:** implemented locally on one device; no cross-device sync.

## M7 Every secondary secret and achievement
All Carrion bears, Nacht, cabin, portal routes, bank/fridge, persistent upgrades, NAV cards and table, radio and Morse interactions, all ten achievements and the subtleties of profile persistence.
**Now:** initial 130-entry catalog including the ten achievements; detailed secret and perma-perk walk-through accuracy needs more work.

## M8 Quality and game-night verification
Node checks, simulated UI tests, real Chromium viewport and interaction testing, in-game map review, iPhone install, safari pinch/scroll, offline launch, state retention, Pages exact-head verification and no unrelated repo changes.
**Now:** Node and simulated DOM CI; physical iPhone, actual gameplay and high-fidelity visual verification still outstanding.

## Next development priorities
1. Review current main exact-head GitHub Actions and Pages status.
2. Source-audit lamp portal positions and make distinct selectable markers for all finale targets.
3. Replace conceptual rectangles with original but **accurate** floor plans using verified observations.
4. Compare source-specific spawn details, refine door type counts and exact prices.
5. Validate iPhone portrait, landscape, Home Screen installation and airplane mode.

## Constraints
The first world map is **not** a measured extraction of BO2 geometry. Successful static deployment is **not** proof of real-device compatibility. The user can continue development by requesting the next milestone.

## M9 — iPhone usability and full-app interface refinement
Goal: stop forcing players to navigate long lists during a four-player live match, while preserving original geography and progress.

Delivered:
- Simplified **Map / Quest / Find / Sites / Crew** bottom navigation with larger, clearly labeled tap targets, selected states and iOS safe-area handling.
- Four one-tap map layers: **Route, Easter egg, Gear, Doors**. Fine-grained category filters move under an optional disclosure; the original map and location-based clickable clusters remain.
- An always-visible, side-aware **next objective** shortcut on the Map view, and step-progress summaries in the Quest view.
- Quest steps are expandable; completed steps remain recorded and assignments are still associated with all four custom player names.
- Search prioritizes item-name matches, has common search suggestions, category counts, clear empty states, and a global header shortcut.
- Sites now support a native location dropdown as well as stop chips and floor switching; non-verified interiors remain labeled schematic.
- Nine buildable trackers use expandable panels; part counts, names, local-only saved data and reset are preserved. Sources are folded into a separate disclosure.
- Touch-driven pan/pinch navigation no longer captures pointer taps immediately; SVG markers have enlarged transparent hit areas.
- Progress migration preserves pre-existing custom map filter settings. Offline-cache revision updated.
- Node source, UI contracts, browser DOM interaction smoke, SVG XML validation and Chrome 390x844 + 844x390 screenshots are produced by repository CI. No third-party paid services.

**Status: Implemented and verified using Node and desktop headless Chrome at mobile viewport sizes.** Physical iPhone testing, in-game cross-check of exact room geometry, and user preference feedback remain necessary. These improvements are independent of M3's unfinished geometry work.

## User playtest priorities after M9
1. In Safari and the Home Screen version, open Map, change all four map modes and tap a numbered location; verify contextual information is easy to reach.
2. Use the global search to find the Jet Gun, Turbine doors and Juggernog.
3. Choose Maxis or Richtofen, complete one quest checklist step and ensure the Map shortcut advances.
4. In Crew, enter names, check one Jet Gun part, reload, and verify it remains checked.
5. Try portrait, landscape and airplane mode after an online load. Report any contrast, tap or scrolling issues with screenshots.


## M10 — Map-first interactive atlas based on player feedback

**Direction:** The main screen is a real clickable world map, not a dashboard. Its geography remains based on the user-provided Afrochubman/BradyGames reference; the original map illustration remains independent. The entire Easter egg is in the separately labeled **EASTER EGG** tab.

Completed:
- Removed front-page map preset buttons and the mission teaser that pushed the actual map down.
- Added an **always-visible MAP KEY**, with colored and lettered symbols for all ten categories: perks, wall buys, parts, crafting benches, cash doors, Turbine doors, special entrances, Mystery Boxes, hidden secrets and Easter egg locations. Key options focus corresponding items.
- Added site-based **individually tappable item icons** over the world map (alongside numbered bus-stop markers). Each icon opens in-map details showing item name, known room, price or prerequisite and notes.
- Added an obvious **+N extra items** marker for dense regions. Selecting it opens a directly tappable on-map list of every item at the relevant site; no reference item is silently dropped or represented as a fictional exact coordinate.
- Default overview displays a manageable selection of high-value points of interest; focusing the legend or zooming reveals more. Every one of the existing catalog entries is reachable by a site marker or its +N index.
- Added inline found/opened tracking in the map detail card, a closing control, and an expanded fullscreen map view.
- Linked Find results to highlighted map information and changed the Easter egg's Locate buttons to open the corresponding map landmark, not an unrelated floor-plan screen.
- Kept all existing content, both quest paths, local saved progress and 9 buildable trackers.
- Added native, scripted Chrome interactions checking SVG marker taps, map-key filtering, popover details, fullscreen, separate Easter egg tab, search and site/crew navigation. Updated source-level tests.
- Captured portrait and landscape headless Chromium snapshots and inspected portrait rendering. Corrected map-key labels wrapping badly on narrow screens.
- Versioned offline cache to v5 to refresh the interface in installed PWAs.

**Truth boundary:** Map icons are anchored to known sites; they are not measured game-map pickup coordinates. Randomized spawns and global profile secrets retain area-level descriptions. Indoor floor plans remain conceptual. Real physical-iPhone and gameplay verification must not be claimed until performed.

Next work: precise line-drawn interiors, spatially verified per-part room placements, lamp locations for the four-player EMP finale, direct field feedback on click targets/legibility, and offline airplane-mode confirmation.


## M11 — Correct iPhone pan and zoom behavior

User-reported defects: dragging the map was unreliable and zooming enlarged map icons and text.

Implementation:
- Replaced whole-SVG CSS scaling with a **bounded world camera**: roads, terrain and buildings move/zoom inside a dedicated \`mapWorld\` SVG group while the root viewport is stationary.
- Moved embedded map labels out of the zooming artwork and into the separate \`mapLabels\` layer. Original title geometry is retained as authored text with fixed pixel size across zoom changes.
- Rebuilt all map markers at local coordinates attached to geographic world coordinates; \`positionMapOverlays\` recalculates anchored locations without scaling icons, symbols, labels or hit areas.
- Pointer gestures now translate actual screen movement into map/viewBox coordinates, handle two-finger pinch around the gesture midpoint, clamp panning to the enlarged map, and preserve one-finger pan while zoomed.
- Scroll-wheel and +/- controls share the same center-aware zoom math; Reset and the fullscreen view preserve overlay alignment.
- Moved away from a blanket post-drag tap-block to only suppress the accidental click at the drag release point.
- Expanded automated source checks plus real Chrome gesture checks verify pan distance, pinch zoom and the **same on-screen icon and text dimensions before and after zoom**. Existing gameplay guide content, progress, Easter egg tabs and location links are unchanged.
- Advanced the PWA offline cache to v6 for the new map code and artwork.

Remaining gate: physical Safari/installed-PWA testing on the user's iPhone. Headless Chromium phone-size viewports are not physical iPhone confirmation. Detailed indoor map accuracy remains on the earlier milestones.


## M12 — On-device map-performance scanner for iPhone debugging

**Why:** Physical-iPhone feedback reports that map dragging still feels broken and laggy even after the camera rewrite. Desktop Chrome gesture pass was insufficient to diagnose the user device.

**Delivered:**
- Added a visible **Scan** button in the TranZit Map heading and a self-contained **Map Performance Scan** panel.
- Tap **Start 15-second scan**, then actively drag and pinch the map. Capture finishes automatically or with **Stop & view results**.
- The diagnostic collects device/browser and CSS viewport information, map zoom and pan, marker/label counts, touch starts/moves/cancels, approximate finger travel, longest input gap, requestAnimationFrame interval median/P95/worst, counts of slow frames, and SVG map update timing median/P95/worst. Long-task observation is included when the browser supports it.
- The scan is **opt-in and on-device**. It does not record game save data, account information, GPS location or app conversations. Nothing is uploaded; users manually choose **Copy report** (with a selectable text fallback) and paste into ChatGPT.
- Progress bars, game content, all Easter egg walkthroughs, map interactions and saved match state remain unchanged.
- Included diagnostics.js in PWA cache version 8 so Home Screen installation supports the scan offline after an online refresh.
- Added static and real Chromium interaction coverage for start, touch events, stop, report creation and visibility.

**Truth boundary:** Results from Chrome test automation prove the scan runs as designed in that browser, but only a scan copied from the user's own iPhone can establish the real iOS lag profile. Review an actual diagnostic report before claiming the underlying performance bug has been fixed.


## M13 — Real-iPhone touch responsiveness correction (after 59 Hz scan)

### Evidence from iPhone Home Screen scan (2026-11-16)
- Median rAF interval improved from **33 ms (~30 Hz)** to **17 ms (~59 Hz)** after M11.
- User still reported dragging felt extremely laggy. Scan recorded **267 pointer moves but only 28 map-update samples** during 15 s, with the view ending at zoom 1 and pan boundaries +55/-55 SVG units.
- Conclusion: frame cadence improved but responsiveness did not; the prior performance fix was insufficient. These measurements suggest movement limits and/or touch events being lost by the PointerEvent capture path, but do not prove precisely which dominates.
- No physical-iPhone pass has been claimed.

### Changes
- Added native \`touchstart\`/\`touchmove\`/\`touchend\`/\`touchcancel\` handlers, with non-passive \`touchmove\` and touch-ID-aware one-finger pan and two-finger pinch. Native iOS streams bypass the previous PointerEvent capture path; PointerEvents remain as the fallback for mouse and other platforms.
- Added a camera-movement helper to count **handled touches, accepted camera changes, boundary-blocked attempts, capture interruptions** and render frames independently.
- The world map now begins at **1.7×**, centered, giving players actual room to drag. Reset returns to whole-map overview, which naturally has limited panning because the entire map is visible.
- Relaxed the fit-level pan allowance and preserved world-positioned, fixed-screen-size item icons and label typography.
- Updated the local diagnostic to **v2**, adding input-to-camera counters so future scans distinguish unhandled touches from clamped movement and rendering delays.
- Added automated browser tests dispatching native TouchEvent-style events to verify drags and pinches move the camera. Kept existing PointerEvent smoke, map markers, quest tracking, and saved progress checks.
- Bumped offline PWA cache to \`tranzit-atlas-v10\`.

**Verification gate:** Exact GitHub main, Node/Chromium tests, and Pages deploy are required. User must still confirm dragging with a physical-iPhone playtest and, if necessary, copy the v2 map scan.


## M14 — Icon placement and source-of-truth integrity audit

**Audit basis:** user's supplied *TranZit Map Key* image by Afrochubman (layout credited to BradyGames), TranZit-specific ZFRR location/weapon/perk/buildable guides, 2016 CoDZ buildables, original-era Neoseeker doors, and Steam community mapping.

**Coverage:** all 130 catalog entries and the 10 regional world anchors, with 130 audited entries in \`AUDIT_ICON_PLACEMENT.md\`. The original map contains manually authored, non-surveyed landmark coordinates. It cannot establish measured XY for every individual pickup. A 100% exact guarantee would be false.

**Critical finding resolved:** the old \`MAP_SLOTS\` implementation placed individual item icons in arbitrary screen/world slots determined by category sort order. These had no source basis and were sometimes far from the correct building. Removed.

**New map contract:** 91 location-linked item records are reachable through category badges with dashed leader lines to the appropriate *site* anchor. The 39 other entries are stop pins or global/mobile/dynamic references and have no fabricated item pins. The five bus stops remain marked independently. NAV Radio, wooden board, and electrical box have alternate zones. All 130 items remain accessible by Find.

**CI:** \`tests/icon-placement-audit.test.mjs\` hard-fails incomplete placement classification and unsourced coordinate-slot logic. Existing UI, native touch, quest, part tracking and PWA validation remain in place. Offline cache v11.

**Not complete:** no item/floor XY can be certified 100% until matched against exact, independently checked gameplay views or authoritative geometry. Complete site-level associations must not be mislabeled as a complete pixel-exact map. The visual layout is a schematic reference map, not an extraction of game scene geometry.
