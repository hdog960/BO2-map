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
