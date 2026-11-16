# M16.0 — Clean UI overhaul baseline and feature-parity contract

**Project:** TranZit Field Atlas (`hdog960/BO2-map`)  
**Audit date:** 2026-11-16  
**Immutable baseline main HEAD:** `80cdb6db12efb38edb41a3d43adbfec52ac5a99a`  
**Development branch:** `m16-clean-ui-audit-20261116`  
**Release policy:** draft PR only; never merge or publish M16 without explicit approval.

## Verified source baseline

- The six currently visible primary bottom-nav tabs in `index.html` are `map`, `quest`, `atlas`, `craft`, `zones`, and `crew`; each has its corresponding `#view-*` section.
- `app.js` implements all six views, map pan/zoom, source-linked marker/category detail cards, search, tracking, quest steps, Crew, and interactive craftable part filters. `diagnostics.js` supplies the copyable v2 scanner.
- `data.js` holds the catalog, ten world site anchors, buildables, both quest routes and linked references. `world-art.svg` is separate from the independent map labels/pins in `app.js`.
- `AUDIT_ICON_PLACEMENT.md` has a complete 130-row ledger. It certifies **130 unique indexed records**, not 130 exact coordinates: **91 site-linked category entries**, **39 non-fixed/item-less pinned references**, and **10 schematic site anchors**. The five numbered bus stops follow Depot → Diner → Farm → Power → Town → Depot.
- Source test files: `tests/atlas.test.mjs`, `tests/runtime-smoke.test.mjs`, `tests/craftables.test.mjs`, `tests/icon-placement-audit.test.mjs`. Real Chromium interactions are in `tests/browser-smoke.html`.
- Existing CI: `.github/workflows/atlas-checks.yml`; known baseline green Actions run `43882559274` at the immutable baseline HEAD. The existing workflow takes 390×844 and 844×390 screenshots.
- PWA: `manifest.webmanifest` remains relative, standalone and local; `sw.js` uses cache `tranzit-atlas-v13` with network-first and offline fallback.
- The published Pages game is not modified by this documentation/audit branch. Real-device iPhone testing is **not claimed**.

## Feature-parity inventory: six existing tabs → three destinations

A move means **retain the feature and its same data/save contract**, not delete it.

| Baseline tab / surface | Must remain functional | M16 intended home | Maximum intentional actions |
|---|---|---|---|
| **MAP** | Corrected 720×580 geography; 10 site pins, five numbered bus stops, category callouts with leaders; pan, pinch, reset, expand; location cards, costs, alternates; map key, category filters and craft-specific filters | **MAP** with key/filter disclosure and concise bottom sheet | 1 for details/filters; 2 for deep drill-down |
| **EASTER EGG** | Maxis 6-step and Richtofen 8-step Tower of Babble paths; route selector, prerequisite/warning notes; current next step, expansion, per-step completion, location actions, assignment dropdowns | **EASTER EGG** with Next Objective and expandable steps | 1 to choose side; 1–2 to a step or site |
| **FIND / atlas** | All 130 entries, search query and popular suggestions, type filters, item detail modal, costs, location actions, progress checkmarks; includes 39 references not suitable for fixed map icons | **MAP** header search overlay | 1 to search, 2 to item detail |
| **CRAFT** | Nine selectable builds, distinct codes/colors (TB, ZS, TR, ET, PS, JG, PAP, NAV, BUS); each part, possible sites, bench/install point and progress; map isolation and per-part checks | **CRAFTABLES** | 1 to select; 1 for Show on Map |
| **SITES / zones** | Ten site choices; five authored floor-plan groups, floors, room notes and map-location routing; schematics explicitly not precise wall/part geometry | **MAP** location detail → interior/floor sheet | 2 from site marker |
| **CREW** | Four editable names, both-side quest step assignments, nine shared buildable checklists, reset confirmations, local-save disclaimers | **EASTER EGG** collapsible Crew panel; contextual Craftables progress | 1–2 to Crew |
| **Global search button** | Quick search without erasing current progress | Map header search overlay | 1 |
| **Help button** | Instructions, install/PWA hints, privacy/offline messaging | Help/Settings overlay | 1 |
| **Map Performance Scan** | Full diagnostic scan v2: start/stop, touch/gesture timing, copy report, no player data | Help/Settings → diagnostics | 2 |
| **Global / local progress** | Items, doors, quest steps, parts, names, assignments and selected filters survive reload | Shared state across all three tabs | zero migrations required |

## Immutable save and runtime compatibility

**Do not change the localStorage key:** `tranzit-atlas-save-v1`.

The existing `app.js` state keys are: `view`, `side`, `done`, `parts`, `found`, `crew` (four names), `assign`, `mapFilters`, `mapMode`, `atlasFilter`, `zone`, `floor`, `selected`, `craftFocus`, `craftSelected`; and existing `mapKind`. Retain old values, translate legacy `view: atlas/zones/crew` to accessible new surfaces without dropping the user record, and preserve the earlier position-based found-ID migration. Keep `build.id + ':' + partIndex` and `side + ':' + stepIndex` progress keys.

**Data contracts:**
- Ten world-site anchors, five bus stop numbers, 130 catalog item IDs and 130-row placement ledger are immutable without separate source-grounded approval.
- Category leader callouts mean **known site only**; avoid fabricated exact interior pickup pins.
- Nine buildables retain their distinctive short codes/colors; 27 catalog part location entries plus eight benches; bus upgrades intentionally have no fabricated fixed workbench.
- Jet Gun parts: Engine at Tunnel, Wires at Power Station, Handbrake at Nacht/Prototype, Gauge at Hunter's Cabin, workbench at Town bar. NAV Table retains alternate sites. Pack-a-Punch three pieces share a Town bank underground catalog location. Bus upgrades retain four candidate areas and one empty location.
- Map pointer and native touch events must retain constant-screen-size labels/icons while background geometry transforms. The diagnostics scanner must continue its v2 report.
- No live game connection, no cross-phone sync, no backend, no new paid service, no new PWA installation target.

## Existing regression baseline and screenshot evidence

**CI baseline:** `https://github.com/hdog960/BO2-map/actions/runs/43882559274`, reported SUCCESS on the baseline main SHA. This is evidence for baseline main, **not** an approval of later M16 commits.

**M16.0 capture contract:** A separate PR-only browser job uses genuine local-served, headless Chromium + Chrome DevTools Protocol with mobile viewport emulation (CSS pixel dimensions, scale 1) to capture `390×844`, `440×956`, `667×375`, `844×390`, and `932×430`. Extra 390×844 captures record all six legacy tabs. The capture produces a machine-readable `baseline-layout.json` with actual dimensions, nav count, map anchors, scroll metrics and screenshot PNG headers. Evidence is a CI artifact and is **not an iPhone run**.

**No milestone advance until:**
1. This checklist is present in isolated draft PR, referencing the exact main baseline.
2. All four source Node suites, SVG syntax and the existing genuine-Chromium browser smoke test pass on the PR exact HEAD.
3. All five required baseline map PNGs exist, have correct PNG dimensions and nontrivial content; all six old views remain demonstrably reachable.
4. The screenshot report is reviewed for overflow and visual problems; any limitations or blind spots are explicitly recorded.
5. Changed paths remain limited to M16 audit docs, its capture script and PR-only audit workflow; published `main` stays untouched.

## M16 sequencing and release constraints

- **M16.0:** Baseline, audit, screen captures, isolated branch and draft PR. No production UI changes.
- **M16.1:** Three-tab tokens, navigation, secondary sheets/drawers and two-action parity. Update baseline-specific tests to new navigation only after M16.0 acceptance.
- **M16.2:** Map layout/gesture/overlays; preserve anchors, leader callouts, on-screen sizes and scanner under Help.
- **M16.3:** Both Easter egg routes and Crew disclosure, save/reload and location links.
- **M16.4:** Nine buildables, filters, all alternate candidates and synchronized progress.
- **M16.5:** Exact-head CI, real Chromium mobile captures, UI accessibility, PWA/offline tests, user-run physical iPhone checklist. **Do not merge or deploy without approval.**

**Baseline audit restrictions:** Do not touch Mythwrought or other repositories, `data.js`, `world-art.svg`, `app.js`, `styles.css`, `index.html`, `sw.js`, saved data or the published GitHub Pages deployment during M16.0.

## M16.0 exact-head browser evidence and visual review (2026-11-16)

**First successful audit head:** `0d5a81d9efdc3e351a05bc22ff544ef469571aa1`.

- Standard PR Actions `43900631551`: **SUCCESS**, 66 / 66 Node tests passed (0 failed); JavaScript syntax, SVG XML parse, complete original-Chromium browser UI flows and two legacy screenshot captures passed.
- Separate M16 capture Actions `43900631893`: **SUCCESS**, another 66 / 66 Node tests (0 failed), genuine Chromium CDP screenshot pass (`M16_BASELINE_CAPTURE_PASS 10`). Artifact `m16-baseline-five-viewports` (ID `14239754811`) contains ten real PNG files and `baseline-layout.json`.
- Independently downloaded artifact and **visually inspected all ten captures as a contact sheet**, then compared each recorded PNG dimension and browser CSS viewport against the requested size. Five map captures: `390×844`, `440×956`, `667×375`, `844×390`, `932×430`. Five additional 390×844 captures: `quest`, `atlas`, `craft`, `zones`, `crew`.
- In all five map captures: 130 indexed records, 10 site pins, 9 buildables, six original bottom-nav entries, 6 Maxis and 8 Richtofen quest steps. Each screenshot's PNG physical dimensions equal its emulated CSS viewport size. No document horizontal overflow detected in the measured baseline screenshots.

**Observed current UX deficits (baseline, not regressions introduced by M16):**
1. Landscape map is substantially below the header and prose; its top is **223 px** down the screen, while the fixed navigation starts at **323, 338, and 378 px** for 667×375, 844×390, and 932×430. This leaves approximately **100, 115, and 155 px** of the map visible above the nav at initial scroll, despite the much taller map canvas.
2. At 390×844 the map begins around 270 px from the top, displays a map viewport approximately **293 px** tall, then presents an extensive legend and separate craft filter strip. The bottom nav consumes approximately **77 px** and splits six destinations into small labels.
3. Existing screens show long top explanations, stacked controls and dense visual blocks, especially Find and Sites. These features must move to accessible secondary surfaces, not vanish.
4. The initial view is zoomed into a portion of the world rather than a fully fitted route; retain functional drag/pinch but reassess the initial framing and route discoverability in M16.2.

**M16.0 acceptance result:** Source/parity audit, exact-head CI, screenshot sizes, real-browser capture, visual review and strict three-file branch diff passed. The physical iPhone check remains pending and **must not** be represented as accomplished. M16.1 may begin in a subsequent explicitly authorized continuation on the same protected draft branch; no merge or deploy was performed.
