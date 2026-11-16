# TranZit Field Atlas

An independent, unofficial **Black Ops II TranZit** interactive atlas for **four-player Tower of Babble** runs on iPhone.

**Open app:** https://hdog960.github.io/BO2-map/

## Features
- Original SVG overview: five bus stops, landmarks, route, touch pan/pinch and category filters.
- Perks, wall guns, Mystery Box spots, parts, benches, doors and prices/requirements.
- Conceptual interior diagrams for Bus Depot, Diner, Farm, Power Station and Town.
- Separate Maxis and Richtofen quest trackers, four editable player names and assignments.
- Searchable field index of 130 entries including all ten achievements.
- Manually saved local progress, part tracker, no account or backend.
- Offline service worker and Home Screen manifest.

## Craftables and colored part tracking

Use the new **CRAFT** tab to choose from nine groups: Turbine (TB, gold), Zombie Shield (ZS, blue), Turret (TR, green), Electric Trap (ET, purple), Power Switch (PS, orange), Jet Gun (JG, cyan), Pack-a-Punch (PAP, red), NAV Table (NAV, pink), and Bus Upgrades (BUS, tan).

Each buildable shows a linked list of its actual part names, known area and possible alternate spawns, part counts, and workbench (or installation instructions for bus upgrades). Tap **Show only this on map** to isolate matching part-site callouts and that craftable's bench, or **Map** by a specific part to jump to its area. The map's own craftable filter strip offers one-tap switching.

The color, abbreviation and buildable name also appear in the field index and the Crew tracker. The progress checkboxes are shared: checking a part in CRAFT or on the map updates its existing on-device save key and Crew checklist.

Important: the labels identify the **correct associated area** from the underlying source records; they are not fabricated exact pickup coordinates. Jet Gun parts have multiple in-area spawns. The three bus upgrades can appear across four powered rooms, one empty. Pack-a-Punch parts share an underground-bank source reference.

References: [ZFRR TranZit buildables](https://zfrr.me/hub/tranzit-buildables/) and the [original BO2 community buildable guide](https://www.callofdutyzombies.com/zombie-library/zombies-library/black-ops_ii/tranzit/buildables-r283/).

## Icon placement accuracy audit

**Status: all 130 catalog records reviewed; NOT exact-coordinate-certified.** The main ten landmark pins are aligned to the supplied Afrochubman/BradyGames-style fan map at the general-site level. Indoor pickup and door XY positions are not available from that source, and part spawns sometimes vary between games.

[Read the complete 130-entry icon placement ledger](./AUDIT_ICON_PLACEMENT.md). It records every item's zone, source description, alternative sites, level of certainty, and whether it is a physical placeable or a map-wide/non-static reference.

Following the audit, **arbitrary on-map item point slots were removed**. Color badges now have dashed leaders connecting them to the appropriate named site; they are *category indexes* rather than made-up pickup coordinates. Tap a category to find the item and precise **written room** notes. Bus-based guns, achievements, persistent upgrades and dynamic portals stay searchable under Find without a false stationary icon.

**100% physical XY certainty requires actual game imagery and measured floorplan registration.** Neither the submitted image nor current guides alone prove each object's precise map point.

## Interactive map-first interface

The home screen is the geographically referenced **TranZit map**. Every major area has tappable icons with an **always-visible key** for perks, wall buys, doors (paid/Turbine/special), parts, benches, boxes, secrets and Easter egg locations. Tapping a marker opens information on the map; the **+N** site markers reveal the other items associated with each location. Icons describe site/room areas, not unverified exact pickup coordinates.

The bottom navigation provides a **separate EASTER EGG tab** with the complete Maxis/Richtofen checklists and four-player assignments. The walkthrough's **Show location** buttons return to a marked site on the map. Search, site floor diagrams and buildable checklists are supporting views.

The map supports touch pan/pinch zoom, a Full map view and local part/door tracking. All content stays available offline after an online cache load. See ROADMAP.md (M10) for implementation and accuracy boundaries.

## iPhone map interaction update

Map panning now uses native iPhone touch events rather than pointer capture. The map opens at a useful exploration zoom (1.7×); dragging follows your finger, pinch-zooming changes map scale, and item icons and location names remain the same on-screen size. The ↺ control fits the full map, which naturally has little room to pan until you zoom in again.

**Please test in the Home Screen app**, not only in a desktop browser. The 2026-11-16 scan showed ~59 Hz frame pacing even though dragging still felt stuck. The new diagnostic report (v2) includes native touch events processed, camera moves accepted, moves blocked by the map boundary, and camera rendering counts. See ROADMAP.md M13 for details.

## Diagnose iPhone map lag

If dragging or pinching the map still feels jerky, open the **Map** tab, tap **Scan**, then **Start 15-second scan**. Move the map with one finger and pinch-zoom with two fingers while the scan records. When it finishes, tap **Copy report** and paste the text into the ChatGPT development conversation. If iOS blocks clipboard access, the report remains selectable in the text box.

The scan measures frame pacing, touch events and local SVG map-update cost. It runs entirely on the phone without a backend. No game saves, account data or precise location are collected, and no report is transmitted unless you manually share it.

## Install on iPhone
1. Open the app in Safari while online.
2. Use Share > Add to Home Screen.
3. Launch it once while online to cache its files.
4. Confirm the label OFFLINE READY, then check airplane-mode launch before relying on it.

The app cannot read your actual game session or synchronize across friends' phones.

## Accuracy
The hand-drawn SVG was **redrawn to follow the user-supplied “TranZit Map Key” by Afrochubman**, which credits the original map layout to BradyGames. It now includes the source-shaped roads, central Town junction, east-side Tunnel highway, north Farm–Diner connection, bridge, Power Station loop, and opposing Prototype/Nacht and Obelisk/Pylon landmarks. It is not to scale. **Interior rectangles are schematic conceptual diagrams, not verified floor geometry.** Map pins indicate relevant areas, not exact pickup coordinates. Some parts spawn in multiple possible places.

Status: first version with a geographically corrected world map committed and checked by automated tests. Exact-head GitHub Pages status should be checked after edits. Physical iPhone playtesting is not yet verified. See ROADMAP.md for gates and remaining work.

## Tests
Requires Node 22, no dependencies. Run the JavaScript syntax check and the Node test suite from tests/. GitHub Actions checks automatically after every push.

## Research references
- https://ptgmedia.pearsoncmg.com/imprint_downloads/brady/colin/black_ops_2_zombies_supplement_11-12.pdf
- https://zfrr.me/hub/tranzit-locations/
- https://zfrr.me/hub/tranzit-buildables/
- https://zfrr.me/hub/tranzit-perks-and-power/
- https://zfrr.me/hub/tranzit-weapons/
- https://zfrr.me/hub/tranzit-easter-egg/
- https://www.neoseeker.com/call-of-duty-black-ops-ii/faqs/272171-call-of-duty-bo2.html

Unofficial fan project. No game screenshots or borrowed game artwork are bundled.
